import React, { useEffect, useState } from "react";
import "./table.css";

interface Product {
  title: string;
  price: number;
  category: string;
}

type RemappedProduct = {
  [key: string]: Product[];
};

interface Sorter {
  [key: string]: "asc" | "desc";
}

const Table = () => {
  const [data, setData] = useState<Product[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<RemappedProduct>({});
  const [sortBy, setSortBy] = useState<Sorter>({});
  const [isLoading, setIsLoading] = useState(false);

  const parseSorting = (sortItems: Sorter) => {
    let str = [];
    for (const p in sortItems)
      if (sortItems.hasOwnProperty(p)) {
        str.push(
          `sortBy=${encodeURIComponent(p)}&order=${encodeURIComponent(
            sortItems[p]
          )}`
        );
      }
    return str.join("&");
  };

  const handleSort = (key: string) => {
    setSortBy({ [key]: sortBy[key] === "asc" ? "desc" : "asc" });
  };

  const getProductsFromApi = React.useCallback(async () => {
    console.log("sortBy", JSON.stringify(sortBy));
    setIsLoading(true);
    const url = `https://dummyjson.com/products?limit=100&${parseSorting(
      sortBy
    )}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      setData([...json.products]);
      setIsLoading(false);
    } catch (error: any) {
      // console.error(error?.message);
      setIsLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    if (getProductsFromApi) {
      getProductsFromApi();
    }
  }, [getProductsFromApi]);

  const handleRemappingData = (dataToMap: Product[]) => {
    const groupedProducts = dataToMap.reduce(
      (remappedData: RemappedProduct, currentData: Product) => {
        const category = currentData.category;
        if (!remappedData[category]) {
          remappedData[category] = [];
        }
        remappedData[category].push(currentData);
        return remappedData;
      },
      {} as RemappedProduct
    );
    setGroupedProducts({ ...groupedProducts });
  };

  useEffect(() => {
    if (data?.length) {
      handleRemappingData(data);
    }
  }, [data]);

  if (isLoading) {
    return <div>Please wait, while loading data...</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th onClick={() => handleSort("category")}>Category</th>
          <th onClick={() => handleSort("title")}>Title</th>
          <th onClick={() => handleSort("price")}>Price</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(groupedProducts).map(([key, obj], i: number) => {
          const products = obj as Product[];
          return (
            <React.Fragment key={i}>
              {products.map((item, index) => (
                <tr key={`${i}-${index}`}>
                  <td>{index === 0 && key}</td>
                  <td>{item.title}</td>
                  <td>{item.price}</td>
                </tr>
              ))}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
};

export { Table };

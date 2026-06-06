import {
  useEffect,
  useState,
} from "react";

import ProductCard from "../components/ProductCard";

import {
  getProducts,
} from "../services/productService";

const Products = () => {
  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data =
        await getProducts();

      setProducts(data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="
        flex
        justify-center
        items-center
        min-h-[60vh]
      "
      >
        <p
          className="
          text-xl
          font-semibold
        "
        >
          Loading Products...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">

      <h1
        className="
        text-3xl
        font-bold
        mb-6
      "
      >
        Products
      </h1>

      <div
        className="
        grid
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-4
        gap-6
      "
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
};

export default Products;
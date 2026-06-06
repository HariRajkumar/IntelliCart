import { useEffect, useState } from "react";

import ProductCard from "../components/ProductCard";

// import { getProducts } from "../services/productService";

import { getProducts, searchProducts } from "../services/productService";

const Products = () => {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSearch = async () => {
    if (!search.trim()) {
      loadProducts();

      return;
    }

    setSearchLoading(true);

    try {
      const data = await searchProducts(search);

      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setSearchLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await getProducts();

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
        flex
        gap-3
        mb-6
      "
      >
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
          border
          p-3
          rounded
          flex-1
        "
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />

        <button
          onClick={handleSearch}
          disabled={searchLoading}
          className="
          bg-black
          text-white
          px-5
          rounded
          disabled:opacity-50
        "
        >
          {searchLoading ? "Searching..." : "Search"}
        </button>

        <button
          onClick={() => {
            setSearch("");

            loadProducts();
          }}
          className="
          border
          px-4
          rounded
        "
        >
          Clear
        </button>
      </div>

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
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Products;

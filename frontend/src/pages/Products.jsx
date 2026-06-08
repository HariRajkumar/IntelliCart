import { useEffect, useState } from "react";

import ProductCard from "../components/ProductCard";

import { getProducts } from "../services/productService";

import { getCategories } from "../services/categoryService";

const Products = () => {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");

  const [search, setSearch] = useState("");

  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory, page]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();

      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);

      const data = await getProducts({
        search,
        category: selectedCategory,
        page,
        limit: 8,
      });

      setProducts(data.items);
      setTotalPages(
        data.total_pages
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
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
          flex-wrap
        "
      >
        <input
          type="text"
          placeholder="Search products..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="
            border
            p-3
            rounded
            flex-1
            min-w-[250px]
          "
        />

        <button
          onClick={handleSearch}
          className="
            bg-black
            text-white
            px-5
            rounded
          "
        >
          Search
        </button>

        <button
          onClick={() => {
            setSearchInput("");
            setSearch("");
            setSelectedCategory("");
            setPage(1);
          }}
          className="
            border
            px-4
            rounded
          "
        >
          Clear
        </button>

        <select
          value={selectedCategory}
          onChange={(e) => {
            setPage(1);
            setSelectedCategory(e.target.value);
          }}
          className="
            border
            p-3
            rounded
          "
        >
          <option value="">All Categories</option>

          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
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

      <div
        className="
        flex
        justify-center
        items-center
        gap-4
        mt-8
      "
      >
        <button
          onClick={() =>
            setPage(page - 1)
          }
          disabled={page === 1}
          className="
          border
          px-4
          py-2
          rounded
          disabled:opacity-50
        "
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() =>
            setPage(page + 1)
          }
          disabled={
            page >= totalPages
          }
          className="
          border
          px-4
          py-2
          rounded
          disabled:opacity-50
        "
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Products;

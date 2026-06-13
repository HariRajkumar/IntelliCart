import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import ProductCard from "../components/ProductCard";

import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");

  const [search, setSearch] = useState("");

  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setSelectedCategory(categoryParam);
    setPage(1);
  }, [categoryParam]);

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
      <h1 className="text-3xl font-bold mb-6 text-text">Products</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="flex-1 min-w-[250px]"
        />

        <Button onClick={handleSearch} className="px-5">
          Search
        </Button>

        <Button
          variant="secondary"
          onClick={() => {
            setSearchInput("");
            setSearch("");
            setSearchParams({});
            setPage(1);
          }}
          className="px-4"
        >
          Clear
        </Button>

        <select
          value={selectedCategory}
          onChange={(e) => {
            const val = e.target.value;
            setPage(1);
            if (val) {
              setSearchParams({ category: val });
            } else {
              setSearchParams({});
            }
          }}
          className="rounded-lg border border-border bg-surface p-3 text-text shadow-sm"
        >
          <option value="">All Categories</option>

          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="flex justify-center items-center gap-4 mt-8">
        <Button
          variant="secondary"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-4 py-2"
        >
          Previous
        </Button>

        <span className="text-text">
          Page {page} of {totalPages}
        </span>

        <Button
          variant="secondary"
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
          className="px-4 py-2"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Products;

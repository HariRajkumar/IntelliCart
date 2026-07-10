import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import ProductCard from "../components/ProductCard";

import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL search params as single source of truth
  const categoryParam = searchParams.get("category") || "";
  const searchParam = searchParams.get("search") || "";
  const minPriceParam = searchParams.get("min_price") || "";
  const maxPriceParam = searchParams.get("max_price") || "";
  const minRatingParam = searchParams.get("min_rating") || "";
  const inStockParam = searchParams.get("in_stock") === "true";
  const sortByParam = searchParams.get("sort_by") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  // Component states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  
  // Local input states to avoid fetching on every keystroke
  const [searchInput, setSearchInput] = useState(searchParam);
  const [localMinPrice, setLocalMinPrice] = useState(minPriceParam);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceParam);

  // Load categories once
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
  }, []);

  // Sync inputs with URL search params when they change externally
  useEffect(() => {
    setSearchInput(searchParam);
    setLocalMinPrice(minPriceParam);
    setLocalMaxPrice(maxPriceParam);
  }, [searchParam, minPriceParam, maxPriceParam]);

  // Fetch products whenever URL searchParams change
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts({
          page: pageParam,
          limit: 8,
          category: categoryParam || undefined,
          search: searchParam || undefined,
          min_price: minPriceParam ? parseFloat(minPriceParam) : undefined,
          max_price: maxPriceParam ? parseFloat(maxPriceParam) : undefined,
          min_rating: minRatingParam ? parseFloat(minRatingParam) : undefined,
          in_stock: inStockParam ? true : undefined,
          sort_by: sortByParam || undefined,
        });

        setProducts(data.items);
        setTotalPages(data.total_pages);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [searchParams]);

  // Universal URL updates
  const updateFilters = (newFilters) => {
    const updated = new URLSearchParams(searchParams);
    
    // Always reset to page 1 when filters change
    updated.set("page", "1");

    Object.entries(newFilters).forEach(([key, val]) => {
      if (val === undefined || val === null || val === "" || val === false) {
        updated.delete(key);
      } else {
        updated.set(key, String(val));
      }
    });

    setSearchParams(updated);
  };

  const handlePageChange = (newPage) => {
    const updated = new URLSearchParams(searchParams);
    updated.set("page", String(newPage));
    setSearchParams(updated);
  };

  const handleClearAll = () => {
    setSearchInput("");
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setSearchParams({});
  };

  const handleSearch = () => {
    updateFilters({ search: searchInput });
  };

  const handlePriceFilterSubmit = (e) => {
    e.preventDefault();
    updateFilters({ min_price: localMinPrice, max_price: localMaxPrice });
  };

  // Determine if any filters are active
  const hasActiveFilters = 
    categoryParam || 
    searchParam || 
    minPriceParam || 
    maxPriceParam || 
    minRatingParam || 
    inStockParam;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 p-4 bg-surface rounded-2xl border border-border/50 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary self-start md:self-center">
          Explore Products
        </h1>
        
        <div className="flex w-full md:w-auto flex-1 max-w-xl gap-2">
          <Input
            type="text"
            placeholder="Search products, brands, categories..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="flex-1"
          />
          <Button onClick={handleSearch} className="px-6 rounded-xl">
            Search
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Filters Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 bg-surface p-6 rounded-3xl border border-border/40 shadow-premium h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-6">
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>Filters</span>
            </h2>
            {hasActiveFilters && (
              <button 
                onClick={handleClearAll}
                className="text-xs font-bold text-primary hover:text-primary-hover transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Categories Selection */}
            <div>
              <h3 className="text-sm font-bold text-text mb-3 uppercase tracking-wider text-[10px] text-muted">
                Category
              </h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => updateFilters({ category: "" })}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition ${
                    !categoryParam 
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted hover:bg-slate-50 hover:text-text"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateFilters({ category: cat.name })}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition ${
                      categoryParam === cat.name
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted hover:bg-slate-50 hover:text-text"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter Section */}
            <div className="pt-4 border-t border-border/50">
              <h3 className="text-sm font-bold text-text mb-3 uppercase tracking-wider text-[10px] text-muted">
                Price Range
              </h3>
              
              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  onClick={() => updateFilters({ min_price: "", max_price: "500" })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                    !minPriceParam && maxPriceParam === "500"
                      ? "bg-primary text-white border-primary"
                      : "bg-surface text-muted border-border hover:border-muted"
                  }`}
                >
                  Under ₹500
                </button>
                <button
                  onClick={() => updateFilters({ min_price: "500", max_price: "2000" })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                    minPriceParam === "500" && maxPriceParam === "2000"
                      ? "bg-primary text-white border-primary"
                      : "bg-surface text-muted border-border hover:border-muted"
                  }`}
                >
                  ₹500 - ₹2,000
                </button>
                <button
                  onClick={() => updateFilters({ min_price: "2000", max_price: "10000" })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                    minPriceParam === "2000" && maxPriceParam === "10000"
                      ? "bg-primary text-white border-primary"
                      : "bg-surface text-muted border-border hover:border-muted"
                  }`}
                >
                  ₹2,000 - ₹10,000
                </button>
              </div>

              {/* Custom Min/Max Inputs */}
              <form onSubmit={handlePriceFilterSubmit} className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Min"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl"
                />
                <span className="text-muted text-xs">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl"
                />
                <Button type="submit" variant="ghost" className="p-2 rounded-xl text-xs shrink-0 aspect-square">
                  Go
                </Button>
              </form>
            </div>

            {/* Avg Rating Section */}
            <div className="pt-4 border-t border-border/50">
              <h3 className="text-sm font-bold text-text mb-3 uppercase tracking-wider text-[10px] text-muted">
                Customer Rating
              </h3>
              <div className="space-y-1">
                {[4, 3, 2].map((num) => (
                  <button
                    key={num}
                    onClick={() => updateFilters({ min_rating: minRatingParam === String(num) ? "" : String(num) })}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium transition ${
                      minRatingParam === String(num)
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted hover:bg-slate-50 hover:text-text"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <div className="flex text-brand-amber">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < num ? "fill-brand-amber" : "fill-none stroke-border text-border"
                            }`}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.25.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.18 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.772-.56-.373-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-1 text-[11px]">& Up</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Stock Toggle */}
            <div className="pt-4 border-t border-border/50">
              <label className="flex items-center gap-2 cursor-pointer py-1 select-none">
                <input
                  type="checkbox"
                  checked={inStockParam}
                  onChange={(e) => updateFilters({ in_stock: e.target.checked })}
                  className="rounded text-primary border-border focus:ring-primary/30 w-4 h-4"
                />
                <span className="text-xs font-semibold text-text">In Stock Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Right Main Catalog Panel */}
        <main className="flex-1">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-4 border-b border-border/60 mb-6">
            <p className="text-sm font-semibold text-muted">
              {loading ? (
                <span>Finding items...</span>
              ) : (
                <span>Showing <strong className="text-text">{products.length}</strong> products</span>
              )}
            </p>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <span className="text-xs font-bold text-muted uppercase tracking-wider text-[10px]">
                Sort By:
              </span>
              <select
                value={sortByParam}
                onChange={(e) => updateFilters({ sort_by: e.target.value })}
                className="rounded-xl border border-border/60 bg-surface px-3 py-1.5 text-xs font-semibold text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="">Best Match</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Avg. Review Rating</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1.5 items-center mb-6">
              <span className="text-xs text-muted font-bold mr-1">Active:</span>
              
              {searchParam && (
                <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 border border-primary/20 text-xs font-bold text-primary rounded-full">
                  <span>Search: "{searchParam}"</span>
                  <button onClick={() => updateFilters({ search: "" })} className="hover:text-primary-hover font-extrabold focus:outline-none">×</button>
                </div>
              )}
              {categoryParam && (
                <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 border border-primary/20 text-xs font-bold text-primary rounded-full">
                  <span>Category: {categoryParam}</span>
                  <button onClick={() => updateFilters({ category: "" })} className="hover:text-primary-hover font-extrabold focus:outline-none">×</button>
                </div>
              )}
              {(minPriceParam || maxPriceParam) && (
                <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 border border-primary/20 text-xs font-bold text-primary rounded-full">
                  <span>
                    Price: {minPriceParam ? `₹${minPriceParam}` : "Min"} - {maxPriceParam ? `₹${maxPriceParam}` : "Max"}
                  </span>
                  <button onClick={() => updateFilters({ min_price: "", max_price: "" })} className="hover:text-primary-hover font-extrabold focus:outline-none">×</button>
                </div>
              )}
              {minRatingParam && (
                <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 border border-primary/20 text-xs font-bold text-primary rounded-full">
                  <span>Rating: {minRatingParam}★ & up</span>
                  <button onClick={() => updateFilters({ min_rating: "" })} className="hover:text-primary-hover font-extrabold focus:outline-none">×</button>
                </div>
              )}
              {inStockParam && (
                <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 border border-primary/20 text-xs font-bold text-primary rounded-full">
                  <span>In Stock Only</span>
                  <button onClick={() => updateFilters({ in_stock: "" })} className="hover:text-primary-hover font-extrabold focus:outline-none">×</button>
                </div>
              )}
            </div>
          )}

          {/* Loading View */}
          {loading ? (
            <div className="flex flex-col justify-center items-center min-h-[40vh] gap-3">
              <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <p className="text-sm font-semibold text-muted">Loading IntelliCart catalog...</p>
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 bg-surface border border-border/40 rounded-3xl shadow-sm text-center">
              <svg className="w-16 h-16 text-muted/60 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold text-text mb-1">No products found</h3>
              <p className="text-sm text-muted max-w-sm mb-4">
                We couldn't find any products matching your active filters. Try adjusting your search query or filters.
              </p>
              <Button onClick={handleClearAll} className="rounded-xl px-5">
                Reset All Filters
              </Button>
            </div>
          ) : (
            /* Cards Grid */
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Section */}
              <div className="flex justify-center items-center gap-2 mt-12 pt-6 border-t border-border/40">
                <Button
                  variant="ghost"
                  onClick={() => handlePageChange(pageParam - 1)}
                  disabled={pageParam === 1}
                  className="px-4 py-2 text-xs rounded-xl flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </Button>

                <div className="flex items-center gap-1 px-3 text-xs font-semibold text-text">
                  <span>Page</span>
                  <span className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold">{pageParam}</span>
                  <span className="text-muted">of {totalPages}</span>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => handlePageChange(pageParam + 1)}
                  disabled={pageParam >= totalPages}
                  className="px-4 py-2 text-xs rounded-xl flex items-center gap-1.5"
                >
                  <span>Next</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;

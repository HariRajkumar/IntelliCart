import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import { getCategories, createCategory } from "../services/categoryService";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from "../services/productService";
import { getAllOrders, updateOrderStatus } from "../services/orderService";
import { getErrorMessage } from "../utils/errorHandler";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview"); // overview, products, categories, orders
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Core Data states
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // Product form states
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [prodName, setProdName] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodStock, setProdStock] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodMRP, setProdMRP] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerPostalCode, setSellerPostalCode] = useState("");
  const [prodSpecs, setProdSpecs] = useState([{ key: "", value: "" }]);

  // Product Image upload states
  const [uploadingImageId, setUploadingImageId] = useState(null);

  // Category form states
  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");

  // Calculations/Statistics
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeProductsCount: 0,
    totalOrdersCount: 0,
    categoriesCount: 0,
  });

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [catsData, prodsData, ordersData] = await Promise.all([
        getCategories(),
        getProducts({ limit: 100 }), // Load a larger list for admin view
        getAllOrders(),
      ]);

      setCategories(catsData);
      setProducts(prodsData.items || []);
      setOrders(ordersData || []);

      calculateStats(prodsData.items || [], ordersData || [], catsData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (prods, ords, cats) => {
    const totalRevenue = ords
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total_price, 0);

    setStats({
      totalRevenue,
      activeProductsCount: prods.filter((p) => p.is_active).length,
      totalOrdersCount: ords.length,
      categoriesCount: cats.length,
    });
  };

  // Product actions
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!prodName.trim() || !prodDescription.trim() || !prodPrice || !prodStock || !prodCategory) {
      toast.error("Please fill in all required product fields");
      return;
    }

    const specsDict = {};
    prodSpecs.forEach((spec) => {
      if (spec.key.trim()) {
        specsDict[spec.key.trim()] = spec.value.trim();
      }
    });

    const payload = {
      name: prodName,
      description: prodDescription,
      price: parseFloat(prodPrice),
      stock: parseInt(prodStock, 10),
      category: prodCategory,
      mrp: prodMRP ? parseFloat(prodMRP) : undefined,
      seller_name: sellerName || undefined,
      seller_postal_code: sellerPostalCode || undefined,
      specifications: specsDict,
    };

    setSaving(true);
    try {
      if (isEditingProduct && editingProductId) {
        await updateProduct(editingProductId, payload);
        toast.success("Product updated successfully!");
      } else {
        await createProduct(payload);
        toast.success("New product added successfully!");
      }
      resetProductForm();
      await loadAllAdminData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEditProductClick = (prod) => {
    setIsEditingProduct(true);
    setEditingProductId(prod.id);
    setProdName(prod.name);
    setProdDescription(prod.description);
    setProdPrice(prod.price);
    setProdStock(prod.stock);
    setProdCategory(prod.category);
    setProdMRP(prod.mrp || "");
    setSellerName(prod.seller_name || "");
    setSellerPostalCode(prod.seller_postal_code || "");
    
    const specsList = Object.entries(prod.specifications || {}).map(([k, v]) => ({ key: k, value: v }));
    setProdSpecs(specsList.length > 0 ? specsList : [{ key: "", value: "" }]);

    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  const handleImageFileChange = async (e, productId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImageId(productId);
    try {
      await uploadProductImage(productId, file);
      toast.success("Product image uploaded successfully!");
      await loadAllAdminData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingImageId(null);
    }
  };

  const handleToggleProductActive = async (prod) => {
    setSaving(true);
    try {
      await updateProduct(prod.id, { is_active: !prod.is_active });
      toast.success(`Product ${prod.is_active ? "deactivated" : "activated"} successfully!`);
      await loadAllAdminData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProductClick = async (productId) => {
    if (!confirm("Are you sure you want to permanently delete this product? (This sets is_active to false in the database)")) return;
    setSaving(true);
    try {
      await deleteProduct(productId);
      toast.success("Product deactivated (soft-deleted) successfully!");
      await loadAllAdminData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const resetProductForm = () => {
    setIsEditingProduct(false);
    setEditingProductId(null);
    setProdName("");
    setProdDescription("");
    setProdPrice("");
    setProdStock("");
    setProdCategory("");
    setProdMRP("");
    setSellerName("");
    setSellerPostalCode("");
    setProdSpecs([{ key: "", value: "" }]);
  };

  // Category actions
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      toast.error("Category name is required");
      return;
    }

    setSaving(true);
    try {
      await createCategory({ name: catName, description: catDescription });
      toast.success("Category created successfully!");
      setCatName("");
      setCatDescription("");
      await loadAllAdminData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Order actions
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      await loadAllAdminData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm font-semibold text-muted">Loading IntelliCart metrics dashboard...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden text-left">
      {/* Decorative gradient glow mesh */}
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto animate-fade-in-up">
        {/* Banner summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-5 bg-surface border border-border/50 shadow-premium flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase text-muted tracking-wider">Total Sales (Paid)</span>
            <span className="text-2xl sm:text-3xl font-black text-text mt-2 block">₹{stats.totalRevenue.toLocaleString()}</span>
          </Card>
          
          <Card className="p-5 bg-surface border border-border/50 shadow-premium flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase text-muted tracking-wider">Active Inventory</span>
            <span className="text-2xl sm:text-3xl font-black text-text mt-2 block">{stats.activeProductsCount} Items</span>
          </Card>

          <Card className="p-5 bg-surface border border-border/50 shadow-premium flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase text-muted tracking-wider">Total Orders</span>
            <span className="text-2xl sm:text-3xl font-black text-text mt-2 block">{stats.totalOrdersCount} Transactions</span>
          </Card>

          <Card className="p-5 bg-surface border border-border/50 shadow-premium flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase text-muted tracking-wider">Categories</span>
            <span className="text-2xl sm:text-3xl font-black text-text mt-2 block">{stats.categoriesCount} Groups</span>
          </Card>
        </div>

        {/* Dashboard workspace grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Navigation Panel */}
          <aside className="lg:col-span-3">
            <div className="bg-surface rounded-3xl border border-border/50 p-4 shadow-premium space-y-1.5">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === "overview"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-muted hover:bg-slate-50 hover:text-text"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Analytics Overview</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("products");
                  resetProductForm();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === "products"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-muted hover:bg-slate-50 hover:text-text"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Manage Products</span>
              </button>

              <button
                onClick={() => setActiveTab("categories")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === "categories"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-muted hover:bg-slate-50 hover:text-text"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Manage Categories</span>
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === "orders"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-muted hover:bg-slate-50 hover:text-text"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>Fulfillment Orders</span>
              </button>
            </div>
          </aside>

          {/* Right Tab Content View */}
          <main className="lg:col-span-9 animate-slide-in-right">
            
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Recent Transactions List */}
                <div className="bg-surface rounded-3xl border border-border/50 p-6 sm:p-8 shadow-premium">
                  <div className="pb-4 border-b border-border/60 mb-6">
                    <h2 className="text-xl font-bold text-text">Recent Orders</h2>
                    <p className="text-xs text-muted mt-1">Review the latest transactions received across the catalog.</p>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-10 text-center text-muted text-sm font-semibold">
                      No customer transactions have been recorded.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border/60 text-muted uppercase font-bold tracking-wider">
                            <th className="py-3 px-2">Order ID</th>
                            <th className="py-3 px-2">Amount</th>
                            <th className="py-3 px-2">Status</th>
                            <th className="py-3 px-2">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {orders.slice(0, 5).map((o) => (
                            <tr key={o.id} className="hover:bg-slate-50 transition font-medium">
                              <td className="py-3.5 px-2 text-text font-bold uppercase truncate max-w-[120px]">{o.id}</td>
                              <td className="py-3.5 px-2 text-text font-extrabold">₹{o.total_price.toLocaleString()}</td>
                              <td className="py-3.5 px-2">
                                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                                  o.status === "delivered"
                                    ? "bg-success/10 text-success"
                                    : o.status === "cancelled"
                                    ? "bg-error/10 text-error"
                                    : o.status === "out_for_delivery"
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "bg-warning/10 text-warning"
                                }`}>
                                  {o.status === "out_for_delivery" ? "out for delivery" : o.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-2 text-muted">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === "products" && (
              <div className="space-y-8">
                
                {/* 1. Inventory Table */}
                <div className="bg-surface rounded-3xl border border-border/50 p-6 sm:p-8 shadow-premium">
                  <div className="pb-4 border-b border-border/60 mb-6 flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h2 className="text-xl font-bold text-text">Product Inventory</h2>
                      <p className="text-xs text-muted mt-1">Add details, update configurations, and upload graphics.</p>
                    </div>
                    {isEditingProduct && (
                      <button
                        onClick={resetProductForm}
                        className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 border border-primary/20 px-3 py-1.5 rounded-xl bg-primary/5 transition"
                      >
                        Create Product
                      </button>
                    )}
                  </div>

                  {products.length === 0 ? (
                    <div className="py-10 text-center text-muted text-sm font-semibold">
                      No products exist. Create one below.
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[400px] overflow-y-auto pr-1">
                      <table className="w-full text-left text-xs border-collapse relative">
                        <thead>
                          <tr className="border-b border-border/60 text-muted uppercase font-bold tracking-wider sticky top-0 bg-surface z-10">
                            <th className="py-3 px-2">Info</th>
                            <th className="py-3 px-2">Price</th>
                            <th className="py-3 px-2">Stock</th>
                            <th className="py-3 px-2">Status</th>
                            <th className="py-3 px-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {products.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50 transition font-medium">
                              <td className="py-3 px-2 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-50 border border-border/40 shrink-0 flex items-center justify-center p-0.5">
                                  <img
                                    src={
                                      p.images && p.images[0]
                                        ? `${import.meta.env.VITE_BACKEND_URL}${p.images[0]}`
                                        : "/placeholder.png"
                                    }
                                    alt={p.name}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="text-left max-w-[150px] sm:max-w-[200px]">
                                  <p className="font-bold text-text truncate leading-snug">{p.name}</p>
                                  <p className="text-[10px] text-muted truncate">{p.category}</p>
                                </div>
                              </td>
                              
                              <td className="py-3 px-2">
                                <p className="font-bold text-text">₹{p.price}</p>
                                {p.mrp && <p className="text-[9px] line-through text-muted/70">₹{p.mrp}</p>}
                              </td>

                              <td className="py-3 px-2">
                                <span className={`font-bold ${p.stock <= 5 ? "text-error" : "text-text"}`}>
                                  {p.stock}
                                </span>
                              </td>

                              <td className="py-3 px-2">
                                <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                                  p.is_active ? "bg-emerald-50 text-success" : "bg-slate-100 text-muted"
                                }`}>
                                  {p.is_active ? "Active" : "Inactive"}
                                </span>
                              </td>

                              <td className="py-3 px-2 text-right">
                                <div className="flex justify-end gap-2 flex-wrap items-center">
                                  {/* Upload Image Selector */}
                                  <label className="cursor-pointer shrink-0">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleImageFileChange(e, p.id)}
                                      className="hidden"
                                      disabled={uploadingImageId === p.id}
                                    />
                                    <span className="text-[10px] font-bold text-primary hover:underline border border-primary/20 px-2 py-1 rounded-lg bg-primary/5 inline-block select-none">
                                      {uploadingImageId === p.id ? "Uploading..." : "Image"}
                                    </span>
                                  </label>

                                  <button
                                    onClick={() => handleEditProductClick(p)}
                                    className="text-[10px] font-bold text-text hover:underline border border-border px-2 py-1 rounded-lg bg-slate-50 shrink-0"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    onClick={() => handleToggleProductActive(p)}
                                    className={`text-[10px] font-bold px-2 py-1 rounded-lg border shrink-0 ${
                                      p.is_active
                                        ? "text-warning border-warning/20 bg-warning/5 hover:underline"
                                        : "text-success border-success/20 bg-success/5 hover:underline"
                                    }`}
                                  >
                                    {p.is_active ? "Deactivate" : "Activate"}
                                  </button>

                                  <button
                                    onClick={() => handleDeleteProductClick(p.id)}
                                    className="text-[10px] font-bold text-error border border-error/20 px-2 py-1 rounded-lg bg-error/5 hover:underline shrink-0"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 2. Product Builder Form */}
                <div className="bg-surface rounded-3xl border border-border/50 p-6 sm:p-8 shadow-premium">
                  <div className="pb-4 border-b border-border/60 mb-6 flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-text">
                        {isEditingProduct ? "Edit Product Details" : "Create New Product"}
                      </h2>
                      <p className="text-xs text-muted mt-1">
                        {isEditingProduct
                          ? "Adjust configurations and save changes."
                          : "Upload parameters to create a new item listings."}
                      </p>
                    </div>
                    {isEditingProduct && (
                      <button onClick={resetProductForm} className="text-xs text-muted font-bold">
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Product Name</label>
                        <Input
                          type="text"
                          placeholder="e.g. RGB Mechanical Keyboard"
                          value={prodName}
                          onChange={(e) => setProdName(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Category</label>
                        <select
                          value={prodCategory}
                          onChange={(e) => setProdCategory(e.target.value)}
                          className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium text-text focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Price (Selling Price, ₹)</label>
                        <Input
                          type="number"
                          placeholder="Selling amount"
                          value={prodPrice}
                          onChange={(e) => setProdPrice(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">MRP (Original Price, ₹)</label>
                        <Input
                          type="number"
                          placeholder="Original MRP (Slash pricing)"
                          value={prodMRP}
                          onChange={(e) => setProdMRP(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Stock Availability</label>
                        <Input
                          type="number"
                          placeholder="Initial stock quantity"
                          value={prodStock}
                          onChange={(e) => setProdStock(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Seller Name</label>
                        <Input
                          type="text"
                          placeholder="e.g. IntelliCart Central Hub"
                          value={sellerName}
                          onChange={(e) => setSellerName(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Seller PIN Code</label>
                        <Input
                          type="text"
                          placeholder="e.g. 400001"
                          value={sellerPostalCode}
                          onChange={(e) => setSellerPostalCode(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Product Description</label>
                      <textarea
                        rows="4"
                        placeholder="Detailed highlights of the product (split by periods for bullet points)..."
                        value={prodDescription}
                        onChange={(e) => setProdDescription(e.target.value)}
                        className="w-full rounded-2xl border border-border bg-surface p-4 text-sm font-medium text-text focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        required
                      ></textarea>
                    </div>

                    {/* Specifications Section */}
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center border-b border-border/50 pb-2">
                        <label className="text-xs font-bold text-text uppercase tracking-wider ml-1">Product Specifications</label>
                        <button
                          type="button"
                          onClick={() => setProdSpecs([...prodSpecs, { key: "", value: "" }])}
                          className="text-[11px] font-bold text-primary hover:text-primary-hover border border-primary/20 px-3 py-1.5 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          Add Row
                        </button>
                      </div>

                      {prodSpecs.length === 0 ? (
                        <p className="text-xs text-muted italic ml-1 py-1">No custom specifications added. Displays default specs.</p>
                      ) : (
                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                          {prodSpecs.map((spec, index) => (
                            <div key={index} className="flex gap-2 items-center">
                              <div className="flex-1">
                                <Input
                                  type="text"
                                  placeholder="Specification Name (e.g. Weight)"
                                  value={spec.key}
                                  onChange={(e) => {
                                    const newSpecs = [...prodSpecs];
                                    newSpecs[index].key = e.target.value;
                                    setProdSpecs(newSpecs);
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <Input
                                  type="text"
                                  placeholder="Value (e.g. 200g)"
                                  value={spec.value}
                                  onChange={(e) => {
                                    const newSpecs = [...prodSpecs];
                                    newSpecs[index].value = e.target.value;
                                    setProdSpecs(newSpecs);
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newSpecs = prodSpecs.filter((_, idx) => idx !== index);
                                  setProdSpecs(newSpecs.length > 0 ? newSpecs : [{ key: "", value: "" }]);
                                }}
                                className="p-2.5 rounded-xl border border-error/20 bg-error/5 hover:bg-error/10 text-error transition-all"
                                title="Remove Specification"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                      {isEditingProduct && (
                        <Button type="button" variant="ghost" onClick={resetProductForm} className="px-6 rounded-xl text-xs">
                          Cancel
                        </Button>
                      )}
                      <Button type="submit" disabled={saving} className="px-8 rounded-xl">
                        {saving ? "Saving..." : isEditingProduct ? "Save Changes" : "Create Product"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* CATEGORIES TAB */}
            {activeTab === "categories" && (
              <div className="space-y-8">
                {/* Create Category Form */}
                <div className="bg-surface rounded-3xl border border-border/50 p-6 sm:p-8 shadow-premium">
                  <div className="pb-4 border-b border-border/60 mb-6">
                    <h2 className="text-xl font-bold text-text">Create Category</h2>
                    <p className="text-xs text-muted mt-1">Add catalog filtering partitions.</p>
                  </div>

                  <form onSubmit={handleCreateCategory} className="space-y-4 max-w-lg">
                    <div>
                      <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Category Name</label>
                      <Input
                        type="text"
                        placeholder="e.g. Electronics, Clothing"
                        value={catName}
                        onChange={(e) => setCatName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Description (Optional)</label>
                      <Input
                        type="text"
                        placeholder="Group description..."
                        value={catDescription}
                        onChange={(e) => setCatDescription(e.target.value)}
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button type="submit" disabled={saving} className="px-8 rounded-xl">
                        {saving ? "Adding..." : "Add Category"}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Categories Table List */}
                <div className="bg-surface rounded-3xl border border-border/50 p-6 sm:p-8 shadow-premium">
                  <h3 className="text-lg font-bold text-text mb-4">Existing Categories</h3>
                  {categories.length === 0 ? (
                    <p className="text-sm text-muted font-semibold">No categories exist.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map((c) => (
                        <div key={c.id} className="p-4 rounded-2xl border border-border bg-slate-50 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-text text-sm">{c.name}</p>
                            {c.description && <p className="text-[10px] text-muted line-clamp-1 mt-0.5">{c.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="bg-surface rounded-3xl border border-border/50 p-6 sm:p-8 shadow-premium">
                <div className="pb-4 border-b border-border/60 mb-6">
                  <h2 className="text-xl font-bold text-text">Fulfillment Orders</h2>
                  <p className="text-xs text-muted mt-1">Review checkout list and transition fulfillment pipelines.</p>
                </div>

                {orders.length === 0 ? (
                  <div className="py-10 text-center text-muted text-sm font-semibold">
                    No orders placed in this application yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-1">
                    <table className="w-full text-left text-xs border-collapse relative">
                      <thead>
                        <tr className="border-b border-border/60 text-muted uppercase font-bold tracking-wider sticky top-0 bg-surface z-10">
                          <th className="py-3 px-2">Order details</th>
                          <th className="py-3 px-2">Shipping Address</th>
                          <th className="py-3 px-2">Payment Details</th>
                          <th className="py-3 px-2">Total Amount</th>
                          <th className="py-3 px-2">Date</th>
                          <th className="py-3 px-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {orders.map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50 transition font-medium">
                            <td className="py-4 px-2">
                              <p className="font-bold text-text uppercase leading-none mb-1">ID: #{o.id}</p>
                              <p className="text-[10px] text-muted select-all">User: {o.user_id}</p>
                              
                              {/* Inline Items listing */}
                              <div className="mt-2 space-y-1 bg-slate-50 border border-border/30 p-2.5 rounded-xl max-w-sm">
                                {o.items?.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-[10px] text-muted">
                                    <span className="truncate max-w-[200px] font-bold text-text">{item.name}</span>
                                    <span>Qty: {item.quantity} ({item.price} each)</span>
                                  </div>
                                ))}
                              </div>
                            </td>

                            <td className="py-4 px-2 max-w-[200px]">
                              {o.shipping_address ? (
                                <div className="space-y-0.5 text-text text-[11px]">
                                  <p className="font-bold">{o.shipping_address.address_line}</p>
                                  <p>{o.shipping_address.city}, {o.shipping_address.state}</p>
                                  <p className="text-muted">{o.shipping_address.postal_code}, {o.shipping_address.country}</p>
                                </div>
                              ) : (
                                <span className="text-muted italic text-[10px]">No address</span>
                              )}
                            </td>

                            <td className="py-4 px-2">
                              <div className="space-y-1 text-[10px]">
                                <div className="flex gap-1.5 items-center">
                                  <span className="text-muted font-bold">Method:</span>
                                  <span className="font-extrabold uppercase text-text">{o.payment_method || "N/A"}</span>
                                </div>
                                <div className="flex gap-1.5 items-center">
                                  <span className="text-muted font-bold">Status:</span>
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                    o.payment_status === "paid"
                                      ? "bg-emerald-50 text-success"
                                      : o.payment_status === "failed"
                                      ? "bg-red-50 text-error"
                                      : "bg-amber-50 text-warning"
                                  }`}>
                                    {o.payment_status || "pending"}
                                  </span>
                                </div>
                                {o.payment_transaction_id && (
                                  <div className="text-muted flex flex-col mt-1">
                                    <span className="font-bold text-[9px]">Tx ID:</span>
                                    <span className="font-mono text-text select-all text-[9px]">{o.payment_transaction_id}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            
                            <td className="py-4 px-2 font-extrabold text-text text-sm">
                              ₹{o.total_price.toLocaleString()}
                            </td>

                            <td className="py-4 px-2 text-muted">
                              {new Date(o.created_at).toLocaleString("en-IN")}
                            </td>

                            <td className="py-4 px-2">
                              <select
                                value={o.status}
                                onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                                className={`rounded-xl border px-3 py-1.5 text-xs font-bold shadow-sm focus:outline-none cursor-pointer ${
                                  o.status === "delivered"
                                    ? "bg-emerald-50 border-success/30 text-success"
                                    : o.status === "cancelled"
                                    ? "bg-red-50 border-error/30 text-error"
                                    : o.status === "out_for_delivery"
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                    : "bg-amber-50 border-warning/30 text-warning"
                                }`}
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

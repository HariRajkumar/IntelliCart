import { useEffect, useState, useContext } from "react";
import { getMyOrders } from "../services/orderService";
import { addToCart } from "../services/cartService";
import AuthContext from "../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getMyOrders();
      // Sort orders by date descending (latest first)
      const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(sortedData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyItAgain = async (productId) => {
    try {
      await addToCart(productId, 1);
      toast.success("Added to cart! Redirecting...");
      navigate("/cart");
    } catch (error) {
      toast.error("Failed to add product to cart");
      console.error(error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Order ID copied!");
  };

  const getStatusClass = (status) => {
    const normalized = status?.toLowerCase() ?? "";
    if (normalized.includes("completed") || normalized.includes("delivered")) {
      return "bg-success/15 text-success border border-success/30";
    }
    if (
      normalized.includes("pending") ||
      normalized.includes("processing") ||
      normalized.includes("shipped")
    ) {
      return "bg-warning/15 text-amber-700 border border-warning/30";
    }
    if (
      normalized.includes("cancel") ||
      normalized.includes("fail") ||
      normalized.includes("returned")
    ) {
      return "bg-error/15 text-error border border-error/30";
    }
    return "bg-secondary/15 text-primary border border-secondary/30";
  };

  const renderProgressTracker = (status) => {
    const normalized = status?.toLowerCase() ?? "";
    
    if (normalized.includes("cancel") || normalized.includes("fail") || normalized.includes("returned")) {
      return (
        <div className="bg-red-50 text-error border border-red-100 rounded-xl p-3 flex items-center gap-2 text-xs font-bold mt-4">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>This order was cancelled.</span>
        </div>
      );
    }

    let step = 1; // 1: Ordered, 2: Shipped, 3: Delivered
    if (normalized.includes("shipped")) {
      step = 2;
    } else if (normalized.includes("completed") || normalized.includes("delivered")) {
      step = 3;
    }

    return (
      <div className="py-4 px-2 mt-4 border-t border-border/40">
        <div className="relative flex items-center justify-between w-full max-w-sm sm:max-w-md mx-auto">
          {/* Line Background */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-border/60 -translate-y-1/2 z-0 rounded-full"></div>
          {/* Active Line */}
          <div 
            className="absolute top-1/2 left-0 h-1 bg-success -translate-y-1/2 z-0 transition-all duration-500 rounded-full"
            style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
          ></div>

          {/* Ordered step */}
          <div className="flex flex-col items-center z-10">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs shadow-sm transition duration-300 ${
              step >= 1 ? "bg-success text-white ring-4 ring-success/20" : "bg-surface border border-border text-muted"
            }`}>
              {step >= 1 ? "✓" : "1"}
            </div>
            <span className="text-[10px] font-bold text-text mt-1">Ordered</span>
          </div>

          {/* Shipped step */}
          <div className="flex flex-col items-center z-10">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs shadow-sm transition duration-300 ${
              step >= 2 ? "bg-success text-white ring-4 ring-success/20" : "bg-surface border border-border text-muted"
            }`}>
              {step >= 2 ? "✓" : "2"}
            </div>
            <span className="text-[10px] font-bold text-text mt-1">Shipped</span>
          </div>

          {/* Delivered step */}
          <div className="flex flex-col items-center z-10">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs shadow-sm transition duration-300 ${
              step >= 3 ? "bg-success text-white ring-4 ring-success/20" : "bg-surface border border-border text-muted"
            }`}>
              {step >= 3 ? "✓" : "3"}
            </div>
            <span className="text-[10px] font-bold text-text mt-1">Delivered</span>
          </div>
        </div>
      </div>
    );
  };

  // Filter & Search Logic
  const filteredOrders = orders.filter((order) => {
    const statusLower = order.status?.toLowerCase() || "";
    let matchesFilter = true;
    if (activeFilter === "pending") {
      matchesFilter = statusLower.includes("pending") || statusLower.includes("processing");
    } else if (activeFilter === "shipped") {
      matchesFilter = statusLower.includes("shipped");
    } else if (activeFilter === "completed") {
      matchesFilter = statusLower.includes("completed") || statusLower.includes("delivered");
    } else if (activeFilter === "cancelled") {
      matchesFilter = statusLower.includes("cancel") || statusLower.includes("fail") || statusLower.includes("returned");
    }

    let matchesSearch = true;
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchesId = order.id.toLowerCase().includes(query);
      const matchesItems = order.items.some((item) => item.name.toLowerCase().includes(query));
      matchesSearch = matchesId || matchesItems;
    }

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold text-muted">Loading your orders...</span>
        </div>
      </div>
    );
  }

  const shipToName = user?.full_name || user?.email?.split("@")[0] || "Customer";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-extrabold text-text tracking-tight">My Orders</h1>
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search orders or items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-border bg-surface text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
          <svg className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-border/60 scrollbar-none">
        {[
          { id: "all", label: "All Orders" },
          { id: "pending", label: "Pending" },
          { id: "shipped", label: "Shipped" },
          { id: "completed", label: "Delivered" },
          { id: "cancelled", label: "Cancelled" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition duration-200 focus:outline-none border ${
              activeFilter === tab.id
                ? "bg-primary border-primary text-white shadow-sm"
                : "bg-surface border-border text-muted hover:border-muted/40 hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-surface border border-border/60 rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-border/40 flex items-center justify-center mb-4 text-muted mx-auto">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-text mb-1">No orders found</h3>
          <p className="text-xs text-muted mb-6">
            {searchQuery || activeFilter !== "all"
              ? "Try adjusting your search query or status filters."
              : "Looks like you haven't placed any orders yet."}
          </p>
          <Button
            onClick={() => navigate("/products")}
            className="px-6 py-2 rounded-full text-xs"
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-surface border border-border/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Order Card Header */}
              <div className="bg-background/80 border-b border-border/60 px-5 py-4 sm:px-6 flex flex-wrap justify-between items-center gap-y-3 gap-x-6 text-xs text-muted">
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <div>
                    <p className="uppercase font-bold tracking-wider text-[10px]">Order Placed</p>
                    <p className="font-semibold text-text mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase font-bold tracking-wider text-[10px]">Total</p>
                    <p className="font-extrabold text-text mt-0.5">₹{order.total_price}</p>
                  </div>
                  <div>
                    <p className="uppercase font-bold tracking-wider text-[10px]">Ship To</p>
                    <p className="font-semibold text-text mt-0.5">{shipToName}</p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="uppercase font-bold tracking-wider text-[10px]">Order ID</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="font-mono font-semibold text-text select-all">{order.id}</span>
                    <button
                      onClick={() => copyToClipboard(order.id)}
                      className="hover:text-primary transition"
                      title="Copy Order ID"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Card Body */}
              <div className="p-5 sm:p-6">
                
                {/* Header status bar */}
                <div className="flex items-center justify-between mb-4 gap-4">
                  <span className="text-sm font-bold text-text">Status Tracker</span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Items List */}
                <div className="divide-y divide-border/40">
                  {order.items.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center"
                    >
                      {/* Product Image */}
                      <div 
                        onClick={() => navigate(`/products/${item.product_id}`)}
                        className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-background border border-border/40 rounded-xl overflow-hidden flex items-center justify-center p-1.5 cursor-pointer hover:opacity-90 transition"
                      >
                        <img
                          src={
                            item.image
                              ? `http://localhost:8000${item.image}`
                              : "https://placehold.co/150"
                          }
                          alt={item.name}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>

                      {/* Item details & buy again */}
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-0.5">
                          <h3 
                            onClick={() => navigate(`/products/${item.product_id}`)}
                            className="text-sm sm:text-base font-bold text-text hover:text-primary cursor-pointer transition line-clamp-1"
                          >
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted">
                            <span>Qty: <strong className="text-text">{item.quantity}</strong></span>
                            <span>•</span>
                            <span>Price: <strong className="text-text">₹{item.price}</strong></span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBuyItAgain(item.product_id)}
                            className="px-4 py-1.5 rounded-full text-xs font-bold border border-primary/25 hover:border-primary/50 text-primary flex items-center gap-1.5 bg-primary/5 hover:bg-primary/10 transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            <span>Buy it Again</span>
                          </button>
                          <button
                            onClick={() => navigate(`/products/${item.product_id}`)}
                            className="px-4 py-1.5 rounded-full text-xs font-bold border border-border hover:bg-border/30 text-text flex items-center justify-center bg-surface transition duration-200 focus:outline-none focus:ring-2 focus:ring-border/40"
                          >
                            View Product
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Status Timeline */}
                {renderProgressTracker(order.status)}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
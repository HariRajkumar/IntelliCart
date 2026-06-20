import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AuthContext from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { getCart, clearCart } from "../services/cartService";
import { getUserProfile, addUserAddress } from "../services/userService";
import { checkout } from "../services/orderService";
import { getDeliveryEstimate } from "../services/productService";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Checkout Wizard Steps: 1 = Address, 2 = Payment, 3 = Review, 4 = Success
  const [step, setStep] = useState(1);

  // Step 1: Address States
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  
  // New Address Form Inputs
  const [newAddressLine, setNewAddressLine] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newPostalCode, setNewPostalCode] = useState("");
  const [newCountry, setNewCountry] = useState("India");
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);

  // Delivery Estimates Cache
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);
  const [estimatingDelivery, setEstimatingDelivery] = useState(false);

  // Step 2: Payment States
  const [paymentMethod, setPaymentMethod] = useState("Card"); // "Card" | "UPI" | "COD"
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [paymentTransactionId, setPaymentTransactionId] = useState("");
  
  // Card Payment Form Inputs
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardFlipped, setCardFlipped] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // UPI Payment States
  const [upiTimer, setUpiTimer] = useState(300); // 5 minutes in seconds
  const [showUpiModal, setShowUpiModal] = useState(false);

  // Step 3: Placing Order
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  // Load Cart & User Profile Addresses
  useEffect(() => {
    loadCheckoutDetails();
  }, []);

  // UPI Timer Countdown Effect
  useEffect(() => {
    if (showUpiModal && upiTimer > 0) {
      const timer = setInterval(() => {
        setUpiTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (upiTimer === 0) {
      setShowUpiModal(false);
      toast.error("UPI Session expired. Please try again.");
      setUpiTimer(300);
    }
  }, [showUpiModal, upiTimer]);

  const loadCheckoutDetails = async () => {
    try {
      setLoading(true);
      
      // Load Cart
      const cartData = await getCart();
      if (!cartData || !cartData.items || cartData.items.length === 0) {
        toast.error("Your cart is empty. Redirecting to products page.");
        navigate("/products");
        return;
      }
      setCart(cartData);

      // Load Profile Addresses
      const profile = await getUserProfile();
      const userAddresses = profile.addresses || [];
      setAddresses(userAddresses);

      // Default selected address to the default profile address, or first available
      const defaultAddr = userAddresses.find((a) => a.is_default);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        fetchDeliveryEstimates(cartData, defaultAddr.postal_code);
      } else if (userAddresses.length > 0) {
        setSelectedAddressId(userAddresses[0].id);
        fetchDeliveryEstimates(cartData, userAddresses[0].postal_code);
      } else {
        setShowNewAddressForm(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load checkout details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Delivery Transit Windows for all items in cart based on chosen ZIP code
  const fetchDeliveryEstimates = async (currentCart, postalCode) => {
    if (!postalCode || !currentCart || currentCart.items.length === 0) return;
    
    setEstimatingDelivery(true);
    try {
      // Fetch delivery estimate for the first item to showcase rule-based estimation
      const firstItem = currentCart.items[0];
      const estimate = await getDeliveryEstimate(firstItem.product_id, postalCode);
      setDeliveryEstimate(estimate);
    } catch (err) {
      console.error("Estimation failed", err);
    } finally {
      setEstimatingDelivery(false);
    }
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    const chosen = addresses.find((a) => a.id === addressId);
    if (chosen) {
      fetchDeliveryEstimates(cart, chosen.postal_code);
    }
  };

  // Add custom inline address
  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddressLine.trim() || !newCity.trim() || !newState.trim() || !newPostalCode.trim()) {
      toast.error("Please fill in all address details");
      return;
    }

    setAddingAddress(true);
    const addressPayload = {
      address_line: newAddressLine,
      city: newCity,
      state: newState,
      postal_code: newPostalCode,
      country: newCountry,
      is_default: isDefaultAddress,
    };

    try {
      let savedAddress = null;
      if (saveToProfile) {
        savedAddress = await addUserAddress(addressPayload);
        toast.success("Address added to your profile!");
      } else {
        // Mock a non-saved temporary address
        savedAddress = {
          ...addressPayload,
          id: "temp_" + Math.random().toString(36).substring(2, 9),
        };
      }

      setAddresses((prev) => [...prev, savedAddress]);
      setSelectedAddressId(savedAddress.id);
      fetchDeliveryEstimates(cart, savedAddress.postal_code);
      setShowNewAddressForm(false);
      
      // Clear inputs
      setNewAddressLine("");
      setNewCity("");
      setNewState("");
      setNewPostalCode("");
      setIsDefaultAddress(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add address");
    } finally {
      setAddingAddress(false);
    }
  };

  // Format Card Number input with spaces (e.g. XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const formatted = value.match(/.{1,4}/g)?.join(" ").substring(0, 19) || "";
    setCardNumber(formatted);
  };

  // Format Expiry date MM/YY
  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 2) {
      setCardExpiry(value);
    } else {
      setCardExpiry(`${value.substring(0, 2)}/${value.substring(2, 4)}`);
    }
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();
    const cleanNumber = cardNumber.replace(/\s/g, "");
    if (cleanNumber.length !== 16) {
      toast.error("Card number must be exactly 16 digits");
      return;
    }
    if (!cardHolder.trim()) {
      toast.error("Card holder name is required");
      return;
    }
    if (cardExpiry.length !== 5) {
      toast.error("Expiry date must be in MM/YY format");
      return;
    }
    if (cardCvv.length !== 3) {
      toast.error("CVV must be exactly 3 digits");
      return;
    }

    setProcessingPayment(true);
  };

  const handleSimulatePayment = (success) => {
    setProcessingPayment(false);
    if (success) {
      const mockTxnId = "txn_" + Math.random().toString(36).substring(2, 12).toUpperCase();
      setPaymentTransactionId(mockTxnId);
      setPaymentStatus("paid");
      toast.success("Card Payment Authorized Successfully!");
      setStep(3); // Proceed to Review Step
    } else {
      setPaymentStatus("failed");
      toast.error("Card Payment Failed. Try again or choose Cash on Delivery.");
    }
  };

  // UPI payment simulation triggers
  const handleUPIOpen = () => {
    setUpiTimer(300);
    setShowUpiModal(true);
  };

  const handleUPISimulation = (success) => {
    setShowUpiModal(false);
    if (success) {
      const mockTxnId = "upi_" + Math.random().toString(36).substring(2, 12).toUpperCase();
      setPaymentTransactionId(mockTxnId);
      setPaymentStatus("paid");
      toast.success("UPI Transaction Approved!");
      setStep(3); // Proceed to Review
    } else {
      setPaymentStatus("failed");
      toast.error("UPI Transaction Declined.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Execute Final Checkout
  const handlePlaceOrder = async () => {
    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    setPlacingOrder(true);
    try {
      const payload = {
        shipping_address: {
          id: selectedAddress.id,
          address_line: selectedAddress.address_line,
          city: selectedAddress.city,
          state: selectedAddress.state,
          postal_code: selectedAddress.postal_code,
          country: selectedAddress.country,
          is_default: selectedAddress.is_default,
        },
        payment_method: paymentMethod,
        payment_transaction_id: paymentTransactionId || null,
        payment_status: paymentMethod === "COD" ? "pending" : paymentStatus,
      };

      const orderResult = await checkout(payload);
      setPlacedOrderDetails(orderResult);
      await clearCart(); // Clean cart state locally & backend
      setStep(4); // Success Page
      toast.success("Order placed successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Checkout failed");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm font-semibold text-muted">Securing checkout session...</p>
      </div>
    );
  }

  const itemsCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const currentSelectedAddress = addresses.find((a) => a.id === selectedAddressId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Styles for card flipping & custom confetti */}
      <style>{`
        /* Card Flip styles */
        .card-perspective {
          perspective: 1000px;
        }
        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        .card-flipped {
          transform: rotateY(180deg);
        }
        .card-front, .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 1rem;
        }
        .card-back {
          transform: rotateY(180deg);
        }

        /* SVG Confetti Styles */
        @keyframes confetti-fall {
          0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(80vh) rotate(360deg);
            opacity: 0;
          }
        }
        .confetti-svg {
          position: absolute;
          animation: confetti-fall 4s linear infinite;
        }
      `}</style>

      {/* Stepper Progress Bar */}
      {step < 4 && (
        <div className="mb-10 max-w-xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border/60 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
            />

            {[
              { label: "Delivery", stepNum: 1 },
              { label: "Payment", stepNum: 2 },
              { label: "Review", stepNum: 3 }
            ].map((s) => (
              <button
                key={s.stepNum}
                onClick={() => step < 4 && s.stepNum < step && setStep(s.stepNum)}
                disabled={step >= 4 || s.stepNum >= step}
                className="flex flex-col items-center z-10 focus:outline-none"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition duration-300 ${
                  step === s.stepNum
                    ? "bg-primary text-white ring-4 ring-primary/20 scale-110"
                    : step > s.stepNum
                    ? "bg-success text-white"
                    : "bg-surface border border-border text-muted"
                }`}>
                  {step > s.stepNum ? "✓" : s.stepNum}
                </div>
                <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${
                  step === s.stepNum ? "text-primary font-black" : "text-muted"
                }`}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step Components */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Steps Wizard Content (8 Cols) */}
        {step < 4 && (
          <div className="lg:col-span-8 space-y-6">
            
            {/* STEP 1: DELIVERY ADDRESS */}
            {step === 1 && (
              <div className="bg-surface border border-border/60 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-text tracking-tight">Select Shipping Address</h2>
                  <p className="text-xs text-muted mt-1">Select where you want your orders delivered.</p>
                </div>

                {/* Saved Addresses List */}
                {addresses.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => handleAddressSelect(addr.id)}
                        className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition relative flex flex-col justify-between min-h-[140px] bg-slate-50/50 ${
                          selectedAddressId === addr.id
                            ? "border-primary ring-2 ring-primary/10 bg-white"
                            : "border-border/60 hover:border-muted/40"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="radio"
                              name="shipping_address"
                              checked={selectedAddressId === addr.id}
                              onChange={() => handleAddressSelect(addr.id)}
                              className="text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            <span className="text-xs font-bold text-text uppercase tracking-wider">
                              {addr.is_default ? "Default Shipping" : "Saved Address"}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-text">{addr.address_line}</p>
                          <p className="text-xs font-semibold text-muted mt-0.5">
                            {addr.city}, {addr.state} - {addr.postal_code}
                          </p>
                          <p className="text-[10px] text-muted font-bold mt-1 uppercase">{addr.country}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Delivery Estimates Banner for the selected address */}
                {selectedAddressId && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl text-left">
                    <h4 className="text-xs font-black uppercase text-muted tracking-wider mb-1">Transit Window Details</h4>
                    {estimatingDelivery ? (
                      <span className="text-xs text-muted flex items-center gap-2 mt-1">
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-primary/20 border-t-primary animate-spin inline-block shrink-0" />
                        Fetching route estimates...
                      </span>
                    ) : deliveryEstimate ? (
                      <div className="mt-1">
                        <p className="text-xs font-bold text-text">
                          🚚 Estimated Arrival: <span className="text-primary font-black">{deliveryEstimate.delivery_date_range}</span>
                        </p>
                        <p className="text-[10px] text-muted font-bold mt-0.5">
                          Ships from: {deliveryEstimate.seller_name} ({deliveryEstimate.origin_postal_code}) to Destination: {deliveryEstimate.destination_postal_code}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted">Estimate not calculated.</p>
                    )}
                  </div>
                )}

                {/* Add New Address Trigger */}
                {!showNewAddressForm ? (
                  <button
                    onClick={() => setShowNewAddressForm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-dashed border-border hover:border-muted font-bold text-xs text-primary bg-slate-50 hover:bg-slate-100 transition focus:outline-none"
                  >
                    + Add A New Shipping Address
                  </button>
                ) : (
                  <form onSubmit={handleAddNewAddress} className="border-t border-border/40 pt-6 space-y-4 text-left">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xs font-black uppercase tracking-wider text-muted">New Shipping Address</h3>
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="text-xs font-semibold text-error hover:underline focus:outline-none"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Street Address</label>
                        <Input
                          type="text"
                          placeholder="Flat, House no., Building, Company, Apartment, Street"
                          value={newAddressLine}
                          onChange={(e) => setNewAddressLine(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">City</label>
                        <Input
                          type="text"
                          placeholder="e.g. Mumbai, Bengaluru"
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">State / Region</label>
                        <Input
                          type="text"
                          placeholder="e.g. Maharashtra, Karnataka"
                          value={newState}
                          onChange={(e) => setNewState(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">PIN / ZIP Code</label>
                        <Input
                          type="text"
                          placeholder="6 Digit PIN code"
                          value={newPostalCode}
                          onChange={(e) => setNewPostalCode(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Country</label>
                        <Input
                          type="text"
                          value={newCountry}
                          onChange={(e) => setNewCountry(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 ml-1">
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={saveToProfile}
                          onChange={(e) => setSaveToProfile(e.target.checked)}
                          className="rounded text-primary focus:ring-primary h-4 w-4"
                        />
                        <span className="text-xs font-semibold text-text">Save this address to my profile book</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isDefaultAddress}
                          onChange={(e) => setIsDefaultAddress(e.target.checked)}
                          className="rounded text-primary focus:ring-primary h-4 w-4"
                        />
                        <span className="text-xs font-semibold text-text">Set as default shipping address</span>
                      </label>
                    </div>

                    <Button type="submit" disabled={addingAddress} className="rounded-xl w-full py-2.5 text-xs font-bold mt-2">
                      {addingAddress ? "Saving Address..." : "Add & Select Address"}
                    </Button>
                  </form>
                )}

                {/* Continue Button */}
                {selectedAddressId && !showNewAddressForm && (
                  <div className="pt-4 border-t border-border/40 text-right">
                    <Button onClick={() => setStep(2)} className="px-6 py-2 rounded-xl text-xs font-bold">
                      Continue to Payment
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: PAYMENT METHOD */}
            {step === 2 && (
              <div className="bg-surface border border-border/60 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-text tracking-tight">Select Payment Option</h2>
                  <p className="text-xs text-muted mt-1">Choose how you want to pay. We support mock credit cards and UPI simulators.</p>
                </div>

                {/* Payment Option Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: "Card", label: "Credit/Debit Card", desc: "Simulate Secure Card Transaction" },
                    { id: "UPI", label: "UPI (Google Pay/GPay)", desc: "Simulate Scan-and-Pay QR flow" },
                    { id: "COD", label: "Cash on Delivery", desc: "Pay cash upon delivery. Status Pending" }
                  ].map((pay) => (
                    <div
                      key={pay.id}
                      onClick={() => {
                        setPaymentMethod(pay.id);
                        setPaymentStatus(pay.id === "COD" ? "pending" : "pending");
                        setPaymentTransactionId("");
                      }}
                      className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition flex flex-col justify-between min-h-[120px] ${
                        paymentMethod === pay.id
                          ? "border-primary ring-2 ring-primary/10 bg-white"
                          : "border-border/60 hover:border-muted/40 bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="radio"
                          name="payment_option"
                          checked={paymentMethod === pay.id}
                          onChange={() => setPaymentMethod(pay.id)}
                          className="text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        <span className="text-xs font-bold text-text tracking-wider">{pay.label}</span>
                      </div>
                      <p className="text-[10px] font-semibold text-slate-500 leading-snug">{pay.desc}</p>
                    </div>
                  ))}
                </div>

                {/* PAYMENT METHOD DETAILED FORMS & SIMULATORS */}
                <div className="border-t border-border/40 pt-6">
                  
                  {/* Card Payment Simulator */}
                  {paymentMethod === "Card" && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left">
                      
                      {/* Interactive Flip Virtual Card Visual (5 Cols) */}
                      <div className="md:col-span-5 flex justify-center">
                        <div className="card-perspective w-72 h-44 cursor-pointer" onClick={() => setCardFlipped(!cardFlipped)}>
                          <div className={`card-inner rounded-2xl shadow-xl transition-transform duration-500 ${cardFlipped ? "card-flipped" : ""}`}>
                            
                            {/* Card Front */}
                            <div className="card-front bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-900 p-4 text-white flex flex-col justify-between">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-[9px] font-bold uppercase opacity-65 tracking-wider">Debit Card</p>
                                  <p className="text-[11px] font-extrabold tracking-wide mt-0.5">IntelliCart Bank</p>
                                </div>
                                <svg className="w-8 h-8 opacity-90 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                                </svg>
                              </div>

                              {/* Card Number */}
                              <p className="text-base font-bold font-mono tracking-widest text-center my-3 bg-black/15 py-0.5 rounded">
                                {cardNumber || "XXXX XXXX XXXX XXXX"}
                              </p>

                              <div className="flex justify-between items-end">
                                <div>
                                  <p className="text-[7px] uppercase tracking-wider opacity-60">Card Holder</p>
                                  <p className="text-[10px] font-bold tracking-wide uppercase truncate max-w-[130px]">
                                    {cardHolder || "Your Name"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[7px] uppercase tracking-wider opacity-60">Expires</p>
                                  <p className="text-[10px] font-bold font-mono">{cardExpiry || "MM/YY"}</p>
                                </div>
                              </div>
                            </div>

                            {/* Card Back */}
                            <div className="card-back bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 p-4 text-white flex flex-col justify-between">
                              <div className="w-full h-8 bg-slate-950 -mx-4 mt-2" />
                              
                              {/* Signature & CVV strip */}
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-6 bg-slate-300 rounded font-serif italic text-slate-800 text-[10px] pl-2 flex items-center select-none bg-opacity-70">
                                  Authorized Signature
                                </div>
                                <div className="w-12 h-6 bg-white rounded text-slate-900 text-xs font-black font-mono flex items-center justify-center">
                                  {cardCvv || "CVV"}
                                </div>
                              </div>

                              <p className="text-[7px] text-muted text-center leading-normal opacity-50">
                                This is a simulated test card layout. Do not input real credit card credentials here.
                              </p>
                            </div>

                          </div>
                        </div>
                      </div>

                      {/* Card Inputs (7 Cols) */}
                      <form onSubmit={handleCardSubmit} className="md:col-span-7 space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Card Number</label>
                          <Input
                            type="text"
                            placeholder="XXXX XXXX XXXX XXXX"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Card Holder Name</label>
                          <Input
                            type="text"
                            placeholder="e.g. Rajesh Kumar"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Expiry Date</label>
                            <Input
                              type="text"
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={handleExpiryChange}
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">CVV</label>
                            <Input
                              type="password"
                              placeholder="123"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").substring(0, 3))}
                              onFocus={() => setCardFlipped(true)}
                              onBlur={() => setCardFlipped(false)}
                              required
                            />
                          </div>
                        </div>

                        {/* Trigger Simulated Processing */}
                        <Button type="submit" className="rounded-xl w-full py-2.5 text-xs font-bold mt-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                          Simulate Authorization Gateway
                        </Button>
                      </form>

                    </div>
                  )}

                  {/* UPI Payment Simulator */}
                  {paymentMethod === "UPI" && (
                    <div className="space-y-4 text-center py-4 bg-slate-50 border border-border/30 rounded-2xl max-w-md mx-auto">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-bold text-text">Unified Payments Interface (UPI)</h3>
                      <p className="text-xs text-muted max-w-xs mx-auto">
                        Generates a mock QR Code for PhonePe, Google Pay, Paytm, or BHIM apps.
                      </p>
                      
                      <Button onClick={handleUPIOpen} className="rounded-xl px-6 py-2 text-xs font-bold mt-2">
                        Display UPI QR Code Screen
                      </Button>
                    </div>
                  )}

                  {/* COD Payment Simulator */}
                  {paymentMethod === "COD" && (
                    <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl text-left max-w-md mx-auto">
                      <p className="text-xs text-amber-800 flex items-start gap-2 leading-relaxed">
                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>
                          Cash on Delivery (COD) is enabled. No transaction validation is required. Your order will be set to a status of <strong>Pending</strong>.
                        </span>
                      </p>
                      <div className="text-right mt-4">
                        <Button onClick={() => setStep(3)} className="px-6 py-2 rounded-xl text-xs font-bold">
                          Review Order
                        </Button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* STEP 3: REVIEW ORDER */}
            {step === 3 && (
              <div className="bg-surface border border-border/60 rounded-3xl p-6 shadow-sm space-y-6 text-left">
                <div>
                  <h2 className="text-xl font-extrabold text-text tracking-tight">Review Your Order</h2>
                  <p className="text-xs text-muted mt-1">Please double check your shipping and payment configurations before placement.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border/40">
                  
                  {/* Address Summary */}
                  <div>
                    <h3 className="text-xs font-black uppercase text-muted tracking-wider mb-2">Shipping Destination</h3>
                    {currentSelectedAddress && (
                      <div className="p-4 rounded-2xl border border-border/60 bg-slate-50/40">
                        <p className="text-xs font-extrabold text-text">{currentSelectedAddress.address_line}</p>
                        <p className="text-xs font-semibold text-muted mt-0.5">
                          {currentSelectedAddress.city}, {currentSelectedAddress.state} - {currentSelectedAddress.postal_code}
                        </p>
                        <p className="text-[10px] text-muted font-bold mt-1 uppercase">{currentSelectedAddress.country}</p>
                      </div>
                    )}
                  </div>

                  {/* Payment Summary */}
                  <div>
                    <h3 className="text-xs font-black uppercase text-muted tracking-wider mb-2">Payment Details</h3>
                    <div className="p-4 rounded-2xl border border-border/60 bg-slate-50/40 space-y-1">
                      <p className="text-xs font-bold text-text">
                        Method: <span className="text-primary font-black uppercase">{paymentMethod}</span>
                      </p>
                      <p className="text-xs font-semibold text-muted">
                        Status: <span className={`font-bold capitalize ${paymentStatus === "paid" ? "text-success" : "text-amber-600"}`}>
                          {paymentMethod === "COD" ? "Pending (Cash on Delivery)" : paymentStatus}
                        </span>
                      </p>
                      {paymentTransactionId && (
                        <p className="text-[10px] font-mono text-muted break-all mt-1">
                          Transaction ID: {paymentTransactionId}
                        </p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Cart Items Summary */}
                <div>
                  <h3 className="text-xs font-black uppercase text-muted tracking-wider mb-3">Itemized Catalog</h3>
                  <div className="divide-y divide-border/40 max-h-60 overflow-y-auto pr-1">
                    {cart.items.map((item) => (
                      <div key={item.product_id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg border border-border/40 bg-slate-50 flex items-center justify-center p-1">
                            <img src={`${import.meta.env.VITE_BACKEND_URL}${item.image}`} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                          </div>
                          <div>
                            <p className="font-bold text-text line-clamp-1 max-w-[200px] sm:max-w-[350px]">{item.name}</p>
                            <p className="text-[10px] text-muted mt-0.5">Qty: {item.quantity} × ₹{item.price}</p>
                          </div>
                        </div>
                        <span className="font-extrabold text-text">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Order trigger buttons */}
                <div className="pt-6 border-t border-border/40 flex justify-between gap-4">
                  <Button variant="ghost" onClick={() => setStep(2)} className="px-5 py-2.5 rounded-xl text-xs">
                    Back to Payment
                  </Button>
                  <Button onClick={handlePlaceOrder} disabled={placingOrder} className="px-8 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                    {placingOrder ? "Placing Order..." : "Confirm & Place Order"}
                  </Button>
                </div>

              </div>
            )}

          </div>
        )}

        {/* RIGHT COLUMN: Order Summary Box (4 Cols) */}
        {step < 4 && (
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="bg-surface border border-border/60 rounded-3xl p-6 shadow-sm text-left">
              <h3 className="text-xs font-extrabold text-muted tracking-wider uppercase mb-4">
                Order Value Summary
              </h3>

              <div className="space-y-3 border-b border-border/60 pb-4 text-xs text-text">
                <div className="flex justify-between">
                  <span>Cart Subtotal ({itemsCount} items)</span>
                  <span className="font-semibold">₹{cart.total_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping & Handling</span>
                  <span className="text-success font-black">FREE</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 mb-4">
                <span className="text-xs font-extrabold text-text">Final Grand Total</span>
                <span className="text-lg font-black text-text">₹{cart.total_price.toLocaleString()}</span>
              </div>

              <div className="bg-slate-50 border border-border/40 p-3 rounded-2xl">
                <p className="text-[10px] text-muted font-semibold leading-relaxed">
                  🛒 Items are estimated and reserved for you during checkout. Deliveries are 100% free under our promotional checkout integration program.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* STEP 4: SUCCESS VIEW */}
      {step === 4 && placedOrderDetails && (
        <div className="max-w-2xl mx-auto py-12 px-4 text-center relative overflow-hidden bg-surface border border-border/50 rounded-3xl shadow-xl">
          
          {/* Confetti Falling Shapes (Pure SVG & CSS Keyframes) */}
          {[...Array(30)].map((_, i) => {
            const size = Math.random() * 8 + 4;
            const left = Math.random() * 100;
            const delay = Math.random() * 4;
            const duration = Math.random() * 3 + 3;
            const colors = ["#4F46E5", "#818CF8", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            return (
              <svg
                key={i}
                className="confetti-svg"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${left}%`,
                  top: `-20px`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                }}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" fill={randomColor} />
              </svg>
            );
          })}

          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6 mx-auto text-success ring-8 ring-emerald-50 scale-110">
            <svg className="w-10 h-10 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold text-text tracking-tight mb-2">Order Confirmed!</h1>
          <p className="text-sm text-muted max-w-sm mx-auto mb-8">
            Thank you for shopping on IntelliCart! Your payment has been received and order processing initiated.
          </p>

          <div className="bg-slate-50 border border-border/40 p-5 rounded-2xl text-left space-y-3 max-w-md mx-auto text-xs mb-8">
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="font-semibold text-muted">Order ID:</span>
              <span className="font-mono font-bold text-text">{placedOrderDetails.id}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="font-semibold text-muted">Shipping Address:</span>
              <span className="font-semibold text-text text-right truncate max-w-[220px]">
                {placedOrderDetails.shipping_address?.address_line}, {placedOrderDetails.shipping_address?.city}
              </span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="font-semibold text-muted">Payment Mode:</span>
              <span className="font-bold text-text uppercase">{placedOrderDetails.payment_method}</span>
            </div>
            {placedOrderDetails.payment_transaction_id && (
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="font-semibold text-muted">Transaction ID:</span>
                <span className="font-mono text-muted text-right break-all truncate max-w-[220px]">
                  {placedOrderDetails.payment_transaction_id}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-1">
              <span className="font-bold text-text">Total Price Paid:</span>
              <span className="font-black text-primary">₹{placedOrderDetails.total_price.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xs mx-auto">
            <Button onClick={() => navigate("/orders")} className="w-full py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg">
              Track My Orders
            </Button>
            <Button variant="ghost" onClick={() => navigate("/products")} className="w-full py-2.5 rounded-xl text-xs font-bold">
              Continue Shopping
            </Button>
          </div>
        </div>
      )}

      {/* GATEWAY GATE MODALS */}
      {/* 1. Processing Payment overlay loader */}
      {processingPayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border p-6 rounded-3xl text-center max-w-sm w-full space-y-4 shadow-2xl animate-fade-in-up">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
            <h3 className="text-sm font-bold text-text">Authorizing Card Transaction...</h3>
            <p className="text-xs text-slate-500">Contacting secure debit banking simulator.</p>
            
            <div className="border-t border-border/40 pt-4 flex gap-2">
              <button
                onClick={() => handleSimulatePayment(false)}
                className="flex-1 py-2 rounded-xl border border-error hover:bg-error/5 text-error font-bold text-xs transition focus:outline-none"
              >
                Simulate Fail
              </button>
              <button
                onClick={() => handleSimulatePayment(true)}
                className="flex-1 py-2 rounded-xl bg-success hover:bg-emerald-600 text-white font-bold text-xs transition focus:outline-none"
              >
                Simulate Success
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. UPI scan QR Code Simulator Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border p-6 rounded-3xl text-center max-w-sm w-full space-y-4 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-border/40 pb-3">
              <span className="text-xs font-black uppercase text-muted tracking-wider">UPI QR Gateway</span>
              <button
                onClick={() => setShowUpiModal(false)}
                className="text-muted hover:text-text focus:outline-none text-base"
              >
                ×
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-text">Scan & Pay ₹{cart.total_price}</p>
              <p className="text-[10px] text-muted">Scan the QR code below via BHIM, GPay, or PhonePe apps.</p>
            </div>

            {/* Mock QR Code Pattern Grid */}
            <div className="w-44 h-44 border border-border bg-white p-3 mx-auto flex items-center justify-center rounded-xl relative shadow-inner">
              <div className="grid grid-cols-5 grid-rows-5 gap-1 w-full h-full opacity-80 select-none pointer-events-none">
                {[...Array(25)].map((_, idx) => {
                  const isBlack = (idx % 2 === 0 && idx % 3 !== 0) || idx === 0 || idx === 4 || idx === 20 || idx === 24;
                  return (
                    <div
                      key={idx}
                      className={`rounded-sm ${isBlack ? "bg-slate-900" : "bg-white"}`}
                    />
                  );
                })}
              </div>
              {/* Inner floating center logo */}
              <div className="absolute w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold text-[9px] shadow uppercase">
                UPI
              </div>
            </div>

            <div className="space-y-1 text-center">
              <p className="text-xs font-bold text-primary font-mono tracking-wider">
                Session Expires in: <span className="text-error font-black">{formatTime(upiTimer)}</span>
              </p>
              <p className="text-[9px] text-muted italic">Gateway waiting for server approval callbacks...</p>
            </div>

            <div className="border-t border-border/40 pt-4 flex gap-2">
              <button
                onClick={() => handleUPISimulation(false)}
                className="flex-1 py-2 rounded-xl border border-error hover:bg-error/5 text-error font-bold text-xs transition focus:outline-none"
              >
                Fail Callback
              </button>
              <button
                onClick={() => handleUPISimulation(true)}
                className="flex-1 py-2 rounded-xl bg-success hover:bg-emerald-600 text-white font-bold text-xs transition focus:outline-none"
              >
                Approve Payment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;

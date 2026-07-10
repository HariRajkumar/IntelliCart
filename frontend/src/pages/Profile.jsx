import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
} from "../services/userService";
import { getErrorMessage } from "../utils/errorHandler";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("info"); // info, addresses, security
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Address fields (for create/update)
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [deletingAddressId, setDeletingAddressId] = useState(null);
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [isDefault, setIsDefault] = useState(false);

  // Security fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setProfile(data);
      setFullName(data.full_name);
      setPhoneNumber(data.phone_number || "");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateUserProfile({
        full_name: fullName,
        phone_number: phoneNumber || null,
      });
      setProfile(updated);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setSaving(true);
    try {
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      toast.success("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Address Handlers
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressLine.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      toast.error("All address fields are required");
      return;
    }

    const payload = {
      address_line: addressLine,
      city,
      state,
      postal_code: postalCode,
      country,
      is_default: isDefault,
    };

    setSaving(true);
    try {
      let updatedAddresses;
      if (isEditingAddress && editingAddressId) {
        updatedAddresses = await updateUserAddress(editingAddressId, payload);
        toast.success("Address updated successfully!");
      } else {
        updatedAddresses = await addUserAddress(payload);
        toast.success("New address added successfully!");
      }

      setProfile((prev) => ({ ...prev, addresses: updatedAddresses }));
      resetAddressForm();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEditAddressClick = (addr) => {
    setIsEditingAddress(true);
    setEditingAddressId(addr.id);
    setAddressLine(addr.address_line);
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postal_code);
    setCountry(addr.country);
    setIsDefault(addr.is_default);
    // Scroll to form on mobile/small screens
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDeleteAddress = async (addressId) => {
    setSaving(true);
    try {
      const updatedAddresses = await deleteUserAddress(addressId);
      setProfile((prev) => ({ ...prev, addresses: updatedAddresses }));
      toast.success("Address removed successfully!");
      setDeletingAddressId(null);
      if (editingAddressId === addressId) {
        resetAddressForm();
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefaultAddress = async (addr) => {
    if (addr.is_default) return;
    setSaving(true);
    try {
      const updatedAddresses = await updateUserAddress(addr.id, { is_default: true });
      setProfile((prev) => ({ ...prev, addresses: updatedAddresses }));
      toast.success("Default address updated!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const resetAddressForm = () => {
    setIsEditingAddress(false);
    setEditingAddressId(null);
    setAddressLine("");
    setCity("");
    setState("");
    setPostalCode("");
    setCountry("India");
    setIsDefault(false);
    setDeletingAddressId(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm font-semibold text-muted">Loading your profile details...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden">
      {/* Decorative gradient glowing mesh overlays */}
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto animate-fade-in-up">
        {/* Header summary banner */}
        <div className="bg-surface border border-border/50 rounded-3xl p-6 sm:p-8 shadow-premium mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-5 self-start sm:self-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-lg shadow-primary/10 select-none uppercase transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              {(profile?.full_name || "U").charAt(0)}
            </div>
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight leading-tight">
                {profile?.full_name}
              </h1>
              <p className="text-xs sm:text-sm text-muted font-medium mt-1">
                {profile?.email} <span className="mx-1.5 font-bold text-border">•</span> <span className="capitalize font-bold text-primary">{profile?.role} Account</span>
              </p>
            </div>
          </div>
          
          <div className="self-end sm:self-center">
            <span className="text-[10px] font-black uppercase text-muted tracking-wider bg-slate-50 border border-border/40 px-3 py-1.5 rounded-xl">
              Member Since: {new Date(profile?.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Dashboard Grid split: Left Navigation Sidebar, Right Tab content panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* 1. Left Sidebar Navigation Panel */}
          <aside className="md:col-span-4 lg:col-span-3">
            <div className="bg-surface rounded-3xl border border-border/50 p-4 shadow-premium space-y-1.5">
              <button
                onClick={() => {
                  setActiveTab("info");
                  resetAddressForm();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === "info"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-muted hover:bg-slate-50 hover:text-text"
                }`}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Account Info</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("addresses");
                  resetAddressForm();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === "addresses"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-muted hover:bg-slate-50 hover:text-text"
                }`}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Address Book</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("security");
                  resetAddressForm();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === "security"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-muted hover:bg-slate-50 hover:text-text"
                }`}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Security</span>
              </button>
            </div>
          </aside>

          {/* 2. Right Workspace Content Panel */}
          <main className="md:col-span-8 lg:col-span-9 animate-slide-in-right">
            
            {/* TAB: PROFILE ACCOUNT INFORMATION */}
            {activeTab === "info" && (
              <div className="bg-surface rounded-3xl border border-border/50 p-6 sm:p-8 shadow-premium text-left">
                <div className="pb-4 border-b border-border/60 mb-6">
                  <h2 className="text-xl font-bold text-text">Account Information</h2>
                  <p className="text-xs text-muted mt-1">Review and update your public name and contact phone number.</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Email Address</label>
                      <Input
                        type="email"
                        value={profile?.email}
                        disabled
                        className="bg-slate-50 cursor-not-allowed opacity-75 font-medium"
                      />
                      <p className="text-[10px] text-muted ml-1.5 mt-1 font-semibold">Account email cannot be modified.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Full Name</label>
                      <Input
                        type="text"
                        placeholder="Your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Phone Number</label>
                      <Input
                        type="tel"
                        placeholder="Enter phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={saving} className="px-8 rounded-xl">
                      {saving ? "Saving Changes..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: ADDRESS BOOK MANAGEMENT */}
            {activeTab === "addresses" && (
              <div className="space-y-8 text-left">
                {/* 1. Address Cards List */}
                <div className="bg-surface rounded-3xl border border-border/50 p-6 sm:p-8 shadow-premium">
                  <div className="pb-4 border-b border-border/60 mb-6 flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-text">Saved Addresses</h2>
                      <p className="text-xs text-muted mt-1">Manage delivery locations for checking out products.</p>
                    </div>
                    {isEditingAddress && (
                      <button
                        onClick={resetAddressForm}
                        className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 border border-primary/20 px-3 py-1.5 rounded-xl bg-primary/5 transition"
                      >
                        Add New Address
                      </button>
                    )}
                  </div>

                  {!profile?.addresses || profile.addresses.length === 0 ? (
                    <div className="py-10 text-center flex flex-col items-center">
                      <svg className="w-12 h-12 text-muted/50 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h4 className="text-sm font-bold text-text">No saved addresses found</h4>
                      <p className="text-xs text-muted max-w-xs mt-1">Please fill in the form below to create your first delivery location.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profile.addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 bg-surface ${
                            addr.is_default
                              ? "border-primary ring-2 ring-primary/10 shadow-sm"
                              : "border-border/60 hover:border-slate-300"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-2.5">
                              {addr.is_default ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary/10 text-[9px] font-bold text-primary uppercase tracking-wider">
                                  Default Shipping
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleSetDefaultAddress(addr)}
                                  disabled={saving}
                                  className="text-[9px] font-bold text-muted hover:text-primary uppercase tracking-wider border border-border hover:border-primary/20 px-2 py-0.5 rounded-md hover:bg-primary/5 transition"
                                >
                                  Set as Default
                                </button>
                              )}
                            </div>
                            
                            <p className="text-sm font-semibold text-text leading-relaxed break-words">
                              {addr.address_line}
                            </p>
                            <p className="text-xs text-muted mt-1 font-medium">
                              {addr.city}, {addr.state} — {addr.postal_code}
                            </p>
                            <p className="text-xs text-muted font-bold mt-0.5 uppercase tracking-wide">
                              {addr.country}
                            </p>
                          </div>

                          <div className="flex justify-end gap-2.5 pt-3 border-t border-border/40">
                            <button
                              onClick={() => handleEditAddressClick(addr)}
                              className="text-xs font-bold text-primary hover:underline transition flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              <span>Edit</span>
                            </button>
                            {deletingAddressId === addr.id ? (
                              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200/60 px-2.5 py-1 rounded-xl animate-fade-in">
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider">Confirm Delete?</span>
                                <button
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  disabled={saving}
                                  className="text-xs font-black text-white bg-error hover:bg-error-hover px-2.5 py-1 rounded-lg transition"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeletingAddressId(null)}
                                  className="text-xs font-bold text-muted hover:text-text px-1.5 py-1"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingAddressId(addr.id)}
                                disabled={saving}
                                className="text-xs font-bold text-error hover:underline transition flex items-center gap-1"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Address Builder / Editor Form */}
                <div id="address-form-box" className="bg-surface rounded-3xl border border-border/50 p-6 sm:p-8 shadow-premium transition-all duration-300">
                  <div className="pb-4 border-b border-border/60 mb-6 flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-text">
                        {isEditingAddress ? "Edit Saved Address" : "Add Delivery Address"}
                      </h2>
                      <p className="text-xs text-muted mt-1">
                        {isEditingAddress
                          ? "Modify your address settings below."
                          : "Save a new address to checkout quickly."}
                      </p>
                    </div>
                    {isEditingAddress && (
                      <button
                        onClick={resetAddressForm}
                        className="text-xs text-muted hover:text-text font-bold"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSaveAddress} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Street Address</label>
                      <Input
                        type="text"
                        placeholder="House, Flat No, Building name, Street name"
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">City</label>
                        <Input
                          type="text"
                          placeholder="Mumbai, Bengaluru, Delhi"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">State</label>
                        <Input
                          type="text"
                          placeholder="Maharashtra, Karnataka, Haryana"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Postal/PIN Code</label>
                        <Input
                          type="text"
                          placeholder="6-digit ZIP code"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Country</label>
                        <Input
                          type="text"
                          placeholder="India, etc."
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isDefault}
                          onChange={(e) => setIsDefault(e.target.checked)}
                          className="rounded text-primary border-border focus:ring-primary/30 w-4.5 h-4.5 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-text">Set as default shipping address</span>
                      </label>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                      {isEditingAddress && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={resetAddressForm}
                          className="px-6 rounded-xl text-xs"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button type="submit" disabled={saving} className="px-8 rounded-xl">
                        {saving ? "Saving..." : isEditingAddress ? "Save Changes" : "Save Address"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB: SECURITY AND PASSWORD CONFIG */}
            {activeTab === "security" && (
              <div className="bg-surface rounded-3xl border border-border/50 p-6 sm:p-8 shadow-premium text-left">
                <div className="pb-4 border-b border-border/60 mb-6">
                  <h2 className="text-xl font-bold text-text">Account Security</h2>
                  <p className="text-xs text-muted mt-1">Change your account password safely.</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Current Password</label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">New Password</label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Confirm New Password</label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1"
                    >
                      {showPassword ? (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <span>Hide Passwords</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Show Passwords</span>
                        </>
                      )}
                    </button>
                    
                    <Button type="submit" disabled={saving} className="px-8 rounded-xl">
                      {saving ? "Updating Password..." : "Update Password"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
            
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;

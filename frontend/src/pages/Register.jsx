import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AuthContext from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { sendOTP, verifyOTP, resendOTP } from "../services/authService";
import { getErrorMessage } from "../utils/errorHandler";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP & details
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Countdown timer for OTP resending
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      await sendOTP(email);
      toast.success("Verification code sent to your email!");
      setStep(2);
      setCountdown(30);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await resendOTP(email);
      toast.success("Verification code resent successfully!");
      setCountdown(30);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a 6-digit verification code");
      return;
    }
    if (!fullName) {
      toast.error("Please enter your full name");
      return;
    }
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    setLoading(true);
    try {
      const data = await verifyOTP({
        email,
        otp,
        full_name: fullName,
        password,
      });
      login(data.access_token);
      toast.success("Welcome! Registration successful");
      navigate("/");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/15 blur-[120px] pointer-events-none" />

      <div className="bg-surface border border-border/50 p-8 rounded-3xl shadow-xl w-full max-w-md relative z-10 transition-all duration-300">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-8 rounded-full transition-all duration-300 ${step === 1 ? 'bg-primary' : 'bg-primary/20'}`} />
            <span className={`h-2.5 w-8 rounded-full transition-all duration-300 ${step === 2 ? 'bg-primary' : 'bg-primary/20'}`} />
          </div>
          <span className="text-xs font-semibold text-muted tracking-wider uppercase">
            Step {step} of 2
          </span>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP}>
            <div className="text-center mb-6">
              <div className="inline-flex p-3.5 bg-primary/10 rounded-2xl text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text mb-2">Create Account</h1>
              <p className="text-sm text-muted">Enter your email to receive a verification OTP</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Email Address</label>
                <Input
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending Code...
                </span>
              ) : "Send Verification Code"}
            </Button>

            <p className="text-center text-sm text-muted mt-6">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold text-primary hover:text-primary-hover transition-colors"
              >
                Sign In
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="text-center mb-6">
              <div className="inline-flex p-3.5 bg-success/10 rounded-2xl text-success mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text mb-2">Verify & Setup</h1>
              <p className="text-sm text-muted">
                Enter code sent to <strong className="text-text">{email}</strong>
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Verification Code</label>
                <Input
                  placeholder="Enter 6-digit OTP"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-xl tracking-[0.5em] font-mono focus:tracking-[0.5em]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Full Name</label>
                <Input
                  placeholder="Your full name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2 ml-1">Password</label>
                <Input
                  placeholder="Minimum 6 characters"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Registering...
                </span>
              ) : "Verify & Register"}
            </Button>

            <div className="flex flex-col items-center gap-3 mt-6">
              {countdown > 0 ? (
                <span className="text-sm text-muted">
                  Resend code in <strong className="text-text font-semibold">{countdown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors disabled:opacity-50"
                >
                  Resend Verification Code
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                }}
                className="text-xs font-semibold text-muted hover:text-text transition-colors flex items-center gap-1.5 mt-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Change Email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;


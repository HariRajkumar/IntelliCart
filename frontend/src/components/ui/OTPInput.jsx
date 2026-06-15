import { useRef } from "react";

const OTPInput = ({ value = "", onChange, length = 6 }) => {
  const inputRefs = useRef([]);

  const otpArray = Array(length)
    .fill("")
    .map((_, i) => value[i] || "");

  const handleChange = (index, val) => {
    const numericVal = val.replace(/\D/g, "");
    if (!numericVal && val !== "") return;

    const newOtpArray = [...otpArray];
    newOtpArray[index] = numericVal.slice(-1);
    const combinedVal = newOtpArray.join("");
    onChange(combinedVal);

    if (numericVal && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpArray[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newOtpArray = [...otpArray];
        newOtpArray[index - 1] = "";
        onChange(newOtpArray.join(""));
      } else {
        const newOtpArray = [...otpArray];
        newOtpArray[index] = "";
        onChange(newOtpArray.join(""));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-3" onPaste={handlePaste}>
      {Array(length)
        .fill(0)
        .map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={otpArray[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-12 text-center text-xl font-bold border-2 border-indigo-500/60 bg-surface text-text rounded-xl transition duration-150 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          />
        ))}
    </div>
  );
};

export default OTPInput;

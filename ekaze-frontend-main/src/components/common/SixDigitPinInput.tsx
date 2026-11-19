import React, { useRef, useEffect } from "react";

interface SixDigitPinInputProps {
  value: string;
  onChange: (val: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  hasError?: boolean;
}

export const SixDigitPinInput: React.FC<SixDigitPinInputProps> = ({
  value,
  onChange,
  autoFocus = true,
  disabled = false,
  hasError = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array of 6 characters
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    if (!rawVal) {
      // Clear this digit
      const next = digits.slice();
      next[index] = "";
      onChange(next.join(""));
      return;
    }

    // If pasted or multiple digits entered
    if (rawVal.length > 1) {
      const pastedDigits = rawVal.slice(0, 6).split("");
      const next = digits.slice();
      pastedDigits.forEach((d, i) => {
        if (index + i < 6) next[index + i] = d;
      });
      onChange(next.join(""));
      const nextFocus = Math.min(index + pastedDigits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const singleDigit = rawVal[rawVal.length - 1];
    const next = digits.slice();
    next[index] = singleDigit;
    onChange(next.join(""));

    // Move to next input if available
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = digits.slice();
        next[index - 1] = "";
        onChange(next.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const next = digits.slice();
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    onChange(next.join(""));

    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex items-center justify-between gap-1.5 sm:gap-2 py-2 w-full max-w-[290px] mx-auto">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={digits[i]}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`w-10 h-12 text-center font-bold text-xl rounded-[6px] border bg-white transition-all outline-none ${
            hasError
              ? "border-red-500 text-red-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              : "border-[#a5b2c0] text-slate-900 focus:border-[#005a9c] focus:ring-1 focus:ring-[#005a9c]"
          }`}
        />
      ))}
    </div>
  );
};

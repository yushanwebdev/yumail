/**
 * Unit tests for verification code detection
 */

import { describe, it, expect } from "vitest";
import { detectVerificationCode } from "./verificationCodeDetector";

describe("detectVerificationCode", () => {
  it("should detect code at the beginning of subject", () => {
    const result = detectVerificationCode("123456 is your Google verification code");
    console.log("Result:", result);
    expect(result).toBe("123456");
  });

  it("should detect code at the end of subject", () => {
    const result = detectVerificationCode("Your verification code is 789012");
    console.log("Result:", result);
    expect(result).toBe("789012");
  });

  it("should detect alphanumeric code", () => {
    const result = detectVerificationCode("Your OTP is A3B9X7");
    console.log("Result:", result);
    expect(result).toBe("A3B9X7");
  });

  it("should return null when no keyword present", () => {
    const result = detectVerificationCode("Order #123456 shipped");
    expect(result).toBeNull();
  });

  it("should return null when no code present", () => {
    const result = detectVerificationCode("Your verification code will arrive soon");
    expect(result).toBeNull();
  });
});

/**
 * Verification Code Detector
 *
 * Detects verification codes (OTP) in email subjects using keyword context
 * and regex pattern matching. Based on industry best practices from:
 * - SMS OTP form standards (web.dev)
 * - Common patterns from Google, Facebook, Amazon
 * - TOTP/HOTP RFC standards
 *
 * Supports:
 * - Numeric codes (4-8 digits) - most common
 * - Alphanumeric codes (4-8 chars with mixed case)
 * - Various keyword contexts and formats
 */

// Verification keywords (case-insensitive)
// Based on common patterns from major services
const KEYWORDS = [
  'verification code',
  'verify',
  'code',
  'otp',
  'one-time password',
  'one-time',
  'passcode',
  'security code',
  'authentication code',
  'authenticate',
  'confirm',
  'confirmation',
  '2fa',
  'two-factor',
  'two-step',
  'login code',
  'access code',
] as const;

// Regex patterns for code detection
const PATTERNS = {
  // Prefixed codes with colon: "code: 123456" or "OTP: A3B9X7"
  // Common in Gmail, Facebook, Amazon verification emails
  prefixed: /(?:code|otp|password|pin):\s*([A-Za-z0-9]{4,8})\b/i,

  // Numeric codes: 123456 (4-8 digits)
  // Most common format - 6 digits is standard (Google, Facebook)
  // SMS Retriever API uses \d{6} pattern
  numeric: /\b\d{4,8}\b/g,

  // Alphanumeric codes with at least one digit and one letter
  // Format: A3B9X7 - prevents matching common words
  // Used by some banking and enterprise services
  alphanumeric: /\b(?=.*\d)(?=.*[A-Z])[A-Z0-9]{4,8}\b/gi,
} as const;

// Create keyword pattern once at module level (performance optimization)
const keywordPattern = new RegExp(
  `\\b(${KEYWORDS.join('|').replace(/\s+/g, '\\s+')})\\b`,
  'i'
);

// Common English words that might match alphanumeric pattern
// These should be filtered out to prevent false positives
const COMMON_WORDS = new Set([
  'your', 'this', 'that', 'here', 'with', 'from', 'have', 'will',
  'about', 'into', 'more', 'after', 'they', 'when', 'then', 'also',
  'some', 'time', 'very', 'what', 'only', 'been', 'were', 'said',
  'each', 'tell', 'does', 'over', 'such', 'must', 'well', 'back',
]);

/**
 * Detects verification code in email subject using context-based matching
 *
 * Algorithm:
 * 1. Validate input and check for keyword presence
 * 2. Try prefixed pattern first (most specific: "code: 123456")
 * 3. Try numeric pattern (most common: 6-digit codes)
 * 4. Fall back to alphanumeric with word filtering
 *
 * @param subject - Email subject line to scan
 * @returns Detected verification code or null if none found
 *
 * Performance: O(n) where n is subject length
 * Limits: Max 500 chars to prevent regex performance issues
 */
export function detectVerificationCode(subject: string | null | undefined): string | null {
  // Early validation (prevent errors and performance issues)
  if (!subject || typeof subject !== 'string') {
    return null;
  }

  // Safety limit: Most email subjects are < 200 chars
  // RFC 2822 recommends max 78 chars per line
  if (subject.length > 500) {
    return null;
  }

  // Check for keyword presence (required for context)
  // This reduces false positives significantly
  const hasKeyword = keywordPattern.test(subject);
  if (!hasKeyword) {
    return null;
  }

  // Priority 1: Try prefixed pattern (most specific)
  // Matches: "code: 123456", "OTP: A3B9X7", "password: 789012"
  const prefixMatch = subject.match(PATTERNS.prefixed);
  if (prefixMatch && prefixMatch[1]) {
    return prefixMatch[1];
  }

  // Priority 2: Try numeric pattern (most common format)
  // Matches: 4-8 digit sequences like "123456"
  // Google, Facebook, Amazon typically use 6 digits
  const numericMatch = subject.match(PATTERNS.numeric);
  if (numericMatch && numericMatch.length > 0) {
    // Return first match (most likely to be the code)
    return numericMatch[0];
  }

  // Priority 3: Fall back to alphanumeric pattern
  // Matches: Mixed alphanumeric like "A3B9X7"
  // Less common but used by some banking/enterprise services
  const alphanumMatch = subject.match(PATTERNS.alphanumeric);
  if (alphanumMatch && alphanumMatch.length > 0) {
    // Filter out common English words that might match pattern
    for (const match of alphanumMatch) {
      if (!COMMON_WORDS.has(match.toLowerCase())) {
        return match.toUpperCase(); // Normalize to uppercase
      }
    }
  }

  return null;
}

/**
 * Check if an email subject likely contains a verification code
 * Lightweight check without full pattern matching
 *
 * Use case: Pre-filter emails before running full detection
 *
 * @param subject - Email subject line
 * @returns true if subject contains verification keywords
 */
export function hasVerificationKeywords(subject: string | null | undefined): boolean {
  if (!subject || typeof subject !== 'string') {
    return false;
  }
  return keywordPattern.test(subject);
}

/**
 * Get confidence score for detected code (0-100)
 * Higher score = more likely to be a valid verification code
 *
 * Factors:
 * - Pattern match type (prefixed > numeric > alphanumeric)
 * - Code length (6 digits is most common)
 * - Keyword proximity
 *
 * @param subject - Email subject line
 * @param detectedCode - The code that was detected
 * @returns Confidence score 0-100
 */
export function getConfidenceScore(
  subject: string,
  detectedCode: string
): number {
  let score = 50; // Base score

  // Prefixed codes are most reliable
  if (PATTERNS.prefixed.test(subject)) {
    score += 30;
  }

  // 6-digit codes are standard (Google, Facebook, etc.)
  if (/^\d{6}$/.test(detectedCode)) {
    score += 20;
  }

  // Pure numeric codes are more common than alphanumeric
  if (/^\d+$/.test(detectedCode)) {
    score += 10;
  }

  return Math.min(score, 100);
}

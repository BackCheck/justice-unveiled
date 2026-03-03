import { describe, it, expect } from "vitest";
import { applyRedaction, redactText, RedactionFlags } from "./redaction";

describe("applyRedaction", () => {
  it("redacts CNIC numbers", () => {
    expect(applyRedaction("My CNIC is 42301-1234567-1", { cnic: true })).toBe(
      "My CNIC is [CNIC REDACTED]"
    );
  });

  it("redacts CNIC without dashes", () => {
    expect(applyRedaction("CNIC: 4230112345671", { cnic: true })).toBe(
      "CNIC: [CNIC REDACTED]"
    );
  });

  it("redacts Pakistani phone numbers", () => {
    expect(applyRedaction("Call +92 300 1234567", { phone: true })).toBe(
      "Call [PHONE REDACTED]"
    );
    expect(applyRedaction("Call 0300-1234567", { phone: true })).toBe(
      "Call [PHONE REDACTED]"
    );
  });

  it("redacts email addresses", () => {
    expect(applyRedaction("Email: test@example.com here", { email: true })).toBe(
      "Email: [EMAIL REDACTED] here"
    );
  });

  it("redacts mixed content with all flags", () => {
    const text = "CNIC 42301-1234567-1, phone +92 300 1234567, email user@test.pk";
    const flags: RedactionFlags = { cnic: true, phone: true, email: true };
    const result = applyRedaction(text, flags);
    expect(result).not.toContain("42301");
    expect(result).not.toContain("+92");
    expect(result).not.toContain("user@test.pk");
    expect(result).toContain("[CNIC REDACTED]");
    expect(result).toContain("[PHONE REDACTED]");
    expect(result).toContain("[EMAIL REDACTED]");
  });

  it("does not redact when flags are false", () => {
    const text = "CNIC 42301-1234567-1, phone +92 300 1234567";
    expect(applyRedaction(text, {})).toBe(text);
  });
});

describe("redactText", () => {
  it("returns null for null input", () => {
    expect(redactText(null, { cnic: true })).toBeNull();
  });

  it("returns undefined for undefined input", () => {
    expect(redactText(undefined, { cnic: true })).toBeUndefined();
  });

  it("returns original text when no flags", () => {
    expect(redactText("test 42301-1234567-1", null)).toBe("test 42301-1234567-1");
  });
});

import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { isValidSquareSignature } from "@/lib/payments/square";

const KEY = "test-signature-key";
const URL = "https://www.juneandbloomlifestyle.com/api/square/webhook";
const BODY = JSON.stringify({ type: "payment.updated", data: { object: { payment: { id: "p1", status: "COMPLETED" } } } });
const sig = (url: string, body: string, key = KEY) =>
  crypto.createHmac("sha256", key).update(url + body).digest("base64");

describe("Square webhook signature", () => {
  it("accepts Square's signature over URL + raw body", () => {
    expect(isValidSquareSignature(BODY, sig(URL, BODY), KEY, URL)).toBe(true);
  });
  it("rejects a changed body", () => {
    expect(isValidSquareSignature(BODY.replace("COMPLETED", "FAILED"), sig(URL, BODY), KEY, URL)).toBe(false);
  });
  it("rejects a signature made for another URL", () => {
    expect(isValidSquareSignature(BODY, sig("https://evil.example/hook", BODY), KEY, URL)).toBe(false);
  });
  it("rejects a wrong key, or no signature or key", () => {
    expect(isValidSquareSignature(BODY, sig(URL, BODY, "other"), KEY, URL)).toBe(false);
    expect(isValidSquareSignature(BODY, null, KEY, URL)).toBe(false);
    expect(isValidSquareSignature(BODY, sig(URL, BODY), "", URL)).toBe(false);
  });
});

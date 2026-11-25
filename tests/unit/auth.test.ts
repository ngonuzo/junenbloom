import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { sessionEmail, sign, verify } from "@/lib/auth/session";

const SECRET = "test-secret-value-for-unit-tests-only";

beforeEach(() => {
  process.env.AUTH_SECRET = SECRET;
  process.env.ADMIN_EMAILS = "Founder@Example.com, sister@example.com";
});
afterEach(() => {
  delete process.env.AUTH_SECRET;
  delete process.env.ADMIN_EMAILS;
});

describe("founder sign-in tokens (FR-80)", () => {
  it("accepts a valid session for an allow-listed email, case-insensitively", async () => {
    const t = await sign({ kind: "session", email: "founder@example.com", exp: Date.now() + 60_000 });
    expect(await sessionEmail(t)).toBe("founder@example.com");
  });

  it("rejects a tampered token", async () => {
    const t = await sign({ kind: "session", email: "founder@example.com", exp: Date.now() + 60_000 });
    const [body, sig] = t.split(".");
    const forged = Buffer.from(JSON.stringify({ kind: "session", email: "x@evil.com", exp: Date.now() + 60_000 }))
      .toString("base64url");
    expect(await verify(`${forged}.${sig}`, "session")).toBeNull();
    expect(await verify(`${body}.${sig.slice(0, -2)}xx`, "session")).toBeNull();
  });

  it("rejects an expired token", async () => {
    const t = await sign({ kind: "session", email: "founder@example.com", exp: Date.now() - 1 });
    expect(await sessionEmail(t)).toBeNull();
  });

  it("rejects a token signed with another secret", async () => {
    const t = await sign({ kind: "session", email: "founder@example.com", exp: Date.now() + 60_000 }, "other");
    expect(await sessionEmail(t)).toBeNull();
  });

  it("does not accept an email link as a session", async () => {
    const link = await sign({ kind: "link", email: "founder@example.com", exp: Date.now() + 60_000, nonce: "n" });
    expect(await sessionEmail(link)).toBeNull();
    expect(await verify(link, "link")).toMatchObject({ email: "founder@example.com" });
  });

  it("ends a session when the email is removed from the allow-list", async () => {
    const t = await sign({ kind: "session", email: "sister@example.com", exp: Date.now() + 60_000 });
    process.env.ADMIN_EMAILS = "founder@example.com";
    expect(await sessionEmail(t)).toBeNull();
  });

  it("rejects garbage", async () => {
    expect(await sessionEmail("")).toBeNull();
    expect(await sessionEmail("not.a.token")).toBeNull();
    expect(await sessionEmail(undefined)).toBeNull();
  });
});

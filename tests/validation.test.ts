import { test } from "node:test";
import assert from "node:assert/strict";
import { signUpSchema, loginSchema, profileSchema, resetPasswordSchema } from "../lib/validation/auth";

test("signUpSchema accepts valid input", () => {
  const result = signUpSchema.safeParse({
    username: "amina24",
    email: "Amina@Example.COM",
    password: "password123",
    levelId: "",
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.email, "amina@example.com");
    assert.equal(result.data.levelId, undefined);
  }
});

test("signUpSchema rejects short username", () => {
  const result = signUpSchema.safeParse({
    username: "ab",
    email: "a@b.com",
    password: "password123",
  });
  assert.equal(result.success, false);
});

test("signUpSchema rejects username with space", () => {
  const result = signUpSchema.safeParse({
    username: "amina 24",
    email: "a@b.com",
    password: "password123",
  });
  assert.equal(result.success, false);
});

test("signUpSchema rejects short password", () => {
  const result = signUpSchema.safeParse({
    username: "amina24",
    email: "a@b.com",
    password: "short",
  });
  assert.equal(result.success, false);
});

test("signUpSchema rejects invalid email", () => {
  const result = signUpSchema.safeParse({
    username: "amina24",
    email: "not-an-email",
    password: "password123",
  });
  assert.equal(result.success, false);
});

test("loginSchema requires password", () => {
  const result = loginSchema.safeParse({ email: "a@b.com", password: "" });
  assert.equal(result.success, false);
});

test("loginSchema accepts valid login", () => {
  const result = loginSchema.safeParse({ email: "A@B.COM", password: "secret" });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.email, "a@b.com");
});

test("resetPasswordSchema rejects mismatched passwords", () => {
  const result = resetPasswordSchema.safeParse({
    password: "password123",
    confirmPassword: "password456",
  });
  assert.equal(result.success, false);
});

test("resetPasswordSchema accepts matching passwords", () => {
  const result = resetPasswordSchema.safeParse({
    password: "password123",
    confirmPassword: "password123",
  });
  assert.equal(result.success, true);
});

test("profileSchema rejects bio over 280 chars", () => {
  const result = profileSchema.safeParse({
    username: "amina24",
    bio: "a".repeat(281),
  });
  assert.equal(result.success, false);
});

test("profileSchema accepts valid profile", () => {
  const result = profileSchema.safeParse({
    username: "amina24",
    bio: "Hello",
    levelId: "123e4567-e89b-12d3-a456-426614174000",
  });
  assert.equal(result.success, true);
});

import { test } from "node:test";
import assert from "node:assert/strict";

// Mirror of the business rule from lib/resources.ts#canDownload
// (kept here to test the logic independently of Supabase).
function canDownload(user: { isContributor: boolean; role: string } | null): boolean {
  return Boolean(user && (user.isContributor || user.role === "moderator" || user.role === "admin"));
}

test("canDownload returns false for null user", () => {
  assert.equal(canDownload(null), false);
});

test("canDownload returns false for non-contributor", () => {
  assert.equal(canDownload({ isContributor: false, role: "user" }), false);
});

test("canDownload returns true for contributor", () => {
  assert.equal(canDownload({ isContributor: true, role: "user" }), true);
});

test("canDownload returns true for moderator", () => {
  assert.equal(canDownload({ isContributor: false, role: "moderator" }), true);
});

test("canDownload returns true for admin", () => {
  assert.equal(canDownload({ isContributor: false, role: "admin" }), true);
});

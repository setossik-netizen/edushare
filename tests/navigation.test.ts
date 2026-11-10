import { test } from "node:test";
import assert from "node:assert/strict";
import { safeNextPath } from "../lib/navigation";

test("safeNextPath returns fallback for non-strings", () => {
  assert.equal(safeNextPath(undefined), "/profil");
  assert.equal(safeNextPath(null), "/profil");
  assert.equal(safeNextPath(123), "/profil");
  assert.equal(safeNextPath({}), "/profil");
});

test("safeNextPath accepts internal paths", () => {
  assert.equal(safeNextPath("/profil"), "/profil");
  assert.equal(safeNextPath("/explorer?classe=terminale-d"), "/explorer?classe=terminale-d");
  assert.equal(safeNextPath("/ressource/abc-123"), "/ressource/abc-123");
});

test("safeNextPath rejects open redirects", () => {
  assert.equal(safeNextPath("//evil.com"), "/profil");
  assert.equal(safeNextPath("http://evil.com"), "/profil");
  assert.equal(safeNextPath("\\\\evil.com"), "/profil");
  assert.equal(safeNextPath("/\\evil.com"), "/profil");
});

test("safeNextPath uses custom fallback", () => {
  assert.equal(safeNextPath("http://evil.com", "/"), "/");
  assert.equal(safeNextPath(null, "/connexion"), "/connexion");
});

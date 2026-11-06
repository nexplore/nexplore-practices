#!/usr/bin/env node

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const script = path.join(__dirname, "check-local-markdown-links.js");

function run(root, ...inputs) {
  return spawnSync(process.execPath, [script, "--root", root, ...inputs], {
    encoding: "utf8",
  });
}

test("fails clearly when an explicit input path is missing", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "markdown-links-"));

  try {
    const result = run(root, "missing-docs");

    assert.equal(result.status, 2);
    assert.match(result.stderr, /Input path does not exist: missing-docs/);
    assert.equal(result.stdout, "");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("checks existing Markdown file and directory inputs successfully", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "markdown-links-"));

  try {
    fs.mkdirSync(path.join(root, "docs"));
    fs.writeFileSync(path.join(root, "README.md"), "# Home\n\n[Guide](docs/guide.md)\n");
    fs.writeFileSync(path.join(root, "docs", "guide.md"), "# Guide\n\n[Home](../README.md)\n");

    const result = run(root, "README.md", "docs");

    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
    assert.match(result.stdout, /Checked 2 Markdown file\(s\), no local Markdown link problems found\./);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

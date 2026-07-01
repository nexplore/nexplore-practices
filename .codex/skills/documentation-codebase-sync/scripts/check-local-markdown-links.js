#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ignoredDirs = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".angular",
  ".next",
  "bin",
  "obj",
]);

function usage() {
  console.error("Usage: node check-local-markdown-links.js [--root DIR] [markdown-files-or-dirs...]");
}

function parseArgs(argv) {
  let root = process.cwd();
  const inputs = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--root") {
      i += 1;
      if (i >= argv.length) {
        usage();
        process.exit(2);
      }
      root = path.resolve(argv[i]);
    } else if (arg === "-h" || arg === "--help") {
      usage();
      process.exit(0);
    } else {
      inputs.push(arg);
    }
  }

  return { root, inputs };
}

function walkMarkdown(target, files) {
  if (!fs.existsSync(target)) return;
  const stat = fs.statSync(target);

  if (stat.isDirectory()) {
    const base = path.basename(target);
    if (ignoredDirs.has(base)) return;
    for (const entry of fs.readdirSync(target)) {
      walkMarkdown(path.join(target, entry), files);
    }
    return;
  }

  if (stat.isFile() && target.toLowerCase().endsWith(".md")) {
    files.push(path.resolve(target));
  }
}

function lineNumberAt(text, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (text.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

function maskFencedCode(markdown) {
  return markdown.replace(/(^|\n)( {0,3}```[\s\S]*?)(\n {0,3}```[^\n]*|$)/g, (block) => (
    block.replace(/[^\n]/g, " ")
  ));
}

function extractInlineLinks(markdown) {
  const links = [];
  const pattern = /!?\[[^\]]*]\(/g;
  let match;

  while ((match = pattern.exec(markdown)) !== null) {
    const destStart = pattern.lastIndex;
    let i = destStart;
    let escaped = false;
    let depth = 0;

    for (; i < markdown.length; i += 1) {
      const char = markdown[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === "(") {
        depth += 1;
        continue;
      }
      if (char === ")" && depth > 0) {
        depth -= 1;
        continue;
      }
      if (char === ")") break;
    }

    if (i >= markdown.length) continue;
    links.push({
      raw: markdown.slice(destStart, i).trim(),
      index: match.index,
    });
    pattern.lastIndex = i + 1;
  }

  return links;
}

function extractReferenceDefinitions(markdown) {
  const links = [];
  const pattern = /^ {0,3}\[[^\]]+]:\s*(\S.*)$/gm;
  let match;

  while ((match = pattern.exec(markdown)) !== null) {
    links.push({
      raw: match[1].trim(),
      index: match.index,
    });
  }

  return links;
}

function destinationFromRaw(raw) {
  if (!raw) return "";
  if (raw.startsWith("<")) {
    const end = raw.indexOf(">");
    return end === -1 ? raw.slice(1) : raw.slice(1, end);
  }

  const titleMatch = raw.match(/^(.+?)(?:\s+["'(].*)$/);
  return (titleMatch ? titleMatch[1] : raw).trim();
}

function isExternal(destination) {
  return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(destination)
    || /^(?:mailto|tel|javascript):/i.test(destination);
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function splitDestination(destination) {
  const hashIndex = destination.indexOf("#");
  const beforeHash = hashIndex === -1 ? destination : destination.slice(0, hashIndex);
  const fragment = hashIndex === -1 ? "" : destination.slice(hashIndex + 1);
  const queryIndex = beforeHash.indexOf("?");
  const filePart = queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex);
  return { filePart: safeDecode(filePart), fragment: safeDecode(fragment) };
}

function slugifyHeading(text) {
  return text
    .trim()
    .replace(/<[^>]+>/g, "")
    .replace(/[`*_~[\]]/g, "")
    .toLowerCase()
    .replace(/&[a-z0-9#]+;/g, "")
    .replace(/[^\p{L}\p{N} _-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

function markdownAnchors(file) {
  const markdown = fs.readFileSync(file, "utf8");
  const anchors = new Set();
  const seen = new Map();

  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      const base = slugifyHeading(heading[2]);
      const count = seen.get(base) || 0;
      seen.set(base, count + 1);
      anchors.add(count === 0 ? base : `${base}-${count}`);
    }

    const idMatches = line.matchAll(/\b(?:id|name)=["']([^"']+)["']/g);
    for (const idMatch of idMatches) {
      anchors.add(idMatch[1]);
    }
  }

  return anchors;
}

function resolveTarget(root, sourceFile, filePart) {
  if (!filePart) return sourceFile;
  if (filePart.startsWith("/")) return path.resolve(root, `.${filePart}`);
  return path.resolve(path.dirname(sourceFile), filePart);
}

function main() {
  const { root, inputs } = parseArgs(process.argv.slice(2));
  const files = [];
  const targets = inputs.length ? inputs : ["."];

  for (const input of targets) {
    walkMarkdown(path.resolve(root, input), files);
  }

  const uniqueFiles = [...new Set(files)].sort();
  const errors = [];
  const anchorCache = new Map();

  for (const file of uniqueFiles) {
    const markdown = fs.readFileSync(file, "utf8");
    const linkSource = maskFencedCode(markdown);
    const links = [
      ...extractInlineLinks(linkSource),
      ...extractReferenceDefinitions(linkSource),
    ];

    for (const link of links) {
      const destination = destinationFromRaw(link.raw);
      if (!destination || isExternal(destination)) continue;

      const { filePart, fragment } = splitDestination(destination);
      if (!filePart && !fragment) continue;

      const target = resolveTarget(root, file, filePart);
      const line = lineNumberAt(markdown, link.index);

      if (filePart && !fs.existsSync(target)) {
        errors.push(`${path.relative(root, file)}:${line}: missing target '${destination}'`);
        continue;
      }

      if (fragment) {
        const targetFile = filePart ? target : file;
        if (!fs.existsSync(targetFile) || fs.statSync(targetFile).isDirectory()) continue;
        if (!targetFile.toLowerCase().endsWith(".md")) continue;

        if (!anchorCache.has(targetFile)) {
          anchorCache.set(targetFile, markdownAnchors(targetFile));
        }

        const anchors = anchorCache.get(targetFile);
        const normalized = fragment.toLowerCase();
        if (!anchors.has(fragment) && !anchors.has(normalized)) {
          errors.push(`${path.relative(root, file)}:${line}: missing anchor '#${fragment}' in '${path.relative(root, targetFile)}'`);
        }
      }
    }
  }

  if (errors.length) {
    console.error(errors.join("\n"));
    console.error(`\nChecked ${uniqueFiles.length} Markdown file(s), found ${errors.length} problem(s).`);
    process.exit(1);
  }

  console.log(`Checked ${uniqueFiles.length} Markdown file(s), no local Markdown link problems found.`);
}

main();

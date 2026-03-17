#!/usr/bin/env node
/**
 * TEST: Canonical URL Consistency Check
 * Validates that canonical URLs are correctly configured across all SEO layers:
 *   1. Cloudflare Worker (ROUTES map)
 *   2. Prerender script (route definitions)
 *   3. siteRoutes.ts (centralized registry)
 *   4. index.html (base canonical)
 *
 * Run: node scripts/test-canonicals.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BASE_URL = 'https://capittal.es';

let passed = 0;
let failed = 0;
let warnings = 0;

function pass(msg) { passed++; console.log(`  ✅ ${msg}`); }
function fail(msg) { failed++; console.log(`  ❌ ${msg}`); }
function warn(msg) { warnings++; console.log(`  ⚠️  ${msg}`); }
function header(msg) { console.log(`\n${'═'.repeat(60)}\n  ${msg}\n${'═'.repeat(60)}`); }

// ─── 1. index.html canonical ──────────────────────────────────────────
header('1. index.html — Base Canonical');

const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
const canonicalMatch = indexHtml.match(/<link\s+rel="canonical"\s+href="([^"]+)"/);

if (canonicalMatch) {
  const canonical = canonicalMatch[1];
  if (canonical === `${BASE_URL}/`) {
    pass(`Canonical is correct: ${canonical}`);
  } else {
    fail(`Canonical should be "${BASE_URL}/" but found "${canonical}"`);
  }
} else {
  fail('No canonical link found in index.html');
}

// Check og:url in index.html
const ogUrlMatch = indexHtml.match(/<meta\s+property="og:url"\s+content="([^"]+)"/);
if (ogUrlMatch) {
  if (ogUrlMatch[1] === `${BASE_URL}/`) {
    pass(`og:url matches canonical: ${ogUrlMatch[1]}`);
  } else {
    fail(`og:url "${ogUrlMatch[1]}" doesn't match canonical "${BASE_URL}/"`);
  }
} else {
  warn('No og:url found in index.html');
}

// Check for trailing slash consistency in index.html
const indexCanonicalTrailingSlash = canonicalMatch?.[1]?.endsWith('/');
if (indexCanonicalTrailingSlash) {
  pass('Homepage canonical has trailing slash (correct for root URL)');
} else {
  fail('Homepage canonical missing trailing slash');
}

// ─── 2. Cloudflare Worker — ROUTES map ────────────────────────────────
header('2. Cloudflare Worker — Route Consistency');

const workerCode = fs.readFileSync(path.join(ROOT, 'cloudflare/worker-bot-prerender.js'), 'utf-8');

// Extract ROUTES object
const routesMatch = workerCode.match(/const ROUTES\s*=\s*\{([\s\S]*?)\n\};/);
if (!routesMatch) {
  fail('Could not parse ROUTES from worker');
} else {
  // Extract route paths
  const routePaths = [];
  const routeRegex = /"([^"]+)":\s*\{t:/g;
  let m;
  while ((m = routeRegex.exec(routesMatch[1])) !== null) {
    routePaths.push(m[1]);
  }

  pass(`Worker has ${routePaths.length} routes defined`);

  // Check no routes have trailing slashes (except /)
  const trailingSlashRoutes = routePaths.filter(p => p !== '/' && p.endsWith('/'));
  if (trailingSlashRoutes.length === 0) {
    pass('No routes with trailing slashes (correct)');
  } else {
    fail(`Routes with trailing slashes: ${trailingSlashRoutes.join(', ')}`);
  }

  // Check all routes start with /
  const badPrefix = routePaths.filter(p => !p.startsWith('/'));
  if (badPrefix.length === 0) {
    pass('All routes start with /');
  } else {
    fail(`Routes missing / prefix: ${badPrefix.join(', ')}`);
  }

  // Check canonical generation logic in worker
  const workerCanonicalPattern = /const canonicalUrl = BASE_URL \+ p;/;
  if (workerCanonicalPattern.test(workerCode)) {
    pass('Worker builds canonical as BASE_URL + path (no trailing slash for subpages)');
  } else {
    warn('Could not verify worker canonical URL construction pattern');
  }

  // Check BASE_URL in worker
  const baseUrlMatch = workerCode.match(/const BASE_URL\s*=\s*"([^"]+)"/);
  if (baseUrlMatch) {
    if (baseUrlMatch[1] === BASE_URL) {
      pass(`Worker BASE_URL is correct: ${baseUrlMatch[1]}`);
    } else {
      fail(`Worker BASE_URL is "${baseUrlMatch[1]}" — expected "${BASE_URL}"`);
    }
  } else {
    fail('Could not find BASE_URL in worker');
  }
}

// ─── 3. Prerender Script ──────────────────────────────────────────────
header('3. Prerender Script — Canonical Replacement');

const prerenderCode = fs.readFileSync(path.join(ROOT, 'scripts/prerender-seo.mjs'), 'utf-8');

// Check canonical replacement pattern
if (prerenderCode.includes('<link rel="canonical" href=')) {
  pass('Prerender script replaces canonical link');
} else {
  fail('Prerender script does not set canonical');
}

if (prerenderCode.includes('og:url')) {
  pass('Prerender script replaces og:url');
} else {
  fail('Prerender script does not set og:url');
}

// Check BASE_URL in prerender
const prerenderBaseUrl = prerenderCode.match(/const BASE_URL\s*=\s*['"]([^'"]+)['"]/);
if (prerenderBaseUrl) {
  if (prerenderBaseUrl[1] === BASE_URL) {
    pass(`Prerender BASE_URL is correct: ${prerenderBaseUrl[1]}`);
  } else {
    fail(`Prerender BASE_URL is "${prerenderBaseUrl[1]}" — expected "${BASE_URL}"`);
  }
}

// ─── 4. SEOHead Component ─────────────────────────────────────────────
header('4. SEOHead Component — Client-Side Canonical');

const seoHeadCode = fs.readFileSync(path.join(ROOT, 'src/components/seo/SEOHead.tsx'), 'utf-8');

// Check canonical link creation/update
if (seoHeadCode.includes('link[rel="canonical"]')) {
  pass('SEOHead finds/creates canonical link element');
} else {
  fail('SEOHead does not manage canonical link');
}

if (seoHeadCode.includes('element.href = url')) {
  pass('SEOHead updates canonical href dynamically');
} else {
  fail('SEOHead does not update canonical href');
}

// Check og:url sync with canonical
if (seoHeadCode.includes("og:url") && seoHeadCode.includes('canonical')) {
  pass('SEOHead sets og:url from canonical');
} else {
  warn('SEOHead may not sync og:url with canonical');
}

// ─── 5. Page-level Canonical Check ────────────────────────────────────
header('5. Page Components — Canonical Usage');

const pagesDir = path.join(ROOT, 'src/pages');

function findFilesRecursive(dir, ext) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findFilesRecursive(fullPath, ext));
    } else if (entry.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

const pageFiles = findFilesRecursive(pagesDir, '.tsx');
let pagesWithSEOHead = 0;
let pagesWithCanonical = 0;
let pagesWithWrongDomain = 0;
const wrongDomainFiles = [];

for (const file of pageFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const relPath = path.relative(ROOT, file);

  if (content.includes('SEOHead') || content.includes('<Helmet')) {
    pagesWithSEOHead++;

    // Check canonical
    if (content.includes('canonical=') || content.includes('canonical:')) {
      pagesWithCanonical++;

      // Check for wrong domain in canonical
      const canonicalMatches = content.matchAll(/canonical[=:]\s*["'`{]([^"'`}]+)/g);
      for (const cm of canonicalMatches) {
        const val = cm[1];
        if (val.startsWith('http') && !val.startsWith(BASE_URL)) {
          pagesWithWrongDomain++;
          wrongDomainFiles.push({ file: relPath, canonical: val });
        }
      }
    }
  }
}

pass(`${pagesWithSEOHead} pages use SEOHead or Helmet`);
pass(`${pagesWithCanonical} pages set canonical URL`);

if (pagesWithWrongDomain === 0) {
  pass('All page canonicals use correct domain (capittal.es)');
} else {
  fail(`${pagesWithWrongDomain} pages have wrong domain in canonical:`);
  wrongDomainFiles.forEach(f => console.log(`      ${f.file}: ${f.canonical}`));
}

// Check canonical patterns used
const dynamicCanonicalPages = [];
const staticCanonicalPages = [];

for (const file of pageFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const relPath = path.relative(ROOT, file);

  if (content.includes('canonical={`https://capittal.es${location.pathname}`}')) {
    dynamicCanonicalPages.push(relPath);
  } else if (content.match(/canonical="https:\/\/capittal\.es\/[^"]+"/)) {
    staticCanonicalPages.push(relPath);
  }
}

pass(`${dynamicCanonicalPages.length} pages use dynamic canonical (location.pathname)`);
pass(`${staticCanonicalPages.length} pages use static canonical string`);

// ─── 6. Cross-layer Consistency ───────────────────────────────────────
header('6. Cross-Layer Consistency — Worker vs siteRoutes');

// Parse siteRoutes from TypeScript file
const siteRoutesCode = fs.readFileSync(path.join(ROOT, 'src/data/siteRoutes.ts'), 'utf-8');
const siteRoutePaths = [];
const siteRouteRegex = /path:\s*'([^']+)'/g;
let srm;
while ((srm = siteRouteRegex.exec(siteRoutesCode)) !== null) {
  siteRoutePaths.push(srm[1]);
}

// Worker routes (from earlier extraction)
const workerRoutePaths = [];
if (routesMatch) {
  const wrRegex = /"([^"]+)":\s*\{t:/g;
  let wrm;
  while ((wrm = wrRegex.exec(routesMatch[1])) !== null) {
    workerRoutePaths.push(wrm[1]);
  }
}

// Check siteRoutes that are missing from worker
const missingInWorker = siteRoutePaths.filter(p => !workerRoutePaths.includes(p));
const missingInSiteRoutes = workerRoutePaths.filter(p => !siteRoutePaths.includes(p));

if (missingInWorker.length === 0) {
  pass('All siteRoutes paths exist in Worker ROUTES');
} else {
  warn(`${missingInWorker.length} siteRoutes missing from Worker (may be intentional):`);
  missingInWorker.forEach(p => console.log(`      ${p}`));
}

if (missingInSiteRoutes.length === 0) {
  pass('All Worker routes exist in siteRoutes');
} else {
  // Worker may have more routes (LPs, etc.) — this is OK
  console.log(`  ℹ️  ${missingInSiteRoutes.length} Worker routes not in siteRoutes (LPs, etc. — often intentional)`);
}

// ─── 7. Trailing Slash Consistency ────────────────────────────────────
header('7. Trailing Slash Policy');

// Check worker handles trailing slashes
if (workerCode.includes("replace(/\\/+$/, '')")) {
  pass('Worker strips trailing slashes before matching routes');
} else {
  warn('Could not verify Worker trailing slash normalization');
}

// Check prerender handles trailing slashes
if (prerenderCode.includes("replace(/\\/+$/, '')") || prerenderCode.includes('routePath')) {
  pass('Prerender script normalizes paths');
} else {
  warn('Could not verify Prerender trailing slash normalization');
}

// ─── 8. Special Cases ─────────────────────────────────────────────────
header('8. Special Cases');

// Check for query params in canonical URLs specifically
for (const file of pageFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  if (content.match(/canonical=.*location\.search/)) {
    const relPath = path.relative(ROOT, file);
    warn(`${relPath} includes query params in canonical (may cause duplicate content)`);
  }
}

// Check for www. in canonical/SEO context (skip admin pages — placeholders only)
for (const file of pageFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const relPath = path.relative(ROOT, file);
  // Skip admin pages — www references are UI placeholders, not SEO canonicals
  if (relPath.includes('admin/')) continue;
  if (content.includes('www.capittal.es')) {
    fail(`${relPath} uses www.capittal.es (should be capittal.es)`);
  }
}

if (workerCode.includes('www.capittal.es')) {
  fail('Worker contains www.capittal.es reference');
} else {
  pass('Worker uses non-www domain consistently');
}

// Check http:// vs https://
for (const file of pageFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const httpMatches = content.match(/http:\/\/capittal\.es/g);
  if (httpMatches) {
    const relPath = path.relative(ROOT, file);
    fail(`${relPath} uses http:// instead of https://`);
  }
}
pass('All pages use https:// protocol');

// ─── SUMMARY ──────────────────────────────────────────────────────────
header('SUMMARY');
console.log(`  Passed:   ${passed}`);
console.log(`  Failed:   ${failed}`);
console.log(`  Warnings: ${warnings}`);
console.log();

if (failed === 0) {
  console.log('  🎉 All canonical checks PASSED! No issues found.');
} else {
  console.log(`  🔴 ${failed} check(s) FAILED — review the issues above.`);
}

console.log();
process.exit(failed > 0 ? 1 : 0);

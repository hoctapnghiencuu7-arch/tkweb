const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const rootDir = path.resolve(__dirname, '../..');

console.log('========================================================');
console.log('🔍 PHASE 1: STATIC ASSET & LINK INTEGRITY TEST');
console.log('Root Directory:', rootDir);
console.log('========================================================\n');

// 1. Target files check
const targetFiles = [
  'index.html',
  'pages/flights.html',
  'pages/booking.html',
  'pages/seats.html',
  'pages/payment.html',
  'pages/ticket.html',
  'pages/schedule.html',
  'pages/login.html',
  'pages/register.html',
  'portfolio/index.html',
  'admin/index.html'
];

let targetFileResults = [];
for (const file of targetFiles) {
  let fullPath = path.join(rootDir, file);
  if (!fs.existsSync(fullPath) && fs.existsSync(path.join(rootDir, '..', file))) {
    fullPath = path.join(rootDir, '..', file);
  }
  const exists = fs.existsSync(fullPath);
  const stat = exists ? fs.statSync(fullPath) : null;
  targetFileResults.push({
    file,
    exists,
    size: stat ? stat.size : 0
  });
  console.log(`[Target File] ${exists ? '✅ PASS' : '❌ FAIL'}: ${file} (${stat ? stat.size + ' bytes' : 'NOT FOUND'})`);
}

// 2. Airline SVG logos check
const requiredAirlines = [
  'bamboo-airways.svg',
  'dtw-airlines.svg',
  'emirates.svg',
  'flydubai.svg',
  'khang-air.svg',
  'ondy-air.svg',
  'qatar-airways.svg',
  'saudia.svg',
  'singapore-airlines.svg',
  'flynest.svg',
  'vietjet-air.svg',
  'vietnam-airlines.svg',
  'vietravel-airlines.svg'
];

console.log('\n--- Checking Airline Logos (assets/images/airlines/*.svg) ---');
let airlineResults = [];
const airlinesDir = path.join(rootDir, 'assets', 'images', 'airlines');
for (const svg of requiredAirlines) {
  const fullPath = path.join(airlinesDir, svg);
  const exists = fs.existsSync(fullPath);
  const stat = exists ? fs.statSync(fullPath) : null;
  airlineResults.push({ svg, exists, size: stat ? stat.size : 0 });
  console.log(`[Airline Logo] ${exists ? '✅ PASS' : '❌ FAIL'}: ${svg} (${stat ? stat.size + ' bytes' : 'MISSING'})`);
}

// 3. Scan all HTML files for broken references (href, src, etc.)
console.log('\n--- Scanning HTML Files for Broken References ---');
const htmlFiles = [
  ...targetFiles,
  'components/header.html',
  'components/footer.html'
];

const linkIssues = [];
const urlRegex = /(?:href|src)=["']([^"']+)["']/gi;

for (const relHtml of htmlFiles) {
  const htmlPath = path.join(rootDir, relHtml);
  if (!fs.existsSync(htmlPath)) continue;

  const content = fs.readFileSync(htmlPath, 'utf8');
  const htmlDir = path.dirname(htmlPath);

  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    const rawUrl = match[1].trim();

    // Skip external URLs, data URLs, javascript:void(0), #anchors, mailto, tel
    if (
      rawUrl.startsWith('http://') ||
      rawUrl.startsWith('https://') ||
      rawUrl.startsWith('//') ||
      rawUrl.startsWith('data:') ||
      rawUrl.startsWith('javascript:') ||
      rawUrl.startsWith('#') ||
      rawUrl.startsWith('mailto:') ||
      rawUrl.startsWith('tel:')
    ) {
      continue;
    }

    // Split query string and hash
    const cleanUrl = rawUrl.split('?')[0].split('#')[0];
    if (!cleanUrl) continue;

    // Resolve relative path
    const resolvedPath = path.resolve(htmlDir, cleanUrl);
    const exists = fs.existsSync(resolvedPath);

    if (!exists) {
      linkIssues.push({
        sourceFile: relHtml,
        ref: rawUrl,
        resolvedPath,
        type: 'BROKEN_LINK'
      });
      console.log(`[Broken Link] ❌ FAIL in ${relHtml}: "${rawUrl}" -> NOT FOUND at ${resolvedPath}`);
    }
  }
}

if (linkIssues.length === 0) {
  console.log('✅ PASS: All internal references (scripts, stylesheets, images, links) resolved correctly!');
} else {
  console.log(`❌ FAIL: Found ${linkIssues.length} broken references!`);
}

// 4. Validate JS syntax
console.log('\n--- Validating JavaScript Syntax ---');
const jsFiles = [
  'assets/js/main.js',
  'assets/js/three.min.js'
];

let jsErrors = [];
for (const relJs of jsFiles) {
  const jsPath = path.join(rootDir, relJs);
  if (!fs.existsSync(jsPath)) {
    jsErrors.push({ file: relJs, error: 'File not found' });
    continue;
  }
  const code = fs.readFileSync(jsPath, 'utf8');
  try {
    new vm.Script(code, { filename: relJs });
    console.log(`[JS Syntax] ✅ PASS: ${relJs}`);
  } catch (err) {
    console.log(`[JS Syntax] ❌ FAIL: ${relJs} - ${err.message}`);
    jsErrors.push({ file: relJs, error: err.message, stack: err.stack });
  }
}

// Check inline scripts in HTML
for (const relHtml of htmlFiles) {
  const htmlPath = path.join(rootDir, relHtml);
  if (!fs.existsSync(htmlPath)) continue;

  const content = fs.readFileSync(htmlPath, 'utf8');
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let sMatch;
  let idx = 0;
  while ((sMatch = scriptRegex.exec(content)) !== null) {
    const scriptTag = sMatch[0];
    // If it has src=..., skip inline check
    if (/src=["']/i.test(scriptTag)) continue;

    const inlineCode = sMatch[1].trim();
    if (!inlineCode) continue;

    idx++;
    try {
      new vm.Script(inlineCode, { filename: `${relHtml} <script #${idx}>` });
    } catch (err) {
      console.log(`[Inline JS Syntax] ❌ FAIL: ${relHtml} script #${idx} - ${err.message}`);
      jsErrors.push({ file: `${relHtml} [script #${idx}]`, error: err.message });
    }
  }
}

// 5. CSS Syntax check
console.log('\n--- Validating CSS Syntax ---');
const cssPath = path.join(rootDir, 'assets/css/style.css');
let cssErrors = [];
if (fs.existsSync(cssPath)) {
  const cssCode = fs.readFileSync(cssPath, 'utf8');
  // Check brace balance
  let openBraces = 0;
  let closeBraces = 0;
  // Strip comments and strings
  const stripped = cssCode
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''");

  for (let i = 0; i < stripped.length; i++) {
    if (stripped[i] === '{') openBraces++;
    if (stripped[i] === '}') closeBraces++;
  }

  if (openBraces === closeBraces) {
    console.log(`[CSS Syntax] ✅ PASS: assets/css/style.css (Braces balanced: ${openBraces} pairs, length: ${cssCode.length} bytes)`);
  } else {
    console.log(`[CSS Syntax] ❌ FAIL: assets/css/style.css - Unbalanced braces! { count: ${openBraces}, } count: ${closeBraces}`);
    cssErrors.push({ file: 'assets/css/style.css', error: `Unbalanced braces (${openBraces} { vs ${closeBraces} })` });
  }

  // Check url(...) references in CSS
  const cssUrlRegex = /url\(["']?([^"')]+)["']?\)/gi;
  let cMatch;
  const cssDir = path.dirname(cssPath);
  let brokenCssUrls = 0;
  while ((cMatch = cssUrlRegex.exec(stripped)) !== null) {
    const rawUrl = cMatch[1].trim();
    if (rawUrl.startsWith('http') || rawUrl.startsWith('//') || rawUrl.startsWith('data:')) continue;
    const cleanUrl = rawUrl.split('?')[0].split('#')[0];
    const resolvedPath = path.resolve(cssDir, cleanUrl);
    if (!fs.existsSync(resolvedPath)) {
      brokenCssUrls++;
      console.log(`[CSS Broken Asset] ❌ FAIL in style.css: "${rawUrl}" -> NOT FOUND at ${resolvedPath}`);
      linkIssues.push({ sourceFile: 'assets/css/style.css', ref: rawUrl, resolvedPath, type: 'CSS_ASSET' });
    }
  }
  if (brokenCssUrls === 0) {
    console.log(`[CSS Assets] ✅ PASS: All url(...) in style.css resolved correctly!`);
  }
}

console.log('\n========================================================');
console.log('PHASE 1 SUMMARY:');
console.log(`Target HTML files: ${targetFileResults.filter(r => r.exists).length}/${targetFiles.length} PASS`);
console.log(`Airline SVG logos: ${airlineResults.filter(r => r.exists).length}/${requiredAirlines.length} PASS`);
console.log(`Broken links/refs: ${linkIssues.length} found`);
console.log(`JS syntax errors: ${jsErrors.length} found`);
console.log(`CSS errors: ${cssErrors.length} found`);
console.log('========================================================\n');

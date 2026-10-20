#!/usr/bin/env node
/**
 * Smoke-check a built VuePress site.
 *
 * Usage: node scripts/check-build.js <dist-dir>
 *
 * Verifies that the build produced a non-empty entry page, the 404 page and
 * the sitemap. Fails (exit 1) with a readable message when something is
 * missing, so CI catches a "successful" build that produced garbage.
 */
const fs = require('fs')
const path = require('path')

const dist = path.resolve(process.argv[2] || '.')
const required = ['index.html', '404.html', 'sitemap.xml']

if (!fs.existsSync(dist) || !fs.statSync(dist).isDirectory()) {
  console.error(`✗ dist directory not found: ${dist}`)
  process.exit(1)
}

let failed = false
for (const file of required) {
  const target = path.join(dist, file)
  if (!fs.existsSync(target)) {
    console.error(`✗ missing ${file} in ${dist}`)
    failed = true
    continue
  }
  const size = fs.statSync(target).size
  if (size === 0) {
    console.error(`✗ empty ${file} in ${dist}`)
    failed = true
    continue
  }
  console.log(`✓ ${file} (${size} bytes)`)
}

if (failed) process.exit(1)
console.log(`✓ build check passed for ${dist}`)

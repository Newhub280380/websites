#!/usr/bin/env node
/**
 * Print the Node.js version declared in `node-version.yml`.
 *
 * `actions/setup-node` reads its `node-version-file` as raw text and does not
 * parse YAML, so the version is resolved here and passed to the action through
 * the step output. This keeps `node-version.yml` the single source of truth.
 */
const fs = require('fs')
const path = require('path')

const file = path.resolve(__dirname, '..', 'node-version.yml')
const content = fs.readFileSync(file, 'utf8')
const match = content.match(/^\s*node-version\s*:\s*['"]?([^'"\s#]+)/m)

if (!match) {
  console.error(`✗ no 'node-version' key found in ${file}`)
  process.exit(1)
}

process.stdout.write(match[1])

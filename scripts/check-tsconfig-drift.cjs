#!/usr/bin/env node
// Warns (never fails) when a repo's tsconfig.json redundantly re-declares a compilerOptions
// key already set, at the same value, by whatever it extends from @infinitetoken/tsconfig.
// Run from a consuming repo's root, after `npm ci` (needs node_modules present).

const fs = require('fs')
const path = require('path')

const CONFIG_PATH = path.resolve('tsconfig.json')
if (!fs.existsSync(CONFIG_PATH)) process.exit(0)

let own
try {
  own = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))
} catch {
  process.exit(0) // not strict JSON (comments, etc.) - skip rather than false-positive
}

const extendsValue = own.extends
if (typeof extendsValue !== 'string' || !extendsValue.startsWith('@infinitetoken/tsconfig')) {
  process.exit(0)
}

function resolveChain(specifier, seen) {
  seen = seen || new Set()
  let resolvedPath
  try {
    resolvedPath = require.resolve(specifier)
  } catch {
    return {}
  }
  if (seen.has(resolvedPath)) return {}
  seen.add(resolvedPath)
  const config = require(resolvedPath)
  let parentOptions = {}
  if (typeof config.extends === 'string') {
    const next = config.extends.startsWith('.') ? path.resolve(path.dirname(resolvedPath), config.extends) : config.extends
    parentOptions = resolveChain(next, seen)
  }
  return Object.assign({}, parentOptions, config.compilerOptions || {})
}

const resolvedParent = resolveChain(extendsValue)
const ownOptions = own.compilerOptions || {}

const redundant = Object.keys(ownOptions).filter(function (key) {
  if (!(key in resolvedParent)) return false
  return JSON.stringify(ownOptions[key]) === JSON.stringify(resolvedParent[key])
})

if (redundant.length > 0) {
  // eslint-disable-next-line no-console
  console.log('::warning::tsconfig.json redundantly re-declares option(s) already set identically by "' + extendsValue + '": ' + redundant.join(', ') + '. Consider removing them.')
}
process.exit(0)

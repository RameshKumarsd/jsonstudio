#!/usr/bin/env node

/**
 * Cloudflare's Linux x64 build environment has been observed to silently skip
 * installing some Linux-specific native binary packages (rolldown, esbuild,
 * lightningcss, @tailwindcss/oxide) during `npm ci`, even though
 * package-lock.json declares them correctly with `os`/`cpu` markers and a
 * local `npm ci` targeting linux/x64 installs them without issue. Root cause
 * unconfirmed (likely non-deterministic npm optionalDependencies resolution)
 * — this script is a defensive fallback, not a proper fix.
 *
 * Runs as a `postinstall` hook. On Linux x64 only, verifies each required
 * native package is actually present on disk (checked via `package.json`,
 * since some of these packages — e.g. @esbuild/linux-x64 — have no `main`/
 * `exports` and are unreachable via `require.resolve(name)`) and, if npm
 * silently skipped one, force-installs it directly. No-ops everywhere else
 * (including local dev on macOS).
 */

const { execSync } = require('node:child_process')

const REQUIRED = [
  '@rolldown/binding-linux-x64-gnu@1.1.4',
  'lightningcss-linux-x64-gnu@1.32.0',
  '@esbuild/linux-x64@0.28.1',
  '@tailwindcss/oxide-linux-x64-gnu@4.3.2',
]

function packageName(spec) {
  return spec.slice(0, spec.lastIndexOf('@'))
}

function isInstalled(spec) {
  try {
    require.resolve(`${packageName(spec)}/package.json`)
    return true
  } catch {
    return false
  }
}

function main() {
  if (process.platform !== 'linux' || process.arch !== 'x64') {
    return
  }

  const missing = REQUIRED.filter((spec) => !isInstalled(spec))

  if (missing.length === 0) {
    console.log('[verify-native-bindings] all Linux x64 native bindings present')
    return
  }

  console.warn(
    `[verify-native-bindings] npm skipped ${missing.length} native binding(s), force-installing: ${missing.join(', ')}`,
  )
  execSync(
    `npm install ${missing.join(' ')} --no-save --no-audit --no-fund --force`,
    { stdio: 'inherit' },
  )

  const stillMissing = missing.filter((spec) => !isInstalled(spec))
  if (stillMissing.length > 0) {
    console.error(
      `[verify-native-bindings] still missing after force-install: ${stillMissing.join(', ')}`,
    )
    process.exit(1)
  }

  console.log('[verify-native-bindings] fallback install succeeded')
}

main()

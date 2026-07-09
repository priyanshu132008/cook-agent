import { defineConfig } from 'tsup';

/**
 * Compile the CLI's TypeScript entry into a single ESM file under dist/.
 *
 * Dependencies are kept external so they resolve from node_modules at runtime
 * in their native module format. This is critical on Windows: heavy CJS deps
 * (pm2 -> iconv-lite -> safer-buffer) call `require('buffer')`, which throws
 * "Dynamic require is not supported" when bundled into ESM. Keeping them
 * external lets Node's loader handle them natively, so the compiled binary
 * runs via `node dist/index.js` with no tsx shim and no install prompts.
 */
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node22',
  clean: true,
  // tsup auto-preserves the #!/usr/bin/env node shebang from src/index.ts.
  // Keep all runtime deps external so Node loads them from node_modules in
  // their native module form. Bundling CJS deps (cheerio -> encoding-sniffer
  // -> iconv-lite -> safer-buffer, which calls require('buffer')) into ESM
  // throws "Dynamic require is not supported" at runtime. Externalized, their
  // native CJS require works. These are declared as the CLI's own
  // dependencies in package.json so they install alongside the published bin.
  external: ['chalk', 'pm2', '@clack/prompts', 'cheerio'],
});
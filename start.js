#!/usr/bin/env node

/**
 * CampusEdge Launchpad — Start Everything
 * =========================================
 * Run from project root:   node start.js
 * Cross-platform (Windows / macOS / Linux).
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = __dirname;
const API_DIR = path.join(ROOT, 'apps', 'api');
const WEB_DIR = path.join(ROOT, 'apps', 'web');
const SHARED_DIR = path.join(ROOT, 'packages', 'shared');

// ─── Helpers ──────────────────────────────────────────────────

const BANNER = `
╔══════════════════════════════════════════════════════════╗
║     🚀  CAMPUSEDGE LAUNCHPAD  —  START EVERYTHING        ║
╚══════════════════════════════════════════════════════════╝
`;

function print(label, msg) {
  const icon = label === 'ok'   ? ' ✅' :
               label === 'warn' ? ' ⚠️' :
               label === 'skip' ? ' ⏭' :
               label === 'done' ? ' 🎉' : ' 🚀';
  console.log(`${icon}  ${msg}`);
}

function run(cmd, opts = {}) {
  const cwd = opts.cwd || ROOT;
  delete opts.cwd;
  try {
    execSync(cmd, { cwd, stdio: 'inherit', ...opts });
  } catch (err) {
    if (opts.ignoreError) return false;
    throw err;
  }
  return true;
}

function has(p) {
  return fs.existsSync(path.resolve(ROOT, p));
}

// ─── Prerequisites check ─────────────────────────────────────

function checkPrerequisites() {
  try {
    execSync('node --version', { stdio: 'pipe' });
    execSync('npm --version', { stdio: 'pipe' });
  } catch {
    console.error('\n❌  Node.js and npm are required. Please install them first.');
    console.error('   https://nodejs.org/en/download/\n');
    process.exit(1);
  }
}

// ─── Main ─────────────────────────────────────────────────────

function main() {
  console.log(BANNER);

  checkPrerequisites();

  // 1. Dependencies -------------------------------------------------
  if (!has('node_modules')) {
    console.log('  📦  Installing dependencies…');
    run('npm install');
    console.log('  ✅  Dependencies installed.');
  } else {
    print('skip', 'node_modules found, skipping npm install.');
  }

  // 2. Prisma client generation ------------------------------------
  console.log('  🗄️   Generating Prisma client…');
  run('npx prisma generate', { cwd: API_DIR });
  console.log('  ✅  Prisma client generated.');

  // 3. Database migrations -----------------------------------------
  if (!has('apps/api/prisma/migrations')) {
    console.log('  🗄️   Running initial database migration…');
    run('npx prisma migrate dev --name init --skip-generate', { cwd: API_DIR });
    console.log('  ✅  Database migrated.');
  } else {
    print('skip', 'Migrations folder found. Applying any pending migrations…');
    run('npx prisma migrate deploy', { cwd: API_DIR });
    console.log('  ✅  Database migrations up to date.');
  }

  // 4. Seed database -----------------------------------------------
  const dbPath = path.join(API_DIR, 'prisma', 'dev.db');
  if (process.argv.includes('--force-seed')) {
    console.log('  🌱  Re-seeding database (--force-seed)…');
    run('npx ts-node prisma/seed.ts', { cwd: API_DIR });
    console.log('  ✅  Database seeded.');
  } else if (!has(dbPath)) {
    console.log('  🌱  Seeding database with demo data…');
    run('npx ts-node prisma/seed.ts', { cwd: API_DIR });
    console.log('  ✅  Database seeded.');
  } else {
    print('skip', `Database exists at ${path.relative(ROOT, dbPath)}. Use --force-seed to re-seed.`);
  }

  // 5. Build shared package ----------------------------------------
  if (!has('packages/shared/dist/index.js')) {
    console.log('  📦  Building shared package…');
    run('npm run build', { cwd: SHARED_DIR });
    console.log('  ✅  Shared package built.');
  } else {
    print('skip', 'Shared package already built.');
  }

  // 6. Start API + Web in parallel ---------------------------------
  console.log('  🎉  All systems ready! Starting servers…\n');
  console.log('  ┌─────────────────────────────────────────────────────────────┐');
  console.log('  │                                                             │');
  console.log('  │   📡  API  →  http://localhost:3001                         │');
  console.log('  │   🌐  Web  →  http://localhost:5173                         │');
  console.log('  │                                                             │');
  console.log('  │   Press Ctrl+C to stop everything.                          │');
  console.log('  │                                                             │');
  console.log('  └─────────────────────────────────────────────────────────────┘\n');

  const api = spawn('npm run dev', { cwd: API_DIR, stdio: 'inherit', shell: true });
  const web = spawn('npm run dev', { cwd: WEB_DIR, stdio: 'inherit', shell: true });

  // Clean shutdown on Ctrl+C / SIGTERM
  function shutdown(signal) {
    console.log(`\n  ⚠️  Received ${signal}. Shutting down…`);
    api.kill(signal);
    web.kill(signal);
    process.exit(0);
  }
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Exit if a child crashes
  api.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`  ❌  API exited with code ${code}. Stopping…`);
      web.kill();
      process.exit(code);
    }
  });
  web.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`  ❌  Web exited with code ${code}. Stopping…`);
      api.kill();
      process.exit(code);
    }
  });
  api.on('error', (err) => { console.error('  ❌  API error:', err.message); process.exit(1); });
  web.on('error', (err) => { console.error('  ❌  Web error:', err.message); process.exit(1); });
}

try {
  main();
} catch (err) {
  console.error(`\n  ❌  Startup failed: ${err.message}`);
  process.exit(1);
}

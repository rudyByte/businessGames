#!/usr/bin/env node

/**
 * ─── CampusEdge Launchpad — Start Everything ────────────────────
 *   One command to init the DB, build shared, and fire up both
 *   the API (Express + Prisma) and Web (Vite + React) servers.
 *
 *   Usage:
 *     node start.js
 *     node start.js --force-seed    (re-seed the database)
 *     node start.js --no-open       (skip browser auto-open)
 *     node start.js --help          (show this message)
 * ─────────────────────────────────────────────────────────────────
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

// ─── Config ──────────────────────────────────────────────────────
const ROOT      = __dirname;
const API_DIR   = path.join(ROOT, 'apps', 'api');
const WEB_DIR   = path.join(ROOT, 'apps', 'web');
const SHARED_DIR = path.join(ROOT, 'packages', 'shared');
const API_PORT  = 3001;
const WEB_PORT  = 5173;
const WEB_URL   = `http://localhost:${WEB_PORT}`;
const API_URL   = `http://localhost:${API_PORT}`;

const DEMO_ACCOUNTS = [
  { role: '🎮 Student',     email: 'aryan@student.com',       pw: 'User@123', link: '/student' },
  { role: '📚 Teacher',     email: 'sharma@dps.in',           pw: 'User@123', link: '/faculty' },
  { role: '👨‍👩‍👧 Parent',     email: 'parent.goel@parent.com',  pw: 'User@123', link: '/parent' },
  { role: '👑 Admin',       email: 'admin@campusedge.in',      pw: 'Admin@123', link: '/admin' },
];

// ─── Helpers ─────────────────────────────────────────────────────

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

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function center(text, width = 72) {
  const pad = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(pad) + text;
}

function hr(char = '─', width = 74) {
  return '  ' + char.repeat(width);
}

function httpGet(url, timeout = 3000) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ ok: true, status: res.statusCode, data }));
    });
    req.on('error', () => resolve({ ok: false, status: 0, data: '' }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 0, data: '' }); });
  });
}

function ensureEnvFile() {
  const envPath = path.join(API_DIR, '.env');
  if (has(envPath)) return;
  console.log('  📝  Creating apps/api/.env with development defaults…');
  const envContent = `# ─── CampusEdge API (Dev Overrides) ─────────────────────
PORT=3001
NODE_ENV=development
JWT_SECRET=campusedge-development-secret-key-32-chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173

# ─── Optional: AI services (without these, fallback logic is used)
# GEMINI_API_KEY=your_key_here
# HUGGINGFACE_API_KEY=your_key_here

# ─── Optional: SMTP (without these, Ethereal is used in dev)
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=your@email.com
# SMTP_PASS=your_password
# SMTP_FROM=noreply@campusedge.in
# SMTP_SECURE=false

# ─── Optional: Redis (without this, in-memory mock is used)
# REDIS_URL=redis://localhost:6379
`;
  fs.writeFileSync(envPath, envContent);
  console.log('  ✅  .env created.');
}

// ─── Banner ──────────────────────────────────────────────────────

const BANNER = `
  ╔════════════════════════════════════════════════════════════╗
  ║                                                            ║
  ║       🚀  C A M P U S E D G E   L A U N C H P A D         ║
  ║              Start Everything · One Command                 ║
  ║                                                            ║
  ╚════════════════════════════════════════════════════════════╝
`;

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  // ── Args ────────────────────────────────────────────────────────
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log(BANNER);
    console.log('  Usage:  node start.js [options]\n');
    console.log('  Options:');
    console.log('    --force-seed   Re-seed the database with fresh demo data');
    console.log('    --no-open      Skip auto-opening the browser');
    console.log('    --help         Show this message');
    console.log();
    process.exit(0);
  }
  const FORCE_SEED = args.includes('--force-seed');
  const NO_OPEN    = args.includes('--no-open');

  console.log(BANNER);

  // ── 0. Prerequisites ───────────────────────────────────────────
  console.log('  ─── Prerequisites ──────────────────────────────────────────\n');
  try {
    execSync('node --version', { stdio: 'pipe' });
    execSync('npm --version',  { stdio: 'pipe' });
    console.log('  ✅  Node.js + npm found\n');
  } catch {
    console.error('  ❌  Node.js and npm are required. Install from https://nodejs.org/\n');
    process.exit(1);
  }

  // ── 1. Ensure .env ─────────────────────────────────────────────
  console.log('  ─── Environment ────────────────────────────────────────────\n');
  ensureEnvFile();
  console.log();

  // ── 2. Dependencies ────────────────────────────────────────────
  console.log('  ─── Dependencies ───────────────────────────────────────────\n');
  if (!has('node_modules')) {
    console.log('  📦  Installing dependencies…');
    run('npm install');
    console.log('  ✅  Dependencies installed.\n');
  } else {
    console.log('  ⏭   node_modules exists\n');
  }

  // ── 3. Prisma client ───────────────────────────────────────────
  console.log('  ─── Database ───────────────────────────────────────────────\n');
  console.log('  🗄️   Generating Prisma client…');
  run('npx prisma generate', { cwd: API_DIR });
  console.log('  ✅  Prisma client generated.\n');

  // ── 4. Migrations ──────────────────────────────────────────────
  if (!has('apps/api/prisma/migrations')) {
    console.log('  🗄️   Running initial database migration…');
    run('npx prisma migrate dev --name init --skip-generate', { cwd: API_DIR });
    console.log('  ✅  Database migrated.\n');
  } else {
    console.log('  ⏭   Running pending migrations…');
    run('npx prisma migrate deploy', { cwd: API_DIR });
    console.log('  ✅  Migrations up to date.\n');
  }

  // ── 5. Seed ────────────────────────────────────────────────────
  const dbFile = path.join(API_DIR, 'prisma', 'dev.db');
  if (FORCE_SEED) {
    console.log('  🌱  Re-seeding database (--force-seed)…');
    run('npx ts-node prisma/seed.ts', { cwd: API_DIR });
    console.log('  ✅  Database re-seeded.\n');
  } else if (!has(dbFile)) {
    console.log('  🌱  Seeding database with demo data…');
    run('npx ts-node prisma/seed.ts', { cwd: API_DIR });
    console.log('  ✅  Database seeded.\n');
  } else {
    console.log('  ⏭   Database exists — re-use with --force-seed if needed\n');
  }

  // ── 6. Shared package ──────────────────────────────────────────
  console.log('  ─── Shared Package ─────────────────────────────────────────\n');
  if (!has('packages/shared/dist/index.js')) {
    console.log('  📦  Building shared package…');
    run('npm run build', { cwd: SHARED_DIR });
    console.log('  ✅  Shared package built.\n');
  } else {
    console.log('  ⏭   Shared package already built\n');
  }

  // ── 7. Launch servers ──────────────────────────────────────────
  console.log('  ─── Launching Servers ──────────────────────────────────────\n');

  const api = spawn('npm run dev', { cwd: API_DIR, stdio: 'inherit', shell: true });
  const web = spawn('npm run dev', { cwd: WEB_DIR, stdio: 'inherit', shell: true });

  // ── 8. Health polling ──────────────────────────────────────────
  console.log('  ⏳  Waiting for servers to be ready…');
  let apiReady = false;
  let webReady = false;

  for (let i = 0; i < 45; i++) {     // up to 45s
    if (!apiReady) {
      const resp = await httpGet(`${API_URL}/api/v1/health`, 2000);
      if (resp.ok) apiReady = true;
    }
    if (!webReady) {
      const resp = await httpGet(WEB_URL, 2000);
      if (resp.ok) webReady = true;
    }
    if (apiReady && webReady) break;
    await sleep(1000);
  }

  // ── 9. Dashboard ──────────────────────────────────────────────
  console.clear();
  console.log(`
  ╔════════════════════════════════════════════════════════════╗
  ║                     🚀  ALL SYSTEMS GO                     ║
  ╠════════════════════════════════════════════════════════════╣
  ║  ${apiReady ? '✅' : '❌'}  API Health:    ${API_URL}/api/v1/health${' '.repeat(Math.max(0, 33 - String(API_URL).length))}║
  ║  ${webReady ? '✅' : '❌'}  Web App:       ${WEB_URL}${' '.repeat(37 - String(WEB_URL).length)}║
  ╚════════════════════════════════════════════════════════════╝
  `);

  // ── Demo accounts ─────────────────────────────────────────────
  console.log(`  ╔════════════════════════════════════════════════════════════╗`);
  console.log(`  ║           🔑  DEMO LOGIN ACCOUNTS                        ║`);
  console.log(`  ╠════════════════════════════════════════════════════════════╣`);
  for (const a of DEMO_ACCOUNTS) {
    const email = a.email.padEnd(32);
    console.log(`  ║  ${a.role.padEnd(16)}  ${email}  ${a.pw.padEnd(12)}  ║`);
  }
  console.log(`  ╚════════════════════════════════════════════════════════════╝\n`);

  // ── Quick links ───────────────────────────────────────────────
  console.log(`  📍  Quick Links:`);
  console.log(`       ${WEB_URL}                    ← Play the game`);
  console.log(`       ${API_URL}/api/v1/health       ← API health check`);
  console.log(`       ${API_URL}/api/v1/auth/login   ← Login endpoint\n`);

  // ── Status ────────────────────────────────────────────────────
  process.stdout.write('  📡  API status: ');
  process.stdout.write(apiReady ? 'RUNNING' : 'STARTING…');
  process.stdout.write('   |   Web status: ');
  process.stdout.write(webReady ? 'RUNNING' : 'STARTING…');
  console.log('\n');
  console.log(`  ⚡  Press Ctrl+C to stop everything.\n`);

  // ── Auto-open browser ────────────────────────────────────────
  if (!NO_OPEN && webReady) {
    const plat = process.platform;
    const cmd = plat === 'darwin' ? 'open' :
                plat === 'win32'  ? 'start' : 'xdg-open';
    console.log(`  🌐  Opening ${WEB_URL} in your browser…\n`);
    try { execSync(`${cmd} "${WEB_URL}"`, { stdio: 'ignore' }); }
    catch { /* not on every platform */ }
  }

  // ── 10. Process management ────────────────────────────────────
  let shuttingDown = false;

  function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`\n  ⚠️  ${signal} received. Shutting down gracefully…`);
    api.kill('SIGTERM');
    web.kill('SIGTERM');
    // Let processes finish and then exit
    setTimeout(() => process.exit(0), 3000);
  }

  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  api.on('exit', (code) => {
    if (!shuttingDown && code !== null && ![0, 143, null].includes(code)) {
      console.error(`\n  ❌  API crashed (code ${code}). Stopping web server.`);
      web.kill();
      process.exit(code);
    }
  });
  web.on('exit', (code) => {
    if (!shuttingDown && code !== null && ![0, 143, null].includes(code)) {
      console.error(`\n  ❌  Web crashed (code ${code}). Stopping API server.`);
      api.kill();
      process.exit(code);
    }
  });
  api.on('error', (err) => { if (!shuttingDown) { console.error('\n  ❌  API error:', err.message); process.exit(1); } });
  web.on('error', (err) => { if (!shuttingDown) { console.error('\n  ❌  Web error:', err.message); process.exit(1); } });
}

main().catch((err) => {
  console.error(`\n  ❌  Startup failed: ${err.message}\n`);
  process.exit(1);
});

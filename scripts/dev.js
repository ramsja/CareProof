#!/usr/bin/env node
/**
 * CareProof — single-terminal dev launcher.
 *
 * Usage:  npm run dev
 *
 * What it does in order:
 *   1. Load .env.local into the process environment
 *   2. Ensure .env.local exists (copies from .env.example if missing)
 *   3. Generate Prisma client
 *   4. Run DB migration (creates dev.db if missing)
 *   5. Seed fictional records (only when DB is freshly created)
 *   6. Start Hardhat node as a background child process
 *   7. Wait until the RPC is ready
 *   8. Deploy CareProofRegistry, write address to .env.local
 *   9. Start Next.js dev server (foreground)
 *
 * Re-start behaviour:
 *   - If NEXT_PUBLIC_CONTRACT_ADDRESS is already valid in .env.local
 *     and the RPC is already up, the deploy step is skipped.
 *   - Prisma generate + migrate are always fast no-ops when nothing changed.
 *
 * Stop: Ctrl+C kills both Next.js and the Hardhat node cleanly.
 */

"use strict";

const { execSync, spawn } = require("child_process");
const fs                  = require("fs");
const path                = require("path");
const http                = require("http");

const ROOT      = path.join(__dirname, "..");
const ENV_FILE  = path.join(ROOT, ".env.local");
const RPC_URL   = "http://127.0.0.1:8545";

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  reset: "\x1b[0m", cyan: "\x1b[36m", green: "\x1b[32m",
  yellow: "\x1b[33m", red: "\x1b[31m", bold: "\x1b[1m",
};
const log  = (m) => console.log(`${C.cyan}[careproof]${C.reset} ${m}`);
const ok   = (m) => console.log(`${C.green}[careproof]${C.reset} ✅ ${m}`);
const warn = (m) => console.log(`${C.yellow}[careproof]${C.reset} ⚠️  ${m}`);
const fail = (m) => console.error(`${C.red}[careproof]${C.reset} ❌ ${m}`);

// ── Env helpers ───────────────────────────────────────────────────────────────

/** Parse any .env-style file → { KEY: value } */
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return Object.fromEntries(
    fs.readFileSync(filePath, "utf8")
      .split("\n")
      .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
      .map((l) => {
        const idx = l.indexOf("=");
        return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^"|"$/g, "")];
      }),
  );
}

/**
 * Build a merged env object: process.env + .env + .env.local
 * This is passed to every subprocess so Prisma / Hardhat always see DATABASE_URL etc.
 */
function mergedEnv() {
  return {
    ...process.env,
    ...parseEnvFile(path.join(ROOT, ".env")),
    ...parseEnvFile(ENV_FILE),
  };
}

/** Read current .env.local values */
const readEnvLocal = () => parseEnvFile(ENV_FILE);

/** Write / update a single key in .env.local without touching other lines. */
function setEnvLocal(key, value) {
  let content = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, "utf8") : "";
  const line  = `${key}="${value}"`;
  const regex = new RegExp(`^${key}=.*$`, "m");
  content = regex.test(content)
    ? content.replace(regex, line)
    : content.trimEnd() + "\n" + line + "\n";
  fs.writeFileSync(ENV_FILE, content, "utf8");
}

// ── Process helpers ───────────────────────────────────────────────────────────

/** Sleep for ms milliseconds. */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Run a command synchronously with the merged env, streaming output.
 * On Windows, EBUSY on Prisma DLL files is transient — retry up to 3 times.
 */
function run(cmd, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      execSync(cmd, { stdio: "inherit", cwd: ROOT, env: mergedEnv(), shell: true });
      return;
    } catch (e) {
      const msg = e.message || "";
      if (i < retries - 1 && /EBUSY|resource busy|locked/i.test(msg)) {
        warn(`Command busy (attempt ${i + 1}/${retries}), retrying in 2s…`);
        // Synchronous sleep via a blocking loop (we're already in sync context)
        const end = Date.now() + 2000;
        while (Date.now() < end) { /* spin */ }
        continue;
      }
      throw e;
    }
  }
}

/** Run a command and capture stdout as a string (merged env). */
function capture(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: "utf8", env: mergedEnv(), shell: true });
}

/** Check if the Hardhat RPC is already up. */
function isRpcRunning() {
  return new Promise((resolve) => {
    const req = http.get(RPC_URL, (res) => { res.resume(); resolve(true); });
    req.on("error", () => resolve(false));
    req.setTimeout(400, () => { req.destroy(); resolve(false); });
  });
}

/** Poll until RPC responds (or timeout). */
function waitForRpc(retries = 50, delayMs = 400) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      const req = http.get(RPC_URL, (res) => { res.resume(); resolve(); });
      req.on("error", () => {
        if (n <= 0) { reject(new Error("Hardhat RPC did not start in time.")); return; }
        setTimeout(() => attempt(n - 1), delayMs);
      });
      req.setTimeout(300, () => { req.destroy(); });
    };
    attempt(retries);
  });
}

// ── Ensure .env.local exists ──────────────────────────────────────────────────
function ensureEnvLocal() {
  if (fs.existsSync(ENV_FILE)) return;
  const example = path.join(ROOT, ".env.example");
  if (fs.existsSync(example)) {
    fs.copyFileSync(example, ENV_FILE);
    log("Created .env.local from .env.example");
  } else {
    fs.writeFileSync(ENV_FILE, [
      'DATABASE_URL="file:./prisma/dev.db"',
      'NEXT_PUBLIC_CHAIN_ID="31337"',
      'NEXT_PUBLIC_CHAIN_NAME="CareProof Local"',
      'NEXT_PUBLIC_RPC_URL="http://127.0.0.1:8545"',
      'NEXT_PUBLIC_CURRENCY_SYMBOL="ETH"',
      'NEXT_PUBLIC_CONTRACT_ADDRESS=""',
    ].join("\n") + "\n", "utf8");
    log("Created .env.local with defaults");
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log(`\n${C.bold}${C.cyan}━━━ CareProof Dev Launcher ━━━${C.reset}\n`);

  // 0. Ensure .env.local exists and load it into process.env immediately
  ensureEnvLocal();
  Object.assign(process.env, parseEnvFile(ENV_FILE));

  // Ensure DATABASE_URL is set (Prisma requires it)
  if (!process.env.DATABASE_URL) {
    const dbPath = path.join(ROOT, "prisma", "dev.db");
    const dbUrl  = `file:${dbPath}`;
    process.env.DATABASE_URL = dbUrl;
    setEnvLocal("DATABASE_URL", `file:./prisma/dev.db`);
    log(`Set DATABASE_URL → file:./prisma/dev.db`);
  }

  // 1. Prisma generate
  log("Generating Prisma client…");
  run("npx prisma generate");
  ok("Prisma client ready");

  // 2. DB migration (idempotent — safe to run every time)
  log("Running database migration…");
  try {
    run("npx prisma migrate dev --name init --skip-seed");
    ok("Database migrated");
  } catch {
    // Migration may fail if already up-to-date in a non-interactive env
    warn("Migration skipped or already up-to-date");
  }

  // 3. Seed if DB is empty
  try {
    // Dynamically require Prisma so it picks up the just-generated client
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const count  = await prisma.record.count().catch(() => 0);
    await prisma.$disconnect();
    if (count === 0) {
      log("Seeding fictional records…");
      run("npx tsx prisma/seed.ts");
      ok("Database seeded");
    } else {
      log(`Database has ${count} record(s) — skipping seed`);
    }
  } catch {
    warn("Could not check record count — skipping seed");
  }

  // 4. Start Hardhat node unless already running
  const rpcAlreadyUp = await isRpcRunning();
  let hardhatProc    = null;

  if (rpcAlreadyUp) {
    log("Hardhat node already running — reusing");
  } else {
    log("Starting Hardhat local node in background…");
    hardhatProc = spawn("npx", ["hardhat", "node"], {
      cwd:      ROOT,
      stdio:    ["ignore", "pipe", "pipe"],
      detached: false,
      shell:    true,
      env:      mergedEnv(),
    });

    hardhatProc.stdout.on("data", (d) => {
      d.toString().split("\n").filter(Boolean).forEach((l) => {
        // Suppress private key / mnemonic lines to avoid accidental leakage in logs
        if (/private key|mnemonic/i.test(l)) return;
        process.stdout.write(`${C.yellow}[hardhat]${C.reset} ${l}\n`);
      });
    });
    hardhatProc.stderr.on("data", (d) => {
      process.stderr.write(`${C.yellow}[hardhat]${C.reset} ${d}`);
    });

    log("Waiting for Hardhat RPC at http://127.0.0.1:8545 …");
    await waitForRpc();
    ok("Hardhat node ready");
  }

  // 5. Deploy contract (skip if address already configured)
  const envVars      = readEnvLocal();
  const existingAddr = envVars["NEXT_PUBLIC_CONTRACT_ADDRESS"];
  let   contractAddr = existingAddr && /^0x[0-9a-fA-F]{40}$/.test(existingAddr)
    ? existingAddr
    : null;

  if (contractAddr) {
    log(`Contract already at ${contractAddr} — skipping deploy`);
  } else {
    log("Deploying CareProofRegistry to local network…");
    try {
      const output = capture("npx hardhat run contracts/scripts/deploy.ts --network localhost");
      process.stdout.write(output);
      const match = output.match(/deployed to:\s*(0x[0-9a-fA-F]{40})/i);
      if (match) {
        contractAddr = match[1];
        setEnvLocal("NEXT_PUBLIC_CONTRACT_ADDRESS", contractAddr);
        // Also update current process.env so Next.js sees it immediately
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS = contractAddr;
        ok(`Contract deployed at ${contractAddr}`);
        ok("NEXT_PUBLIC_CONTRACT_ADDRESS written to .env.local");
      } else {
        warn("Could not parse contract address from deploy output.");
        warn("Set NEXT_PUBLIC_CONTRACT_ADDRESS manually in .env.local");
      }
    } catch (e) {
      fail("Deploy failed: " + (e instanceof Error ? e.message.split("\n")[0] : String(e)));
      warn("Continuing — set NEXT_PUBLIC_CONTRACT_ADDRESS manually in .env.local");
    }
  }

  // 6. Start Next.js (foreground)
  console.log(`\n${C.green}${C.bold}━━━ Starting Next.js at http://localhost:3000 ━━━${C.reset}\n`);

  const nextProc = spawn("npx", ["next", "dev"], {
    cwd:   ROOT,
    stdio: "inherit",
    shell: true,
    env:   mergedEnv(),
  });

  // 7. Clean shutdown
  const shutdown = () => {
    console.log(`\n${C.cyan}[careproof]${C.reset} Shutting down…`);
    nextProc.kill("SIGTERM");
    if (hardhatProc) hardhatProc.kill("SIGTERM");
    process.exit(0);
  };

  process.on("SIGINT",  shutdown);
  process.on("SIGTERM", shutdown);
  nextProc.on("exit", (code) => {
    if (hardhatProc) hardhatProc.kill("SIGTERM");
    process.exit(code ?? 0);
  });
})();

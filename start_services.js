const { spawn, exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Configuration for services to run.
 */
const CONFIG = {
  services: [
    {
      name: 'AGENT',
      cwd: 'V5-Agent',
      command: 'npm',
      args: ['run', 'dev'],
      port: 3000,
      color: '\x1b[35m' // Magenta
    },
    {
      name: 'FRONTEND',
      cwd: 'frontend',
      command: 'npm',
      args: ['run', 'dev'],
      port: 3001,
      color: '\x1b[36m' // Cyan
    }
    // REMOVED: NODE (Hardhat) is now expected to be run manually in a separate terminal
    // to prevent auto-sync issues.
  ],
  colors: {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    gray: '\x1b[90m'
  }
};

const getTimestamp = () => `${CONFIG.colors.gray}[${new Date().toLocaleTimeString()}]${CONFIG.colors.reset}`;

const log = (msg, color = '') => {
  console.log(`${getTimestamp()} ${color}${msg}${CONFIG.colors.reset}`);
};

const error = (msg) => {
  console.error(`${getTimestamp()} ${CONFIG.colors.red}[ERROR] ${msg}${CONFIG.colors.reset}`);
};

/**
 * Robustly kills processes on a specific port.
 */
async function killProcessOnPort(port) {
  return new Promise((resolve) => {
    const cmd = `netstat -ano | findstr :${port} | findstr LISTENING`;
    exec(cmd, (err, stdout) => {
      if (err || !stdout) return resolve();

      const pids = stdout.trim().split('\n')
        .map(line => line.trim().split(/\s+/).pop())
        .filter(pid => /^\d+$/.test(pid));

      const uniquePids = [...new Set(pids)];
      if (uniquePids.length === 0) return resolve();

      log(`Cleaning port ${port} (PIDs: ${uniquePids.join(', ')})`, CONFIG.colors.yellow);
      
      uniquePids.forEach(pid => {
        try {
          execSync(`taskkill /F /PID ${pid} /T`, { stdio: 'ignore' });
        } catch (e) {
          try { execSync(`powershell -Command "Stop-Process -Id ${pid} -Force"`, { stdio: 'ignore' }); } catch (pe) {}
        }
      });
      resolve();
    });
  });
}

function clearLockFiles(serviceDir) {
  const locks = [path.join(serviceDir, '.next/dev/lock')];
  locks.forEach(l => {
    if (fs.existsSync(l)) {
      try { fs.unlinkSync(l); log(`Cleared lock: ${l}`, CONFIG.colors.gray); } catch (e) {}
    }
  });
}

const processes = [];

function startService(service) {
  const servicePath = path.resolve(__dirname, service.cwd);
  
  if (!fs.existsSync(servicePath)) return error(`Path not found: ${servicePath}`);
  
  clearLockFiles(servicePath);

  log(`[${service.name}] Starting...`, service.color);

  const child = spawn(service.command, service.args, {
    cwd: servicePath,
    shell: true,
    stdio: 'pipe',
    env: { ...process.env, FORCE_COLOR: 'true' }
  });

  child.stdout.on('data', (data) => {
    data.toString().split('\n').filter(s => s.trim()).forEach(line => {
      console.log(`${service.color}[${service.name}]${CONFIG.colors.reset} ${line.trim()}`);
    });
  });

  child.stderr.on('data', (data) => {
    data.toString().split('\n').filter(s => s.trim()).forEach(line => {
      console.error(`${service.color}[${service.name}]${CONFIG.colors.reset} ${CONFIG.colors.red}[ERR]${CONFIG.colors.reset} ${line.trim()}`);
    });
  });

  child.on('close', (code, signal) => {
    const status = signal ? `killed by signal ${signal}` : `exited with code ${code}`;
    const msg = `[${service.name}] ${status}`;
    
    if (code === 0 || code === null) {
      log(msg, CONFIG.colors.green);
    } else {
      error(msg);
      if (code === 4294967295) {
        log(`[${service.name}] Tip: Exit code -1 (4294967295) on Windows often means the process was terminated by an external signal or a system limit.`, CONFIG.colors.yellow);
      }
    }
  });

  processes.push({ name: service.name, child });
}

async function main() {
  console.clear();
  console.log(`${CONFIG.colors.green}===================================================${CONFIG.colors.reset}`);
  console.log(`${CONFIG.colors.green}   V5 SIMPLIFIED ORCHESTRATOR - FRONTEND ONLY     ${CONFIG.colors.reset}`);
  console.log(`${CONFIG.colors.green}===================================================${CONFIG.colors.reset}\n`);
  log('Dependency: Please ensure Hardhat Node is running in a separate terminal.', CONFIG.colors.yellow);
  log('Dependency: Verified contracts must be manually deployed.', CONFIG.colors.yellow);

  // Still clean ports 3000 and 3001
  for (const port of [3000, 3001]) {
    await killProcessOnPort(port);
  }
  
  await new Promise(r => setTimeout(r, 1000));
  CONFIG.services.forEach(startService);

  // Keep orchestrator alive
  setInterval(() => {}, 1000);
}

main().catch(err => error(`FATAL: ${err.message}`));

const shutdown = () => {
  log(`\nStopping services...`, CONFIG.colors.yellow);
  processes.forEach(({ name, child }) => {
    if (child.pid) {
      try { execSync(`taskkill /F /PID ${child.pid} /T`, { stdio: 'ignore' }); } catch (e) {}
    }
  });
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

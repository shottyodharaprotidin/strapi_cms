/* Releases a TCP port by killing listening processes (Windows-first implementation). */
const { execSync } = require('child_process');

const port = Number(process.argv[2]);
if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  console.error('Usage: node scripts/free-port.js <port>');
  process.exit(2);
}

function releasePortWindows(targetPort) {
  const output = execSync('netstat -ano -p tcp', { encoding: 'utf8' });
  const lines = output.split(/\r?\n/);
  const pids = new Set();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('TCP')) continue;

    const parts = trimmed.split(/\s+/);
    if (parts.length < 5) continue;

    const localAddress = parts[1];
    const state = parts[3];
    const pid = parts[4];

    if (state !== 'LISTENING') continue;

    const portPart = localAddress.includes(':')
      ? localAddress.split(':').pop()
      : '';

    if (String(targetPort) === portPart && /^\d+$/.test(pid)) {
      pids.add(Number(pid));
    }
  }

  for (const pid of pids) {
    try {
      process.kill(pid, 'SIGTERM');
      console.log(`Released port ${targetPort} by terminating PID ${pid}`);
    } catch (error) {
      const code = error && error.code ? error.code : 'UNKNOWN';
      console.warn(`Could not terminate PID ${pid} (${code})`);
    }
  }

  if (pids.size === 0) {
    console.log(`Port ${targetPort} is already free`);
  }
}

try {
  if (process.platform === 'win32') {
    releasePortWindows(port);
  } else {
    // Fallback for non-Windows environments.
    const cmd = `lsof -ti tcp:${port}`;
    let output = '';
    try {
      output = execSync(cmd, { encoding: 'utf8' }).trim();
    } catch {
      console.log(`Port ${port} is already free`);
      process.exit(0);
    }

    const pids = output
      .split(/\r?\n/)
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isInteger(value));

    if (pids.length === 0) {
      console.log(`Port ${port} is already free`);
      process.exit(0);
    }

    for (const pid of pids) {
      try {
        process.kill(pid, 'SIGTERM');
        console.log(`Released port ${port} by terminating PID ${pid}`);
      } catch (error) {
        const code = error && error.code ? error.code : 'UNKNOWN';
        console.warn(`Could not terminate PID ${pid} (${code})`);
      }
    }
  }
} catch (error) {
  const message = error && error.message ? error.message : String(error);
  console.error(`Failed to release port ${port}: ${message}`);
  process.exit(1);
}

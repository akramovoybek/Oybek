const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

const RUNNER_IMAGE = process.env.DOCKER_RUNNER_IMAGE || 'contest-runner';
const DEFAULT_TIMEOUT = parseInt(process.env.EXECUTION_TIMEOUT, 10) || 10;
const DEFAULT_MEMORY = process.env.MEMORY_LIMIT || '256m';

/**
 * Run Python code inside an isolated Docker container.
 *
 * @param {Object} options
 * @param {string} options.code - Python source code
 * @param {string} options.input - stdin input
 * @param {number} options.timeLimit - time limit in seconds
 * @param {number} options.memoryLimit - memory limit in MB
 * @returns {Object} { output, error, exitCode, timedOut, executionTime, memoryUsed }
 */
async function runCode({ code, input, timeLimit, memoryLimit }) {
  const timeout = (timeLimit || DEFAULT_TIMEOUT) * 1000; // ms
  const memLimit = `${memoryLimit || 256}m`;

  const runId = uuidv4();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `run-${runId}-`));
  const codePath = path.join(tmpDir, 'solution.py');
  const inputPath = path.join(tmpDir, 'input.txt');

  fs.writeFileSync(codePath, code);
  fs.writeFileSync(inputPath, input || '');

  return new Promise((resolve) => {
    const startTime = Date.now();

    const args = [
      'run',
      '--rm',
      '--name', `runner-${runId}`,
      // Resource limits
      '--memory', memLimit,
      '--memory-swap', memLimit,
      '--cpus', '1',
      // Security: no network
      '--network', 'none',
      // Read-only root filesystem except /tmp
      '--read-only',
      '--tmpfs', '/tmp:rw,noexec,nosuid,size=64m',
      // No privileged operations
      '--cap-drop', 'ALL',
      '--security-opt', 'no-new-privileges',
      // Mount code and input as read-only
      '-v', `${codePath}:/app/solution.py:ro`,
      '-v', `${inputPath}:/app/input.txt:ro`,
      // Use the runner image
      RUNNER_IMAGE,
      // Command: run python with input, capture time
      'sh', '-c',
      'cd /app && python3 solution.py < input.txt',
    ];

    const child = execFile('docker', args, {
      timeout: timeout + 2000, // extra 2s for container overhead
      maxBuffer: 10 * 1024 * 1024, // 10MB
      encoding: 'utf-8',
    }, (error, stdout, stderr) => {
      const executionTime = (Date.now() - startTime) / 1000;

      // Cleanup temp files
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch (_) { /* ignore cleanup errors */ }

      if (error) {
        const timedOut = error.killed || error.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER'
          || executionTime >= (timeLimit || DEFAULT_TIMEOUT);

        // Try to force-remove container if it timed out
        if (timedOut) {
          try {
            execFile('docker', ['rm', '-f', `runner-${runId}`], () => {});
          } catch (_) { /* ignore */ }
        }

        return resolve({
          output: stdout || '',
          error: stderr || error.message,
          exitCode: error.code,
          timedOut,
          executionTime,
          memoryUsed: 0,
        });
      }

      resolve({
        output: stdout || '',
        error: null,
        exitCode: 0,
        timedOut: false,
        executionTime,
        memoryUsed: 0,
      });
    });
  });
}

module.exports = { runCode };

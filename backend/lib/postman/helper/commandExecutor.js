const { exec, spawn } = require("child_process");
const { COLORS } = require("../../utils/index.js");

function executeShellCommand(command, callback) {
  const process = spawn('sh', ['-c', command]);  // Use 'sh' with '-c' to run the command string

  let output = '';
  let errorOutput = '';

  process.stdout.on('data', (data) => {
    output += data.toString();
  });

  process.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  process.on('close', (code) => {
    if (code !== 0) {
      console.error(`Command exited with code: ${code}`);
      if (errorOutput) console.error(`Error output: ${errorOutput}`);
      return;
    }
    callback(output);
  });
}

function executeCommand(content) {
  const command = content.trim();
  executeShellCommand(command, (stdout) => {
    console.log(`Command output:\n${stdout}`);
  });
}

function handleMath(content) {
  const { GREEN, RESET } = COLORS;
  const expression = content.trim();
  console.log("[DEBUG] ", expression)
  executeShellCommand(`echo "${expression}" | bc`, (stdout) => {
    console.log(`Result:\n\t${GREEN}${stdout}${RESET}`);
  });
}

module.exports = { executeCommand, handleMath };

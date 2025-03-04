const readline = require("readline");

const isHttpRequest = (request) => {
  const httpMethods = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS",
    "HEAD",
  ];
  return httpMethods.includes(request.method.toUpperCase());
};

function parseHttpRequest(request) {
  const lines = request.split(/\r?\n/);
  const parsedRequests = [];
  let method, url, protocol = "HTTP/1.1";
  const headers = {};
  let bodyLines = [];
  let state = "REQUEST_LINE";
  let contentLength = 0;
  let isChunked = false;
  let isCommentedBlock = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Ignore lines starting with '#'
    if (trimmedLine.startsWith('#')) {
      continue;
    }

    // Check if we're exiting a commented block
    if (isCommentedBlock && !trimmedLine.startsWith('#')) {
      isCommentedBlock = false;
    }

    // Skip processing if we're in a commented block
    if (isCommentedBlock) {
      continue;
    }

    if (state === "REQUEST_LINE") {
      if (!trimmedLine) continue; // Skip empty lines before request line
      [method, url, protocol] = trimmedLine.split(" ");
      protocol = protocol || "HTTP/1.1";
      state = "HEADERS";
    } else if (state === "HEADERS") {
      if (trimmedLine === "") {
        // An empty line indicates the end of headers, move to BODY state
        contentLength = parseInt(headers["Content-Length"] || "0", 10);
        isChunked = headers["Transfer-Encoding"]?.toLowerCase() === "chunked";
        state = "BODY";
      } else {
        const [key, value] = trimmedLine.split(/:\s+/);
        headers[key] = value;
      }
    } else if (state === "BODY") {
      if (isChunked) {
        // Handle chunked transfer encoding
        let chunkSize = parseInt(trimmedLine, 16);
        while (chunkSize > 0) {
          const chunk = lines.splice(0, chunkSize).join("\n");
          bodyLines.push(chunk);
          chunkSize = parseInt(lines.shift(), 16); // Read next chunk size
        }
        state = "END"; // End of chunked body
      } else if (contentLength > 0) {
        // Read body based on Content-Length
        bodyLines.push(trimmedLine);
        contentLength -= Buffer.byteLength(trimmedLine, "utf-8");
        if (contentLength <= 0) {
          state = "END"; // End of body based on Content-Length
        }
      } else if (/^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)/.test(trimmedLine)) {
        // If we encounter another request line, finalize the current request
        parsedRequests.push({
          method,
          url,
          protocol,
          headers: { ...headers },
          body: parseBody(bodyLines.join("\n"), headers),
        });

        // Reset for the next request
        method = url = protocol = "";
        bodyLines = [];
        Object.keys(headers).forEach((key) => delete headers[key]);

        [method, url, protocol] = trimmedLine.split(" ");
        protocol = protocol || "HTTP/1.1";
        state = "HEADERS";
      } else {
        // Accumulate body lines
        bodyLines.push(trimmedLine);
      }
    }
  }

  // Add the last request if it exists
  if (method && url) {
    parsedRequests.push({
      method,
      url,
      protocol,
      headers,
      body: parseBody(bodyLines.join("\n"), headers),
    });
  }

  return parsedRequests;
}

function parseBody(body, headers) {
  const contentType = headers["Content-Type"] || headers["content-type"];
  if (contentType && contentType.includes("application/json")) {
    try {
      return JSON.parse(body);
    } catch (e) {
      console.error("Failed to parse JSON body:", e.message);
    }
  }
  return body.trim();
}

function printWelcome() {
  const { RESET, BOLD, GREEN, YELLOW, BLUE, MAGENTA, GRAY, RED } = COLORS;

  console.log(`${BOLD}${GREEN}Welcome to the Command Processor!${RESET}`);
  console.log(`Create a command file when prompted.`);
  console.log(`${YELLOW}Usage based on file extensions:${RESET}`);
  console.log(`${MAGENTA}  - ".http" or ".rest": ${GRAY}HTTP requests${RESET}`);
  console.log(`${BLUE}  - ".txt" or ".file": ${GRAY}File operations${RESET}`);
  console.log(`${GREEN}  - ".math": ${GRAY}Math calculations${RESET}`);
  console.log(`${RED}  - No extension: ${GRAY}Terminal commands${RESET}`);
  console.log(`${YELLOW}Usage based on autosave:${RESET}`);
  console.log(`  if (done) BOF(remove____WAIT____) && EOF(add_new_line)`);
  console.log(`${RED}Exit: ${GRAY}Enter exit or quit${RESET}`);
}


const debounce = (fn, delay) => {
  let timeId;
  let lastCallTime = 0;

  return function (...args) {
    const now = Date.now();
    if (now - lastCallTime < delay) {
      clearTimeout(timeId);
    }
    lastCallTime = now;

    timeId = setTimeout(() => {
      args.length > 0 ? console.log(args[0]) : null;
      fn.apply(this, args);
    }, delay);
  };
};

const COLORS = {
  RESET: "\x1b[0m",
  BOLD: "\x1b[1m",
  GREEN: "\x1b[32m",
  YELLOW: "\x1b[33m",
  BLUE: "\x1b[34m",
  MAGENTA: "\x1b[35m",
  CYAN: "\x1b[36m",
  GRAY: "\x1b[90m",
  RED: "\x1b[31m",
};


const getCommandFileName = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const promptText = "Enter the name of the command file: ";
    let visible = true;
    let intervalId;

    const startPulsating = () => {
      intervalId = setInterval(() => {
        readline.cursorTo(process.stdout, 0);
        readline.clearLine(process.stdout, 0);
        process.stdout.write(
          visible ? promptText : " ".repeat(promptText.length)
        );
        visible = !visible;
      }, 500);
    };

    startPulsating();

    // Stop pulsation when a key is pressed
    process.stdin.on("data", (char) => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;

        // Display the prompt text permanently and include the first typed character
        readline.cursorTo(process.stdout, 0);
        readline.clearLine(process.stdout, 0);
        process.stdout.write(promptText + char);
      }
    });

    rl.question(promptText, (fileName) => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      readline.cursorTo(process.stdout, 0);
      readline.clearLine(process.stdout, 0);
      rl.close();
      resolve(fileName.trim());
    });
  });
};

const COLORS_ARRAY = [
  "\x1b[0m",  // RESET
  "\x1b[1m",  // BOLD
  "\x1b[32m", // GREEN
  "\x1b[33m", // YELLOW
  "\x1b[34m", // BLUE
  "\x1b[35m", // MAGENTA
  "\x1b[36m", // CYAN
  "\x1b[90m", // GRAY
  "\x1b[31m"  // RED
];

function promisify(callback) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      function cb(err, value) {
        err ? reject(err) : resolve(value);
      }
      callback.call(this, ...args, cb);
    });
  };
}

module.exports = { parseHttpRequest, isHttpRequest, printWelcome, getCommandFileName, debounce, COLORS, COLORS_ARRAY, promisify  };

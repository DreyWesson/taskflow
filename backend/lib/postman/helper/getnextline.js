const fs = require("fs/promises");
const readline = require("readline");

class GetNextLine {
  constructor(source, options = {}) {
    this.source = source;
    this.options = options;
    this.fileHandle = null;
    this.rl = null;
    this.buffer = Buffer.alloc(options.bufferSize || 1024);
    this.bufferOffset = 0;
    this.bufferLength = 0;
    this.fileOffset = 0;
    this.eof = false;
    this.lineEnding = options.lineEnding || /\r?\n/;
    this.isTerminal = source === "terminal";
  }

  async open() {
    if (this.isTerminal) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: this.options.prompt || "",
      });
    } else {
      try {
        this.fileHandle = await fs.open(this.source, "r");
      } catch (error) {
        throw new Error(`Failed to open file: ${error.message}`);
      }
    }
  }

  async close() {
    if (this.isTerminal && this.rl) {
      this.rl.close();
    } else if (this.fileHandle) {
      await this.fileHandle.close();
      this.fileHandle = null;
    }
  }

  async fillBuffer() {
    if (this.eof) return 0;

    try {
      const { bytesRead } = await this.fileHandle.read(
        this.buffer,
        0,
        this.buffer.length,
        this.fileOffset
      );

      this.bufferOffset = 0;
      this.bufferLength = bytesRead;
      this.fileOffset += bytesRead;

      if (bytesRead < this.buffer.length) {
        this.eof = true;
      }

      return bytesRead;
    } catch (error) {
      throw new Error(`Error reading file: ${error.message}`);
    }
  }

  async getNextLine() {
    if (!this.rl && !this.fileHandle) {
      await this.open();
    }

    if (this.isTerminal) {
      return new Promise((resolve) => {
        this.rl.question("", (line) => {
          if (line.toLowerCase() === "eof") {
            this.eof = true;
            resolve(null);
          } else {
            resolve(line);
          }
        });
      });
    }

    let line = "";
    let lineEnding = null;

    while (true) {
      if (this.bufferOffset >= this.bufferLength) {
        const bytesRead = await this.fillBuffer();
        if (bytesRead === 0 && line.length === 0) {
          await this.close();
          return line || null; // EOF reached
        }
      }

      const remainingBuffer = this.buffer.slice(
        this.bufferOffset,
        this.bufferLength
      );
      const endingMatch = remainingBuffer.toString().match(this.lineEnding);

      if (endingMatch) {
        lineEnding = endingMatch[0];
        const endIndex = endingMatch.index;
        line += remainingBuffer.slice(0, endIndex).toString();
        this.bufferOffset += endIndex + lineEnding.length;
        break;
      } else {
        line += remainingBuffer.toString();
        this.bufferOffset = this.bufferLength;
      }
    }

    return line;
  }
}

async function promptForFilename(rl) {
  return new Promise((resolve) => {
    rl.question("Enter a filename to save the input: ", (filename) => {
      resolve(filename);
    });
  });
}

async function main() {
  let gnl;
  let outputFile;
  let outputStream;

  if (process.argv[2] === "--terminal") {
    gnl = new GetNextLine("terminal", { prompt: "> " });
    console.log("Enter lines of text. Type 'EOF' to end input.");

    // Prompt for filename
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const filename = await promptForFilename(rl);
    rl.close();

    // Open file for writing
    outputFile = await fs.open(filename, "w");
    outputStream = outputFile.createWriteStream();

    console.log(`Writing input to file: ${filename}`);
  } else {
    const filename = process.argv[2] || "example.txt";
    gnl = new GetNextLine(filename, { bufferSize: 64, lineEnding: /\r?\n|\r/ });
    console.log(`Reading from file:${filename}\n`);
  }

  try {
    let line;
    while ((line = await gnl.getNextLine()) !== null) {
      console.log(`Line: ${line}`);
      if (outputStream) {
        await new Promise((resolve, reject) => {
          outputStream.write(line + "\n", (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    }
    console.log("\nInput ended.");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await gnl.close();
    if (outputStream) {
      outputStream.end();
      await outputFile.close();
    }
  }
}

// main().catch(console.error);

module.exports = { GetNextLine };

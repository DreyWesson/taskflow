const chokidar = require("./node_modules/chokidar");
const { spawn } = require("child_process");
const path = require("path");
const { debounce, COLORS } = require("./utils");

const chokidarOptions = {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100,
  },
};

class Nodemon {
  static async fileWatcher(filePath, options = {}, cb) {
    const debouncedCallback = debounce(cb, 100);

    console.log(
      `${COLORS.CYAN}Watching ${COLORS.YELLOW}${filePath}${COLORS.CYAN} for changes...${COLORS.RESET}`
    );

    const watcher = chokidar.watch(filePath, {
      ...chokidarOptions,
      ...options.watchOptions,
    });

    watcher
      .on("all", (event, path) => {
        if (
          options.type
            ? event.toLowerCase() === options.type.toLowerCase()
            : true
        ) {
          const eventType = event.charAt(0).toUpperCase() + event.slice(1);
          debouncedCallback(
            `${COLORS.MAGENTA}${eventType} detected${COLORS.RESET}: ${path}`
          );
        }
      })
      .on("error", (error) => console.error(`Watcher error: ${error}`));

    return watcher;
  }

  static async startNodemon(filePaths, entryFile = "index.js") {
    if (!Array.isArray(filePaths)) {
      filePaths = [filePaths];
    }

    let childProcess = null;
    let isInitialStart = true;

    const startChildProcess = () => {
      if (childProcess) {
        childProcess.kill();
        console.log(
          `${COLORS.CYAN}Restarting your application...${COLORS.RESET}`
        );
      } else if (isInitialStart) {
        console.log("Starting application...");
        isInitialStart = false;
      }

      const fullEntryPath = path.isAbsolute(filePaths[0])
        ? path.join(filePaths[0], entryFile)
        : path.join(process.cwd(), filePaths[0], entryFile);

      childProcess = spawn("node", [fullEntryPath], { stdio: "inherit" });
      childProcess.on("close", (code) => {
        if (code !== null) {
          console.log(`Child process exited with code ${code}`);
        }
      });
    };

    startChildProcess();

    const watchers = await Promise.all(
      filePaths.map(async (filePath) =>
        this.fileWatcher(
          filePath,
          { watchOptions: { recursive: true } },
          startChildProcess
        )
      )
    );

    // Keep the process running
    process.on("SIGINT", () => {
      console.log("\nStopping watchers and exiting...");
      watchers.forEach((watcher) => {
        if (watcher && typeof watcher.close === "function") {
          watcher.close();
        }
      });
      if (childProcess) {
        childProcess.kill();
      }
      process.exit(0);
    });

    return watchers;
  }
}

module.exports = { Nodemon };

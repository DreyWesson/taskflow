const MyBuffer = require("./helper/buffer.js");
const FileSystem = require("./helper/filesystem.js");
const { handleAllRequests } = require("./helper/httpRequestHandler.js");
const fileOperations = require("./helper/fileOps.js");
const { handleMath, executeCommand } = require("./helper/commandExecutor.js");
const { printWelcome, getCommandFileName } = require("./utils/index.js");
const fs = require("fs/promises");

async function prependToFile(filePath, data) {
  try {
    const existingContent = await fs.readFile(filePath, 'utf8');

    const newContent = data + existingContent;

    await fs.writeFile(filePath, newContent, 'utf8');

    console.log('Data prepended successfully!');
  } catch (err) {
    console.error('Error prepending data:', err);
  }
}


(async function () {
  printWelcome();

  let filePath;
  // Loop until a valid filename is provided
  while (!filePath) {
    filePath = await getCommandFileName();
    if (!filePath || filePath.trim() === "") {
      console.log("Invalid filename. Please enter a file name.");
      filePath = null; // Reset to prompt again
    }
  }
  const extIdx = filePath.lastIndexOf(".");
  const ext = extIdx !== -1 ? filePath.substring(extIdx + 1) : "";
  if (filePath === "exit" || filePath === "quit") process.exit(0);

  await FileSystem.createFile(filePath);
  const options = { type: "change" };

  FileSystem.fileWatcher(filePath, options, cb);

  async function cb() {
    const buffer = await FileSystem.readFile(filePath);
    const { utf8: content } = await MyBuffer.getData(buffer);

    if (!content || content.length < 2) return;

    if (content.includes("____WAIT____")) return;

    if (ext === "") executeCommand(content);

    if (ext === "math") handleMath(content);

    if (ext === "txt" || ext === "file")
      await fileOperations.fileHandler(filePath);

    if (ext === "http" || ext === "rest") await handleAllRequests(content);
  }
})().catch(console.error);

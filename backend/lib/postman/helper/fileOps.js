const FileSystem = require("./filesystem.js");
const { GetNextLine } = require("./getnextline.js");
const { actions } = require("../utils/constant.js");

function formatExtractedTokens(command) {
  const splitCommand = command.split(" ");

  const pathIndex = splitCommand.findIndex(
    (part) =>
      part.startsWith("/") || part.startsWith("./") || part.includes(".")
  );

  if (pathIndex === -1) {
    return [command];
  }

  const actionPart = splitCommand.slice(0, pathIndex).join(" ");
  const filePath = splitCommand[pathIndex];
  const content = splitCommand.slice(pathIndex + 1).join(" ");

  return [actionPart, filePath, content];
}

function actionIncludes(actionPart, actionArray) {
  return actionArray.some((word) =>
    actionPart.toLowerCase().includes(word.toLowerCase())
  );
}

async function processLine(line) {
  if (!line.trim()) return;
  const [action, filePath, content] = formatExtractedTokens(line);

  if (actionIncludes(action, actions.CREATE_FILE)) {
    await FileSystem.createFile(filePath);
  } else if (actionIncludes(action, actions.DELETE_FILE)) {
    await FileSystem.deleteFile(filePath);
  } else if (actionIncludes(action, actions.RENAME_FILE)) {
    let oldname = filePath;
    let newname = content;
    await FileSystem.renameFile(oldname, newname);
  } else if (actionIncludes(action, actions.ADD_TO_FILE)) {
    await FileSystem.addToFile(filePath, content);
  }
}

async function fileHandler(filePath) {
  const gnl = new GetNextLine(filePath, {
    bufferSize: 64,
    lineEnding: /\r?\n|\r/,
  });

  try {
    await gnl.open();
    let line;
    while ((line = await gnl.getNextLine()) !== null) {
      console.log(line);
      await processLine(line);
    }
  } catch (error) {
    console.error("Error during file processing:", error.message);
  } finally {
    await gnl.close();
  }
}

module.exports = { fileHandler };

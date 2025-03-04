const fs = require("fs/promises");
const MyBuffer = require("../helper/buffer.js");
const { debounce } = require("../utils/index.js");
const { COLORS } = require("../utils/index.js");

class FileSystem {
  static async createFile(filename) {
    try {
      const file = await fs.open(filename, "wx");
      await file.close();
      console.log(`${filename} created successfully!`);
      return true;
    } catch (error) {
      if (error.code === "EEXIST") {
        console.log(`${filename} already exists`);
        return false;
      } else {
        console.log(`Error creating file ${filename}: `, error);
        throw error;
      }
    }
  }

  static async renameFile(oldname, newname) {
    try {
      await fs.rename(oldname, newname);
      console.log(`${oldname} rename successful: ${newname}`);
      return true;
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log(`${oldname} does not exist`);
      } else {
        console.log(`Error occurred when renaming: ${oldname}`);
        throw error;
      }
    }
  }

  static async openFile(filePath, options = {}) {
    try {
      return await fs.open(filePath, options.flags || "r");
    } catch (error) {
      console.error("Error opening file:", error);
    }
  }

  static async deleteFile(filename) {
    try {
      await fs.unlink(filename);
      console.log(`File deleted successfully: ${filename}`);
      return true;
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log(`File not found: ${filename}`);
      } else {
        console.log(`Error deleting ${filename}: ${error.message}`);
      }
      throw error;
    }
  }

  static async addToFile(filename, content) {
    try {
      await fs.appendFile(filename, content);
      console.log(`Successfully added content to ${filename}`);
    } catch (error) {
      console.log(`Error occurred adding content to ${filename} error`);
      throw error;
    }
  }

  static async readFile(filePath, options = {}) {
    let file;
    try {
      file = await this.openFile(filePath, { flags: options.flags });
      const { size } = (await this.getFileStat(filePath)).size;
      const buffer = Buffer.alloc(options?.size ?? size ?? 1024);
      const { bytesRead } = await file.read({
        buffer: buffer,
        offset: options.offset || 0,
        length: buffer.byteLength,
        position: options.position || null,
      });

      return buffer.slice(0, bytesRead);
    } catch (error) {
      throw new Error(`Error reading file: ${error.message}`);
    } finally {
      if (file) await file.close();
    }
  }

  static async getFileStat(filePath, options = {}) {
    let file;
    try {
      file = await this.openFile(filePath, { flags: options.flags });
      return await file.stat();
    } catch (error) {
      throw new Error(`Error getting file stats: ${error.message}`);
    } finally {
      if (file && options.shouldClose !== false) await file.close();
    }
  }

  static async reader(filePath, options = {}) {
    try {
      const buffer = await this.readFile(filePath, options);
      return MyBuffer.getData(buffer, options.dataTypes || []);
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error(`File not found: ${filePath}`);
      }
      throw new Error(`Error reading file content: ${error.message}`);
    }
  }

  static async fileWatcher(filePath, options = {}, cb) {
    const debouncedCallback = debounce(cb, 100);
    let watcher;
    try {
      console.log(
        `${COLORS.CYAN}Watching ${COLORS.YELLOW}${filePath}${COLORS.CYAN} for changes...${COLORS.RESET}`
      );
      watcher = fs.watch(filePath, {
        recursive: true,
        ...options.watchOptions,
      });

      for await (const event of watcher) {
        if (
          options.type ? event.eventType === options.type.toLowerCase() : true
        ) {
          const eventType =
            event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1);
          debouncedCallback(
            `${COLORS.MAGENTA}${eventType} detected${COLORS.RESET}: ${filePath}`
          );
        }
      }
    } catch (error) {
      console.error(`Error watching file: ${error.message}`);
    }
  }
}


module.exports = FileSystem;

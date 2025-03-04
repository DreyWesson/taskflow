const { Buffer } = require("buffer");

class MyBuffer {
  static keys = ["ascii", "binary", "hex", "octal", "utf8"];

  static getByBase(buffer, base) {
    return buffer
      .reduce((acc, byte) => {
        let representation = byte.toString(base);

        let padding = 8;
        if (base === 2) padding = 8;
        else if (base === 8) padding = 3;
        else if (base === 16) padding = 2;
        else padding = 0; // For other bases, don't pad

        return acc + representation.padStart(padding, "0") + " ";
      }, "")
      .trim();
  }

  static convertBuffer(buffer) {
    let init = Object.fromEntries(this.keys.map((key) => [key, ""]));

    buffer.reduce((acc, char) => {
      acc.binary += `${char.toString(2)} `;
      acc.ascii += `${char} `;
      acc.octal += `${char.toString(8)} `;
      return acc;
    }, init);

    init.hex = buffer.toString("hex");
    init["utf8"] = buffer.toString("utf-8");

    return init;
  }

  static getData(buffer, type) {
    if (!buffer) return {};
    if (!Buffer.isBuffer(buffer)) buffer = Buffer.from(buffer);

    const val = this.convertBuffer(buffer);

    if (!type || type.length === 0) type = this.keys;

    const res = {};
    type.forEach((key) => {
      if (val[key]) res[key] = val[key].trim();
    });
    return res;
  }
}

module.exports = MyBuffer;

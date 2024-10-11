"use strict";

/* -------------------------------------------------------------------------- */
/*                                      Logger                                     */
/* -------------------------------------------------------------------------- */


// morgan middleware for logging requests.

const morgan = require("morgan");
const fs = require("node:fs");
const path = require("node:path");

const now = new Date();
const today = now.toISOString().split("T")[0];

// Lambda gibi sunucusuz ortamlarda genellikle '/tmp' kullanılmalıdır.
const logDirectory = path.join("/tmp", "logs");

if (!fs.existsSync(logDirectory)) {
  console.log("Logs folder has been created ");
  fs.mkdirSync(logDirectory, { recursive: true });
} else {
  console.log("Logs folder already exists");
}

const logStream = fs.createWriteStream(
  path.join(logDirectory, `${today}.log`),
  { flags: "a+" }
);

module.exports = morgan("combined", {
  stream: logStream,
});
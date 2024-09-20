let database;

if (process.env.NODE_ENV === "production") {
  database = require("./postgres");
} else if (process.env.NODE_ENV === "development") {
  database = require("./sqlite");
} else {
  throw new Error("NODE_ENV must be set");
}

module.exports = database;

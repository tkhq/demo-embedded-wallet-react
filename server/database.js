let database;

if (process.env.NODE_ENV === "production") {
  database = require("./postgres");
} else if (process.env.NODE_ENV === "development") {
  database = require("./sqlite");
}

module.exports = database;

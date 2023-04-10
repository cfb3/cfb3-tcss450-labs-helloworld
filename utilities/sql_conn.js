const mysql = require("mysql");
const fs = require("fs");

var config = {
  host: process.env.HOST,
  user: process.env.ADMIN,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: 3306,
  ssl: {
    ca: fs.readFileSync("./DigiCertGlobalRootCA.crt.pem"),
  },
};

const conn = new mysql.createConnection(config);

// conn.connect((err) => {
//   if (err) {
//     console.log("!!! Cannot connect !!! Error:");
//     throw err;
//   } else {
//     console.log("Connection established.");
//   }
// });

const pool = conn;

module.exports = pool;

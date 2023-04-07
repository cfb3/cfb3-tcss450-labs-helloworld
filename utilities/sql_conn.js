// Obtain a Pool of DB connections.
const pg = require("pg");
const config = {
  host: "450test.postgres.database.azure.comm",
  // Do not hard code your username and password.
  // Consider using Node environment variables.
  user: "cfb3",
  password: "Tnvrno11",
  database: "sample",
  port: 5432,
  ssl: true,
};

const client = new pg.Client(config);

client.connect((err) => {
  if (err) throw err;
  else {
    console.log("Connected");
  }
});

const pool = client;

module.exports = pool;

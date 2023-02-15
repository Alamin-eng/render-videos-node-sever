const express = require("express");
const app = express();
const cor= require("cors");
const Pool = require("pg-pool");
const env = require("dotenv");


app.use(cor());
// use express.json is important
app.use(express.json());

env.config()

let port = process.env.PORT || 5001;
//RENDER ---------------

const config = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },

};
const pool = new Pool(config);
// get request 
app.get("/", (req, res) => {
  pool
    .query("SELECT * FROM urls")
    .then((result) => res.send(result.rows)) // need to use rows to view only table data
    .catch((error) => {
      console.error(error);
      res.status(500);
})
});

module.exports = pool;
//RENDER ------------

app.listen(port, function () {
  console.log(`Server is listening on port ${port}. Ready to accept requests!`);
});

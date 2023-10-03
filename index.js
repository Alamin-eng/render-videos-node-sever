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
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },

};
const pool = new Pool(config);
// get request 
app.get("/", (req, res) => {
  pool
    .query("SELECT * FROM url")
    .then((result) => res.send(result.rows)) // need to use rows to view only table data

    .catch((error) => {
      console.error(error);
      res.status(500);
      
})
});

// Post method 
app.post("/", (req, res) => {
  
  const newVideo = req.body;

  if (!newVideo.title || !newVideo.url) {
    res.send({ result: "failure", message: "Video could not be saved" });
  } else {
    const query =
      "INSERT INTO urls (title,url,rating) VALUES ($1, $2, $3) RETURNING id"; // notice how we returned id

    pool.query(query, [newVideo.title, newVideo.url, 0], (error, results) => {
      if (error) {
        throw error;
      }
      console.log(results.rows);
      res.status(200).send(results.rows[0]);
    });
  }
});

// GET "/{id}"
app.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  pool
    .query('SELECT * FROM url WHERE id=$1', [id])
    .then((result) => res.json(result.rows))
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

// DELETE "/{id}"
app.delete('/:id',async (req, res) => {
  const id = parseInt(req.params.id); 
  console.log(typeof id)
   const client = await pool.connect();
  try {
    await client.query('DELETE FROM url WHERE id = $1', [id]);
    res.status(200).send(`Item with ID ${id} has been deleted`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting item');
  } finally {
    client.release();
  }
//   pool
//     .query("DELETE FROM urls WHERE id=$1", [id], (err, res) => {
//   if (err) throw err;
//   console.log(`Item with id ${id} has been deleted`);
// });
})

//-- Delete 
module.exports = pool;
//RENDER ------------

app.listen(port, function () {
  console.log(`Server is listening on port ${port}. Ready to accept requests!`);
});

const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/posts", async (req, res) => {
  const id = randomBytes(4).toString("hex");
  const { title } = req.body;

  if (!title) {
    return res.status(400).send({ error: "Title is required" });
  }

  posts[id] = {
    id,
    title,
  };

  try {
    await axios.post(
      process.env.EVENT_BUS_URL || "http://localhost:4005/events",
      {
        type: "PostCreated",
        data: { id, title },
      }
    );
  } catch (err) {
    console.error("Error sending event:", err.message);
    return res.status(500).send({ error: "Event bus communication failed" });
  }

  res.status(201).send(posts[id]);
});

app.post("/events", (req, res) => {
  console.log("Received Event", req.body.type);

  res.send({});
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");
const { BadRequestError, DatabaseError } = require("./errors/custom-errors");
const errorHandler = require("./middleware/error-handler");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/posts", async (req, res, next) => {
  try {
    const id = randomBytes(4).toString("hex");
    const { title } = req.body;

    if (!title) {
      throw new BadRequestError("Title is required");
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
      throw new DatabaseError("Event bus communication failed");
    }

    res.status(201).send(posts[id]);
  } catch (err) {
    next(err);
  }
});

app.post("/events", (req, res) => {
  console.log("Received Event", req.body.type);
  res.send({});
});

// Error handling middleware should be used last
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

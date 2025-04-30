const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;

  if (!content) {
    return res.status(400).send({ error: "Content is required" });
  }

  const comments = commentsByPostId[req.params.id] || [];
  comments.push({ id: commentId, content, status: "pending" });
  commentsByPostId[req.params.id] = comments;

  try {
    await axios.post(
      process.env.EVENT_BUS_URL || "http://localhost:4005/events",
      {
        type: "CommentCreated",
        data: {
          id: commentId,
          content,
          postId: req.params.id,
          status: "pending",
        },
      }
    );
  } catch (err) {
    console.error("Error sending event:", err.message);
    return res.status(500).send({ error: "Event bus communication failed" });
  }

  res.status(201).send(comments);
});

app.post("/events", async (req, res) => {
  console.log("Event Received:", req.body.type);

  const { type, data } = req.body;

  if (type === "CommentModerated") {
    const { postId, id, status, content } = data;
    const comments = commentsByPostId[postId];

    if (!comments) {
      return res.status(404).send({ error: "Post not found" });
    }

    const comment = comments.find((comment) => comment.id === id);
    if (!comment) {
      return res.status(404).send({ error: "Comment not found" });
    }

    comment.status = status;

    try {
      await axios.post(
        process.env.EVENT_BUS_URL || "http://localhost:4005/events",
        {
          type: "CommentUpdated",
          data: {
            id,
            status,
            postId,
            content,
          },
        }
      );
    } catch (err) {
      console.error("Error sending event:", err.message);
      return res.status(500).send({ error: "Event bus communication failed" });
    }
  }

  res.send({});
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

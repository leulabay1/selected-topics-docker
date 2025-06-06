const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");
const { BadRequestError, NotFoundError, DatabaseError } = require("./errors/custom-errors");
const errorHandler = require("./middleware/error-handler");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res, next) => {
  try {
    const commentId = randomBytes(4).toString("hex");
    const { content } = req.body;

    if (!content) {
      throw new BadRequestError("Content is required");
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
      throw new DatabaseError("Event bus communication failed");
    }

    res.status(201).send(comments);
  } catch (err) {
    next(err);
  }
});

app.post("/events", async (req, res, next) => {
  try {
    console.log("Event Received:", req.body.type);

    const { type, data } = req.body;

    if (type === "CommentModerated") {
      const { postId, id, status, content } = data;
      const comments = commentsByPostId[postId];

      if (!comments) {
        throw new NotFoundError("Post not found");
      }

      const comment = comments.find((comment) => comment.id === id);
      if (!comment) {
        throw new NotFoundError("Comment not found");
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
        throw new DatabaseError("Event bus communication failed");
      }
    }

    res.send({});
  } catch (err) {
    next(err);
  }
});

// Error handling middleware should be used last
app.use(errorHandler);

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

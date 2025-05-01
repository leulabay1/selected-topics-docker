const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { BadRequestError, DatabaseError } = require("./errors/custom-errors");
const errorHandler = require("./middleware/error-handler");

const app = express();
app.use(bodyParser.json());

const events = [];

app.post("/events", async (req, res, next) => {
  try {
    const event = req.body;

    if (!event.type) {
      throw new BadRequestError("Event type is required");
    }

    events.push(event);

    const services = [
      { url: "http://localhost:4000/events", name: "posts" },
      { url: "http://localhost:4001/events", name: "comments" },
      { url: "http://localhost:4002/events", name: "query" },
      { url: "http://localhost:4003/events", name: "moderation" },
    ];

    const eventDeliveryPromises = services.map(async (service) => {
      try {
        await axios.post(service.url, event);
      } catch (err) {
        console.error(`Failed to send event to ${service.name} service:`, err.message);
        // We don't throw here to allow other services to receive the event
      }
    });

    await Promise.all(eventDeliveryPromises);

    res.send({ status: "OK" });
  } catch (err) {
    next(err);
  }
});

app.get("/events", (req, res) => {
  res.send(events);
});

// Error handling middleware should be used last
app.use(errorHandler);

const PORT = 4005;
app.listen(PORT, () => {
  console.log("Listening on 4005");
});

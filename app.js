const express = require("express");
const seatQueue = require("./queue");
const redis = require("./services/redisClient");
const worker = require("./workers/seatWorker");
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
  res.send("Welcome to movie-booking-worker!");
});
app.listen(PORT, () => {
  console.log(`Server chạy trên port ${PORT}`);
  console.log("Worker đã được khởi động và lắng nghe job queue.");
});

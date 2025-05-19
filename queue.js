const { Queue } = require("bullmq");
const redis = require("./services/redisClient");

const seatQueue = new Queue("seatQueue", {
  connection: redis,
});

module.exports = seatQueue;

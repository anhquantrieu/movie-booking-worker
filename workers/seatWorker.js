const { Worker } = require("bullmq");
const redis = require("../services/redisClient");
const pusher = require("../services/pusher");

const worker = new Worker(
  'seatQueue',
  async job => {
    if (job.name === 'release-seat') {
      const { userId, showtimeId, seatIds, holdId } = job.data;
      console.log(`Xử lý release-seat cho holdId=${holdId}`);

      const seatKeys = seatIds.map(seatId => `seat:${showtimeId}:${seatId}`);
      const redisKey = `hold:${showtimeId}:${holdId}`;

      try {
        const holdExists = await redis.exists(redisKey);
        if (holdExists) {
          await Promise.all(seatKeys.map(key => redis.del(key)));
          await redis.del(redisKey);

          await pusher.trigger(`showtime-${showtimeId}`, 'seat-status-changed', {
            seatIds,
            status: 'AVAILABLE',
            holdId,
          });

          console.log(`Đã giải phóng ghế cho holdId=${holdId}`);
        } else {
          console.log(`HoldId ${holdId} không tồn tại hoặc đã được thanh toán.`);
        }
      } catch (error) {
        console.error('Lỗi khi release-seat:', error);
        throw error;
      }
    }
  },
  { connection: redis, }
);

worker.on('completed', job => {
  console.log(`Job ${job.id} (${job.name}) đã xử lý xong.`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} (${job.name}) thất bại:`, err);
});

module.exports = worker;


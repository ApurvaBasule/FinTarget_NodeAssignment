const Redis = require('ioredis');
const fs = require('fs');
const path = require('path');

const redis = new Redis('');

const logFilePath = path.join(__dirname, 'task_log.txt');

async function task(user_id) {
    const log = `${user_id}-task completed at-${Date.now()}\n`;
    fs.appendFileSync(logFilePath, log);
    console.log(log);
}

async function httpAddNewTask(req,res){
  const user_id = req.body.user_id;
  const currentTime = Date.now();


  let tasksThisSecond = await redis.get(`tasks:${user_id}:second`) || 0;
  let tasksThisMinute = await redis.get(`tasks:${user_id}:minute`) || 0;

  if (tasksThisSecond >= 1 || tasksThisMinute >= 20) {
      const queuedTime = await redis.lpush(`queue:${user_id}`, currentTime);
      return res.status(429).send(`Rate limit exceeded, task queued at position ${queuedTime}.`);
  }

  task(user_id);

  redis.incr(`tasks:${user_id}:second`);
  redis.incr(`tasks:${user_id}:minute`);

  redis.expire(`tasks:${user_id}:second`, 1);
  redis.expire(`tasks:${user_id}:minute`, 60);

  res.status(200).send('Task processed successfully');

}

async function processQueue() {
  const userKeys = await redis.keys('queue:*');
  for (const key of userKeys) {
      const user_id = key.split(':')[1];

      let tasksThisSecond = await redis.get(`tasks:${user_id}:second`) || 0;
      let tasksThisMinute = await redis.get(`tasks:${user_id}:minute`) || 0;

      if (tasksThisSecond < 1 && tasksThisMinute < 20) {
          const queuedTask = await redis.rpop(`queue:${user_id}`);
          if (queuedTask) {

              task(user_id);

              redis.incr(`tasks:${user_id}:second`);
              redis.incr(`tasks:${user_id}:minute`);

              redis.expire(`tasks:${user_id}:second`, 1);
              redis.expire(`tasks:${user_id}:minute`, 60);
          }
      }
  }
}

// Set up an interval to check the queues every second and process tasks if rate limits allow
setInterval(processQueue, 1000);

module.exports={
httpAddNewTask,
} 
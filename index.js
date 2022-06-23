const Sniper = require("./atomicSniper.js");
const csv = require("csv-parser");
const fs = require("fs");
const delay = require("delay");

const importTasks = async () => {
  if (fs.existsSync("./sniper_import.csv")) {
    let tasksArray = await new Promise((resolve) => {
      let tasksArr = [];
      fs.createReadStream("./sniper_import.csv")
        .pipe(csv())
        .on("data", (row) => {
          tasksArr.push({
            collection: row.collection,
            tid: row.template_id,
            price: row.price,
            hook: row.hook,
            delay: row.delay,
          });
        })
        .on("end", () => {
          resolve(tasksArr);
        });
    });
    return tasksArray;
  } else {
    console.log(chalk.red(" Add an sniper_import.csv to this folder first!"));
  }
};
const startTasks = async () => {
  let tasks = [];
  let cache = await importTasks();
  for (let t in cache) {
    tasks.push(
      new Sniper(
        cache[t].collection,
        cache[t].tid,
        cache[t].price,
        cache[t].hook,
        cache[t].delay
      )
    );
  }
  console.log(tasks);
  for (let task in tasks) {
    tasks[task].start();
    await delay(50);
  }
};

startTasks();

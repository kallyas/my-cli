// chalk, figlet, path, fs, yargs, clear, promisfy
import chalk from "chalk";
import figlet from "figlet";
import path, { dirname } from "path";
import fs from "fs";
import { createRequire } from "module";
import yargs from "yargs";
import { clear } from "console";
import { promisify } from "util";

const require = createRequire(import.meta.url);

const usage = `
Usage:
    $ node app.js <command> [options]
commands:
    add <task> - add new task
    list - list all tasks
    delete - delete a task
    complete - mark task complete
    clear - clear screen
    help - show help
options:
    --help - show help
`;

const dbPath = path.join(
  dirname(require.resolve("./package.json")),
  "tasks.json"
);

const checkDB = async () => {
  const exists = await promisify(fs.exists)(dbPath);
  if (!exists) {
    await promisify(fs.writeFile)(dbPath, "[]");
  }
};

const randomId = () => Math.floor(Math.random() * 100000);

const cli = async () => {
  clear();
  // print app name
  console.log(
    chalk.green(figlet.textSync("Tasks CLI", { horizontalLayout: "full" }))
  );

  // get command
  const command = process.argv[2];

  // options
  const options = yargs(process.argv.slice(3)).argv;

  // check the command
  switch (command) {
    case "add":
      addTask(options);
      break;
    default:
      console.log(chalk.red("unknown command " + command));
      console.log(usage);
      break;
  }
};

// add a new task
const addTask = async (options) => {
  const taskName = options._[0];
  // check if taskname is empty or undefined
  if (taskName === undefined) {
    console.log(chalk.red("Task name is requires"));
    console.log(usage);
    return;
  }

  //   get tasks from the file
  const tasks = await getTasks();

  const newTask = {
    id: randomId(),
    task: taskName,
    completed: false,
  };

  //   check if task exist already
  const exists = tasks.filter((task) => task.task === taskName).length > 0;

  if (exists) {
    console.log(chalk.red("Task exists already"));
    console.log(usage);
    return;
  }

  tasks.push(newTask);

  await saveTask(tasks);

  console.log(chalk.green(`Task ${taskName} was added`));
};

// get tasks
const getTasks = async () => {
    await checkDB()

    const tasks = await promisify(fs.readFile)(dbPath)

    // parse the tasks
    return JSON.parse(tasks)
}

const saveTask = async (tasks) => {
    await checkDB()
    await promisify(fs.writeFile)(dbPath, JSON.stringify(tasks))
}

cli();

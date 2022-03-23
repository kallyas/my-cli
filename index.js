#!/usr/bin/env node

// cli app that adds users to a json file
// file system

// modules: fs, path, util

const fs = require("fs");
const path = require("path");
const util = require("util");

// read and write file functions
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// db path
const dbPath = path.join(__dirname, "db.json");

// check if db.json exists
const checkDB = async () => {
  try {
    await readFile(dbPath);
  } catch (error) {
    if (error.code === "ENOENT") {
      await writeFile(dbPath, "[]");
    } else {
      throw error;
    }
  }
};

const randomId = () => Math.floor(Math.random() * 100000);

// validation
// email, name >= 5

const addUser = async (user) => {
  await checkDB();
  const db = await readFile(dbPath);
  const users = JSON.parse(db);
  users.push(user);
  await writeFile(dbPath, JSON.stringify(users));
  console.log(user.name + " has been added");
};

const usage = () => console.log("Usage: node index <name> <email>");

const main = async () => {
  if (process.argv.length !== 4) {
    usage();
    process.exit(1);
  }

  const [, , name, email] = process.argv;

  // call validate data here

  const user = {
    id: randomId(),
    name,
    email,
  };

  await addUser(user);
};

main();

const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const moment = require("moment");

const isEnv = (env) => process.env.NODE_ENV === env;

const getConfigDataFromArgs = (configFle) => {
  if (!configFle) {
    throw new Error("Config file not set");
  }

  if (!fs.existsSync(configFle)) {
    throw new Error(configFle + " does not exists");
  }

  return require(path.resolve(configFle));
};

const getRangeFromConfig = (rangeData) => {
  if (typeof rangeData === "object") return rangeData;
  const [start, end] = rangeData.split("-").map((n) => parseInt(n));
  return Array.from({length: end + 1 - start}, (v, k) => k + start);
};

const saveDataToFile = (data, path, filename) => {
  ensureDirectoryExists(path);

  if (fs.existsSync(path + filename)) {
    fs.unlinkSync(path + filename);
  }

  console.draft("");

  fs.writeFile(path + filename, JSON.stringify(data), {overwrite: true, flag: "wx"}, (err) => {
    if (err) {
      console.draft(err);
      process.exit();
    }

    console.draft(chalk.green("Data Saved: "));
    console.draft(path + filename);
  });
};

const slugify = (text) => {
  const from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
  const to = "aaaaaeeeeeiiiiooooouuuunc------";

  const newText = text.split("").map((letter, i) => letter.replace(new RegExp(from.charAt(i), "g"), to.charAt(i)));

  return newText
    .toString() // Cast to string
    .toLowerCase() // Convert the string to lowercase letters
    .trim() // Remove whitespace from both sides of a string
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-y-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
};

const getFileNameFromConfig = (config) => {
  const [, domain] = config.baseUrl.split("//");
  const date = new Date();

  return slugify(domain + "_" + moment().format("YYYYMMDD") + "_" + moment().format("HHmmss")) + ".json";
};

const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true});
  }
};

const progressBar = (progress, payload) => {
  // Make it 50 characters length
  var units = Math.round(progress / 2);
  return (
    "[" +
    chalk.green("=").repeat(units) +
    " ".repeat(50 - units) +
    "] " +
    chalk.green(progress + "%") +
    " " +
    (payload && chalk.grey("(" + payload + ")"))
  );
};

const showProgress = (barLine, progress, max, payload) => {
  barLine(progressBar(Math.round((progress * 10000) / max) / 100, payload));
};

const iterateWithProgress = (items, initialMessage) => async (callback) => {
  const iteratedData = [];
  let current = 0;
  const max = items.length;
  console.draft(initialMessage);
  var barLine = console.draft("");
  showProgress(barLine, 0, max, "");

  for (const item of items) {
    const data = await callback(item, current, iteratedData, items);
    iteratedData.push(data);
    showProgress(barLine, ++current, max, item);
  }

  showProgress(barLine, max, max, "Finished");

  console.draft(chalk.green("Done"));
  console.draft("");
  return iteratedData;
};

module.exports = {
  isEnv,
  getConfigDataFromArgs,
  getRangeFromConfig,
  saveDataToFile,
  slugify,
  getFileNameFromConfig,
  showProgress,
  iterateWithProgress,
  ensureDirectoryExists,
  progressBar,
};

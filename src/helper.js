const fs = require("fs");
const chalk = require("chalk");

const getConfigDataFromArgs = (argv) => {
  const [, , configFle] = argv;

  if (!configFle) {
    throw "Config file not set";
  }

  if (!fs.existsSync(configFle)) {
    throw configFle + " does not exists";
  }

  return require("../" + configFle);
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

  console.log("");

  fs.writeFile(path + filename, JSON.stringify(data), {overwrite: true, flag: "wx"}, (err) => {
    if (err) {
      console.log(err);
      process.exit();
    }

    console.log(chalk.green("Data Saved: "));
    console.log(path + filename);
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

  return (
    slugify(
      domain +
        "_" +
        date.getFullYear() +
        (date.getMonth() > 9 ? date.getMonth() : "0" + date.getMonth()) +
        (date.getDay() > 9 ? date.getDay() : "0" + date.getDay()) +
        "_" +
        (date.getHours() > 9 ? date.getHours() : "0" + date.getHours()) +
        (date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes()) +
        (date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds())
    ) + ".json"
  );
};

const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true});
  }
};

const ProgressBar = (progress, payload) => {
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
  barLine(ProgressBar(Math.round((progress * 10000) / max) / 100, payload));
};

const iterateWithProgress = (items, initialMessage) => async (callback) => {
  const iteratedData = [];
  let current = 0;
  const max = items.length;
  console.log(initialMessage);
  var barLine = console.draft("");

  showProgress(barLine, 0, max, "");

  for (const item of items) {
    const data = await callback(item, current, iteratedData, items);
    iteratedData.push(data);
    showProgress(barLine, ++current, max, item);
  }

  showProgress(barLine, max, max, "Finished");

  console.log(chalk.green("Done"));
  console.log("");
  return iteratedData;
};

module.exports = {
  getConfigDataFromArgs,
  getRangeFromConfig,
  saveDataToFile,
  slugify,
  getFileNameFromConfig,
  showProgress,
  iterateWithProgress,
};

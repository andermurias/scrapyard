const fs = require("fs");

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

const saveDataToFile = (data, filename) => {
  if (fs.existsSync(filename)) {
    fs.unlinkSync(filename);
  }
  fs.writeFile(filename, JSON.stringify(data), {overwrite: true, flag: "wx"}, (err) =>
    err ? console.log(err) : console.log("Data Saved")
  );
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

module.exports = {getConfigDataFromArgs, getRangeFromConfig, saveDataToFile, slugify};

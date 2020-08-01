#!/usr/bin/env node

const cheerio = require("cheerio");
const yargs = require("yargs");

const {getConfigDataFromArgs, getRangeFromConfig, saveDataToFile, getFileNameFromConfig} = require("../src/helper");
const {getPipe, processPipe} = require("../src/scrap");

const options = yargs
  .usage("Usage: -c <path>")
  .option("c", {alias: "config", describe: "Config file path", type: "string", demandOption: true}).argv;

(async () => {
  const config = getConfigDataFromArgs(options.config);

  const range = getRangeFromConfig(config.dataSource.elements.page);

  const urls = await getPipe(config.baseUrl, config.dataSource.url, range, config.dataSource.selector);

  const json = await processPipe(urls, config.scrapData, config.baseUrl, config.language);

  saveDataToFile(json, "output/", getFileNameFromConfig(config));
})();

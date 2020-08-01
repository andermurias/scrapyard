const cheerio = require("cheerio");

const {getConfigDataFromArgs, getRangeFromConfig, saveDataToFile, getFileNameFromConfig} = require("./src/helper");
const {getPipe, processPipe} = require("./src/scrap");

(async () => {
  const config = getConfigDataFromArgs(process.argv);

  const range = getRangeFromConfig(config.dataSource.elements.page);

  const urls = await getPipe(config.baseUrl, config.dataSource.url, range, config.dataSource.selector);

  const json = await processPipe(urls, config.scrapData, config.baseUrl, config.language);

  saveDataToFile(json, "output/", getFileNameFromConfig(config));
})();

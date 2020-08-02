const cheerio = require("cheerio");
const chalk = require("chalk");
const axios = require("axios");
const {range, iterateWithProgress, isEnv} = require("./helper");

const DraftLog = require("draftlog");
const draft = DraftLog(console, isEnv("test"));

const getPipe = async (baseUrl, pipeUrl, pages, selector) => {
  const pageIterator = await iterateWithProgress(pages, "Obtaining Pipe...");
  const pipeDataGroupedByPage = await pageIterator(processPipeIterationPage(baseUrl, pipeUrl, selector));
  return [].concat(...pipeDataGroupedByPage);
};

const processPipeIterationPage = (baseUrl, pipeUrl, selector) => async (page) => {
  const requestUrl = pipeUrl.replace("{page}", page);
  const pageRequest = await axios.get(requestUrl);
  const $ = cheerio.load(pageRequest.data);
  return $(selector)
    .map((_, e) => baseUrl + $(e).attr("href"))
    .toArray();
};

const getPage = async (url) => {
  const pageContent = await axios.get(url);
  const $ = cheerio.load(pageContent.data);
  return $;
};

const getScrapData = ($, scrapData, url) => {
  const data = {
    url: url,
  };
  for (const key in scrapData) {
    if (key[0] === "_") {
      const slugMatch = url.match(new RegExp(scrapData[key]));
      const [, slug] = slugMatch || ["", ""];
      data[key] = slug;
    } else {
      data[key] = getDataWithCustomSelector($, scrapData[key]);
    }
  }
  return data;
};

const getDataFromURL = async (url, scrapData, baseUrl, lang) => {
  const $ = await getPage(url);
  const dataResponse = {};
  dataResponse[lang.default] = getScrapData($, scrapData, url);

  for (const key in lang.aditional) {
    const i18nUrl = getDataWithCustomSelector($, lang.aditional[key]);
    if (i18nUrl) {
      const $i18n = await getPage(i18nUrl);
      dataResponse[key] = getScrapData($i18n, scrapData, i18nUrl);
    }
  }

  return dataResponse;
};

const getDataWithCustomSelector = ($, customSelector) => {
  const [selector, value] = customSelector.split("/");
  if (value === undefined || value === "text") {
    return $(selector).text();
  }
  if (value === "html") {
    return $(selector).html();
  }
  if (/attr:([a-zA-Z\-]*)/.test(value)) {
    const [, attr] = value.match(/attr:([a-zA-Z\-]*)/);
    return $(selector).attr(attr);
  }

  return $(selector).text();
};

const processPipe = async (urls, scrapData, baseUrl, lang) => {
  const pageIterator = await iterateWithProgress(urls, "Processing Pipe...");
  return await pageIterator(async (url) => await getDataFromURL(url, scrapData, baseUrl, lang));
};

const getForTest = async () => {
  return await axios.get("index_1.html");
};

module.exports = {getPipe, getPage, getScrapData, getDataFromURL, processPipe, getForTest};

const cheerio = require("cheerio");
const chalk = require("chalk");
const axios = require("axios");
const {range, iterateWithProgress} = require("./helper");

require("draftlog").into(console);

const getPipe = async (baseUrl, pipeUrl, pages, selector) => {
  const pageIterator = await iterateWithProgress(pages, "Obtaining Pipe...");

  const pipeDataGroupedByPage = await pageIterator(async (page) => {
    const requestUrl = pipeUrl.replace("{page}", page);
    const pageRequest = await axios.get(requestUrl);
    const $ = cheerio.load(pageRequest.data);
    return $(selector)
      .map((_, e) => baseUrl + $(e).attr("href"))
      .toArray();
  });

  return [].concat(...pipeDataGroupedByPage);
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
    const $i18n = await getPage(i18nUrl);
    dataResponse[key] = getScrapData($i18n, scrapData, i18nUrl);
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

module.exports = {getPipe, getPage, getScrapData, getDataFromURL, processPipe};

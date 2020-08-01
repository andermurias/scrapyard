const cheerio = require("cheerio");
const axios = require("axios");
const {range} = require("./helper");

const getPipe = async (baseUrl, pipeUrl, pages, selector) => {
  const pipe = [];
  for (const page of pages) {
    const requestUrl = pipeUrl.replace("{page}", page);
    console.log("Request: " + requestUrl);
    const pageRequest = await axios.get(requestUrl);
    const $ = cheerio.load(pageRequest.data);
    $(selector).map((_, e) => pipe.push(baseUrl + $(e).attr("href")));
  }
  return pipe;
};
const getPage = async (url) => {
  console.log("Getting info from: " + url);
  const pageContent = await axios.get(url);
  const $ = cheerio.load(pageContent.data);
  console.log("Loader: " + url);
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
  const data = [];
  for (const url of urls) {
    const scrappedData = await getDataFromURL(url, scrapData, baseUrl, lang);
    data.push(scrappedData);
  }
  return data;
};
module.exports = {getPipe, getPage, getScrapData, getDataFromURL, processPipe};

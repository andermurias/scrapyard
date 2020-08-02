const axios = require("axios");
const fs = require("fs");
const path = require("path");
const scrap = require("../src/scrap");

const config = require("../__mock__/config/test");
const pipeOutput = require("../__mock__/output/pipe");
const scrapOutput = require("../__mock__/output/output.json");

jest.mock("axios");

axios.get.mockImplementation(
  (url) =>
    new Promise((resolve, reject) => {
      const filePath = path.resolve("__mock__/web/" + url);
      console.log(filePath);
      if (fs.existsSync(filePath)) {
        resolve({data: fs.readFileSync(filePath)});
      } else {
        reject({data: "[axios.mock] - File does not exists"});
      }
      return;
    })
);

describe("Scrap test", () => {
  it("Get url pipe", async () => {
    const pipe = await scrap.getPipe(config.baseUrl, config.dataSource.url, [1, 2, 3], config.dataSource.selector);
    expect(pipe).toEqual(pipeOutput);
  });

  it("Get data from URLs", async () => {
    const json = await scrap.processPipe(pipeOutput, config.scrapData, config.baseUrl, config.language);
    expect(json).toEqual(scrapOutput);
  });
});

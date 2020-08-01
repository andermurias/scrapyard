const fs = require("fs");
const chalk = require("chalk");

const helper = require("../src/helper");
const config = require("../config/guggenheim.json");

describe("Helper tests", () => {
  it("Get slug from URL", () => {
    const result = helper.slugify("www.example-of-url.com");
    expect(result).not.toContain(".");
    expect(result).not.toContain("/");
    expect(result).not.toContain("á");
  });
  it("Get a config file as object", () => {
    const helperConfig = helper.getConfigDataFromArgs("config/guggenheim.json");

    expect(config).toMatchObject(config);
    expect(helper.getConfigDataFromArgs).toThrow(Error);
    expect(() => {
      helper.getConfigDataFromArgs("config/does-not-exists");
    }).toThrow(Error);
  });

  it("Test range function", () => {
    expect(helper.getRangeFromConfig([1, 2, 3, 4, 5])).toMatchObject([1, 2, 3, 4, 5]);
    expect(helper.getRangeFromConfig("1-5")).toMatchObject([1, 2, 3, 4, 5]);
  });

  it("Ensure if directory exists", () => {
    const testDirectory = "test/directory";
    helper.ensureDirectoryExists(testDirectory);
    expect(fs.existsSync(testDirectory)).toBeTruthy();
    fs.rmdirSync(testDirectory);
    fs.rmdirSync("test", {
      recursive: true,
    });
  });

  it("Test the file name generator", () => {
    const fileName = helper.getFileNameFromConfig({baseUrl: "https://www.example-of-url.com"});
    expect(fileName).toMatch(/^wwwexample-of-urlcom_[0-9]{8}_[0-9]{6}\.json$/);
  });

  it("Progress Bar format", () => {
    const progressBar = helper.progressBar(50, "1");
    expect(progressBar).toMatch(
      "[" + chalk.green("=").repeat(25) + "                         ] " + chalk.green("50%") + " " + chalk.grey("(1)")
    );
  });
});

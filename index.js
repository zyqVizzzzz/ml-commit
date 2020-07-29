#!/usr/bin/env node
"use strict";
const path = require("path");
const editJsonFile = require("edit-json-file");
const arg = process.argv;
// 初始化my-commit ,将部分脚本写入到package.json中
if (arg[2] && arg[2] === "init") {
  // If the file doesn't exist, the content will be an empty object by default.
  let file = editJsonFile(`${process.cwd()}/package.json`);
  // Set a couple of fields
  file.set("husky", {
    hooks: {
      "pre-commit": "lint-staged",
    },
  });
  file.set("lint-staged", {
    "src/*.js": "['eslint --fix']",
  });
  // 询问是否全部使用git add .
  var List = require("prompt-list");
  var list = new List({
    name: "order",
    message: "是否默认使用git add .",
    // choices may be defined as an array or a function that returns an array
    choices: ["yes", "no"],
  });
  // async
  list.ask(function (answer) {
    file.set("scripts", {
      "ml-ci":
        answer === "yes"
          ? "git add . && cross-env ./node_modules/.bin/ml-commit"
          : "cross-env ./node_modules/.bin/ml-commit",
    });
    // Output the content
    file.save();
    var shell = require("shelljs");
    console.log("开始安装依赖");
    shell.exec("npm i husky --save-dev", { async: true });
    console.log("正在安装 husky---- ");
    shell.exec("npm i cross-env --save-dev", { async: true });
    console.log("正在安装cross-env ---- ");
    shell.exec("npm i lint-staged --save-dev", { async: true });
  });
} else {
  const bootstrap = require("commitizen/dist/cli/git-cz").bootstrap;
  bootstrap({
    cliPath: path.join(__dirname, "../../node_modules/commitizen"),
    // this is new
    config: {
      path: "cz-conventional-changelog",
      path: "cz-emoji",
    },
  });
}

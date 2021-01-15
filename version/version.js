"use strict";
const ora = require("ora"); //主要用来实现node.js命令行环境的loading效果，和显示各种状态的图标等
const inquirer = require("inquirer");//一个用户与命令行交互的工具
const formatDate = require("./format");
const fs = require("fs");
const shell = require("shelljs");//脚本中写 shell 命令
const curTime = new Date().getTime();
const defaultVersion = `${formatDate(curTime)}`;
const promptList = [
  {
    type: "input",
    message: "输入当前提交的项目版本号:",
    name: "version",
    default: defaultVersion, // 默认值
    validate: function (val) {
      if (val.includes("-")) {
        // 若校验 只要包含-就让其通过 否则不通过
        return true;
      }
      return "请输入正确的时间格式，详情参考README文档!";
    },
  },
];
const commitMessage = [
  {
    type: "input",
    message: "请输入提交信息:",
    name: "message",
    default: `${defaultVersion}版本提交`,
    validate: function (val) {
      if (val) {
        // 若校验 只要包含-就让其通过 否则不通过
        return true;
      }
      return "请输入本次提交信息";
    },
  },
];
const writePackage = (answers, callback) => {
  fs.readFile("./package.json", (err, data) => {
    if (err) throw new Error(err);
    data = JSON.parse(data.toString());
    answers.version1 = answers.version.replace(/-/g, ".");
    data.version = answers.version1;
    data = JSON.stringify(data, null, 2);
    fs.writeFileSync("./package.json", data);
    callback();
    return true;
  });
};
const shellTags = async (answers, data) => {
  shell.exec("conventional-changelog -p angular -i CHANGELOG.md -s -r 0");
  shell.exec("git add .");
  shell.exec(`git commit --no-verify -m "${data.message}"`);
  if (shell.exec(`git tag v${answers.version}`).code !== 0) {
    return false;
  }
  shell.exec(`git push origin v${answers.version}`);
  shell.exec(`git push origin master`);
  return true;
};
const runTag = async (answers) => {
  try {
    const data = await inquirer.prompt(commitMessage);
    const result = await shellTags(answers, data);
    return result;
  } catch (error) {
    return false;
  }
};
inquirer.prompt(promptList).then(async (answers) => {
  let loading = ora("writing into package.json ...");
  loading.start();
  await writePackage(answers, async function () {
    loading.color = "green";
    loading.text = `writing package.json successfully 😄`;
    loading.succeed();
    //add commit tag
    const result = await runTag(answers);
    if (result) {
      loading.color = "green";
      loading.text = `runing tag successfully 😄`;
    } else {
      loading.color = "red";
      loading.text = `runing tag fail 😭`;
    }
    loading.succeed();
  });
});

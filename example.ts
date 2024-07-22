import gitRepo from "./src/gitRepo";

const test = new gitRepo(`${__dirname}`, false);

console.log(test.branches["master"]);
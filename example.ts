import gitRepo from "./src/gitRepo";

const test = new gitRepo(`${__dirname}`, false);

console.log(test.branches.get("master")?.HEAD.tree.contents);
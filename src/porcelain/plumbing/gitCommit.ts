import gitbun from "../../..";
import gitRepo from "../../gitRepo";
import gitUser from "../gitUser";
import gitTree from "./gitTree";
import gitobj from "./gitobj";

export default class gitCommit {
	#tree?: gitTree;
	#author?: gitbun.gitUserTimestamped;
	#committer?: gitbun.gitUserTimestamped;
	#message?: string;
	#parent?: gitCommit;
	#object: gitobj;
	#parsed: boolean = false;
	#env: gitRepo;
	constructor(env: gitRepo, commit: gitobj) {
		this.#object = commit;
		this.#env = env;
	}

	get tree() {
		if (!this.#parsed)
			this.#parse();
		return this.#tree;
	}

	get author() {
		if (!this.#parsed)
			this.#parse();
		return this.#author;
	}

	get committer() {
		if (!this.#parsed)
			this.#parse();
		return this.#committer;
	}

	get message() {
		if (!this.#parsed)
			this.#parse();
		return this.#message;
	}

	get parent() {
		if (!this.#parsed)
			this.#parse();
		return this.#parent;
	}

	#parse() {
		var commitValue = this.#object.value.toString()
		var lines = commitValue.split("\n");
		while (true) {
			var line = lines.shift();
			if (!line || line.length == 0)
				break;
			if (line.startsWith("tree "))
				this.#tree = new gitTree(this.#env, line.slice(5, 45));
			if (line.startsWith("parent "))
				this.#parent = new gitCommit(this.#env, this.#env.getObject(line.slice(7, 47)));
			if (line.startsWith("committer "))
				this.#committer = gitUser.parseWithTimestamp(line.slice(10));
			if (line.startsWith("author "))
				this.#author = gitUser.parseWithTimestamp(line.slice(7));
		}
		if (lines.length == 0) {
			this.#parsed = true;
			return;
		}
		lines.pop();
		this.#message = lines.join("\n");
		this.#parsed = true;
	}
}
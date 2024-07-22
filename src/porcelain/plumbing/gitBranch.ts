import gitRepo from "../../gitRepo";
import gitbun from "../../..";
import gitCommit from "./gitCommit";

export default class gitBranch {
	#name?: string;
	HEAD: gitCommit;
	constructor(env: gitRepo, hash: string) {
		this.HEAD = new gitCommit(env, env.getObject(hash));
	}

	get name() { return this.#name; }
	set name(v) {
		if (typeof this.#name != "string")
			this.#name = v;
	}
}
import gitRepo from "../../gitRepo";
import gitbun from "../../..";
import gitCommit from "./gitCommit";

export default class gitBranch {
	#name?: string;
	#env : gitRepo;
	#HEAD: gitCommit;
	constructor(env: gitRepo, hash: string) {
		this.#env = env;
		this.#HEAD = new gitCommit(env, env.getObject(hash));
	}

	get name() { return this.#name; }
	set name(v) {
		if (typeof this.#name != "string")
			this.#name = v;
	}
	
	get head() { return this.#HEAD; }
}
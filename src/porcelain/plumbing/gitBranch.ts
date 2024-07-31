import gitRepo from "../../gitRepo";
import gitbun from "../../..";
import gitCommit from "./gitCommit";

export default class gitBranch {
	#name: string;
	#hash: string;
	#env : gitRepo;
	#HEAD: gitCommit;
	constructor(env: gitRepo, hash: string, name: string) {
		this.#env = env;
		this.#HEAD = new gitCommit(env, env.getObject(hash));
		this.#hash = hash;
		this.#name = name;
	}

	get name() { return this.#name; }
	get head() { return this.#HEAD; }
	get hash() { return this.#hash; }
}
import { statSync, existsSync, mkdirSync } from "fs";
import gitTag from "./porcelain/plumbing/gitBranch";
import gitBranch from "./porcelain/plumbing/gitBranch";
import gitobj from "./porcelain/plumbing/gitobj";

export default class gitRepo {

	defaultBranch: gitBranch;
	#path: string;
	#bare: boolean;
	constructor(directory: string, bare: boolean = true) {
		this.#bare = bare;
		this.#path = directory;
		if (existsSync(directory)) {
			mkdirSync(directory);
		} else {
			var stat = statSync(directory);
			if (!stat.isDirectory())
				throw new TypeError("Git Repository must be a directory");
			if (existsSync(`${this.path}/.git`)) {
				if (bare)
					console.warn(`[WARNING] Repository "${this.path}" is being read as bare, but contains '.git'`);
				bare = false;
			}
		}
		this.branches = new Map<string, gitBranch>();
		this.defaultBranch = new gitBranch(this);
	}

	get path() { return this.#path; }
	get dotGit() { if (this.#bare) return this.#path; return `${this.#path}/.git`; }

	getBranch(name:string) {
		
		return this.#getObject(hash, "tag");
	}

	#getObject(hash: string, type: string) {
		var ret = new gitobj(type);
		ret.fromFile(`${this.dotGit}/objects/${hash.slice(0,2)}/${hash.slice(2)}`);
	}

	#deserialize() {

	}

	// store in file
	#serialize() {
		var hasDotGit = existsSync(`${this.path}/.git`);
		if (!hasDotGit)
			mkdirSync(`${this.path}/.git`);

	}
}


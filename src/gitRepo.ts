import { statSync, existsSync, mkdirSync, readFileSync, readdirSync } from "fs";
import gitBranch from "./porcelain/plumbing/gitBranch";
import gitobj from "./porcelain/plumbing/gitobj";

export default class gitRepo {
	branches: {[_:string]: gitBranch};
	#path: string;
	#bare: boolean;
	constructor(directory: string, bare: boolean = true) {
		this.#bare = bare;
		this.#path = directory;
		if (!existsSync(directory)) {
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
		this.branches = {};
		this.#deserialize();
	}

	get path() { return this.#path; }
	get dotGit() { if (this.#bare) return this.#path; return `${this.#path}/.git`; }

	getObject(hash: string) {
		var ret = new gitobj();
		ret.fromFile(`${this.dotGit}/objects/${hash.slice(0,2)}/${hash.slice(2)}`);
		return ret
	}

	#deserialize() {
		var branchRefs = `${this.dotGit}/refs/heads`;
		if (!existsSync(branchRefs))
			return null;
		var branches = readdirSync(branchRefs);
		branches.forEach((branch) => {
			var hash = readFileSync(`${branchRefs}/${branch}`).toString().slice(0,40);
			var obj = new gitBranch(this, hash);
			obj.name = branch;
			this.branches[branch] = obj;
		});
	}

	// store in file
	#serialize() {
		var hasDotGit = existsSync(`${this.path}/.git`);
		if (!hasDotGit)
			mkdirSync(`${this.path}/.git`);

	}
}
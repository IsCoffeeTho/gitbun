import { statSync, existsSync, mkdirSync, readFileSync, readdirSync, readlinkSync } from "fs";
import gitBranch from "./porcelain/plumbing/gitBranch";
import gitobj from "./porcelain/plumbing/gitobj";

export default class gitRepo {
	branches: { [_: string]: gitBranch };
	defaultBranch?: gitBranch;
	#path: string;
	#bare: boolean;
	constructor(directory: string, bare: boolean = true) {
		this.#bare = bare;
		this.#path = directory;
		if (!existsSync(directory))
			throw new Error("Repository Does not Exist");
		var stat = statSync(directory);
		while (stat.isSymbolicLink()) {
			directory = readlinkSync(directory);
			stat = statSync(directory);
		}
		if (!stat.isDirectory())
			throw new TypeError("Git Repository must be a directory");
		if (existsSync(`${this.path}/.git`)) {
			if (bare)
				console.warn(`[WARNING] Repository "${this.path}" is said to be bare, but contains '.git'. Reading as regular repo.`);
			bare = false;
		}
		this.branches = {};
		this.#deserialize();
	}

	get path() { return this.#path; }
	get dotGit() { if (this.#bare) return this.#path; return `${this.#path}/.git`; }

	getObject(hash: string) {
		var ret = new gitobj();
		ret.fromFile(`${this.dotGit}/objects/${hash.slice(0, 2)}/${hash.slice(2)}`);
		return ret;
	}

	#deserialize() {
		var branchRefs = `${this.dotGit}/refs/heads`;
		if (!existsSync(branchRefs))
			return;
		var branches = readdirSync(branchRefs);
		if (branches.length == 0) {
			return;
		}
		for (var idx in branches) {
			var branch = branches[idx];
			var hash = readFileSync(`${branchRefs}/${branch}`).toString().slice(0, 40);
			var obj = new gitBranch(this, hash, branch);
			this.branches[branch] = obj;
		}
	}

	// store in file
	#serialize() {
		if (!existsSync(this.dotGit))
			mkdirSync(this.dotGit);
		if (!existsSync(`${this.dotGit}/refs`))
			mkdirSync(`${this.dotGit}/refs`);
	}
}
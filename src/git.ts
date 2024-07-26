import gitbun from "..";
import EventEmitter from "events";
import gitSSH from "./server/ssh/gitssh";
import gitRepo from "./gitRepo";
import { existsSync, mkdirSync } from "fs";
import { pathToFileURL } from "bun";

export default class gitService extends EventEmitter {
	repoDir: URL;
	#opt: gitbun.gitServiceOptions;
	#sshServer?: gitSSH;
	constructor(opt: gitbun.gitServiceOptions) {
		super();
		this.#opt = opt;
		this.repoDir = pathToFileURL(opt.repoDir);
		if (opt.ssh)
			this.#sshServer = new gitSSH(this, opt.ssh);
	}

	createRepo(name: string): gitRepo {
		name = gitService.sanitizeRepoName(name);
		var retRepoDir = `${this.repoDir.pathname}${name}`;
		if (existsSync(retRepoDir))
			throw new Error(`Repository Already Exists`);
		mkdirSync(retRepoDir);
		return new gitRepo(retRepoDir, true);
	}

	getRepo(name: string): gitRepo | null {
		name = gitService.sanitizeRepoName(name);
		var retRepoDir = `${this.repoDir.pathname}${name}`;
		try {
			return new gitRepo(retRepoDir, true);
		} catch (err) {
			return null;
		}
	}

	begin(ready?: () => any) {
		if (this.#sshServer)
			this.#sshServer.begin();
		if (ready)
			ready();
	}

	static sanitizeRepoName(name: string) {
		if (name.startsWith("'") && name.endsWith("'"))
			name = name.slice(1,-1);
		if (name.endsWith(".git"))
			name = name.slice(0, -".git".length);
		return pathToFileURL(`/${name}`).pathname;
	}

	static null: any;
}
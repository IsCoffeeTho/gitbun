import gitbun from "..";
import gitSSH from "./ssh/gitssh";
import EventEmitter from "events";

export default class gitService extends EventEmitter {
	ssh: gitSSH = gitSSH.null;
	repoDir: string;
	#opt: gitbun.gitServiceOptions;
	constructor(opt: gitbun.gitServiceOptions) {
		super();
		this.#opt = opt;
		this.repoDir = opt.repoDir;
		this.ssh = new gitSSH(opt.ssh, this);
	}

	begin(ready?: () => any) {
		this.ssh.begin();
	}

	static null: any;
}
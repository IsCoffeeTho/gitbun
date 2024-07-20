import { Connection, Server, utils } from "ssh2";
import { readFileSync } from "fs";
import gitService from "../git";
import gitSSHAgent from "./agent";
import gitbun from "../..";

const defaultAuthFunctions: { [_: string]: ((ctx: gitbun.gitSSHKeyContext) => void) } = {
	UserKeys(ctx) {
		console.log(ctx);
		ctx.accept();
	}
};

export default class gitSSH {
	host: string;
	port: number;
	#server: Server;
	parent: gitService;
	authKey: ((ctx: gitbun.gitSSHKeyContext) => void);
	constructor(opt: gitbun.sshServerSettings, service: gitService) {
		this.host = opt.host;
		this.port = typeof opt.port == "number" ? opt.port : parseInt(opt.port);
		this.#server = new Server({
			hostKeys: opt.hostkeys.map((v) => {
				if (Buffer.isBuffer(v))
					return v;
				if (v.match(/^[\/\.]/g))
					return readFileSync(v);
				return v;
			})
		}, client => this.#connection(client, this));
		this.parent = service;
		if (typeof opt.auth == "function")
			this.authKey = opt.auth;
		else
			this.authKey = defaultAuthFunctions[opt.auth];
	}

	#connection(client: Connection, _this: gitSSH) {
		new gitSSHAgent(client, _this);
	}

	#realRepoPath(repo: string) {
		console.log(`${this.parent.repoDir}`);
	}

	begin() {
		this.#server.listen(this.port, this.host);
	}

	static null: any;

	static parseKey(file: string, passphrase?: string) {
		return utils.parseKey(readFileSync(file), passphrase);
	}
}
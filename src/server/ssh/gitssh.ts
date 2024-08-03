import { AuthContext, PublicKeyAuthContext, Server } from "ssh2";
import { readFileSync } from "fs";
import gitbun, { gitService } from "../../..";
import gitUploadPack from "./uploadPack";
import gitSSHagent from "./sshagent";

export default class gitSSH {
	#server: Server;
	#host: string;
	#port: number;
	constructor(env: gitService, opt: gitbun.sshServerSettings) {
		this.#server = new Server({
			hostKeys: opt.hostkeys.map((v) => {
				return readFileSync(v);
			})
		}, (con) => {
			var agent = new gitSSHagent(env, con);
			con.on("authentication", (ctx: AuthContext) => {
				if (ctx.username != "git")
					return ctx.reject(["publickey", "none"]);
				if (ctx.method != "publickey" && ctx.method != "none")
					return ctx.reject(["publickey", "none"]);
				var decisionMade = false;
				var decision = false;
				var auth_ctx: gitbun.sshAuthContext = {
					user: {},
					key: ((ctx.method != "none") ? (<PublicKeyAuthContext>ctx).key : null),
					accept() {
						if (decisionMade)
							return;
						decision = true;
						decisionMade = true;
					},
					reject() {
						decisionMade = true;
					}
				}
				opt.auth(auth_ctx);
				agent.user = auth_ctx.user;
				var opsecTimer: Timer;
				var opsecTimeout = 3000;
				opsecTimer = setInterval(() => {
					opsecTimeout -= 100;
					if (opsecTimeout <= 0) {
						clearInterval(opsecTimer);
						ctx.reject();
						console.error("Authentication timeout");
						return;
					}
					if (!decisionMade)
						return;
					if (decision)
						ctx.accept();
					else
						ctx.reject();
					clearInterval(opsecTimer);
				}, 100);
			});
		});
		this.#host = opt.host;
		if (typeof opt.port == "string")
			opt.port = parseInt(opt.port);
		this.#port = opt.port;
	}

	begin(callback?: () => any) {
		this.#server.listen(this.#port, this.#host, callback);
	}
}
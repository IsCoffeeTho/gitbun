import { AuthContext, PublicKeyAuthContext, Server } from "ssh2";
import { readFileSync } from "fs";
import gitbun, { gitService } from "../../..";

export default class gitSSH {
	#server: Server;
	#host: string;
	#port: number;
	#env: gitService;
	constructor(env: gitService, opt: gitbun.sshServerSettings) {
		this.#env = env;
		this.#server = new Server({
			hostKeys: opt.hostkeys.map((v) => {
				return readFileSync(v);
			})
		}, (con) => {
			var user: any;
			con.on("authentication", (ctx: AuthContext) => {
				if (ctx.username != "git")
					return ctx.reject(["publickey", "none"]);
				if (ctx.method != "publickey" && ctx.method != "none")
					return ctx.reject(["publickey", "none"]);
				var decisionMade = false;
				var decision = false;
				var auth_ctx: gitbun.sshAuthCtx = {
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
				user = auth_ctx.user;
				var opsecTimer: Timer;
				var opsecTimeout = 5 * 4;
				opsecTimer = setInterval(() => {
					if (--opsecTimeout <= 0) {
						clearInterval(opsecTimer);
						console.error(new Error("Authentication timeout"));
						return;
					}
					if (!decisionMade)
						return;
					if (decision)
						ctx.accept();
					else
						ctx.reject();
					clearInterval(opsecTimer);
				}, 250);
			});

			con.on("session", (acceptSession, rejectSession) => {
				var session = acceptSession();
				session.on("exec", (acceptExec, rejectExec, infoExec) => {
					var command = infoExec.command.split(" ").filter((v) => {
						return v != "";
					})
					if (["git-upload-pack", "git-recieve-pack"].indexOf(command[0]) == -1) {
						rejectExec();
						return;
					}
					console.log(command);
				})
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
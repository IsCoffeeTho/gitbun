import { AuthContext, Connection, PublicKeyAuthContext } from "ssh2";
import gitbun, { gitService } from "../../..";
import gitUploadPack from "./uploadPack";
import gitSSH from "./gitssh";

export default class gitSSHagent {
	#env: gitService;
	user: any = {};
	constructor(env: gitService, con: Connection) {
		this.#env = env;
		con.on("session", (acceptSession, rejectSession) => {
			var session = acceptSession();
			session.on("exec", (acceptExec, rejectExec, infoExec) => {
				var command = infoExec.command.split(" ").filter((v) => { return v != ""; })
				var protocol = command.shift() ?? "";
				var repoName = gitService.sanitizeRepoName(command.pop() ?? "");
				if (["git-upload-pack", "git-receive-pack"].indexOf(protocol) == -1) {
					rejectExec();
					return;
				}
				var client = acceptExec();
				try {
					var repo = this.#env.getRepo(repoName);
					if (!repo)
						throw new Error("Repository is not found");
					var throwAway: undefined | boolean | string;
					if (!this.#env.emit((protocol == "git-upload-pack" ? "pull" : "push"), {
						user: this.user,
						repo: repo,
						accept() { throwAway = false; },
						reject(reason?: string) {
							throwAway = true;
							if (reason)
								throwAway = reason;
						}
					}) && throwAway == undefined)
						throw new Error("Unhandled Permissions");
					else if (throwAway) {
						if (typeof throwAway == "string")
							client.stderr.write(`gitbun: ${throwAway}\n`);
						client.close();
					} else {
						if (protocol == "git-upload-pack")
							new gitUploadPack(repo, client);
						else
							client.close();
					}
				} catch (err: any) {
					client.close();
					throw err;
				}
			})
		});
	}
}
import { gitService } from ".";
import { mkdtempSync } from "fs";

const app = new gitService({
	repoDir: mkdtempSync("/tmp/gitbun-test-root"),
	ssh: {
		host: process.env["SSH_HOST"] ?? "::",
		port: process.env["SSH_PORT"] ?? 2222,
		hostkeys: (process.env["SSH_HOST_KEYS"])?.split(":") ?? [],
		auth(ctx) {
			if (ctx.key == null) {
				ctx.user = {
					id: -1,
					username: 'Anonymus User'
				}
				ctx.accept();
				return;
			}
			// ctx.key.algo : string;
			// ctx.key.data : Buffer;
			ctx.user = {
				id: 0,
				name: "Known User",
			};
			ctx.accept(); // accept all
			// ctx.reject();
		}
	}
});

app.on("pull", (ctx) => {
	console.log(ctx);
	ctx.reject();
})

console.log(`${app.repoDir.pathname}`);

const exampleRepo = app.createRepo("example");

app.begin(() => {
	console.log("GitService READY");
});
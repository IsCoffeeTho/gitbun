import { gitService } from ".";
import { mkdtempSync } from "fs";

const app = new gitService({
	repoDir: mkdtempSync("/tmp/gitbun-test-root"),
	ssh: {
		host: process.env["SSH_HOST"] ?? "::1",
		port: process.env["SSH_PORT"] ?? 2222,
		hostkeys: (process.env["SSH_HOST_KEYS"])?.split(":") ?? [],
		auth(ctx) {
			if (ctx.key == null) {
				ctx.user = {
					id: 'f'.repeat(40),
					username: 'Anonymus User'
				}
				ctx.accept();
				return;
			}
			// ctx.key.algo : string;
			// ctx.key.data : Buffer;
			ctx.user = {
				id: ''.padStart(40, "0"),
				name: "Known User",
			};
			ctx.accept(); // accept all
			// ctx.reject();
		}
	}
});

app.on("pull", (ctx) => {
	console.log(ctx.repo);
	ctx.accept();
});

app.on("push", (ctx) => {
	console.log(ctx);
	ctx.accept();
});

console.log(`${app.repoDir.pathname}`);

const exampleRepo = app.createRepo("example");

app.begin(() => {
	console.log("GitService READY");
});
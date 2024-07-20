import gitbun, { gitService } from ".";

const git = new gitService({
	ssh: {
		host: process.env["SSH_HOST"] ?? "::",
		port: process.env["SSH_PORT"] ?? "22",
		hostkeys: process.env["SSH_HOST_KEYS"]?.split(":") ?? [],
		auth: "UserKeys"
	},
	repoDir: "/var/git",
});

git.on("permission", (ctx: gitbun.gitPermissionContext) => {
	// if (ctx.action == "pull" && repodata.isPublic)
		return ctx.allow();
	// return ctx.deny();
});

git.begin(() => {
	console.log("READY");
});
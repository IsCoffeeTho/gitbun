import { PublicKey } from "ssh2";
import gitService from "./src/git";

export default gitbun;
export { gitService };

declare namespace gitbun {
	
	export type gitUser = {
		name: string,
		email: string
	};

	export type gitUserTimestamped = gitUser & {timestamp : Date};

	export type gitServiceOptions = {
		repoDir: string,
		ssh?: sshServerSettings
	};

	export type serverSettings = {
		host: string,
		port: number | string,
	};

	export type sshServerSettings = serverSettings & {
		hostkeys: string[],
		auth(ctx:sshAuthCtx):any
	};

	export type sshAuthCtx = {
		user: any,
		readonly key: PublicKey | null,
		accept(): any,
		reject(): any
	}
}
import { PublicKey } from "ssh2";
import gitService from "./src/git";
import gitRepo from "./src/gitRepo";

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
		defaultBranch?: string,
		ssh?: sshServerSettings
	};

	export type serverSettings = {
		host: string,
		port: number | string,
	};

	export type sshServerSettings = serverSettings & {
		hostkeys: string[],
		auth(ctx:sshAuthContext):any
	};

	export type sshAuthContext = {
		user: any,
		readonly key: PublicKey | null,
		accept(): any,
		reject(): any
	}

	export type pullContext = {
		readonly user: any;
		readonly repo: gitRepo;
		accept(): void;
		reject(): void;
	};
}
import gitService from "./src/git";

export default gitbun;
export { gitService };

declare namespace gitbun {

	interface gitObject {
		type: string;
		value: Buffer;
		readonly hash: string;
	}

	/** @ignore */
	interface gitDB {
		store(type: string, value: string | Buffer | Uint8Array): string;
		retrieve(hash: string): gitObject;
		remove(hash: string): void;
	}

	interface gitRepo {
		/** Stored in the repository using the gitobject system to serialize */
		data: any;
		init(): void;
		
	}

	export type gitAction = "push" | "pull";

	export type gitActionContext = {
		user: any;
		repo: gitRepo;
		branch: string;
		action: gitAction;
	};

	export type gitUser = {
		name: string,
		email: string
	}

	export type gitPermissionContext = gitActionContext & {
		allow(): void;
		deny(): void;
	};

	export type gitServiceOptions = {
		ssh: sshServerSettings,
		repoDir: string,
	};

	export type gitServiceEvents = {
		"pull": [gitActionContext],
		"push": [gitActionContext]
	};

	export type serverSettings = {
		host: string,
		port: number | string,
	};

	export type sshServerSettings = serverSettings & {
		hostkeys: string[]
		auth: "UserKeys" | ((ctx: gitSSHKeyContext) => void);
	};

	export type gitSSHKeyContext = {
		data: any;
		algorithm: string;
		key: Buffer;
		signature: Buffer;
		blob: Buffer;
		accept(): void;
		reject(): void;
	};
};
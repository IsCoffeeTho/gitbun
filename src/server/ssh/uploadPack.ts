import { ServerChannel } from "ssh2";
import packProtocol from "../../porcelain/packProtocol";
import gitRepo from "../../gitRepo";

export default class gitUploadPack {
	#con : packProtocol;
	#repo : gitRepo;
	constructor (repo: gitRepo, con: ServerChannel) {
		this.#repo = repo;
		this.#con = new packProtocol(con);
		if (!repo.defaultBranch) {
			this.#con.flush();
			this.#con.close();
		}
		for (var name in repo.branches) {
			var branch = repo.branches[name];
			this.#con.pktline(`${branch.hash} ${name}`);
		}
		this.#con.flush();
	}



	
}
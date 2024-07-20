import { Connection } from "ssh2";
import gitSSH from "./gitssh";

export default class gitSSHAgent {
	parent: gitSSH;
	constructor(client: Connection, sshHandle: gitSSH) {
		this.parent = sshHandle;
	}
}
import { ServerChannel } from "ssh2";

/**
 * @see {@link https://git-scm.com/docs/pack-protocol}
 * @see {@link https://git-scm.com/docs/protocol-common}
 * @see {@link https://git-scm.com/docs/protocol-capabilities} ⇽ may need more study 
*/
export default class packProtocol {
	#con: ServerChannel;
	constructor(con: ServerChannel) {
		this.#con = con;
	}

	advertiseCapabilities() {
		const capabilities = [
			"multi_ack",
			"side-band",
			"side-band-64k",

			"shallow",

		];
	}

	flush() {
		this.#con.write("0000");
	}
}
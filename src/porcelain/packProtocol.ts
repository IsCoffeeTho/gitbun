import { ServerChannel } from "ssh2";

import pkg from "../../package.json";

enum packCapabilityState {
	UNKNOWN,
	ADVERTISED,
	NEGOTIATED,
}

/**
 * @see {@link https://git-scm.com/docs/pack-protocol}
 * @see {@link https://git-scm.com/docs/protocol-common}
 * @see {@link https://git-scm.com/docs/protocol-capabilities} ⇽ may need more study 
*/
export default class packProtocol {
	#con: ServerChannel;
	#packetBuffer: Buffer[] = [];
	#capabilities: string[] = [
		"multi_ack",
		"side-band",
		"side-band-64k",
		"ofs-delta",
		"shallow",
		"deepen-since",
		"deepen-not",
		"deepen-relative",
		"no-progress",
		"include-tag",
		`object-format=sha1`,
		`agent=${pkg.name}/${pkg.version}`
	];
	#capabilityState: packCapabilityState = packCapabilityState.UNKNOWN;
	constructor(con: ServerChannel) {
		this.#con = con;
		this.#con.stdin.on("data", this.#read);
	}

	#read(data: Buffer) {
		this.#packetBuffer.push(data);
	}

	pktline(data: Buffer | Uint8Array | string) {
		var len = (data.length + 4).toString(16).padStart(4, "0004").slice(-4);
		if (this.#capabilityState == packCapabilityState.UNKNOWN) {
			this.#con.stdout.write(`${len}${data}\0${this.#capabilities.join(" ")}\n`);
			this.#capabilityState = packCapabilityState.ADVERTISED;
		} else {
			this.#con.stdout.write(`${len}${data}\n`);
		}
	}

	close() {
		this.#con.stdout.write("0002");
		this.#con.close();
	}

	delim() { this.#con.stdout.write("0001"); }

	flush() { this.#con.stdout.write("0000"); }
}
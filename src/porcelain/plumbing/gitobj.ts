import { readFileSync } from "fs";
import gitbun from "../../..";

export default class gitobj implements gitbun.gitObject {
	#hash: string = "";
	#hash_: boolean = false;
	#val: Buffer = Buffer.from("");
	#type: string = "blob";

	/** The value of the git object */
	get value() { return this.#val; }
	set value(v: Buffer) {
		this.#val = v;
		this.#hash_ = false;
	}

	/** The type of the git object */
	get type() { return this.#type; }

	/**
	 * The hash (key) of the object as should be stored in the git database.
	 * The value of this property gets changed upon editing the type and value properties.
	 * @readonly 
	*/
	get hash() {
		if (this.#hash_)
			return this.#hash;
		var hasher = new Bun.CryptoHasher("sha1");
		hasher.update(`${this.type} ${this.value.length}\0${this.value.toString()}`);
		this.#hash = hasher.digest("hex");
		this.#hash_ = true;
		return this.#hash;
	}

	toFile() {
		var size = this.#val.byteLength.toString();
		var file = Buffer.alloc(2 + this.#type.length + size.length + this.#val.byteLength);
		file.write(`${this.#type} ${this.#val.length}\0${this.#val.toString()}`);
		var uncompressed = new Uint8Array(file);
		var compressed = Bun.deflateSync(uncompressed);
		return new Uint8Array([0x78, 0x01, ...compressed]);
	}

	fromFile(file: string) {
		var compressed = new Uint8Array(Buffer.from(readFileSync(file)));
		if (compressed[0] != 0x78)
			throw new Error("Git Object has invalid format");
		if (compressed[1] != 0x01)
			throw new Error("Git Object format is unsupported");
		var dec = new TextDecoder();
		var uncompressed = Bun.inflateSync(compressed.slice(2));
		var data = dec.decode(uncompressed);
		var parsed = data.match(/^[^ ]+/g);
		if (!parsed)
			throw new Error("Git Object has invalid format");
		var type = parsed[0];
		switch (type) {
			case "tag":
			case "blob":
			case "tree":
			case "commit":
				break;
			default:
				throw new TypeError("Git Object has an invalid type");
		}
		data = data.slice(type.length + 1)
		var parsed = data.match(/\d+/g);
		if (!parsed)
			throw new Error("Git Object has invalid format");
		var size = parseInt(parsed[0]);
		var data_begin = (parsed[0]).length + 1;
		data = data.slice(data_begin, data_begin + size);
		this.value = Buffer.from(data);
	}
}
import gitRepo from "../../gitRepo";
import gitBlob from "./gitBlob";
import gitobj from "./gitobj";

export default class gitTree {
	#parsed: boolean = false;
	#object: gitobj;
	#env : gitRepo;
	#contents: { [_: string]: gitBlob | gitTree };
	constructor(env: gitRepo, hash: string) {
		this.#object = env.getObject(hash);
		this.#env = env;
		this.#contents = {};
	}

	get hash() { return this.#object.hash; }

	get contents() {
		if (!this.#parsed)
			this.#parse();
		return this.#contents;
	}

	#parse() {
		var objValue = this.#object.value;
		while (objValue.length > 0) {
			var filemode = "";
			var filename = "";
			var hash = "";
			while (true) {
				var c = objValue.at(0);
				objValue = objValue.subarray(1);
				if (c == 32) // space
					break;
				filemode += String.fromCharCode(c ?? 0);
			}
			while (true) {
				var c = objValue.at(0);
				objValue = objValue.subarray(1);
				if (c == 0) // space
					break;
				filename += String.fromCharCode(c ?? 0);
			}
			for (var i = 0; i < 20; i++) {
				var c = objValue.at(0) ?? 0;
				objValue = objValue.subarray(1);
				hash += c.toString(16);
			}
			console.log(filemode, filename, hash);
			var obj;
			if (filemode.at(0) == '4')
				obj = new gitTree(this.#env, hash);
			else
				obj = new gitBlob(this.#env, hash);
			this.#contents[filename] = obj;
		}
		this.#parsed = true;
	}
}
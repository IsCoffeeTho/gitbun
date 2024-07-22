import gitRepo from "../../gitRepo";
import gitobj from "./gitobj";

export default class gitBlob {
	#parsed : boolean = false;
	#object : gitobj;
	#contents : string;
	constructor(env: gitRepo, hash: string) {
		this.#object = env.getObject(hash);
		this.#contents = "";
	}

	get hash() { return this.#object.hash; }

	get contents() {
		if (!this.#parsed)
			this.#parse();
		return this.#contents;
	}
	
	#parse() {
		var objValue = this.#object.value.toString();
		console.log(objValue);
		this.#contents = objValue;
		this.#parsed = true;
	}
}
import gitRepo from "../../gitRepo";
import gitBlob from "./gitBlob";
import gitobj from "./gitobj";

export default class gitTree {
	#parsed : boolean = false;
	#object : gitobj;
	#contents : {[_:string]: gitBlob | gitTree};
	constructor(env: gitRepo, hash: string) {
		this.#object = env.getObject(hash);
		this.#contents = {};
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
		this.#parsed = true;
	}
}
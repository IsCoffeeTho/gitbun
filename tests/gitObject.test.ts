import { test, expect } from "bun:test";
import gitobj from "../src/porcelain/plumbing/gitobj";

test("gitObject Basic Operation", () => {
	var testObj = new gitobj();
	var dec = new TextDecoder();
	expect(testObj.type).toBe(`blob`);
	expect(testObj.value.toString()).toBe(``);
	expect(testObj.hash).toBe("e69de29bb2d1d6434b8b29ae775ad8c2e48c5391");
	expect(dec.decode(Bun.inflateSync(testObj.toFile().slice(2)))).toBe(`blob 0\0`);
});

test("gitObject hash", () => {
	var obj = new gitobj();
	var runHashTest = (text: string, hash: string) => {
		obj.value = Buffer.from(text);
		expect(obj.hash).toBe(hash);
	}
	runHashTest("", "e69de29bb2d1d6434b8b29ae775ad8c2e48c5391");
	runHashTest("\n", "8b137891791fe96927ad78e64b0aad7bded08bdc");
	runHashTest("test", "30d74d258442c7c65512eafab474568dd706c430");
	runHashTest("test\n", "9daeafb9864cf43055ae93beb0afd6c7d144bfa4");
	runHashTest("\x01\x02\x03", "aed2973e4b8a7ff1b30ff5c4751e5a2b38989e74");
});

test("gitObject compression", () => {
	var dec = new TextDecoder();
	var runCompressionTest = (value: string) => {
		var obj = new gitobj();
		obj.value = Buffer.from(value);
		expect(dec.decode(Bun.inflateSync(obj.toFile().slice(2)))).toBe(`blob ${value.length}\0${value}`);
	}
	runCompressionTest("");
	runCompressionTest("\n");
	runCompressionTest("test");
	runCompressionTest("test\n");
	runCompressionTest("\x01\x02\x03");
});

test("gitObject parsing", () => {
	var runParsingTest = (value: string) => {
		var { stdout } = Bun.spawnSync({
			cmd: [
				"git", "hash-object", "-w", "--stdin"
			],
			stdin: Buffer.from(value)
		});
		var objectHash = stdout.toString().slice(0, -1);
		var hashPath = `${process.cwd()}/.git/objects/${objectHash.slice(0, 2)}/${objectHash.slice(2)}`;
		var parsedObject = new gitobj();
		parsedObject.fromFile(hashPath);
		expect(parsedObject.type).toBe('blob');
		expect(parsedObject.value.toString()).toBe(value);
		expect(parsedObject.hash).toBe(objectHash);
	}
	runParsingTest("");
	runParsingTest("\n");
	runParsingTest("test");
	runParsingTest("test\n");
	runParsingTest("\x01\x02\x03");
});
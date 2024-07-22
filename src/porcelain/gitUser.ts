import gitbun from "../..";

export default {
	parse(line: string) {
		var name = line.match(/^.*</g)?.[0];
		var email = line.match(/<.*>/g)?.[0];
		name = name?.slice(0, -1);
		email = email?.slice(1, -1);
		var ret: gitbun.gitUser = { name: name?.trimEnd().trimStart() ?? "Git User", email: email ?? "info@cwyl.org" };
		return ret;
	},
	parseWithTimestamp(line: string) {
		// @ts-ignore // warning about missing timestamp property that gets added here
		var ret: gitbun.gitUserTimestamped = this.parse(line);
		var timestamp = line.match(/>.*/g)?.[0];
		timestamp = timestamp?.slice(1).trimStart().trimEnd() ?? "0 +0000";
		var sections = timestamp.split(" ");
		var timezoneString = sections[1];
		var timezoneSign = (timezoneString.at(0) == '-' ? -1 : 1);
		var timezoneHour = parseInt(timezoneString.slice(1,-2));
		var timezoneMin = parseInt(timezoneString.slice(-2));
		var timezone = timezoneSign * (((timezoneHour * 60) + timezoneMin) * 60000)
		ret.timestamp = new Date((parseInt(sections[0]) * 1000) + timezone);
		return ret;
	}
}
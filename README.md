# gitbun
- [Installation \& Setup](#installation--setup)
- [Usage](#usage)

## Installation & Setup

The library can be used as is, but for standardization here is a recommended setup:
- SSH servers to be "**rebound to**" or "**redirected from**" any other port besides port `22`; *and*
- A Daemon for the system written by your code, to be created; *and*
- Any Daemon created for this system to be ran by `git` user that is part of the `git` group;

```sh
# install library
bun install gitbun
```

## Usage

```js
// myGitService.js

import { gitService } from "gitbun";

const gitServer = new gitService({
	repoDir: '~/repos'
	ssh: {
		host: "::1",
		port: 22,
		hostkeys: [ "host_rsa.pub" ],
		auth(ctx) {
			if (ctx.key == null) {
				ctx.user = {
					id: -1,
					username: 'Anonymus User'
				}
				ctx.accept();
				return;
			}
			// autheticate users based off their public keys
			ctx.user = {
				id: 1,
				username: 'Known User'
			}
			ctx.accept();
		}
	}
});

gitServer.begin(() => {
	console.log("Running git server");
});
```
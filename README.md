# boba-buddies
Sandbox's virtual water cooler conversation app.


## How to Contribute :D
At the current state of things, feel free to take on any open issues and make a PR for it. 

### Tech Stack
TypeScript <br>
Node.js <br>
Slack Bolt API  <br>
Jest Framework for Testing <br>

### How to Get Started
Of course, clone the repo and run that dank `npm install`.<br>
There are a few secrets and API keys that we use since we're using [Slack's Bolt API](https://slack.dev/bolt-js/concepts), so you'll need to have them set somewhere on your machine.
You can find the keys in our slack channel; it should be in a [pinned message](https://sandboxneu.slack.com/archives/C02CNKJ3EQJ/p1643315402011100).

Hypothetically, to run the app, you would do something along the lines of `ts-node pairAndIntroduce.ts` iirc. However, that file currently doesn't do anything if you take a look, so you would need to
configure some things in that file to actually do something. Eventually, we'll make it less jank lol.<br>

Right now, anything the app does will interact with our Slack test channel at #boba-buddies-testing.

### Brief Brief Overview of Codebase
The main entrypoint is located in the `pairAndIntroduce.ts` file, where the app configs to connect to the Bolt API live.<br>
You'll find that the individual features like creating pairs and sending a check in message lives in the `/util` folder.<br>
All of the testing we have so far is in the `__tests__` folder and you can run them with `npm test` :D.

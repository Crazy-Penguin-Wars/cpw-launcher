# About

NewCP-App is an electron based client for running New Club Penguin. It comes with a builtin flash player, and uses a version of Electron from before flash support was dropped. 

# Contributing

All contributions are welcome. People who discover bugs with the client may open new issues (please keep in mind that you should only open a new issue if it is a bug with the client, NOT a bug with the game), and people may open pull requests to add new features or fix bugs. Do not expect to be paid for contributing, however if your contribution was meaningful, you may be credited. Active contributors may be recruited as a developer for NewCP, but this is not guaranteed. 

**NOTE: The following instructions are for people who want to contribute. If you are here to play NewCP, please use our prebuilt binaries from [here](https://github.com/New-Club-Penguin/NewCP-App-Build/releases)**.

### Setup

- Please make sure you have [nodejs](https://nodejs.org/en/download/) and [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable) installed. 
- Clone this repository.
- Install node dependencies using the command `yarn install`.

### Running
To run the NewCP client, use the following command:
```
yarn start
```

### Map-editor test maps

The launcher accepts `cpw://test-map?url=<encoded-url>`, where the encoded URL is a `/test-map` launch URL returned by the CPW demo server. It only accepts the configured hosted server and `http://127.0.0.1:8000`, then loads the map in the existing Flash window. The map editor creates this handoff automatically through **Test in game**.

The default game server remains `https://michielvde.eu.pythonanywhere.com`. Set `CPW_SERVER_URL` before starting the launcher to use another trusted default server during development.

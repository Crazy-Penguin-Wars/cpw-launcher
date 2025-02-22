const RPC = require('discord-rpc');
const rpcClient = new RPC.Client({ transport: 'ipc' });
const APPLICATION_ID = '1342872507312508978';
RPC.register(APPLICATION_ID);

const rpcStates = ["Playing the best game ever",
    "Killing penguins... luckily they respawn!",
    "Using 10.000 Doomsday Weapons",
    "Where is my Cheat Engine.exe again 🤔",
    "Penguins in the desert??? 🤨",
    "whyyyyyyy *insert emote sound*",
    "Playing a silly facebook game",
    "NEVER teach a penguin how to use a bazooka!",
    "🥙"]

function onRpcReady() {
    rpcClient.setActivity({
        state: rpcStates[Math.floor(Math.random()*rpcStates.length)],
        details: "Crazy Penguin Wars Demo",
        startTimestamp: Date.now(),
        largeImageKey: "cpwicon",
        instance: true,
    });
}

function initDiscordRichPresence() {
    rpcClient.on('ready', onRpcReady);
    rpcClient.login({
        clientId: APPLICATION_ID
    }).catch(console.error);
}

module.exports = { initDiscordRichPresence }
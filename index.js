var fs = require('fs');
var http = require('http');
var Discord = require('discord.js');
var client = new Discord.Client();
var configData = fs.readFileSync('config.json');
var config = JSON.parse(configData);
var updateInterval = config.interval;
var lastfmUsername = config.lastfmUsername;
var lastfmApiKey = config.lastfmApiKey;
var discordToken = config.discordToken;
var loop;
client.login(discordToken);
client.on('ready', function () {
    console.log(new Date() + ": Logged into Discord as: " + client.user.tag);
    // client.user.setPresence({ game: { name: "YEET YEET" }, status: "online" });
    startLoop();
    return;
});
client.on('disconnect', function () {
    console.log(new Date() + ": Discord client disconnected");
    stopLoop();
    client.destroy();
    return;
});
function stopLoop() {
    console.log(new Date() + ": Stopping loop");
    clearInterval(loop);
    return;
}
function startLoop() {
    loop = setInterval(function () { getLastfmData(); }, updateInterval * 1000);
    return;
}
function getLastfmData() {
    http.get("http://ws.audioscrobbler.com/2.0/"
        + "?method=" + "user.getrecenttracks"
        + "&user=" + lastfmUsername
        + "&api_key=" + lastfmApiKey
        + "&limit=" + "1"
        + "&format=json", function (resp) {
        var data = '';
        resp.on('data', function (chunk) {
            data += chunk;
        });
        resp.on('end', function () {
            var dataJSON = JSON.parse(data);
            updateDiscordStatus(dataJSON.recenttracks.track[0]);
            return;
        });
    }).on('error', function (err) {
        console.log(new Date() + ": Last.fm API Error:" + err.message);
        return;
    });
    return;
}
function updateDiscordStatus(trackData) {
    // let isNowPlaying:boolean = trackData["@attr"].nowplaying;
    var artist = trackData.artist["#text"];
    var album = trackData.album["#text"];
    var song = trackData.name;
    if (client.status == Discord.Constants.Status["READY"]) {
        var status_1 = artist + " - " + song;
        console.log(new Date() + ": Set status to: " + status_1);
        client.user.setActivity(status_1, { type: "LISTENING" });
    }
    else {
        console.log(new Date() + ": Discord client not connected");
        stopLoop();
        client.destroy();
    }
}
process.on('SIGINT', function () {
    stopLoop();
    console.log(new Date() + ": Closing");
    client.destroy();
    process.exit();
});

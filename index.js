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
client.on('ready', function () {
    console.log(client.user.tag);
});
client.login(discordToken);
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
    });
}).on('error', function (err) {
    console.log("Error:" + err.message);
});
function updateDiscordStatus(trackData) {
    var isNowPlaying = trackData["@attr"].nowplaying;
    var artist = trackData.artist["#text"];
    var album = trackData.album["#text"];
    var song = trackData.name;
    if (isNowPlaying) {
    }
    else {
    }
}
// https.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', (resp) => {
// 	let data = '';
// 	// A chunk of data has been recieved.
// 	resp.on('data', (chunk) => {
// 		data += chunk;
// 	});
// 	// The whole response has been received. Print out the result.
// 	resp.on('end', () => {
// 		console.log(JSON.parse(data).explanation);
// 	});
// }).on("error", (err) => {
// 	console.log("Error: " + err.message);
// });

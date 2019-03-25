const fs    = require('fs');
const http = require('http');
const Discord = require('discord.js');
const client = new Discord.Client();

let configData            = fs.readFileSync('config.json');
let config                = JSON.parse(configData);
let updateInterval:number = config.interval;
let lastfmUsername:string = config.lastfmUsername;
let lastfmApiKey:string   = config.lastfmApiKey;
let discordToken:string   = config.discordToken;
var loop;

client.login(discordToken);

client.on('ready', () => {
	console.log(new Date() + ": Logged into Discord as: " + client.user.tag);
	// client.user.setPresence({ game: { name: "YEET YEET" }, status: "online" });
	startLoop();
	return;
});


client.on('disconnect', () => {
	console.log(new Date() + ": Discord client disconnected");
	stopLoop();
	client.destroy();
	return;
});

function stopLoop(){
	console.log(new Date() + ": Stopping loop");
	clearInterval(loop);
	return;
}

function startLoop (){
	loop = setInterval(function() { getLastfmData() }, updateInterval * 1000);
	return;
}

function getLastfmData(){
	http.get(
		"http://ws.audioscrobbler.com/2.0/"
		+ "?method=" + "user.getrecenttracks"
		+ "&user=" + lastfmUsername
		+ "&api_key=" + lastfmApiKey
		+ "&limit=" + "1"
		+ "&format=json",
		
		(resp) => {
			var data:string = '';
			
			resp.on('data', (chunk) =>{
				data += chunk;
			});
			
			resp.on('end', ()=> {
				var dataJSON = JSON.parse(data);
				updateDiscordStatus(dataJSON.recenttracks.track[0]);
				return;
			});
			
	}).on('error', (err) =>{
		console.log(new Date() + ": Last.fm API Error:" + err.message);
		return;
	});
	return;
}


function updateDiscordStatus(trackData){
	// let isNowPlaying:boolean = trackData["@attr"].nowplaying;
	let artist:string = trackData.artist["#text"];
	let album:string = trackData.album["#text"];
	let song:string = trackData.name;

	if(client.status == Discord.Constants.Status["READY"]){
		let status:string = artist + " - " + song;
		console.log(new Date() + ": Set status to: " + status);
		client.user.setActivity(status, { type: "LISTENING" });
	} else {
		console.log(new Date() + ": Discord client not connected");
		stopLoop();
		client.destroy();
	}
}

process.on('SIGINT', function(){
	console.log(new Date() + ": Closing");
	stopLoop();
	client.destroy();
	process.exit();
});
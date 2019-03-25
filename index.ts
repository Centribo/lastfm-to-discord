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

client.on('ready', () => {
	console.log(client.user.tag);
});

client.login(discordToken);

http.get(
	"http://ws.audioscrobbler.com/2.0/"
	+ "?method=" + "user.getrecenttracks"
	+ "&user=" + lastfmUsername
	+ "&api_key=" + lastfmApiKey
	+ "&limit=" + "1"
	+ "&format=json",
	
	(resp) => {
		let data:string = '';
		
		resp.on('data', (chunk) =>{
			data += chunk;
		});
		
		resp.on('end', ()=> {
			let dataJSON = JSON.parse(data);
			
			updateDiscordStatus(dataJSON.recenttracks.track[0]);
		});
		
}).on('error', (err) =>{
		console.log("Error:" + err.message);
});

function updateDiscordStatus(trackData){
	let isNowPlaying:boolean = trackData["@attr"].nowplaying;
	let artist:string = trackData.artist["#text"];
	let album:string = trackData.album["#text"];
	let song:string = trackData.name;

	if(isNowPlaying){

	} else {

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
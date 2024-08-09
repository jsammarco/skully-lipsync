//DOWNLOAD SONG
//yt-dlp -f "ba" -x --audio-format mp3 ytsearch:"Billie Jean" -o "%(title)s.%(ext)s"
//yt-dlp -f "ba" -x --audio-format mp3 ytsearch:"System of a Down Toxicity" -o "System of a Down Toxicity.%(ext)s"

//CONVERT SONG
//spleeter separate -p spleeter:5stems -o output5stem "System.mp3"

//PLAY SONG
//ffplay -af astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level -i C:\Users\Joe\Downloads\output5stem.mp3\queen\vocals.wav

/*
 *        ,-.-,-,
 *      _/ / / /       /)
 *    ,'        `.   ,'')
 *  _/(@) `.      `./ ,')
 * (____,`  \:`-.   \ ,')
 *  (_      /::::}  / `.)
 *   \    ,' :,-' ,)\ `.)
 *    `.        ,')  `..)
 *      \-....-'\      \) w
 *       `-`-`-`-`
 */
const pathLib = require('path');
const dgram = require('dgram');
const client = dgram.createSocket('udp4');
const udp_ip = "192.168.1.255"; //192.168.1.116
const udp_port = 2390;
const mv = require('mv');
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline');
const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
var spawn = require('child_process').spawn;
var downloadSuccess = false;
var convertSuccess = false;
var beatValue = 0;
var otherValue = 0;
var folder = __dirname;
console.log("DIR", folder);
var vocal_min = -35;
var vocal_max = -18;
var drum_min = -38;
var drum_max = -18;
var other_min = -38;
var other_max = -18;
var vocalCmdClosed = true;
var headTurnPos = 3;
var headTurn = false;
var headTurnTimer = null;
var headTurnDelay = 500;
var debounceTimer = null;
var paused = false;
const portname = "COM4";
var portOpen = false;
var lastComMsgIn = "";
var lastComMsgOut = "";
var lastNeckPos = 0;
var lastMouthPos = 0;
var db = 2;
var relay1LastTimeOn = new Date().getTime();
var relay2LastTimeOn = new Date().getTime();
var relay1LastTimeOff = new Date().getTime();
var relay2LastTimeOff = new Date().getTime();
var relay1 = 0;
var relay2 = 0;
const noUSB = true; //TRUE for UDP only
var skipUDPCount = 1;
var udpCounter = 0;

if (!noUSB) {
	const port = new SerialPort({
	  path:portname,
	  baudRate:19200
	});
	const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

	// Read the port data
	port.on("open", () => {
	  console.log('serial port opened');
	  portOpen = true;
	});
	port.on("close", () => {
	  console.log('serial port closed');
	  portOpen = false;
	});
	parser.on('data', data =>{
	  // console.log('got word from arduino:', data);
	  data = String(data).trim();
	  if (data == "") { return false; }
	  lastComMsgIn = data;
	});
}

setInterval(function () {
	vocal_max = -18;
}, 5000);
// var songName = "Creedence Clearwater Revival - Green River";
var songName = "";
//No slashes or weird characters.
var songList = [ 
	// "Speaker Sound Test Check Bass Treble Pan and Vocals",
	"why georgia john mayer",
	"So Doggone Lonesome - Johnny Cash",
	"Ariana Grande - we can't be friends",
	"Life is Good - The Hunts",
	"Mad Jino - Bum",
	"Vic Sage - OMG",
	"Semo - Low Again",
	"Alice In Chains - Them Bones", 
	"midnight city by m83", 
	"Céline Dion - My Heart Will Go On", 
	"Imagine Dragons - Nice to Meet You", 
	"The Chainsmokers - Summertime Friends", 
	"Chop Suey – System Of A Down", 
	"September – Earth, Wind, and Fire", 
	"Blurred Lines Robin Thicke Pharrell Williams", 
	"Thrift Shop (feat. Wanz) (Clean Radio Edit)", 
	"Respect - Aretha Franklin", 
	"Every Breath You Take - The Police", 
	"Sultans Of Swing - Dire Straits", 
	"The Who - My Generation", 
	// "Imagine - John Lennon", 
	"Smells Like Teen Spirit - Nirvana", 
	"Can’t stop the feeling film version justin timberlake", 
	"Zombie by The Cranberries", 
	"Lil Dicky - Earth (Clean Version) Cleanmusic.mp3", 
	"Alors on Danse by Stromae", 
	"Beggin by Maneskin", 
	// "Frank Sinatra - Fly Me To The Moon", 
	"Vegas by Doja Cat", 
	"I Like You by Post Malone",
	"As It Was by Harry Styles", 
	"you're so vain carly simon", 
	"stressed out twenty one pilots", 
	"System Of A Down - Sugar", 
	"Rob Zombie - Dragula", 
	"Toxicity System of a Down",
	"Highway to Hell ACDC", 
	"Girls like you - Maroon 5", 
	"24kGoldn - Mood", 
	"The Kid - Stay", 
	"Olivia Rodrigo - good 4 u", 
	"Sub Urban Cradles", 
	"Count on Me - Bruno Mars", 
	"Eiffel 65 - I'm blue", 
	"Foo Fighters - Everlong Official HD Video", 
	// "Dean Martin - Volare",
	// "Hex Girls Singing I'm  gonna put a spell", 
	"Stayin alive bee gees", 
	"Running up the hill - kate bush", 
	"Onderkoffer - IT Halloween Trap Remix", 
	"Etta James – At Last", 
	"Spooky scary Skeletons (Remix) (Extended Mix)",
	"Imagine Dragons Bones", 
	// "Elton John Rocketman", 
	// "Louis Armstrong - What A Wonderful World Original Spoken Intro Version", 
	"Frank Sinatra – The Way You Look Tonight", 
	"Elvis Presley – Can’t Help Falling In Love", 
	"system of a down prison", 
	"another one bites the dust queen", 
	"enter the sandman Metallica", 
	"Thriller Michael Jackson shortened version",
	"Creedence Clearwater Revival Have you ever seen the rain",
	"The Nightmare Before Christmas This is Halloween",
	"Onderkoffer - IT Halloween Trap Remix", 
	"TheFatRat - MAYDAY feat. Laura Brehm", 
	"Blue Oyster Cult Don't Fear The Reaper",
	"Adams family theme song",
	"Monster Mash", 
	"Jamming bob marley",
	"Stayin alive bee gees", 
	"Star Wars Imperial March Reyrzy Remix", 
	"Punyaso - FLOAT TOO", 
	"Jeeper Creepers Song", 
	"Psycho Killer Talking Heads", 
	"enter the sandman Metallica", 
	"Radioactive Imagine Dragons", 
	"Bark at the moon ozzy osbourne", 
	"rocky horror picture show time warp", 
	"Day-o Beetlejuice banana boat song", 
	"This is halloween Tim burton's Nightmare before Christmas", 
	"Tainged Love Broken Peach Halloween Special", 
	"Don't Stop Beleivin Journey",
	"Superstition by stevie wonder", 
	"AC DC - Highway to Hell", 
	"Bow Wow - I Want Candy", 
	"the youth of the nation", 
	"Scary movie wassup remix", 
	"Blame Calvin Harris", 
	"Phenoix - Alpha Zulu", 
	"Rock Superstar Cypress Hill", 
	"Insane in the brain Cypress Hill", 
	"Rob Zombie - Superbeast Girl on a motorcycle mix", 
	"Sweet Dreams (Are Made of this)", 
	// "I Put a spell on you song", 
	"Come Little Children",
	"Tragedy strikes at spirit acre farms spirit halloween", 
	"Huggy wuggy song free hugs poppy playtime",
	"Cartoon Cat Run Away",
	"Nightcore Ghost Scary Song",
	"Spooky scary Skeletons (Remix) (Extended Mix)", 
	"Talking Heads - Psycho Killer", 
	"Nina Simone - I put a spell on you", 
	"Ava Max - Sweet But Psycho", 
	"The Police - Every Breath You Take", 
	"Rob Zombie - Living Dead Girl", 
	"Rockwell - Somebody's watching me", 
	"The Yeah Yeah Yeahs - Heads will roll a-trak Remix", 
	"Alice Cooper - Feed My Frankenstein", 
	"Frank Sinatra - Witchcraft", 
	"I Don't Want to Miss a Thing", 
	"Imagine Dragons Bones", 
	"Ghostbusters by Ray Parker",
	"Grinch Song", 
	"Jason Aldean", 
	"Linkin Park", 
	"Dean Martin - That's Amore", 
	// "You are so beautify to me",
];
var currentSongIndex = 0;

setInterval(function () {
	if(vocalCmdClosed && currentSongIndex == songList.length - 1){
		currentSongIndex = 0;
		console.log("DONE RESTART");
		//return process.exit();
	}
	if(vocalCmdClosed && !paused){
		vocalCmdClosed = false;
		play(songList[currentSongIndex]);
	}
}, 3000);

process.stdin.on('keypress', (c, k) => {
	if(k.name == "right"){
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(function() {
			nextSong();
		}, 300);
	}
	if(k.name == "space"){
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(function() {
			stopSong();
		}, 300);
	}
});	

// process.stdin.on('keypress', (c, k) => {
// 	debounce(() => {
// 		pausePlay();
// 	}, 300);
// });	

function stopSong() {
	if(!paused){
		currentSongIndex--;
		console.log("STOPPED SONG");
		spawn('taskkill', ['/F', '/IM', 'ffplay.exe', '/T']);
	}
	paused = !paused;
}

function nextSong(){
	console.log("NEXT SONG");
	spawn('taskkill', ['/F', '/IM', 'ffplay.exe', '/T']);
}

function play(songName) {
	if (!songName || songName == "") { return; }
	console.log("PLAYING", currentSongIndex);
	try {
		console.log(folder+"/output5stem/"+songName+"/vocals.wav");
	  	if (fs.existsSync(folder+"/output5stem/"+songName+"/vocals.wav")) {
	  		console.log("File Exists");
	  		return playSong(folder+"/"+songName+".mp3", 
					folder+"/output5stem/"+songName+"/vocals.wav",
					folder+"/output5stem/"+songName+"/drums.wav",
					folder+"/output5stem/"+songName+"/other.wav");
		}else{
	  		console.log("File Does Not Exist. Downloading and converting.");
			return downloadConvertPlay(songName);
		}
	} catch(err) {
		console.error(err);
	}
}
// askForSong();

function askForSong(){
	rl.question('Pick a song, Any song? ', function (name) {
		if (name == "") {
			console.log("Aww. no song???  Bye");
			return process.exit();
		}
		songName = name;
		try {
		  	if (fs.existsSync(folder+"/output5stem/"+songName+"/vocals.wav")) {
		  		playSong(folder+"/"+songName+".mp3", 
						folder+"/output5stem/"+songName+"/vocals.wav",
						folder+"/output5stem/"+songName+"/drums.wav",
						folder+"/output5stem/"+songName+"/other.wav");
			}else{
				return downloadConvertPlay(songName);
			}
		} catch(err) {
			console.error(err);
		}
	});
}

rl.on('close', function () {
  console.log('\nBYE BYE !!!');
  process.exit(0);
});

// playSong(folder+"/"+songName+".mp3", 
// 		folder+"/output5stem/"+songName+"/vocals.wav",
// 		folder+"/output5stem/"+songName+"/drums.wav",
// 		folder+"/output5stem/"+songName+"/other.wav");
// // process.abort();

function downloadConvertPlay(songName) {
	var downloadCmd = spawn('yt-dlp', ['-f', 'ba', '-x', '--audio-format', 'mp3', 'ytsearch:'+songName, '-o', songName+'.%(ext)s']);
	downloadCmd.on('close', function(code) {
	    console.log('DownloadCmd closing code: ' + code + " DOWNLOAD " + (downloadSuccess ? "SUCCESS" : "FAILED"));
	    if(downloadSuccess){
	    	convertSong(songName+".mp3", songName);
	    }
	});
	downloadCmd.on('error', function (err) {
		console.log('DownloadCmd error', err);
	});
	downloadCmd.stdout.on('data', function(data) {
	    console.log('DownloadCmd stdout: ' + data);
	    if (data.indexOf('Finished downloading') > -1) {
	    	downloadSuccess = true;
	    }
	});
	downloadCmd.stderr.on('data', function(data) {
		data = data.toString();
		console.log("DownloadCmd Data", data);
	});
}

function convertSong(path, songName) {
	console.log("Processing with A.I. Please wait.");
	// var spleeterCmd = spawn('spleeter', ['separate', '-p', 'spleeter:5stems', '-o', 'output5stem', path]);
	var spleeterCmd = spawn('spleeter', ['separate', '-p', 'spleeter:5stems', '-o', 'output5stem', path]);
	console.log(spleeterCmd.spawnargs);
	spleeterCmd.stdout.on('data', function(data) {
	    console.log('stdout: ' + data);
		data = data.toString();
	    if (data.indexOf('vocals.wav written succesfully') > -1) {
			convertSuccess = true;
		}
	});
	spleeterCmd.stderr.on('data', function(data) {
	    console.log('spleeterCmd stderr: ' + data);
	});
	spleeterCmd.on('close', function(code) {
	    console.log('spleeterCmd closing code: ' + code + " SEPARATE " + (convertSuccess ? "SUCCESS" : "FAILED"));
	    if(convertSuccess){
	    	//Move folder out of mdx_extra folder
	    	// mv(folder+"/mdx_extra/"+songName, folder+"/"+songName, function(err) {
			   //  if (err) {
			   //      throw err
			   //  } else {
			        console.log("Successfully moved the folder!");
			        // playSong(folder+"/"+songName+".mp3", folder+"/output5stem/"+songName+"/vocals.wav", folder+"/output5stem/"+songName+"/drums.wav", folder+"/output5stem/"+songName+"/other.wav");
			        //playSong(folder+"/"+songName+".mp3", folder+"/output5stem/"+songName+"/vocals.mp3", folder+"/output5stem/"+songName+"/drums.mp3", folder+"/output5stem/"+songName+"/other.mp3");
			        vocalCmdClosed = true;
			//     }
			// });
	    }
	});
	spleeterCmd.on('error', function (err) {
		console.log('spleeterCmd error', err);
	});
}

function playSong(path, vocalPath, drumPath, otherPath){


  const pitchDataPath = vocalPath.slice(0,-11) + "/pitch.csv";
  let pitchData = [];
// Ensure the directory for the pitch data file exists
const ensureDirectoryExistence = (filePath) => {
  const dirname = pathLib.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
};

if (!fs.existsSync(pitchDataPath)) {
  console.log('Extracting pitch data...');
  ensureDirectoryExistence(pitchDataPath);
  const aubioPitchCmd = spawn('aubio', ['pitch', vocalPath]);

  const writeStream = fs.createWriteStream(pitchDataPath);
  aubioPitchCmd.stderr.on('data', function(data) {
    writeStream.write(data);
  });

  aubioPitchCmd.on('close', (code) => {
    writeStream.end();
    console.log('Pitch data extraction completed.');

    // Read the pitch data after extraction
    const rl = readline.createInterface({
      input: fs.createReadStream(pitchDataPath),
      crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      const [timestamp, pitch] = line.split(',').map(parseFloat);
      pitchData.push({ timestamp, pitch });
    });

    rl.on('close', () => {
	    console.log('Pitch data loaded', pitchData);
	    process.abort();
      // startFFplay(path, vocalPath, drumPath, otherPath, pitchData);
    });
  });
} else {
  // Read the pitch data if it already exists
  const rl = readline.createInterface({
    input: fs.createReadStream(pitchDataPath),
    crlfDelay: Infinity
  });

  rl.on('line', (line) => {
    const [timestamp, pitch] = line.split(',').map(parseFloat);
    pitchData.push({ timestamp, pitch });
  });

  rl.on('close', () => {
    console.log('Pitch data loaded', pitchData);
    process.abort();
    // startFFplay(path, vocalPath, drumPath, otherPath, pitchData);

  });
}



	console.log("Playing "+path);
	console.log("Vocals "+vocalPath);
	var ffplayVocalsCmd = null;
	var songCmd = null;
	var ffplayDrumsCmd = spawn('ffplay', ['-autoexit', '-volume', '0', '-af', 'astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level', '-nodisp', '-i', drumPath]);
	// setTimeout(function(){
	// const aubioPitchCmd = spawn('aubio', ['pitch', vocalPath]);
		ffplayVocalsCmd = spawn('ffplay', ['-autoexit', '-volume', '0', '-af', 'astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level', '-nodisp', '-i', vocalPath]);
	// }, 0);
	var ffplayOtherCmd = spawn('ffplay', ['-autoexit', '-volume', '0', '-af', 'astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level', '-nodisp', '-i', otherPath]);
	songCmd = spawn('ffplay', ['-autoexit', '-volume', '100', '-nodisp', '-i', path]);
	ffplayDrumsCmd.stderr.on('data', function(data) {
		data = data.toString();
	    // console.log('stderr: ' + data);
	    if (data.indexOf("Overall.RMS_level=") === -1) { return; }
	    var rms = data.substring(
		    data.indexOf("Overall.RMS_level=") + 18, 
		    data.indexOf("Overall.RMS_level=") + 18 + 5
		);
		rms = parseInt(rms);
		// if(rms + 40 < drum_min){ //-38
		// 	drum_min = rms + 40;
		// }
		if(rms > drum_max){ //-10
			drum_max = rms;
		}
		// console.log('Drum RMS_level: ', rms, 'Min: ', drum_min, 'Max: ', drum_max);
		var val = Math.round((Math.max(1,  Math.min(5, convertRange(rms, [drum_min, drum_max], [1,5])))) * 100) / 100;
		beatValue = val;
	});
	ffplayOtherCmd.stderr.on('data', function(data) {
		data = data.toString();
	    // console.log('stderr: ' + data);
	    if (data.indexOf("Overall.RMS_level=") === -1) { return; }
	    var rms = data.substring(
		    data.indexOf("Overall.RMS_level=") + 18, 
		    data.indexOf("Overall.RMS_level=") + 18 + 5
		);
		rms = parseInt(rms);
		// if(rms + 40 < drum_min){ //-38
		// 	drum_min = rms + 40;
		// }
		if(rms > other_max){ //-10
			other_max = rms;
		}
		// console.log('Other RMS_level: ', rms, 'Min: ', other_min, 'Max: ', other_max);
		var val = Math.round((Math.max(1,  Math.min(5, convertRange(rms, [other_min, other_max], [1,5])))) * 100) / 100;
		otherValue = val;
	});
	ffplayVocalsCmd.stdout.on('data', function(data) {
	    console.log('stdout: ' + data);
	});
	// aubioPitchCmd.stdout.on('data', function(data) {
	//     const currentPitch = data.toString().split('\n').filter(line => line.trim() !== '').map(line => parseFloat(line));
	//     avgPitch = currentPitch.reduce((acc, pitch) => acc + pitch, 0) / currentPitch.length;
	//     // console.log('Average Pitch:', avgPitch);
	// });
	ffplayVocalsCmd.stderr.on('data', function(data) {
		data = data.toString();
	    // console.log('stderr: ' + data);
	    if (data.indexOf("Overall.RMS_level=") === -1) { return; }
	    var rms = data.substring(
		    data.indexOf("Overall.RMS_level=") + 18, 
		    data.indexOf("Overall.RMS_level=") + 18 + 5
		);
		rms = parseInt(rms);
		if (isNaN(rms)) {
			rms = -20;
		}
		// if(rms + 20 < vocal_min){ //38
		// 	vocal_min = rms + 20;
		// }
		if(rms > vocal_max){ //10
			vocal_max = rms;
		}
		console.clear();
		// console.log(portname+" "+(portOpen ? "Open" : "Closed")+"\n Last Msg Out: "+lastComMsgOut+" Last Msg In: "+lastComMsgIn);
		console.log("currentSong", songList[currentSongIndex]);
		console.log("currentSongIndex", currentSongIndex);
		// console.log('Vocal RMS_level: ' + rms, 'Min: ', vocal_min, 'Max: ', vocal_max);
		var val = Math.round((Math.max(0,  Math.min(6, convertRange(rms, [vocal_max - 25, vocal_max], [0,6])))) * 100) / 100;
		if (rms < -20) {
			val = 0;
		}
		// if (rms > vocal_max - 5 && vocal_max > 18 && val > 4) {
		// 	if(randomInt(1, 3) == 3){
		// 		val = 2;
		// 		console.log("LJHSADLASJHD");
		// 	}
		// }
		console.log("Vocal RMS:", rms);
		console.log("Vocal Min:", vocal_min);
		console.log("Vocal Max:", vocal_max);
		if (isNaN(val)) { val = 0; }
		console.log('Value: ' + Math.round(val));
		for (var i = 0; i < 3; i++) {
			console.log("");
		}
		// console.log("         =====");
		// console.log("|\\      ====0===");
		// console.log("| --- ===========");
		// // if (rms > -30) {
		// 	for (var i = 0; i < val; i++) {
		// 		console.log("|    ===");
		// 	}
		// // }
		// console.log("|/-- ===========");
		// console.log("/     =========");
		// console.log("       ======");
		if(val > 4 && randomInt(1, 128) == 8){
			clearTimeout(headTurnTimer);
			headTurn = true;
			headTurnPos = randomInt(0, 5);
			if (headTurnPos == 3) { headTurnPos = headTurnPos + randomInt(-1, 1); }
			Math.max(1,  Math.min(5, headTurnPos));
		}else if(val > 3 && randomInt(1, 128) == 8){
			headTurnTimer = setTimeout(function(){
				headTurn = false;
				headTurnPos = 3;
			}, headTurnDelay);
		}else if(val < 2 && randomInt(1, 128) == 8){
			headTurnTimer = setTimeout(function(){
				headTurn = false;
				headTurnPos = 3;
			}, headTurnDelay);
		}

		var neckPos = Math.round(Math.max(21,  Math.min(131, convertRange(headTurnPos, [1, 5], [21,131]))));
		var mouthPos = val; //Math.round(Math.max(51,  Math.min(151, convertRange(val, [1, 5], [51,151]))));

		if(val < 0){
			console.log("\
	  ╭━╮\n\
	╭╮┃╮┃\n\
	╰╯┃┃┃\n\
	╭╮┃┃┃\n\
	╰╯┃╯┃\n\
	  ╰━╯");
		}else if (val < 2) {
			console.log("\
	\n\
	╭╮╭━━╮\n\
	╰╯┃╭╮┃\n\
	╭╮┃╰╯┃\n\
	╰╯╰━━╯\n");
		}else if(val < 3){
			console.log("\
	  ╭━━━╮\n\
	╭╮┃╭━╮┃\n\
	╰╯┃┃ ┃┃\n\
	╭╮┃┃ ┃┃\n\
	╰╯┃╰━╯┃\n\
	  ╰━━━╯");
		}else if(val < 4){
			console.log("\
	  ╭━━━━╮\n\
	╭╮┃╭━━╮┃\n\
	╰╯┃┃  ┃┃\n\
	╭╮┃┃  ┃┃\n\
	╰╯┃╰━━╯┃\n\
	  ╰━━━━╯");
		}else if(val < 5){
			console.log("\
	  ╭━━━━━╮\n\
	╭╮┃╭━━━╮┃\n\
	╰╯┃┃   ┃┃\n\
	╭╮┃┃   ┃┃\n\
	╰╯┃╰━━━╯┃\n\
	  ╰━━━━━╯");
	// 	}else if(val < 6){
	// 		console.log("\
	//   ╭━━━━━━╮\n\
	// ╭╮┃╭━━━━╮┃\n\
	// ╰╯┃┃    ┃┃\n\
	// ╭╮┃┃    ┃┃\n\
	// ╰╯┃╰━━━━╯┃\n\
	//   ╰━━━━━━╯");
		}else if(val >= 6){
			console.log("\
	  ╭━━━━━━╮\n\
	╭ ┃╭━━━━╮┃\n\
	╰ ┃┃    ┃┃\n\
	╭ ┃┃    ┃┃\n\
	╰ ┃╰━━━━╯┃\n\
	  ╰━━━━━━╯");
		}else{
			console.log("\
	  ╭━╮\n\
	╭╮┃╮┃\n\
	╰╯┃┃┃\n\
	╭╮┃┃┃\n\
	╰╯┃╯┃\n\
	  ╰━╯");
		}
		for (var i = 0; i < 2; i++) {
			console.log("");
		}

		if(headTurn){
			console.log("--Head Turned-- "+headTurnPos);
		}else{
			console.log("==Head Forward== "+headTurnPos);
		}
		var beatStr = "";
		for (var i = 0; i < Math.min(6,beatValue); i++) {
			beatStr += "=";
		}
		var otherStr = "";
		for (var i = 0; i < Math.min(6,otherValue); i++) {
			otherStr += "=";
		}
		console.log("Drum: ", beatStr);
		console.log("Other: ", otherStr);
		if(otherValue > 2.8 && (new Date().getTime() - relay1LastTimeOn > 500 || relay1 === 1)){
			relay1 = 1;
			relay1LastTimeOn = new Date().getTime();
		console.log("\
     \`  __  -\n\
   - .\"\`  \`\". -\n\
  - /   /\   \\ -\n\
 > |    \/    | <\n\
  . \\   ()   / ,\n\
    .'.____.' ,\n\
      {_.=\"}\n\
      {_.=\"}\n\
      `-..-`");
		}else if(otherValue < 3.0 && new Date().getTime() - relay1LastTimeOff > 500 || relay1 === 0){
			relay1 = 0;
			relay1LastTimeOff = new Date().getTime();
		console.log("\
        __\n\
     .\"`  `\".\n\
    /   /\   \\\n\
   |    \/    |\n\
    \\   ()   /\n\
     '.____.'\n\
      {_.=\"}\n\
      {_.=\"}\n\
      `-..-`");
		}else{
		console.log("\
        __\n\
     .\"`  `\".\n\
    /   /\   \\\n\
   |    \/    |\n\
    \\   ()   /\n\
     '.____.'\n\
      {_.=\"}\n\
      {_.=\"}\n\
      `-..-`");
		}
		if(beatValue > 3.5 && (new Date().getTime() - relay2LastTimeOn > 200 || relay2 === 1)){
			relay2 = 1;
			relay2LastTimeOn = new Date().getTime();
		console.log("\
   \\       /\n\
    \\     /   \n\
   __o____o___\n\
  |___________|\n\
   |\\  /\\  /\\|\n\
   |_\\/__\\/__|\n\
  |___________|");
		}else if(beatValue < 3.0 && new Date().getTime() - relay2LastTimeOff > 200 || relay2 === 0){
			relay2 = 0;
			relay2LastTimeOff = new Date().getTime();
		console.log("\
	\n\
======o     o======\n\
   ___________\n\
  |___________|\n\
   |\\  /\\  /\\|\n\
   |_\\/__\\/__|\n\
  |___________|");
		}else{
		console.log("\
	\n\
======o     o======\n\
   ___________\n\
  |___________|\n\
   |\\  /\\  /\\|\n\
   |_\\/__\\/__|\n\
  |___________|");
		}
		// if (neckPos > lastNeckPos+db || neckPos < lastNeckPos-db || mouthPos > lastMouthPos+db || mouthPos < lastMouthPos-db) {
			var serialMsg = neckPos+','+mouthPos+','+relay1+','+relay2+'\n';
			var udp_msg = serialMsg;
			var udp_msg_len = udp_msg.length;
			console.log(serialMsg);
			udpCounter++;
			if (udpCounter % skipUDPCount == 0) {
				console.log("sent", udpCounter)
				client.send(udp_msg, 0, udp_msg_len, udp_port, udp_ip);
				udpCounter = 0;
			}
			if (!noUSB) {
				port.write(serialMsg, (err) => {
					lastComMsgOut = serialMsg;
					if (err) {
					  return console.log('Error on write: ', err.message);
					}
					console.log('Serial Msg Out: '+serialMsg);
				});
			}
    // Get the corresponding pitch value
    const elapsedTime = parseFloat(data.split('time=')[1].split(' ')[0]);
    const closestPitch = pitchData.reduce((prev, curr) => Math.abs(curr.timestamp - elapsedTime) < Math.abs(prev.timestamp - elapsedTime) ? curr : prev);
    console.log('Pitch:', closestPitch.pitch);
		// }
	});
	ffplayVocalsCmd.on('close', function(code) {
	    console.log('ffplayVocalsCmd closing code: ' + code);
	    vocalCmdClosed = true;
		currentSongIndex += 1;
	});
	ffplayVocalsCmd.on('error', function (err) {
		console.log('ffplayVocalsCmd error', err);
	    // vocalCmdClosed = true;
	});
}

function convertRange( value, r1, r2 ) { 
    return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
}


function randomInt(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

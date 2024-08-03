const dgram = require('dgram');
const client = dgram.createSocket('udp4');
const udp_ip = "192.168.1.105";
const udp_port = 2390;
const mic = require('mic');
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline');
const fs = require('fs');
const VUMeter = require('vu-meter');
const meter = new VUMeter();
// const portname = "/dev/cu.usbmodem14601"; //COM4
const portname = "/dev/null"; //COM4
var portOpen = false;
const noUSB = true; //TRUE for UDP only

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

var micInstance = mic({
    rate: '44100',
    channels: '1',
    debug: false,
    exitOnSilence: 10
});
var micInputStream = micInstance.getAudioStream();

// var outputFileStream = fs.WriteStream('output.raw');

// micInputStream.pipe(outputFileStream);

micInputStream.pipe(meter);
 
meter.on('data', (data) => {
	// var val = data.reduce((a, b) => a + b) / data.length;
	var val = data[0];
	val = convertRange( val, [-70, -10], [-1, 5] );
	val = Math.floor(Math.round( Math.max(0, Math.min(6, val)) * 100 ) / 100);
	// console.log(val);
	var neckPos = 2;
	var mouthPos = val;
	var relay1 = mouthPos > 4 ? 1 : 0;
	var relay2 =  mouthPos > 4 ? 1 : 0;
	var serialMsg = neckPos+','+mouthPos+','+relay1+','+relay2+'\n';
	console.log(serialMsg);
	var udp_msg = serialMsg;
	var udp_msg_len = udp_msg.length;
	client.send(udp_msg, 0, udp_msg_len, udp_port, udp_ip);
	if (!noUSB) {
		port.write(serialMsg, (err) => {
			lastComMsgOut = serialMsg;
			if (err) {
			  return console.log('Error on write: ', err.message);
			}
			// console.log('Serial Msg Out: '+serialMsg);
		});
	}
});


// micInputStream.on('data', function(data) {
//     console.log("Recieved Input Stream: " + data.length);
// });

// micInputStream.on('error', function(err) {
//     console.log("Error in Input Stream: " + err);
// });

// micInputStream.on('sound', function(err, e) {
//     console.log("Error in Input Stream: ", err, e);
// });

// micInputStream.on('startComplete', function() {
//     console.log("Got SIGNAL startComplete");
//     setTimeout(function() {
//             micInstance.pause();
//     }, 5000);
// });
    
// micInputStream.on('stopComplete', function() {
//     console.log("Got SIGNAL stopComplete");
// });
    
// micInputStream.on('pauseComplete', function() {
//     console.log("Got SIGNAL pauseComplete");
//     setTimeout(function() {
//         micInstance.resume();
//     }, 5000);
// });

// micInputStream.on('resumeComplete', function() {
//     console.log("Got SIGNAL resumeComplete");
//     setTimeout(function() {
//         micInstance.stop();
//     }, 5000);
// });

micInputStream.on('silence', function() {
    console.log("Got SIGNAL silence");
	var neckPos = 2;
	var mouthPos = 0;
	var relay1 = 0;
	var relay2 = 0;
	var serialMsg = neckPos+','+mouthPos+','+relay1+','+relay2+'\n';
	var udp_msg = serialMsg;
	var udp_msg_len = udp_msg.length;
	client.send(udp_msg, 0, udp_msg_len, udp_port, udp_ip);
	if (!noUSB) {
		port.write(serialMsg, (err) => {
			lastComMsgOut = serialMsg;
			if (err) {
			  return console.log('Error on write: ', err.message);
			}
			// console.log('Serial Msg Out: '+serialMsg);
		});
	}
});

micInputStream.on('processExitComplete', function() {
    console.log("Got SIGNAL processExitComplete");
});

micInstance.start();


function convertRange( value, r1, r2 ) { 
    return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
}
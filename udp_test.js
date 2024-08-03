var dgram = require('dgram');

var client = dgram.createSocket('udp4');
var udp_ip = "192.168.1.105";
var udp_port = 2390;
var msg = "YO Bro!";
var msg_len = msg.length;

client.send(msg, 0, msg_len, udp_port, udp_ip);
var i = 0;
setInterval(function(){
	if (i > 100) {
		return process.exit();
	}
	msg = "YO Bro "+i;
	msg_len = msg.length;
	client.send(msg, 0, msg_len, udp_port, udp_ip);
	i++;
}, 20);

// client.send('Hello World!',0, 12, 12000, '127.0.0.1', function(err, bytes) {
// 	client.close();
// });
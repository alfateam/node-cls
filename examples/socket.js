
let cls = require('../index');
cls.debug = false;
const WebSocket = require('ws');

const ws = new WebSocket('wss://echo.websocket.org');

ws.on('open', () => {
	for (let i = 0; i < 10000; i++) {
		ws.send('hello hello hello');

	}
});

ws.on('message',  async () => {
	if (global.gc)
		global.gc();
});
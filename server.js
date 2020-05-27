"use strict" /* eslint no-warning-comments: [1, { "terms": ["todo", "fix", "help"], "location": "anywhere" }] */ /* eslint-env node */ /* global */;
const debug = !process.env.NODE_ENV;

const express = require("express"),
	app = express(),
	server = app.listen(
		process.env.PORT || process.argv[2] || 8000,
		function expressServerListening() {
			debug && console.log(server.address());
		}
	),
	helmet = require("helmet"),
	io = require("socket.io"),
	listener = io.listen(server);

app.use(express.static("public"));
app.use(helmet());

// Socket.io Control
listener.sockets.on("connection", function connectionDetected(socket) {
	socket.on("refreshRequest", function processRefreshRequest(options) {
		socket.emit("refreshResponse", {});
	});
});


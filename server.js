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
	listener = io.listen(server),
	jsonfile = require("jsonfile"),
	_ = require("lodash");

app.use(express.static("public"));
app.use(helmet());

// Data
const dataFile = "data.json";

// Socket.io Control
listener.sockets.on("connection", (socket) => {
	// send back data
	socket.on("refreshRequest", (clientID) => {
		jsonfile
			.readFile(dataFile)
			.then((currentData) => {
				let newData = _.cloneDeep(currentData);

				socket.emit("refreshResponse", {
					filteredRecords: newData.records.filter(
						(record) => record.clientID === clientID
					),
				});
			})
			.catch((error) => console.error(error));
	});

	// on form submit
	socket.on("formSubmit", (formData) => {
		jsonfile
			.readFile(dataFile)
			.then((currentData) => {
				let newData = _.cloneDeep(currentData);
				newData.records.push(formData);

				jsonfile
					.writeFile(dataFile, newData)
					.then((res) => {
						// refresh response
						socket.emit("refreshResponse", {
							filteredRecords: newData.records.filter(
								(record) =>
									record.clientID === formData.clientID
							),
						});
					})
					.catch((error) => console.error(error));
			})
			.catch((error) => console.error(error));
	});

	socket.on("deleteRecord", (recordInfo) => {
		jsonfile
			.readFile(dataFile)
			.then((currentData) => {
				let newData = _.cloneDeep(currentData);
				newData.records = newData.records.filter(
					(record) =>
						!(
							record.clientID === recordInfo.clientID &&
							record.fornName === recordInfo.fornName &&
							record.formAddr === recordInfo.formAddr &&
							record.formTime === recordInfo.formTime
						)
				);

				jsonfile
					.writeFile(dataFile, newData)
					.then((res) => {
						// refresh response
						socket.emit("refreshResponse", {
							filteredRecords: newData.records.filter(
								(record) =>
									record.clientID === recordInfo.clientID
							),
						});
					})
					.catch((error) => console.error(error));
			})
			.catch((error) => console.error(error));
	});
});

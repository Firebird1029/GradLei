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
	nodemailer = require("nodemailer"),
	inlineBase64 = require("nodemailer-plugin-inline-base64"),
	// Brandon's stuff
	mongoose = require("mongoose");
// End of Brandon's stuff

app.use(express.static("public"));
app.use(helmet());

// Brandon's Fun Stuff

mongoose.Promise = global.Promise;
mongoose.set("useFindAndModify", false);
mongoose.connect(process.env.MONGO_URL, {
	useUnifiedTopology: true,
	useNewUrlParser: true,
});
// mongoose.set("debug", debug);

const mahalogramSchema = new mongoose.Schema({
	sender: String,
	receiver: String,
	content: String,
	message: String,
	recipientSpan: String,
	senderSpan: String,
	creationDate: {
		type: Date,
		default: Date.now
	},
	screenWidth: String,
	picURL: String,
});
const Mahalogram = mongoose.model("Mahalogram", mahalogramSchema);

// End of Brandon's Stuff

// Socket.io Control
listener.sockets.on("connection", function connectionDetected(socket) {
	socket.on("refreshRequest", function processRefreshRequest(options) {
		socket.emit("refreshResponse", {});
	});
	socket.on("makeNewMahalogram", function createNewMahalogram(data) {
		// console.log(data.content);
		main(data).catch(console.error);

		// Brandon's Fun Stuff
		let newMahalogram = new Mahalogram({
			sender: data.sender,
			receiver: data.receiver,
			// content: data.content,
			message: data.message,
			// recipientSpan: data.recipientSpan,
			senderSpan: data.senderSpan,
			screenWidth: data.screenWidth.toString(),
			picURL: data.picURL,
		});
		newMahalogram.save();
		// End of Brandon's Fun stuff

		socket.emit("successMahalogram");
	});
});

// async..await is not allowed in global scope, must use a wrapper
async function main(data) {
	// console.log(data)
	// Generate test SMTP service account from ethereal.email
	// Only needed if you don't have a real mail account for testing
	//let testAccount = await nodemailer.createTestAccount();

	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: "mahalogramshawaii@gmail.com", // generated ethereal user
			pass: process.env.GMAIL_PASSWORD, // generated ethereal password
		},
	});
	// https://github.com/mixmaxhq/nodemailer-plugin-inline-base64
	transporter.use("compile", inlineBase64());
	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: "mahalogramshawaii@gmail.com", // sender address
		to: "mahalogramshawaii@gmail.com", // list of receivers
		bcc: "mahalogramstemp@gmail.com",
		subject: `You Received a Mahalogram from ${data.senderSpan}!`, // Subject line
		html: `<html><body><p>To: ${data.receiver}</p>
			<p><a href="https://mahalograms.punschedule.com"><img src="${data.content}" style="width: 100%;"/></a></p>
			<p>From: ${data.sender}</p>
			<p>Send your own Mahalogram here: <a href="https://mahalograms.punschedule.com">http://tinyurl.com/mahalograms</a></p>
			<p>Project by Anela and Ulala</p>
			</body></html>`, // html body
		attachments: [
			{
				filename: "mahalogram.jpg",
				content: data.content.split("base64,")[1],
				encoding: "base64",
			},
		],
	});

	debug && console.log("Message sent: %s", info.messageId);
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

	// Preview only available when sending through an Ethereal account
	// console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
	// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

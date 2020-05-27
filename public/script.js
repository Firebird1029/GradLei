// id
// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeid(length) {
	var result = "";
	var characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(
			Math.floor(Math.random() * charactersLength)
		);
	}
	return result;
}

// socket io
let socket = io();
let records = [];

if (localStorage.getItem("gradlei_clientid")) {
	socket.emit("refreshRequest", localStorage.getItem("gradlei_clientid"));
} else {
	localStorage.setItem("gradlei_clientid", makeid(50));
}

// https://stackoverflow.com/questions/51848051/convert-json-to-html-table-using-jquery
function tableGenerator(selector, data) {
	$(selector).empty(); // custom
	// data is an array
	var keys = Object.keys(Object.assign({}, ...data)); // Get the keys to make the header
	// Add header
	// var head = "<thead><tr>";
	var head =
		"<thead><tr id='infoHead'><th>Name</th><th>Address</th><th class='dateTimeCol'>Date/Time</th><th></th>";
	// keys.forEach(function (key) {
	// 	head += "<th>" + key + "</th>";
	// });
	$(selector).append(head + "</tr></thead>");
	// Add body
	var body = "<tbody>";
	data.forEach(function (obj) {
		// For each row
		var row = "<tr>";
		keys.forEach(function (key) {
			// For each column
			row += "<td>";
			if (obj.hasOwnProperty(key)) {
				// If the obj doesnt has a certain key, add a blank space.
				row += obj[key];
			}
			row += "</td>";
		});
		row +=
			"<td style='width: 5%; padding: 12px 15px; cursor: pointer;' data-name='" +
			obj.formName +
			"' data-addr='" +
			obj.formAddr +
			"' data-time='" +
			obj.formTime +
			`'><a onclick="deleteRecord('${obj.formName}','${obj.formAddr}','${obj.formTime}')">
				<i class='fa fa-trash' style='color: #272d2d;'></i>
			</a></td>`;
		body += row + "</tr>";
	});
	$(selector).append(body + "</tbody>");
}

socket.on("refreshResponse", (serverRecords) => {
	let recordsToAdd = serverRecords;
	recordsToAdd.filteredRecords.forEach(function (rec) {
		delete rec.clientID;
	});
	records = recordsToAdd;
	console.log(records);

	// generate table
	tableGenerator("#infoTable", records.filteredRecords);

	// TODO get addresses
	// https://stackoverflow.com/questions/47910874/search-address-with-openlayers
	// var data = {
	// 	format: "json",
	// 	addressdetails: 1,
	// 	q: "22 rue mouneyra bordeaux",
	// 	limit: 1,
	// };
	// $.ajax({
	// 	method: "GET",
	// 	url: "https://nominatim.openstreetmap.org",
	// 	data: data,
	// }).done(function (msg) {
	// 	console.log(msg);
	// });
});

// form
$("#newGradForm").submit((event) => {
	// form submitted
	event.preventDefault();
	$("#formName, #formAddr").removeClass("error");

	// confetti
	confetti.start();
	setTimeout(() => {
		confetti.stop();
	}, 1000);

	// check for empty fields -- uses HTML5 required, so no need

	// socket io
	socket.emit("formSubmit", {
		clientID: localStorage.getItem("gradlei_clientid"),
		formName: $("#formName").val(),
		formAddr: $("#formAddr").val(),
		formTime: $("#formTime").val(),
	});

	return false;
});

// delete record
function deleteRecord(name, addr, time) {
	console.log(name, addr, time);
	socket.emit("deleteRecord", {
		clientID: localStorage.getItem("gradlei_clientid"),
		formName: name,
		formAddr: addr,
		formTime: time,
	});
}

// map
var map = new ol.Map({
	target: "map",
	layers: [
		new ol.layer.Tile({
			source: new ol.source.OSM(),
		}),
	],
	view: new ol.View({
		center: ol.proj.fromLonLat([-157.85, 21.315]),
		zoom: 15,
	}),
});

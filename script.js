// API KEY = AIzaSyDHqKwHID0GXuubBlptFp5C8FKyhR2LSYw

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

	// add to peppa pig
	alert($("#formName").val() + ": " + $("#formAddr").val())

})

// no no zone





var public_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRb6vPl53SrR98_gV8G30Rqfgr_orQek-BDPvlGwhtSZmmlqCPy3f36g0lRrO3wqPEuzwW2u_tbc_LI/pub?output=csv';

function init() {
	Papa.parse(public_spreadsheet_url, {
		download: true,
		// header: true,
		complete: showInfo
	})
}

window.addEventListener('DOMContentLoaded', init)

function showInfo(results) {
	var data = results.data
	console.log(data);
}



// no no zone



var map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat([-157.85, 21.315]),
          zoom: 11
        })
      });



/* var map;
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 21.306, lng: -157.8},
		zoom: 10
	});
} */

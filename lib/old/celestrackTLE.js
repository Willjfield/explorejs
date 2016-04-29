var corsURL = "http://cors.io/?u="
var celestrakTypeURL = "http://www.celestrak.com/NORAD/elements/"
var celestrakNORAD = "http://celestrak.com/cgi-bin/TLE.pl?CATNR="

var categories = {
	 newTLE : "tle-new.txt",
	 stations : "stations.txt",
	 visible : "visual.txt",
	 FENGYUNDebris : "1999-025.txt",
	 iridiumDebris : "iridium-33-debris.txt",
	 cosmos2251Debris : "cosmos-2251-debris.txt",
	 BREEZEMDebris : "2012-044.txt",
	 weather : "weather.txt",
	 noaa : "noaa.txt",
	 goes : "goes.txt",
	 earthResources : "resource.txt",
	 searchRescue : "sarsat.txt",
	 disasterMonitor : "dmc.txt",
	 TDRSS : "tdrss.txt",
	 ARGOS : "argos.txt",
	 geostationary : "geo.txt",
	 intelsat : "intelsat.txt",
	 gorizont : "gorizont.txt",
	 raduga : "raduga.txt",
	 molniya : "molniya.txt",
	 iridium : "iridium.txt",
	 orbcomm : "orbcomm.txt",
	 globalstar : "globalstar.txt",
	 amateur : "amateur.txt",
	 experimental : "x-comm.txt",
	 other : "other-comm.txt",
	 GPSOps : "gps-ops.txt",
	 glonassOps : "glo-ops.txt",
	 galileo : "galileo.txt",
	 beidou : "beidou.txt",
	 sbas : "sbas.txt",
	 nnss : "nnss.txt",
	 RussianLEONav : "musson.txt",
	 science : "science.txt",
	 geodetic : "geodetic.txt",
	 engineering : "engineering.txt",
	 education : "education.txt",
	 military : "military.txt",
	 radar : "radar.txt",
	 cubesats : "cubesat.txt",
	 other : "other.txt"
}
//classified
//http://blog.another-d-mention.ro/programming/read-load-files-from-zip-in-javascript/
var classified = "https://www.prismnet.com/~mmccants/tles/classfd.zip"

var xmlhttp = new XMLHttpRequest();

function getTLE(query, satellites, callback){
	var url;
	if(query in categories){
		url = corsURL + celestrakTypeURL + categories[query]
	}else{
		console.log("not a valid query")
		return 0;
	}
	xmlhttp.open("GET", url, true);
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		    var tleresponse = xmlhttp.responseText;
		    tleresponse = tleresponse.split('\n');
		    tleresponse.splice(tleresponse.length-1)
		    for(var s = 0; s<tleresponse.length;s+=3){
		    		satellites.push({
		    			id: tleresponse[s].replace(/\s/g, ''),
		    			line1 : tleresponse[s+1],
		    			line2 : tleresponse[s+2]
		    		})
		        }
	    }
	    callback();
	}
	xmlhttp.send(null);
}
	/* EXAMPLE:
	var stations = []
	getTLE("stations", stations, function(){
	console.log(stations)
	})
*/


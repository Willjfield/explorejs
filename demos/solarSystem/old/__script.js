var tleLine1 = "1 25544U 98067A   16072.60311259  .00012306  00000-0  19343-3 0  9998"
var tleLine2 = "2 25544  51.6438 179.7093 0001431 279.1916 222.9068 15.54042739989958"
var tlObj = new xpl.tle(tleLine1,tleLine2);
var xyz = tlObj.update();

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 65, window.innerWidth/window.innerHeight, 0.000001, 1000 );
camera.position.set(0,0,100)

var focusedPlanet = 2

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var controls = new THREE.OrbitControls(camera);
				controls.enableDamping = true;
				controls.dampingFactor = 0.25;
				controls.minDistance = 0;
				controls.minPolarAngle = 0; // radians
				controls.maxPolarAngle = Infinity;

				controls.zoomSpeed = 1
				controls.rotateSpeed = 1
				controls.panSpeed = 1

                var light = new THREE.PointLight( 0xffffff, 1.5, 0 );
light.position.set( 0, 0, 0 );
scene.add( light );

var light = new THREE.AmbientLight( 0x343434 ); // soft white light
scene.add( light );

var t = 0;
var step = 0
var drawPlanets = []
var solScale = 1;
xpl.setScale(solScale)
var planScale = 250000;

//SUN
var geometry = new THREE.SphereGeometry( xpl.kmtoau(xpl.sol.radius)*solScale,16,16 );
var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
var sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );

//PLANETS
var manager = new THREE.LoadingManager();
				manager.onProgress = function ( item, loaded, total ) {
					//document.getElementById("loading").remove()
					//document.getElementById("loadAmount").remove()
					//console.log( item, loaded, total );
				};

				var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						//document.getElementById("loadAmount").innerHTML = (Math.round(percentComplete, 2) + '%')
					}
				};

				var onError = function ( xhr ) {
				};

var loader = new THREE.ImageLoader( manager );

function makePlanets(){
	for(var p in xpl.planets){	
			var geometry = new THREE.SphereGeometry( xpl.kmtoau(xpl.planets[p].radius)*solScale,48,48 );
			var material = new THREE.MeshLambertMaterial( { color:0xffffff ,/*wireframe: true*/} );
			var sphere = new THREE.Mesh( geometry, material );
			
			var materialW = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, wireframeLinewidth: .5 } );
			var geometryW = new THREE.SphereGeometry( xpl.planets[p].radius/planScale,8,8 );
			var sphereW = new THREE.Mesh( geometryW, materialW );
			sphere.add(sphereW);

			var curPosition = xpl.SolarSystem(xpl.planets[p],xpl.now);
			sphere.position.set(curPosition[0]*solScale,curPosition[2]*solScale,curPosition[1]*solScale);
			///ROTATE SPHERE OR TEXTURE 180?
			//sphere.rotateX((-xpl.planets[p].oblique*Math.PI/180)+Math.PI)
			sphere.rotateX(-xpl.planets[p].oblique*Math.PI/180)
			sphere.name = xpl.planets[p].name
			drawPlanets.push(sphere);
		}
   
}

makePlanets()
    
var mwGeo = new THREE.SphereGeometry(900,48,48)
var mwMat = new THREE.MeshBasicMaterial({color:0xffffff, side:THREE.DoubleSide})
var mwMesh = new THREE.Mesh(mwGeo,mwMat)

loader.load("../../lib/data/images/milkywaypan_brunier.jpg",function (image){
    var texture = new THREE.Texture()
    texture.image = image
    texture.needsUpdate = true
    mwMesh.material.map = texture
    //how to get tilt of galactic plane?
    mwMesh.rotation.set(0,0,60*Math.PI/180)
    scene.add(mwMesh)
})

drawPlanets.forEach(function(planet, index){
	var texturePath = "../../lib/data/images/"
		texturePath += planet.name + ".jpg"
		var ptexture
		loader.load( texturePath, function (image) {
				ptexture = new THREE.Texture();
				ptexture.image = image;
				ptexture.needsUpdate = true;
				drawPlanets[index].material.map = ptexture
				scene.add(drawPlanets[index])
				})		
});

var moonGeo = new THREE.SphereGeometry(xpl.kmtoau(1736.482)*solScale,32,32)
var moonMat = new THREE.MeshLambertMaterial({color:0xffffff})
var moonMesh = new THREE.Mesh(moonGeo,moonMat)
var earthCenter = new THREE.Object3D()
earthCenter.position.copy(drawPlanets[2].position)
scene.add(earthCenter)


var obs = {latitude:0,longitude:0,elevation:0}
var moonPosition = xpl.MoonPos(xpl.now+t, obs)
moonMesh.position.x = xpl.kmtoau(moonPosition[9])

loader.load( "../../lib/data/images/Moon.jpg", function (image) {
				ptexture = new THREE.Texture();
				ptexture.image = image;
				ptexture.needsUpdate = true;
				moonMesh.material.map = ptexture
				moonMesh.rotateY(Math.PI)
				earthCenter.add(moonMesh)
				earthCenter.rotation.y = moonPosition[3]*(Math.PI/180)
				earthCenter.rotation.x = drawPlanets[2].rotation.x+(moonPosition[4]*(Math.PI/180))
				})	

var ISSGeo = new THREE.SphereGeometry( .000001*solScale,16,16 );
var ISSMat = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
var ISSeciMat = new THREE.MeshBasicMaterial( { color: 0xff00ff } );
var ISS_ecf = new THREE.Mesh(ISSGeo,ISSMat);
var ISS_eci = new THREE.Mesh(ISSGeo,ISSeciMat)
	scene.add(ISS_eci)
	drawPlanets[2].add(ISS_ecf)

	///TEST EARTH AXES
	/*
	var testGeo = new THREE.SphereGeometry(.0002,16,16);
	var testMaty = new THREE.MeshBasicMaterial({color:0x00ff00})
	var testMeshy = new THREE.Mesh(testGeo,testMaty)
	drawPlanets[2].add(testMeshy)
	testMeshy.position.y = .005
	var testMatx = new THREE.MeshBasicMaterial({color:0xff0000})
	var testMeshx = new THREE.Mesh(testGeo,testMatx)
	drawPlanets[2].add(testMeshx)
	testMeshx.position.x = .005
	var testMatz = new THREE.MeshBasicMaterial({color:0x0000ff})
	var testMeshz = new THREE.Mesh(testGeo,testMatz)
	drawPlanets[2].add(testMeshz)
	testMeshz.position.z = .005
	*/
	///TEST EARTH AXES

camera.position.set(drawPlanets[2].position.x,drawPlanets[2].position.y,-drawPlanets[2].position.z-.0001)
controls.target = new THREE.Vector3(drawPlanets[2].position.x,drawPlanets[2].position.y,drawPlanets[2].position.z)

var planetSelector = document.getElementById("planetSelector")
var planetSelected = 3
var speed=0
var render = function () {

	// var speed = parseInt(document.getElementById("speedSlider").value)
	
	var dir = speed > 0
	dir *= 2
	dir -= 1
	//min hr day month year decade century
	switch(Math.abs(speed)){
		case 0:
			step = 0
			document.getElementById("timescale").innerHTML = 'Second'
			speed<0 ? document.getElementById("timescale").innerHTML+=' backwards' : {}

		break;
		case 1:
			step = 0.00001157407 * dir// 1 min/sec
			document.getElementById("timescale").innerHTML = 'Minute'
			speed<0 ? document.getElementById("timescale").innerHTML+=' backwards' : {}
		break;
		case 2:
			step = 0.00069166666 * dir// 1 hr/sec
			document.getElementById("timescale").innerHTML = 'Hour'
			speed<0 ? document.getElementById("timescale").innerHTML+=' backwards' : {}
		break;
		case 3:
			step = 0.0166 * dir// 1 day/sec
			document.getElementById("timescale").innerHTML = 'Day'
			speed<0 ? document.getElementById("timescale").innerHTML+=' backwards' : {}
		break;
		case 4:
		 	step = 0.498 * dir// 1 month/sec
		 	document.getElementById("timescale").innerHTML = 'Month'
			speed<0 ? document.getElementById("timescale").innerHTML+=' backwards' : {}
		break;
		case 5:
			step = 5.976 * dir// 1 yr/sec
			document.getElementById("timescale").innerHTML = 'Year'
			speed<0 ? document.getElementById("timescale").innerHTML+=' backwards' : {}
		break;
	}

	earthCenter.position.copy(drawPlanets[2].position)
	earthCenter.rotation.y = moonPosition[3]*(Math.PI/180)
	earthCenter.rotation.x = drawPlanets[2].rotation.x+(moonPosition[4]*(Math.PI/180))

	moonPosition = xpl.MoonPos(xpl.now+t, obs)
	moonMesh.position.x = xpl.kmtoau(moonPosition[9])
	if(focusedPlanet<9){
		controls.target = new THREE.Vector3(drawPlanets[focusedPlanet].position.x,drawPlanets[focusedPlanet].position.y,drawPlanets[focusedPlanet].position.z)
	}else{
		controls.target = new THREE.Vector3(0,0,0)
	}
    mwMesh.position.set(camera.position.x,camera.position.y,camera.position.z)
    controls.update()
	xpl.updateTime()
	
	t+=step;

	var xyz = tlObj.update(t);
	xyz = tlObj.position_ecf;
    
	var ISSPosition = [xpl.kmtoau(xyz.x)*solScale,xpl.kmtoau(xyz.z)*solScale,xpl.kmtoau(-xyz.y)*solScale]
	ISS_ecf.position.set(ISSPosition[0],ISSPosition[1],ISSPosition[2]);
	// var iss_helio = xpl.ecf_to_heliocentric(ISS_ecf.position,xpl.now+t)
	// ISS_eci.position.set(iss_helio.x,iss_helio.z,iss_helio.y)

   /* ECI Conversion is slightly off. Probably has something to do with barycenter vs center 
   	xyz_eci = tlObj.position_eci;
    var ISSeciPos = new THREE.Vector3(xpl.kmtoau(xyz_eci.x)*solScale,xpl.kmtoau(xyz_eci.z)*solScale,xpl.kmtoau(-xyz_eci.y)*solScale)
    ISSeciPos.applyAxisAngle(new THREE.Vector3(0,1,0),(-0.03926991))
    ISSeciPos.applyAxisAngle(new THREE.Vector3(1,0,0),(xpl.curEarthOblique(xpl.now+t)*Math.PI/180)-.045)
    
    ISSeciPos.add(drawPlanets[2].position)
    ISS_eci.position.copy(ISSeciPos)
    */
    
	requestAnimationFrame( render );
	
   	for(p in drawPlanets){
		var curPosition = xpl.SolarSystem(xpl.planets[p],xpl.now+t);
		//launch of voyager 1
        //var curPosition = xpl.SolarSystem(xpl.planets[p],2443391.500000+t);
		var curRotation = xpl.planets[p].rotationAt(xpl.now+t)
		var oblique = 0
		drawPlanets[p].rotation.y = curRotation
		drawPlanets[p].position.set(curPosition[0]*solScale,curPosition[2]*solScale,-curPosition[1]*solScale)
	}

	if(document.getElementById("moveWithPlanet").checked){
		camera.position.copy(drawPlanets[focusedPlanet].position)
		var dist
		focusedPlanet>3 ? dist = .002 : dist = .0001
		camera.position.x+=dist
		camera.position.z+=dist
	}
	renderer.render(scene, camera);
};

var voyager1Positions = []
xpl.probePositions('voyager1',voyager1Positions,function(){
	var probeGeometry = new THREE.Geometry();
		probeGeometry.verticesNeedUpdate = true
	for(var v in voyager1Positions){
		probeGeometry.vertices.push(
			new THREE.Vector3( voyager1Positions[v].x, voyager1Positions[v].y, -voyager1Positions[v].z )
		);
	}
	var probeMaterial = new THREE.LineBasicMaterial({
		color: 0x00ff00});
	var line = new THREE.Line(probeGeometry,probeMaterial );
	line.geometry.verticesNeedUpdate = true
	scene.add(line)
},"../../lib/data/probes/")

var voyager2Positions = []
xpl.probePositions('voyager2',voyager2Positions,function(){
	var probeGeometry = new THREE.Geometry();
		probeGeometry.verticesNeedUpdate = true
	for(var v in voyager2Positions){
		probeGeometry.vertices.push(
			new THREE.Vector3( voyager2Positions[v].x, voyager2Positions[v].y, -voyager2Positions[v].z )
		);
	}
	var probeMaterial = new THREE.LineBasicMaterial({
		color: 0xffff00});
	var line = new THREE.Line(probeGeometry,probeMaterial );
	line.geometry.verticesNeedUpdate = true
	scene.add(line)
},"../../lib/data/probes/")

var dawnPositions = []
xpl.probePositions('dawn',dawnPositions,function(){
	var probeGeometry = new THREE.Geometry();
		probeGeometry.verticesNeedUpdate = true
	for(var v in dawnPositions){
		probeGeometry.vertices.push(
			new THREE.Vector3( dawnPositions[v].x, dawnPositions[v].y, -dawnPositions[v].z )
		);
	}
	var probeMaterial = new THREE.LineBasicMaterial({
		color: 0xff0000});
	var line = new THREE.Line(probeGeometry,probeMaterial );
	line.geometry.verticesNeedUpdate = true
	scene.add(line)
},"../../lib/data/probes/")

document.addEventListener("keydown",function(event){
	switch(event.keyCode){
		case 48:
			focusedPlanet = 9
			controls.target = new THREE.Vector3(0,0,0)
		break;
		case 49:
			focusedPlanet = 0
			camera.position.set(drawPlanets[focusedPlanet].position.x,drawPlanets[focusedPlanet].position.y,drawPlanets[focusedPlanet].position.z-.0001)
		break;
		case 50:
			focusedPlanet = 1
			camera.position.set(drawPlanets[focusedPlanet].position.x,drawPlanets[focusedPlanet].position.y,drawPlanets[focusedPlanet].position.z-.0001)
		break;
		case 51:
			focusedPlanet = 2
			camera.position.set(drawPlanets[focusedPlanet].position.x,drawPlanets[focusedPlanet].position.y,drawPlanets[focusedPlanet].position.z-.0001)
		break;
		case 52:
			focusedPlanet = 3
			camera.position.set(drawPlanets[focusedPlanet].position.x,drawPlanets[focusedPlanet].position.y,drawPlanets[focusedPlanet].position.z-.0001)
		break;
		case 53:
			focusedPlanet = 4
			camera.position.set(drawPlanets[focusedPlanet].position.x,drawPlanets[focusedPlanet].position.y,drawPlanets[focusedPlanet].position.z-.001)
		break;
		case 54:
			focusedPlanet = 5
			camera.position.set(drawPlanets[focusedPlanet].position.x,drawPlanets[focusedPlanet].position.y,drawPlanets[focusedPlanet].position.z-.001)
		break;
		case 55:
			focusedPlanet = 6
			camera.position.set(drawPlanets[focusedPlanet].position.x,drawPlanets[focusedPlanet].position.y,drawPlanets[focusedPlanet].position.z-.001)
		break;
		case 56:
			focusedPlanet = 7
			camera.position.set(drawPlanets[focusedPlanet].position.x,drawPlanets[focusedPlanet].position.y,drawPlanets[focusedPlanet].position.z-.001)
		break;
	}
})

window.addEventListener( 'resize', onWindowResize, false )

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

document.getElementById("planetSelect").addEventListener("mouseup",function(event){
	planetSelected=parseInt(planetSelector.options[planetSelector.selectedIndex].value)
	focusedPlanet = planetSelected
	console.log(focusedPlanet)
	var dist
	focusedPlanet>3 ? dist = .001 : dist = .0001
	camera.position.set(drawPlanets[focusedPlanet].position.x,drawPlanets[focusedPlanet].position.y,drawPlanets[focusedPlanet].position.z-dist)

})

document.getElementById("resetTime").addEventListener("mouseup",function(event){
	t = 0
})

// var logValue = function(e){
// 		console.log(e.newVal)
// 	}

// 	YUI().use('dial', function(Y) {
// 	    var dial = new Y.Dial({
// 	        min:-100000,
// 	        max:100000,
// 	        stepsPerRevolution:100,
// 	        value: 0,
// 	        strings:{label:'',resetStr: 'Reset'},
// 	        after : {
// 	           valueChange: Y.bind(logValue, dial)
// 	        }

// 	    });
// 		dial.render("#demo");
// 		var labels = document.getElementsByClassName('yui3-dial-label')
// 		labels[0].style.visibility='hidden'
// 	});

render();

var tlObj
var satellites = []
var xyz = new THREE.Vector3()

var url = '../../lib/data/ISS.json'
var xmlhttp = new XMLHttpRequest();
xmlhttp.open("GET", url, true);
xmlhttp.onreadystatechange = function() {
	if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	    var tleresponse = JSON.parse(xmlhttp.responseText);
	    for(var s = 0; s<tleresponse.length;s+=3){
	    		satellites.push({
	    			id: tleresponse[s].TLE_LINE0,
	    			line1 : tleresponse[s].TLE_LINE1,
	    			line2 : tleresponse[s].TLE_LINE2
	    		})
	        }
	        //console.log(satellites[0])
	        tlObj = new xpl.tle(satellites[0].line1,satellites[0].line2)
    }
}

xmlhttp.send(null);

var dial

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

var initDate = new Date()
var timeZone = parseInt(initDate.getTimezoneOffset()/60)*-1

var light = new THREE.PointLight( 0xffffff, 1.5, 0 );
light.position.set( 0, 0, 0 );
scene.add( light );

var light = new THREE.AmbientLight( 0x343434 ); // soft white light
scene.add( light );

var t = 0;
var sumT = 0
var step = 0
var drawPlanets = []
var solScale = 1;
xpl.setScale(solScale)
var planScale = 250000;

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

var mwGeo = new THREE.SphereGeometry(.01,48,48)
var mwMat = new THREE.MeshBasicMaterial({color:0x888888, side:THREE.DoubleSide, depthTest: false})
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

//SUN
var SunLabel
var sunTexture = new THREE.Texture();
	loader.load( '../../lib/data/images/Sun.jpg', function ( image ) {
	sunTexture.image = image;
	sunTexture.needsUpdate = true;				

	var sunGeometry = new THREE.SphereGeometry(xpl.kmtoau(xpl.sol.radius)*solScale,32,32);
	var sunMaterial = new THREE.MeshLambertMaterial( { emissiveMap:sunTexture,emissive: 0xffffff, emissiveIntensity:2 } );
	var material = new THREE.MeshLambertMaterial( { map:image } );
	var sphere = new THREE.Mesh( sunGeometry, sunMaterial );
	scene.add( sphere );
	SunLabel = new ThreeLabel({labelText:"Sun",width:4,labelScale:1,parentScale:.01})
})
var planetLabels=new Array(xpl.planets.length)
function makePlanets(){
	for(var p in xpl.planets){	
			var geometry = new THREE.SphereGeometry( xpl.kmtoau(xpl.planets[p].radius)*solScale,48,48 );
			var material = new THREE.MeshLambertMaterial( { color:0xffffff ,/*wireframe: true*/} );
			var sphere = new THREE.Mesh( geometry, material );
			sphere.rotateX(xpl.planets[p].oblique*Math.PI/180)
			var curPosition = xpl.SolarSystem(xpl.planets[p],xpl.now);
			sphere.position.set(-curPosition[0]*solScale,curPosition[2]*solScale,curPosition[1]*solScale);
			sphere.name = xpl.planets[p].name
			planetLabels[p] = new ThreeLabel({labelText:xpl.planets[p].name,width:4,labelScale:1,parentScale:.01, parent:sphere})

			drawPlanets.push(sphere);

		}
		var texturePath = "../../lib/data/images/"
		texturePath += "Saturn_Ring.png"
		var ptexture
		loader.load( texturePath, function (image) {
				var ringGeo = new THREE.PlaneGeometry(.0025,.0025,1)
				var ringMat = new THREE.MeshLambertMaterial( {color:0xffffff, transparent:true, needsUpdate: true, side:THREE.DoubleSide} );
				var ringMesh = new THREE.Mesh(ringGeo,ringMat)
				ringMesh.rotateX(Math.PI/2)
				ptexture = new THREE.Texture();
				ptexture.image = image;
				ptexture.needsUpdate = true;
				ringMesh.material.map = ptexture
				drawPlanets[5].add(ringMesh)
				})		
}

makePlanets()

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
				//addLabel(drawPlanets[index])
				})		
});

var moonGeo = new THREE.SphereGeometry(xpl.kmtoau(1736.482)*solScale,32,32)
var moonMat = new THREE.MeshLambertMaterial({color:0xffffff})
var moonMesh = new THREE.Mesh(moonGeo,moonMat)
moonMesh.name = "moonMesh"
var earthCenter = new THREE.Object3D()
earthCenter.position.copy(drawPlanets[2].position)
scene.add(earthCenter)

var obs = {latitude:0,longitude:0,elevation:0}
var moonPosition = xpl.MoonPos(xpl.now+t+sumT, obs)
console.log(moonPosition)
moonMesh.position.x = xpl.kmtoau(moonPosition[9])

var moonLabel
loader.load( "../../lib/data/images/Moon.jpg", function (image) {
				ptexture = new THREE.Texture();
				ptexture.image = image;
				ptexture.needsUpdate = true;
				moonMesh.material.map = ptexture
				moonMesh.rotateY(Math.PI)
				earthCenter.add(moonMesh)
				moonLabel = new ThreeLabel({labelText:"Moon",width:4,labelScale:.1,parent:scene, parentScale:.005})
				moonMesh.add(scene.getObjectByName("Moon_parent_label",true))
				scene.getObjectByName("moonMesh",true).rotateY(Math.PI/2)

				scene.remove(scene.getObjectByName("Moon_parent_label",true))
				earthCenter.rotation.y = moonPosition[3]*(Math.PI/180)+Math.PI
				earthCenter.rotation.x = drawPlanets[2].rotation.x+(moonPosition[4]*(Math.PI/180))
				})	

var ISSGeo = new THREE.SphereGeometry( .000001*solScale,16,16 );
var ISSMat = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
var ISSeciMat = new THREE.MeshBasicMaterial( { color: 0xff00ff } );
var ISS_ecf = new THREE.Mesh(ISSGeo,ISSMat);
var ISS_eci = new THREE.Mesh(ISSGeo,ISSeciMat)
	//scene.add(ISS_eci)
	//drawPlanets[2].add(ISS_ecf)

var loader = new THREE.OBJLoader( manager );
var modelPath = '../../lib/data/3D/ISS'

var mtlLoader = new THREE.MTLLoader();
mtlLoader.load( modelPath+'.mtl', function( materials ) {
	materials.preload();
	loader.load( modelPath+'.obj', function ( object ) {
		var objLoader = new THREE.OBJLoader();
		//loader.setMaterials( materials );
		object.name = "ISSObj"
		object.traverse( function ( child ) {
		if ( child instanceof THREE.Mesh ) {
			//console.log(materials.materials)
			child.materials = materials.materials//new THREE.MeshLambertMaterial( {/*map: texture*/color:0x888888, needsUpdate: true, side:THREE.DoubleSide} );
			child.geometry.computeVertexNormals();
			child.castShadow = true
			child.receiveShadow = true
		}
		} );

		object.scale.set(.00001,.00001,.00001)
		drawPlanets[2].add(object)

	});

}, onProgress, onError );

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

camera.position.set(drawPlanets[2].position.x,drawPlanets[2].position.y,drawPlanets[2].position.z-.0001)
controls.target = new THREE.Vector3(drawPlanets[2].position.x,drawPlanets[2].position.y,drawPlanets[2].position.z)

var planetSelector = document.getElementById("planetSelector")
var planetSelected = 3
var speed=0

var makeLabels=true

var ISSPropMat = new THREE.LineBasicMaterial({
	color: 0x00ff00});

var v2Label, dLabel, v1Label
var curV1Position = new THREE.Vector3()
var curV2Position = new THREE.Vector3()
var curDawnPosition = new THREE.Vector3()
var render = function () {
	typeof SunLabel != 'undefined' ? SunLabel.update():{}
	typeof v2Label != 'undefined' ? v2Label.update():{}
	typeof v1Label != 'undefined' ? v1Label.update():{}
	typeof dLabel != 'undefined' ? dLabel.update():{}
	// UPDATE CLIPPING PLANES!
	camera.far = camera.position.distanceTo(controls.target)*20000
	if(camera.far>100){
		camera.far = 100
	}
	camera.updateProjectionMatrix()
	
	if(typeof dial != 'undefined'){
		dial._stepsPerRevolution = parseFloat(document.getElementById('timeSelector').value)
	}

	var date = xpl.dateFromJday(xpl.now+t+sumT+(timeZone/24))

	var dmin = date.minute.toString()
	if(dmin.length<2) dmin = "0"+dmin

	var dspHour = date.hour
	dspHour.length < 2 ? dspHour = "0"+dspHour :{}
	var dtz = Math.sign(timeZone)>-1 ? "+" : {}

	var curJday = xpl.jday(date.year,date.month,date.day,date.hour,date.minute,date.sec)

	document.getElementById('curDate').innerHTML = "Date: " + date.month + "/" + date.day + "/" +date.year+
								"<br>Time: "+dspHour+":"+dmin +"(UTC "+timeZone+")";

	earthCenter.position.copy(drawPlanets[2].position)
	earthCenter.rotation.y = moonPosition[3]*(Math.PI/180)+Math.PI
	earthCenter.rotation.x = drawPlanets[2].rotation.x+(moonPosition[4]*(Math.PI/180))

	moonPosition = xpl.MoonPos(xpl.now+t+sumT, obs)
	moonMesh.position.x = xpl.kmtoau(moonPosition[9])
	if(focusedPlanet<9){
		controls.target = new THREE.Vector3(drawPlanets[focusedPlanet].position.x,drawPlanets[focusedPlanet].position.y,drawPlanets[focusedPlanet].position.z)
	}else if(focusedPlanet==9){
		controls.target = new THREE.Vector3(0,0,0)
	}else{
		switch(focusedPlanet){
				case 10:
				controls.target = curV1Position
				break
				case 11:
				controls.target = curV2Position
				break
				case 12:
				controls.target = curDawnPosition
				break
			}
	}
    mwMesh.position.set(camera.position.x,camera.position.y,camera.position.z)
    controls.update()
	xpl.updateTime()

	if(typeof tlObj!='undefined'){
		tlObj.update(t+sumT);
		xyz = tlObj.position_ecf;

		var ISSPropGeo = new THREE.Geometry();
		ISSPropGeo.verticesNeedUpdate = true
		var ISSPropLine = new THREE.Line(ISSPropGeo,ISSPropMat );
		ISSPropLine.geometry.verticesNeedUpdate = true
		//var curObj = clone(tlObj)
		var curObj = new xpl.tle(satellites[0].line1,satellites[0].line2)
		//console.log(curObj)
		for(var propT = 0;propT<0.0625;propT+=.0015){
			curObj.update(t+sumT+propT)
			curxyz = curObj.position_ecf
			var curPosition = [xpl.kmtoau(curxyz.x)*solScale,xpl.kmtoau(curxyz.z)*solScale,xpl.kmtoau(-curxyz.y)*solScale]
			ISSPropGeo.vertices.push(
				new THREE.Vector3( curPosition[0], curPosition[1], curPosition[2] )
			);
		}
		drawPlanets[2].add(ISSPropLine)
	}
    
	var ISSPosition = [xpl.kmtoau(xyz.x)*solScale,xpl.kmtoau(xyz.z)*solScale,xpl.kmtoau(-xyz.y)*solScale]
	
	if(typeof scene.getObjectByName("ISSObj",true)!='undefined'){
		scene.getObjectByName("ISSObj",true).position.set(ISSPosition[0],ISSPosition[1],ISSPosition[2]);
	}


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
	
   	for(var p in drawPlanets){
   		//changeCanvas(drawPlanets[p].name)
		var curPosition = xpl.SolarSystem(xpl.planets[p],xpl.now+t+sumT);
		//launch of voyager 1
        //var curPosition = xpl.SolarSystem(xpl.planets[p],2443391.500000+t);
		var curRotation = xpl.planets[p].rotationAt(xpl.now+t+sumT)+Math.PI
		var oblique = 0
		drawPlanets[p].rotation.y = curRotation
		drawPlanets[p].position.set(-curPosition[0]*solScale,curPosition[2]*solScale,curPosition[1]*solScale)
		planetLabels[p].update()
	}

	if(document.getElementById("moveWithPlanet").checked){
		var dist
		focusedPlanet>3 ? dist = .004 : dist = .0005
		document.getElementById("movewcam").style.color = "red"
		document.getElementById("movewcam").style.fontWeight='900'
		if(focusedPlanet<9){
			if(camera.position.distanceTo(drawPlanets[focusedPlanet].position)>dist){
				controls.dollyIn(1.1)
			}
		}else if(focusedPlanet==9){
			dist = .01
			if(camera.position.distanceTo(new THREE.Vector3())>dist){
				controls.dollyIn(1.1)
			}
		}else{
			switch(focusedPlanet){
				case 10:
				 if(camera.position.distanceTo(curV1Position)>dist){
					controls.dollyIn(1.1)
				 }	
				break
				case 11:
				if(camera.position.distanceTo(curV2Position)>dist){
					controls.dollyIn(1.1)
				 }	
				break
				case 12:
				if(camera.position.distanceTo(curDawnPosition)>dist){
					controls.dollyIn(1.1)
				 }	
				break
			}
		}
		// camera.position.copy(drawPlanets[focusedPlanet].position)
	}else{
		document.getElementById("movewcam").style.color = "white"
		document.getElementById("movewcam").style.fontWeight='normal'
	}
	renderer.render(scene, camera);
	drawPlanets[2].remove(ISSPropLine)
};

var voyager1Positions = []
xpl.probePositions('voyager1',voyager1Positions,function(){
	var probeGeometry = new THREE.Geometry();
		probeGeometry.verticesNeedUpdate = true
	for(var v in voyager1Positions){
		probeGeometry.vertices.push(
			new THREE.Vector3( -voyager1Positions[v].x, voyager1Positions[v].y, voyager1Positions[v].z )
		);
	}
	var probeMaterial = new THREE.LineBasicMaterial({
		color: 0x00ff00});
	var line = new THREE.Line(probeGeometry,probeMaterial );
	line.geometry.verticesNeedUpdate = true
	scene.add(line)

	var v = voyager1Positions.length-1
	curV1Position = new THREE.Vector3( -voyager1Positions[v].x, voyager1Positions[v].y, voyager1Positions[v].z )
	v1Label = new ThreeLabel({labelText:"Voyager 1", labelPosition:curV1Position, width:4,labelScale:1,parentScale:.005})

	var modelPath = '../../lib/data/3D/Voyager'

	//var mtlLoader = new THREE.MTLLoader();
	//mtlLoader.load( modelPath+'.mtl', function( materials ) {
		//materials.preload();
		loader.load( modelPath+'.obj', function ( object ) {
			var objLoader = new THREE.OBJLoader();
			//loader.setMaterials( materials );
			object.name = "VoyagerObj"
			object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.materials = new THREE.MeshLambertMaterial( {/*map: texture*/color:0x888888, needsUpdate: true, side:THREE.DoubleSide} );
				child.geometry.computeVertexNormals();
				child.castShadow = true
				child.receiveShadow = true
			}
			} );
			object.position.copy(curV1Position)
			object.scale.set(.0005,.0005,.0005)
			object.lookAt(new THREE.Vector3())
			object.rotateX(Math.PI/2)
			scene.add(object)
		});

	//}, onProgress, onError );

},"../../lib/data/probes/")

var voyager2Positions = []

xpl.probePositions('voyager2',voyager2Positions,function(){
	var probeGeometry = new THREE.Geometry();
		probeGeometry.verticesNeedUpdate = true
	for(var v in voyager2Positions){
		probeGeometry.vertices.push(
			new THREE.Vector3( -voyager2Positions[v].x, voyager2Positions[v].y, voyager2Positions[v].z )
		);
	}
	var probeMaterial = new THREE.LineBasicMaterial({
		color: 0xffff00});
	var line = new THREE.Line(probeGeometry,probeMaterial );
	line.geometry.verticesNeedUpdate = true
	scene.add(line)
	var v = voyager2Positions.length-1
	curV2Position = new THREE.Vector3( -voyager2Positions[v].x, voyager2Positions[v].y, voyager2Positions[v].z )
	v2Label = new ThreeLabel({labelText:"Voyager 2", labelPosition:curV2Position, width:4,labelScale:1,parentScale:.005})

	var modelPath = '../../lib/data/3D/Voyager'

	//var mtlLoader = new THREE.MTLLoader();
	//mtlLoader.load( modelPath+'.mtl', function( materials ) {
		//materials.preload();
		loader.load( modelPath+'.obj', function ( object ) {
			var objLoader = new THREE.OBJLoader();
			//loader.setMaterials( materials );
			object.name = "VoyagerObj"
			object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.materials = new THREE.MeshLambertMaterial( {/*map: texture*/color:0x888888, needsUpdate: true, side:THREE.DoubleSide} );
				child.geometry.computeVertexNormals();
				child.castShadow = true
				child.receiveShadow = true
			}
			} );
			object.position.copy(curV2Position)
			object.scale.set(.0005,.0005,.0005)
			object.lookAt(new THREE.Vector3())
			object.rotateX(Math.PI/2)
			scene.add(object)
		});

	//}, onProgress, onError );
},"../../lib/data/probes/")

var dawnPositions = []
xpl.probePositions('dawn',dawnPositions,function(){
	var probeGeometry = new THREE.Geometry();
		probeGeometry.verticesNeedUpdate = true
	for(var v in dawnPositions){
		probeGeometry.vertices.push(
			new THREE.Vector3( -dawnPositions[v].x, dawnPositions[v].y, dawnPositions[v].z )
		);
	}
	var probeMaterial = new THREE.LineBasicMaterial({
		color: 0xff0000});
	var line = new THREE.Line(probeGeometry,probeMaterial );
	line.geometry.verticesNeedUpdate = true
	scene.add(line)

	var v = dawnPositions.length-1
	curDawnPosition = new THREE.Vector3( -dawnPositions[v].x, dawnPositions[v].y, dawnPositions[v].z )
	dLabel = new ThreeLabel({labelText:"Dawn", labelPosition:curDawnPosition, width:4,labelScale:1,parentScale:.005})

	var modelPath = '../../lib/data/3D/Dawn'

	//var mtlLoader = new THREE.MTLLoader();
	//mtlLoader.load( modelPath+'.mtl', function( materials ) {
		//materials.preload();
		loader.load( modelPath+'.obj', function ( object ) {
			var objLoader = new THREE.OBJLoader();
			//loader.setMaterials( materials );
			object.name = "DawnObj"
			object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.materials = new THREE.MeshLambertMaterial( {/*map: texture*/color:0x888888, needsUpdate: true, side:THREE.DoubleSide} );
				child.geometry.computeVertexNormals();
				child.castShadow = true
				child.receiveShadow = true
			}
			} );
			object.position.copy(curDawnPosition)
			object.scale.set(.0005,.0005,.0005)
			object.lookAt(new THREE.Vector3())
			//object.rotateX(Math.PI/2)
			scene.add(object)
		});

	//}, onProgress, onError );
},"../../lib/data/probes/")

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

document.getElementById("planetSelector").addEventListener("change",function(event){
	planetSelected=parseInt(planetSelector.options[planetSelector.selectedIndex].value)
	focusedPlanet = planetSelected
	// var dist
	// focusedPlanet>3 ? dist = .001 : dist = .0001
	// camera.position.set(drawPlanets[focusedPlanet].position.x,drawPlanets[focusedPlanet].position.y,drawPlanets[focusedPlanet].position.z-dist)
	document.getElementById("moveWithPlanet").checked = true
})

document.getElementById('timeSelector').addEventListener("change", function() {
    sumT+=t
    t = 0
    dial.set('value',0)
});

var logValue = function(e){
        t = (e.newVal/14400)
}

YUI().use('dial', function(Y) {
    	dial = new Y.Dial({
	        min:-100000000000,
	        max:100000000000,
	        stepsPerRevolution:5256000,
	        value: 0,
	        strings:{label:'',resetStr: 'Reset'},
	        after : {
	           valueChange: Y.bind(logValue, dial)
	        }
    	});
	dial.render("#demo");
	var labels = document.getElementsByClassName('yui3-dial-label')
	labels[0].style.visibility='hidden'
	var resetButton = document.getElementsByClassName('yui3-dial-center-button')
	resetButton[0].addEventListener('click',function(){
			sumT = 0
			t = 0
			dial.set('value',0)
		}, false)
});

document.getElementById("showLabels").addEventListener("change",function(){
	if(document.getElementById("showLabels").checked){
		scene.getObjectByName("Sun_parent_label",true).visible = true

		scene.getObjectByName("Voyager 2_parent_label",true).visible = true
		scene.getObjectByName("Voyager 1_parent_label",true).visible = true
		scene.getObjectByName("Dawn_parent_label",true).visible = true	

		scene.getObjectByName("Moon_parent_label",true).visible = true	
		
		for(var p in xpl.planets){
			var label = scene.getObjectByName(xpl.planets[p].name+"_parent_label",true)
			typeof label != 'undefined' ? label.visible = true : {}
			//console.log(drawPlanets[p])
			//label.visible = true
		}
	}else{
		scene.getObjectByName("Sun_parent_label",true).visible = false
		scene.getObjectByName("Voyager 2_parent_label",true).visible = false
		scene.getObjectByName("Voyager 1_parent_label",true).visible = false
		scene.getObjectByName("Dawn_parent_label",true).visible = false	
		scene.getObjectByName("Moon_parent_label",true).visible = false
		for(var p in drawPlanets){
			var label = scene.getObjectByName(xpl.planets[p].name+"_parent_label",true)
			typeof label != 'undefined' ? label.visible = false : {}
			//label.visible = false
		}
	}
})
var accuracySelected = false
document.getElementById("accuracy").addEventListener("click",function(){
	accuracySelected = !accuracySelected
	if(accuracySelected){
		document.getElementById("accuracy").style.bottom = "50%"
		document.getElementById("accuracy").style.background = "black"
		//document.getElementById("accuracy").style.left = "50%"
		document.getElementById("accuracy").style.right = "50%"
		document.getElementById("accuracy").style.transform = "translate(50%,50%)"
		document.getElementById("accuracy").style.fontSize = "16px"
		document.getElementById("accuracy").innerHTML = "This Solar System is not complete. The following are various inaccuracies that are being addressed:"+
		"<br><br>– The ISS, Voyager probes and Dawn probe are dramatically scaled up"+
		"<br>– The tilt of the Milky Way background is roughly approximated"+
		"<br>– The obliqueness of planets other than Earth are not necessarily on the correct axis"+
		"<br>– There are of course many dwarf planets, comets, asteroids and moons that have not been included yet"
	}else{
		document.getElementById("accuracy").style.background = "black"
		document.getElementById("accuracy").style.bottom = ""
		document.getElementById("accuracy").style.right = ""
		document.getElementById("accuracy").style.transform = ""
		document.getElementById("accuracy").style.fontSize = ""
		document.getElementById("accuracy").innerHTML = "A note on accuracy"
	}
})



render();

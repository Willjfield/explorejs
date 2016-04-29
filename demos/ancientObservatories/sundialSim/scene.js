//Precession means it doesn't work forever. It goes off.
var obsPos = {latitude:41.895556,longitude:12.496667, elevation: .038} //rome
//var obsPos = {latitude:40.6928,longitude:-73.9903, elevation: 0}//brooklyn
var modelPath = 'models/Sundials/Ascoli/ObjID73_r2.obj'
var texturePath = 'models/Sundials/Ascoli/ss_tex.jpg'
var timeZone = 1

var groundTexPath = 'models/Sundials/Ascoli/groundtext.jpg'
var container;

var camera, scene, renderer;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var controls;

var speed, timeOffset, date, sumT
var dial
var planetArray = []

var tutStage = 0

var line, lineMaterial
init();
animate();

var summerPosition = new THREE.Vector3(.05,1.8,-2.019)
var winterPosition = new THREE.Vector3(.05,0,-.6699)

var showAllLabels = false
var updateAllLabels = false
var showLines = false

var nightWarning = false

function init() {
	//console.log('sunrise '+xpl.sunrise(obsPos,-0.833))
	speed = 0
	timeOffset = 0
	sumT = 0

	var date = xpl.dateFromJday(xpl.now,timeZone)

	container = document.createElement( 'div' );
	document.body.appendChild( container );
	// scene

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 4000 );
	

	renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setClearColor( 0x000000, 0 );
	renderer.shadowMap.enabled = true;

	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.25;
	controls.minDistance = 0;
	controls.minPolarAngle = 0; // radians
	controls.maxPolarAngle = Math.PI*2
	controls.maxDistance = 100
	controls.target = new THREE.Vector3(0,1,-1.5)

	 var ambient = new THREE.AmbientLight( 0x292939 );
	 scene.add( ambient );

	var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
	 	directionalLight.position.set( 0, 0, -500 );
	directionalLight.castShadow	= true

	directionalLight.shadowCameraRight     =  5;
	directionalLight.shadowCameraLeft     = -5;
	directionalLight.shadowCameraTop      =  5;
	directionalLight.shadowCameraBottom   = -5;
	directionalLight.shadowCameraNear   = 1;
	directionalLight.shadowCameraFar   = 800;
	directionalLight.shadowCameraVisible = true

	directionalLight.shadowDarkness = .1;
	directionalLight.shadowMapWidth = 1024;
	directionalLight.shadowMapHeight = 1024;

	var loader = new THREE.ImageLoader( manager );
	loader.load(groundTexPath, function(image){
			var groundTex = new THREE.Texture();
			groundTex.image = image
			groundTex.needsUpdate = true;
			//var groundGeo = new THREE.BoxGeometry(25,.5,25)
			var groundGeo = new THREE.PlaneGeometry(25, 25, 1, 1)
			var groundMat = new THREE.MeshLambertMaterial({map: groundTex, /*color:0x307030, side:THREE.DoubleSide*/})
			var groundMesh = new THREE.Mesh(groundGeo,groundMat)
			groundMesh.rotateX(-Math.PI/2)
			groundMesh.position.y=.5
			groundMesh.castShadow = true
			groundMesh.receiveShadow = true
			scene.add(groundMesh)
	})

	var gnomonGeo = new THREE.CylinderGeometry( .025, .025, 3, 16 );
	var gnomonMat = new THREE.MeshBasicMaterial( {color: 0x111111} );
	gnomonMesh = new THREE.Mesh( gnomonGeo, gnomonMat );
	gnomonMesh.rotateX(Math.PI/2)
	gnomonMesh.position.set(0,3.04,-1.48) 
	gnomonMesh.castShadow = true
	scene.add( gnomonMesh );

	//Whole planet creation has to happen in callback function or else sun loads last
	var sunTexture = new THREE.Texture();
	loader.load( '../../../../lib/data/images/Sun.jpg', function ( image ) {
		
		var groundGridMat = new THREE.LineBasicMaterial({color:0xffffff})
		
		var size = 500
		var space = 25
		for(var i = -size+(space/2); i<size;i+=space){
			var groundGridGeo = new THREE.Geometry()
			groundGridGeo.vertices.push(
				new THREE.Vector3( i, .5, -size ),
				new THREE.Vector3( i, .5, size )
			);
			var groundGridMesh = new THREE.Line( groundGridGeo, groundGridMat );
			scene.add( groundGridMesh );

			var groundGridGeo = new THREE.Geometry()
			groundGridGeo.vertices.push(
				new THREE.Vector3( -size, .5, i ),
				new THREE.Vector3( size, .5, i )
			);
			var groundGridMesh = new THREE.Line( groundGridGeo, groundGridMat );
			scene.add( groundGridMesh );

		}
		
		for(var p=0;p<6;p++){
				var nullObj = new THREE.Object3D();
				nullObj.name = xpl.planets[p].name
				if(p!=2){
					var geometry = new THREE.SphereGeometry( 5,8,8 );
					var material = new THREE.MeshBasicMaterial( { color: xpl.planets[p].texColor } );
					var sphere = new THREE.Mesh( geometry, material );
					sphere.position.set(0,0,-1500)

					nullObj.add(sphere)
					var pAltAz = xpl.PlanetAlt(p,xpl.now+timeOffset+sumT,obsPos)
					nullObj.rotation.set(pAltAz[0]*(Math.PI/180),-pAltAz[1]*(Math.PI/180),0,'YXZ')
				}else{
					
						sunTexture.image = image;
						sunTexture.needsUpdate = true;
						// sunTexture.receiveShadow = true;
						// sunTexture.castShadow = true;					

						var sunGeometry = new THREE.SphereGeometry( 25,8,8 );
						var sunMaterial = new THREE.MeshLambertMaterial( { emissiveMap:sunTexture,emissive: 0xffffff, emissiveIntensity:2 } );

						var lineGeometry = new THREE.Geometry()
						lineMaterial = new THREE.LineBasicMaterial({
							color: 0xffff00,transparent:true,opacity:.5, needsUpdate:true
						})

						lineGeometry.vertices.push(
							new THREE.Vector3( 0, 0, 0 ),
							new THREE.Vector3( 0, 0, -1500 ),
							new THREE.Vector3( 0, 3, 0 ),
							new THREE.Vector3( 0, 3, -1500 ),
							new THREE.Vector3( 0, -3, -1500 ),
							new THREE.Vector3( 0, -3, 0 ),
							new THREE.Vector3( 0, -3, -1500 ),
							new THREE.Vector3( 3, 0, 0 ),
							new THREE.Vector3( 3, 0, -1500 ),
							new THREE.Vector3( -3, 0, -1500 ),
							new THREE.Vector3( -3, 0, 0 ),
							new THREE.Vector3( -3, 0, -1500 )
						);

						line = new THREE.Line( lineGeometry, lineMaterial );

						var sphere = new THREE.Mesh( sunGeometry, sunMaterial );
						sphere.position.set(0,0,-1500)

						nullObj.add(sphere)
						nullObj.add(line)
						nullObj.add( directionalLight )

						var pAltAz = xpl.PlanetAlt(2,xpl.now+timeOffset+sumT,obsPos)

						nullObj.rotation.set(pAltAz[0]*(Math.PI/180),-pAltAz[1]*(Math.PI/180),0,'YXZ')	
				}					
			planetArray.push(nullObj)
			scene.add( nullObj )
		}

		
	});
	//when done, add the venusNull to the scene
	// texture

	var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {
		document.getElementById("loading").remove()
		document.getElementById("loadAmount").remove()
		document.getElementById("intro").style.visibility='visible'
		console.log( item, loaded, total );
	};

	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			document.getElementById("loadAmount").innerHTML = (Math.round(percentComplete, 2) + '%')
		}
	};

	var onError = function ( xhr ) {
	};
	
	var loader = new THREE.OBJLoader( manager );
	loader.load( modelPath, function ( object ) {
		object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material = new THREE.MeshLambertMaterial( {/*map: texture*/color:0x888888, needsUpdate: true, side:THREE.DoubleSide} );
				child.geometry.computeVertexNormals();

				child.castShadow = true
				child.receiveShadow = true
			}
		} );
		object.scale.set(.01,.01,.01)
		object.rotateX(-Math.PI/2)
		object.position.y=3

		scene.add( object );

	}, onProgress, onError );

	window.addEventListener( 'resize', onWindowResize, false );
	camera.position.set(4,15,4);

}

function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}
var addSolstices = false
var showSoltices = false

var addEquinoxes = false
var showEquinoxes = false

var equinoxPosition = new THREE.Vector3(0,0,-1.48)

function animate() {
	if(addSolstices){
		addLabel("Summer Solstice (June 21st)", summerPosition,scene,1)
		addLabel("Winter Solstice (Dec. 21st)", winterPosition,scene,1)	
		addSolstices = false
	}

	if(showSoltices){
		updateLabels("Summer Solstice (June 21st)",summerPosition)
		updateLabels("Winter Solstice (Dec. 21st)",winterPosition)
	}

	if(addEquinoxes){
		addLabel("Fall/Spring Equinox",equinoxPosition, scene, 1)
		addEquinoxes = false
	}

	if(showEquinoxes){
		updateLabels("Fall/Spring Equinox",equinoxPosition)
	}

	// if(showAllLabels){
	// 	addLabel("Summer Solstice (June 21st)", summerPosition,scene,1)
	// 	addLabel("Winter Solstice (Dec. 21st)", winterPosition,scene,1)
	// 	addLabel("Fall/Spring Equinox",equinoxPosition, scene, 1)
	// 	showAllLabels = false
	// }

	// if(updateAllLabels){
	// 	updateLabels("Summer Solstice (June 21st)", summerPosition)
	// 	updateLabels("Winter Solstice (Dec. 21st)", winterPosition)
	// 	updateLabels("Fall/Spring Equinox",equinoxPosition)
	// }

	// if(showLines){
	// 	for(var p in scene.children){
	// 		if(scene.children[p].name=="Earth"){
	// 			scene.children[p].add(line)
	// 		}
	// 	}
	// 	showLines = false
	// }

	// if(!showLines){
	// 	for(var p in scene.children){
	// 		if(scene.children[p].name=="Earth"){
	// 			scene.children[p].remove(line)
	// 		}
	// 	}
	// }
		


	tutorial()

	xpl.updateTime()

	if(typeof dial != 'undefined'){
		dial._stepsPerRevolution = parseFloat(document.getElementById('timeSelector').value)
	}

	//DISPLAY DATE vs CALC DATE
		// var dDay = date.day.toString()
	// dDay.length<2 ? dDay = "0"+dDay : {}

	// var dMo= date.month.toString()
	// dMo.length<2 ? dMo = "0"+dMo : {}

		// var dhour = date.hour//.toString()
	// // dhour.length < 2 ? dhour = "0"+dhour :{}
	// var dspHour = (dhour+timeZone)
	// if(dspHour>23){dspHour=0}
	// if(dspHour<0){dspHour=24+dspHour}

	var date = xpl.dateFromJday(xpl.now+timeOffset+sumT+(timeZone/24))

	var dmin = date.minute.toString()
	if(dmin.length<2) dmin = "0"+dmin

	var dspHour = date.hour
	dspHour.length < 2 ? dspHour = "0"+dspHour :{}
	var dtz = Math.sign(timeZone)>-1 ? "+" : {}

	var curJday = xpl.jday(date.year,date.month,date.day,date.hour,date.minute,date.sec)

	document.getElementById('date').innerHTML = "Date: " + date.month + "/" + date.day + "/" +date.year+
								"<br>Time: "+dspHour+":"+dmin +"(UTC"+dtz+timeZone+")";

	// document.getElementById('date').innerHTML = "Date: " + dMo + "/" + dDay + "/" +date.year+ " (at meridian)"+
	// 											"<br>Time: "+dspHour+":"+dmin +"(UTC"+dtz+timeZone+")";
	document.getElementById('latlong').innerHTML ="Latitude: "+obsPos.latitude.toFixed(3)+
																				"<br> Longitude: "+obsPos.longitude.toFixed(3)+
																				"<br> Elevation(m): "+obsPos.elevation*1000

	for(var p =0;p<planetArray.length;p++){
			var pAltAz = xpl.PlanetAlt(p,xpl.now+timeOffset+sumT,obsPos)
			planetArray[p].rotation.set(pAltAz[0]*(Math.PI/180),-pAltAz[1]*(Math.PI/180),0,'YXZ')
	}

	var sunAlt = xpl.PlanetAlt(2,xpl.now+timeOffset+sumT,obsPos)[0]
	
	if(sunAlt>0){
		document.body.style.backgroundColor ='rgb(255,255,255)'
		var dayColor = 'rgb('+parseInt(sunAlt*3)+','+parseInt(sunAlt*4)+','+parseInt(sunAlt*5)+')'
		document.body.style.backgroundColor = dayColor
		document.getElementById('nightTime').style.visibility = 'hidden'
	}else{
		if(nightWarning){
			document.getElementById('nightTime').style.visibility = 'visible'
		}else{
			document.getElementById('nightTime').style.visibility = 'hidden'
		}
		document.body.style.backgroundColor ='#000010'
	}

	requestAnimationFrame( animate );
	render();
}

function render() {
	controls.update();
	renderer.render( scene, camera );
}


function addLabel(name, label_position, parent, lScale){
	//var size = 256;
	typeof parent == 'undefined' ? parent = scene : {}
	typeof lScale == 'undefined' ? lScale = 1 : {}

	var canvas = document.createElement('canvas')

	canvas.className='label'
	//console.log(canvas)
	document.body.appendChild(canvas)
	var ctx = canvas.getContext('2d');
	canvas.width = 256
	canvas.height = 128
	ctx.font = '12pt Arial';
	ctx.fontWeight = 'bolder'
	// ctx.fillStyle = 'white';
	// ctx.fillRect(0, 0, canvas.width, canvas.height);
	// ctx.fillStyle = 'black';
	// ctx.fillRect(5, 5, canvas.width-10, canvas.height-10);
	ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle="rgba(0, 0, 0, 0)";
    ctx.fill();
	ctx.fillStyle = 'white';
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(name, canvas.width / 2, canvas.height / 2);

	var stexture = new THREE.Texture(canvas);
	stexture.needsUpdate = true;

	var parentObj = new THREE.Object3D()

	var smaterial = new THREE.MeshBasicMaterial({ map: stexture, needsUpdate: true, depthTest: false,alphaMap:stexture, transparent: true, opacity: 1});
	var sgeometry = new THREE.PlaneGeometry( 1, .5 );
	var smesh = new THREE.Mesh( sgeometry, smaterial );
	smesh.scale.set(lScale,lScale,lScale)

	var pointer = new THREE.Geometry()
	pointer.vertices.push(new THREE.Vector3(0,0,0),new THREE.Vector3(0,1.75,0))
	var pointerLine = new THREE.LineBasicMaterial({
		color: 0xffffff,transparent: true, needsUpdate: true, opacity: 1});
	var line = new THREE.Line(pointer,pointerLine );

	line.name=name+"_labelLine"
	line.position.copy(label_position)
	line.geometry.verticesNeedUpdate = true
	
	parent.add(line)
	parentObj.add(smesh)

	parentObj.name=name+"_label"
	parentObj.position.copy(label_position)
	parentObj.position.y+=2

	parent.add( parentObj );
}

function updateLabels(name, position, parent, visible){
	typeof visible == 'undefined' ? visible = true : visible = false
	typeof parent == 'undefined' ? parent = scene : {}
	if(visible){

		for(var child in parent.children){
				if(parent.children[child].name==name+"_labelLine"){
					parent.children[child].position.copy(position)
				}
				if(parent.children[child].name==name+"_label"){
					parent.children[child].lookAt(camera.position)
					var labelScale = parent.children[child].position.distanceTo(camera.position)*.3
					parent.children[child].scale.set(labelScale,labelScale,labelScale)
					parent.children[child].position.copy(position)
					parent.children[child].position.y+=2
				}
			}
		}else{
			
		}
}

function mouseUp(){
	document.getElementById("speedSlider").value = 0
}

document.getElementById('timeSelector').addEventListener("change", function() {
    sumT+=timeOffset
    timeOffset = 0
    dial.set('value',0)
});

document.getElementById("creditButton").addEventListener("click",function(){
	document.getElementById("credit").style.visibility = "visible"
	document.getElementById("intro").style.visibility = "hidden"
	document.getElementById("timeExplanation").style.visibility = "hidden"
	document.getElementById("info").style.visibility = "hidden"	
	nightWarning = false
})

document.getElementById("credit").addEventListener("click",function(){
	document.getElementById("credit").style.visibility = "hidden"
	document.getElementById("intro").style.visibility = "hidden"
	document.getElementById("timeExplanation").style.visibility = "hidden"
	document.getElementById("info").style.visibility = "hidden"	
	nightWarning = true
})

document.getElementById("close").addEventListener("click",function(){
	document.getElementById("intro").style.visibility = 'hidden'
	nightWarning = true
	document.getElementById("moreInfo").style.visibility = 'visible'
	if(sphereCut){scene.remove(sphereCut)}
	controls.autoRotate = false
	create = true
	tutStage = 0
})

document.getElementById("takeTour").addEventListener("click",function(){
	create = true
	tutStage = 0
	document.getElementById("intro").style.visibility = 'visible'
	document.getElementById("credit").style.visibility = "hidden"
	document.getElementById("timeExplanation").style.visibility = "hidden"
	document.getElementById("info").style.visibility = "hidden"	
	nightWarning = false
})

document.getElementsByTagName('canvas')[0].addEventListener("click",function(){
	if(tutStage>0){
		document.getElementById("intro").style.visibility = 'hidden'
		document.getElementById("credit").style.visibility = "hidden"
		document.getElementById("timeExplanation").style.visibility = "hidden"
		document.getElementById("info").style.visibility = "hidden"	
	}	
})

var logValue = function(e){
        timeOffset = (e.newVal/14400)
}

var create = true
var sphereCut, globeMesh, earthPlaneMesh
var upOp = true

document.getElementById("next").addEventListener("click",function(){
					++tutStage
					create = true
				})

function tutorial(){
	switch(tutStage){
		case 0:
			if(create){
				document.getElementById("infoText").innerHTML = "<p id='infoText'><a href='http://www.ancient-astronomy.org/en/2013/05/03/antike-sonnenuhren/'>The Berlin Sundial Project </a>has 3D scanned and archived dozens of sundials from ancient Greece and Rome. The sundial presented here was found in the Villa Palombra in Rome and dates to the first century BCE. <br><br>Use the mouse to navigate through the scene.<br><br>Spin the time dial to change the time and date or enter a date in the text box.<br><br></p>"
				create=false
			}
		break

		case 1:
			if((xpl.now+sumT+timeOffset+(timeZone/12))%1>.02){timeOffset+=.01}
			if(create){
				controls.autoRotate = true
				document.getElementById("infoText").innerHTML = "This sundial was made by cutting a spherical shape out of stone."
				document.getElementById("next").innerHTML = "Next"
				var sphereCutGeo = new THREE.SphereGeometry(2.2,24,24)
				var sphereCutMat = new THREE.MeshBasicMaterial( { depthTest: false,color: 0xffffff, wireframe: true, wireframeLinewidth: 1, side: THREE.DoubleSide, transparent: true, opacity:.25} );
				sphereCut = new THREE.Mesh(sphereCutGeo,sphereCutMat)
				sphereCut.position.y=3
				scene.add(sphereCut)
				create=false
			}
		break

		case 2:
			if((xpl.now+sumT+timeOffset+(timeZone/12))%1>.02){timeOffset+=.01}

			if(create){
				document.getElementById("infoText").innerHTML = "The lines on the face of the dial are made by calculating earth's axis relative to the observer's latitude."
				var earthPlaneGeo = new THREE.PlaneGeometry(10,10,1)
				var earthPlaneMat = new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0, side: THREE.DoubleSide})
				earthPlaneMesh = new THREE.Mesh(earthPlaneGeo,earthPlaneMat)
				earthPlaneMesh.rotateX(Math.PI/2)
				var loader = new THREE.TextureLoader()
				loader.load(
				'../../../lib/data/images/Earth.jpg',
				function ( texture ) {
					var globeGeo = new THREE.SphereGeometry(2.2,24,24)
					var globeMat = new THREE.MeshBasicMaterial({map:texture,transparent:true, opacity:0})
					globeMesh = new THREE.Mesh(globeGeo,globeMat)
					sphereCut.add(globeMesh)
				})
				
				addLabel("Plane of Earth Equator", new THREE.Vector3(1,0,2.45), sphereCut, 5)
				
				sphereCut.add(earthPlaneMesh)			
				create=false
			}

			if(typeof globeMesh != 'undefined' && globeMesh.material.opacity<1 && upOp){globeMesh.material.opacity+=.01}
			if(typeof earthPlaneMesh != 'undefined' && earthPlaneMesh.material.opacity<.4 && upOp){earthPlaneMesh.material.opacity+=.01}

			if(sphereCut.rotation.x>((90-obsPos.latitude)*xpl.DEG2RAD)*-1){
				sphereCut.rotateX(-.01*(sphereCut.rotation.x-((90-obsPos.latitude)*xpl.DEG2RAD)*-1))
				sphereCut.children[1].rotation.x=(Math.PI/4)	
			}

			sphereCut.children[1].rotation.y = controls.getAzimuthalAngle()

		break

		case 3:
			if(sphereCut.rotation.x>((90-obsPos.latitude)*xpl.DEG2RAD)*-1){
				sphereCut.rotateX(-.01*(sphereCut.rotation.x-((90-obsPos.latitude)*xpl.DEG2RAD)*-1))
				sphereCut.children[1].rotation.x=(Math.PI/4)	
			}

			sphereCut.children[1].rotation.y = controls.getAzimuthalAngle()
			if(typeof globeMesh != 'undefined' && globeMesh.material.opacity>0 && upOp){globeMesh.material.opacity-=.01}
			if(typeof sphereCut != 'undefined' && sphereCut.material.opacity>0 && upOp){sphereCut.material.opacity-=.01}

			if(Math.abs(controls.getAzimuthalAngle())>.5){controls.rotateLeft(.01*(Math.abs(controls.getAzimuthalAngle())-.1))}
			if(Math.abs(controls.getPolarAngle())>.1){controls.rotateUp(.01*(Math.abs(controls.getPolarAngle())))}
			
			if(camera.position.distanceTo(new THREE.Vector3(0,0,0))>4){controls.dollyIn(1+(.001*camera.position.distanceTo(new THREE.Vector3(0,0,0))))}
			
			if(create){
				controls.autoRotate = false
				document.getElementById("infoText").innerHTML = "This makes the direction of sunlight directly perpendicular to the middle marking line of the dial on the equinoxes."
				for(var p in scene.children){
					if(scene.children[p].name=="Earth"){
						scene.children[p].add(line)
					}
				}
				addEquinoxes = true
				showEquinoxes = true
				create = false
			}
			
		break

		case 4:
			if(camera.position.distanceTo(new THREE.Vector3(0,0,0))<8){controls.dollyOut(1+(.1/camera.position.distanceTo(new THREE.Vector3(0,0,0))))}
			if(controls.getPolarAngle()<1){controls.rotateUp(.1*(controls.getPolarAngle()-1))}

			if(create){
				document.getElementById("infoText").innerHTML = "The solstice lines can then be made at 23.4 degrees above and below the equator line – the angle that Earth tilts between seasons."
				showSoltices = true
				addSolstices = true
				scene.remove(sphereCut)
				for(var p in scene.children){
					if(scene.children[p].name=="Earth"){
							scene.children[p].remove(line)
						}
				}

				create = false
			}
		break

		case 5:
			if(create){
				document.getElementById("intro").style.visibility = 'hidden'
				document.getElementById("moreInfo").style.visibility = 'visible'
				controls.autoRotate = false
			}
		break
	}
}

// document.body.addEventListener("keypress",function(){
// 	lineMaterial.opacity*=-1time
// })
document.getElementById("timeRight").addEventListener("click",function(){
	document.getElementById("timeExplanation").style.visibility = "visible"
	document.getElementById("intro").style.visibility = "hidden"
	document.getElementById("credit").style.visibility = "hidden"
	document.getElementById("info").style.visibility = "hidden"	
	nightWarning = false
})

document.getElementById("info").addEventListener("click",function(){
	document.getElementById("info").style.visibility = "hidden"

	nightWarning = true
})

document.getElementById("location").addEventListener("click",function(){
	document.getElementById("info").style.visibility = "visible"
	document.getElementById("intro").style.visibility = "hidden"
	document.getElementById("timeExplanation").style.visibility = "hidden"
	document.getElementById("credit").style.visibility = "hidden"

	nightWarning = false
	//document.getElementById("nightTime").style.visibility = "hidden"
})

document.getElementById("timeExplanation").addEventListener("click",function(){
	document.getElementById("timeExplanation").style.visibility = "hidden"
	nightWarning = true
})
document.getElementById("submitDate").addEventListener("click",function(){
	var enteredDate = document.getElementById("setDate").value
	var eDateComponents = enteredDate.split("/");
	var curjday = xpl.now+timeOffset+sumT
	var ejday = xpl.jday(parseInt(eDateComponents[2]),parseInt(eDateComponents[0]),parseInt(eDateComponents[1]))
	ejday+=((curjday-.5)%1)
	//console.log(ejday)
	
	var tDiff = ejday-curjday
	sumT+=tDiff
})

YUI().use('dial', function(Y) {
        dial = new Y.Dial({
            min:-100000000000,
            max:100000000000,
            stepsPerRevolution:10,
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
            timeOffset = 0
            dial.set('value',0)
        }, false)
});

			//var obsPos = {latitude:41.895556,longitude:12.496667, elevation: .038}
			var obsPos = {latitude:40.6928,longitude:-73.9903, elevation: 0}
			var modelPath = 'models/Sundials/Ascoli/ObjID73_r2.obj'
			var texturePath = 'models/Sundials/Ascoli/ss_tex.jpg'
			var timeZone = -5

			var groundTexPath = 'models/Sundials/Ascoli/groundtext.jpg'
			var container;

			var camera, scene, renderer;

			var mouseX = 0, mouseY = 0;

			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;

			var controls;

			var speed, tOffset, date, diffDay

			var planetArray = []

			//debug slider
			var zGnomon = 0
			var yGnomon = 0

			init();
			animate();

			function init() {
				speed = 0
				tOffset = 0
				diffDay = 0
				//min hr day month year decade century
				document.getElementById("speedSlider").min = -7
				document.getElementById("speedSlider").max = 7
				document.getElementById("speedSlider").step = 1

				// var date = explore.dateFromJday(explore.now+(timeZone/24))
				// document.getElementById('inday').value = date.day
				// document.getElementById('inmonth').value = date.month
				// document.getElementById('inyear').value = date.year

				container = document.createElement( 'div' );
				document.body.appendChild( container );
				// scene

				scene = new THREE.Scene();
				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
				camera.position.set(0,0,0);

				renderer = new THREE.WebGLRenderer();
				renderer.setClearColor( 0x111116, 1);
				renderer.shadowMap.enabled = true;
				//renderer.shadowMapType = THREE.PCFSoftShadowMap;
				//renderer.shadowMapSoft = true;

				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );

				controls = new THREE.OrbitControls(camera, renderer.domElement);
				controls.enableDamping = true;
				controls.dampingFactor = 0.25;
				controls.minDistance = 0;
				controls.minPolarAngle = 0; // radians
				controls.maxPolarAngle = Math.PI*2

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
						var groundGeo = new THREE.BoxGeometry(25,.5,25)
						var groundMat = new THREE.MeshLambertMaterial({map: groundTex, /*color:0x307030,*/ side:THREE.DoubleSide})
						var groundMesh = new THREE.Mesh(groundGeo,groundMat)
						groundMesh.castShadow = true
						groundMesh.receiveShadow = true
						scene.add(groundMesh)
				})


				var gnomonGeo = new THREE.CylinderGeometry( .025, .025, 3, 16 );
				var gnomonMat = new THREE.MeshBasicMaterial( {color: 0x111111} );
				gnomonMesh = new THREE.Mesh( gnomonGeo, gnomonMat );
				gnomonMesh.rotateX(Math.PI/2)
				gnomonMesh.position.set(0,3.04,-1.48) 
				//gnomonMesh.position.set(0,1.44,-.05+zGnomon)//vertical
				gnomonMesh.castShadow = true
				scene.add( gnomonMesh );

				for(var p in explore.planets){
					if(p<6){
					var nullObj = new THREE.Object3D();
					if(p!=2){
						var geometry = new THREE.SphereGeometry( 10,8,8 );
						var material = new THREE.MeshBasicMaterial( { color: explore.planets[p].texColor } );
					}else{
						var geometry = new THREE.SphereGeometry( 15,8,8 );
						var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
					}
					var sphere = new THREE.Mesh( geometry, material );
					sphere.position.set(0,0,-900)

					nullObj.add(sphere)
					p==2 ? nullObj.add( directionalLight ) : {}

					var pAltAz = explore.PlanetAlt(p,explore.now+tOffset,obsPos)
					nullObj.rotation.set(pAltAz[0]*(Math.PI/180),-pAltAz[1]*(Math.PI/180),0,'YXZ')
					planetArray.push(nullObj)
					scene.add( nullObj )
				}
				}

				//when done, add the venusNull to the scene
				// texture

				var manager = new THREE.LoadingManager();
				manager.onProgress = function ( item, loaded, total ) {
					document.getElementById("loading").remove()
					document.getElementById("loadAmount").remove()
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

				/*For image texture
				var texture = new THREE.Texture();
				loader.load( texturePath, function ( image ) {
					texture.image = image;
					texture.needsUpdate = true;
					texture.receiveShadow = true;
					texture.castShadow = true;
				} );
				*/
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

			}

			function onWindowResize() {
				windowHalfX = window.innerWidth / 2;
				windowHalfY = window.innerHeight / 2;

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );
			}

			function animate() {
				explore.updateTime()
				speed = parseInt(document.getElementById("speedSlider").value)

				var dir = speed > 0
				dir *= 2
				dir -= 1
				//min hr day month year decade century
				switch(Math.abs(speed)){
					case 0:
						document.getElementById("speedSlider").style.background = 'transparent'
					break;
					case 1:
						tOffset += 0.00001157407 * dir// 1 min/sec
						document.getElementById("speedSlider").style.background = 'rgba(255,0,0,.1)'
					break;
					case 2:
						tOffset += 0.00069166666 * dir// 1 hr/sec
						document.getElementById("speedSlider").style.background = 'rgba(255,100,0,.15)'
					break;
					case 3:
						tOffset += 0.0166 * dir// 1 day/sec
						document.getElementById("speedSlider").style.background = 'rgba(255,200,0,.2)'
					break;
					case 4:
					 	tOffset += 0.498 * dir// 1 month/sec
					 	document.getElementById("speedSlider").style.background = 'rgba(200,255,0,.25)'
					break;
					case 5:
						tOffset += 5.976 * dir// 1 yr/sec
						document.getElementById("speedSlider").style.background = 'rgba(100,255,0,.3)'
					break;
					case 6:
						tOffset += 59.76 * dir// 1 decade/sec
						document.getElementById("speedSlider").style.background = 'rgba(0,255,0,.35)'
					break;
					case 7:
						tOffset += 597.6 * dir// 1 century/sec
						document.getElementById("speedSlider").style.background = 'rgba(0,255,0,.45)'
					break;
				}

				var date = explore.dateFromJday(explore.now+tOffset)
				//console.log("m "+explore.jday(date.year,date.month,date.day,date.hour,date.minute,date.sec))
				console.log("a " + (explore.now+tOffset))

				var dmin = date.minute.toString()
				dmin.length<2 ? dmin = "0"+dmin : {}

				var dhr = date.hour+timeZone


				var dTZ = timeZone>-1 ? "+"+timeZone.toString() : timeZone.toString()

				// var inDay = parseFloat(document.getElementById('inday').value)>0 ? parseFloat(document.getElementById('inday').value) : 0
				// var inMonth = parseFloat(document.getElementById('inmonth').value)>0 ? parseFloat(document.getElementById('inmonth').value) : 0
				// var inYear = parseFloat(document.getElementById('inyear').value)>0 ? parseFloat(document.getElementById('inyear').value) : 0

				// var curJday = explore.jday(inYear,inMonth,inDay,date.hour,date.minute,date.sec)

				document.getElementById('date').innerHTML = "Date: "+ date.month +"/"+date.day+"/"+date.year+"<br>Time: "+dhr+":"+dmin+" (UTC"+dTZ+")";
															
				document.getElementById('latlong').innerHTML ="Latitude: "+obsPos.latitude+
																							"<br> Longitude: "+obsPos.longitude+
																							"<br> Elevation(m): "+obsPos.elevation*1000+
																							"<br>Sundial from Villa Palombara Massimi, Rome"


				for(var p in planetArray){
						var pAltAz = explore.PlanetAlt(p,explore.now+tOffset,obsPos)
						planetArray[p].rotation.set(pAltAz[0]*(Math.PI/180),-pAltAz[1]*(Math.PI/180),0,'YXZ')
				}

				console.log(explore.PlanetAlt(2,explore.now+tOffset,obsPos)[1],explore.PlanetAlt(2,explore.now+tOffset,obsPos)[0])

				requestAnimationFrame( animate );
				render();
			}

			function render() {
				controls.update();
				renderer.render( scene, camera );
			}

			function mouseUp(){
				document.getElementById("speedSlider").value = 0
			}

			function gzMouseDown(){
				zGnomon = parseFloat(document.getElementById("zGnomon").value)
				gnomonMesh.position.z = -.55+zGnomon
				console.log(gnomonMesh.position)
			}

			function gyMouseDown(){
				yGnomon = parseFloat(document.getElementById("yGnomon").value)
				gnomonMesh.position.y = 4.85-yGnomon
				console.log(gnomonMesh.position)
			}

			//FOR PLACING GNOMON
			// document.getElementById("zGnomon").min = -2
			// document.getElementById("zGnomon").max = 2
			// document.getElementById("zGnomon").step = .0001
			//
			// document.getElementById("yGnomon").min = -2
			// document.getElementById("yGnomon").max = 2
			// document.getElementById("yGnomon").step = .0001

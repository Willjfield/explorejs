var tleLine1 = "1 25544U 98067A   16068.60811216  .00006572  00000-0  10711-3 0  9999"
var tleLine2 = "2 25544  51.6425 199.6230 0001553 265.2287 192.4960 15.53947737989335"
var tlObj = new xpl.tle(tleLine1,tleLine2);
var xyz = tlObj.update();

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.00001, 1000 );
camera.position.set(0,0,100)

var renderer = new THREE.WebGLRenderer({ /*alpha: true*/ });
renderer.setSize( window.innerWidth, window.innerHeight );
//renderer.setClearColor( 0xffffff, 0);
document.body.appendChild( renderer.domElement );

var controls = new THREE.OrbitControls(camera);
				controls.enableDamping = true;
				controls.dampingFactor = 0.25;
				controls.minDistance = 0;
				controls.minPolarAngle = 0; // radians
				controls.maxPolarAngle = Infinity;
				controls.zoomSpeed = .01
				controls.rotateSpeed = .01
				controls.panSpeed = .01

                var light = new THREE.PointLight( 0xffffff, 5, 0 );
light.position.set( 0, 0, 0 );
scene.add( light );

var light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );

var t = 0;
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
			var geometry = new THREE.SphereGeometry( xpl.kmtoau(xpl.planets[p].radius)*solScale,32,32 );
			//console.log(xpl.kmtoau(xpl.planets[2].radius)*solScale)
			var material = new THREE.MeshLambertMaterial( { color:0xffffff ,wireframe: true} );
			var sphere = new THREE.Mesh( geometry, material );
			
			var materialW = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, wireframeLinewidth: .5 } );
			var geometryW = new THREE.SphereGeometry( xpl.planets[p].radius/planScale,8,8 );
			var sphereW = new THREE.Mesh( geometryW, materialW );
			sphere.add(sphereW);

			var curPosition = xpl.SolarSystem(xpl.planets[p],xpl.now);
			sphere.position.set(curPosition[0]*solScale,curPosition[2]*solScale,curPosition[1]*solScale);
			sphere.rotateX(-xpl.planets[p].oblique*Math.PI/180)
			sphere.name = xpl.planets[p].name
			drawPlanets.push(sphere);
		}
   
}

makePlanets()
    
   var mwGeo = new THREE.SphereGeometry(900,32,32)
   var mwMat = new THREE.MeshBasicMaterial({color:0xffffff, side:THREE.DoubleSide})
   var mwMesh = new THREE.Mesh(mwGeo,mwMat)
   loader.load("../data/images/milkywaypan_brunier.jpg",function (image){
        var texture = new THREE.Texture()
        texture.image = image
        texture.needsUpdate = true
        mwMesh.material.map = texture
        //how to get tilt of galactic plane?
        mwMesh.rotation.set(0,0,60*Math.PI/180)
        scene.add(mwMesh)
   })


drawPlanets.forEach(function(planet, index){
	var texturePath = "../data/images/"
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

    var ISSGeo = new THREE.SphereGeometry( .00001*solScale,16,16 );
	var ISSMat = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
	var ISSeciMat = new THREE.MeshBasicMaterial( { color: 0xff00ff } );
	var ISS_ecf = new THREE.Mesh(ISSGeo,ISSMat);
    var ISS_eci = new THREE.Mesh(ISSGeo,ISSeciMat)
    //scene.add(ISS_eci)
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

camera.position.set(drawPlanets[2].position.x,drawPlanets[2].position.y+.0001,drawPlanets[2].position.z)
//camera.lookAt(drawPlanets[2].position.x,drawPlanets[2].position.y,drawPlanets[2].position.z)
camera.rotation.y = -1.0301412288052558

var render = function () {
	camera.position.set(drawPlanets[2].position.x,drawPlanets[2].position.y+.0001,drawPlanets[2].position.z)

    mwMesh.position.set(camera.position.x,camera.position.y,camera.position.z)
	//KEEP CAMERA LOOKING AT EARTH
    controls.center = new THREE.Vector3(drawPlanets[2].position.x,drawPlanets[2].position.y+.1,drawPlanets[2].position.z)
    //controls.update()
	xpl.updateTime()
	var step = .0005
	t+=step;
	console.log(xpl.now+t)
	var xyz = tlObj.update(t);
	xyz = tlObj.position_ecf;
    
	var ISSPosition = [xpl.kmtoau(xyz.x)*solScale,xpl.kmtoau(xyz.z)*solScale,xpl.kmtoau(-xyz.y)*solScale]
	ISS_ecf.position.set(ISSPosition[0],ISSPosition[1],ISSPosition[2]);
	var iss_helio = xpl.ecf_to_heliocentric(ISS_ecf.position,xpl.now+t)
	ISS_eci.position.set(iss_helio.x,iss_helio.z,iss_helio.y)

	
    
   /* ECI Conversion is slightly off 
   xyz_eci = tlObj.position_eci;
    var ISSeciPos = new THREE.Vector3(xpl.kmtoau(xyz_eci.x)*solScale,xpl.kmtoau(xyz_eci.z)*solScale,xpl.kmtoau(-xyz_eci.y)*solScale)
    ISSeciPos.applyAxisAngle(new THREE.Vector3(1,0,0),(-xpl.curEarthOblique(xpl.now+t)*Math.PI/180)-.045)
    ISSeciPos.add(drawPlanets[2].position)
    ISS_eci.position.copy(ISSeciPos)
    console.log(ISS_eci.position)
    console.log(tlObj.helioCoords)
   */
	requestAnimationFrame( render );
	
   	for(p in drawPlanets){
		var curPosition = xpl.SolarSystem(xpl.planets[p],xpl.now+t);
        //curRotation could be worked into library. Formula is (% of day at time) * (length of day on planet/julian day) * 1 rotation in radians + difference between julian noon and solar noon
        var curRotation = ((xpl.now+t)%(xpl.planets[p].dayLength/23.9344))*2*Math.PI-0.166667
		var oblique = xpl.planets[p].oblique*(Math.PI/180)
		drawPlanets[p].rotation.y = curRotation
		drawPlanets[p].position.set(curPosition[0]*solScale,curPosition[2]*solScale,curPosition[1]*solScale)
	}
	renderer.render(scene, camera);
};

document.addEventListener("keydown",function(event){
	if(event.keyCode === 16 || event.charCode === 16){
		controls.zoomSpeed = 1
		controls.rotateSpeed = 1
		controls.panSpeed = 1
	}
})

document.addEventListener("keyup",function(){
	controls.zoomSpeed = .1
	controls.rotateSpeed = .01
		controls.panSpeed = .01
	})

render();

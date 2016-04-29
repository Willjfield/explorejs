var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 55, window.innerWidth/window.innerHeight, 0.00001, 1000 );

var renderer = new THREE.WebGLRenderer({ /*alpha: true*/ });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.domElement.style.position = 'fixed'
document.body.appendChild( renderer.domElement );

var light = new THREE.AmbientLight( 0x343434 ); // soft white light
scene.add( light );

var rotX = rotY = rotZ = ((Math.random()*2)-1)*.0005
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
    
var mwGeo = new THREE.SphereGeometry(900,48,48)
var mwMat = new THREE.MeshBasicMaterial({color:0xffffff, side:THREE.DoubleSide})
var mwMesh = new THREE.Mesh(mwGeo,mwMat)
loader.load("../../lib/data/images/milkywaypan_brunier.jpg",function (image){
    var texture = new THREE.Texture()
    texture.image = image
    texture.needsUpdate = true
    mwMesh.material.map = texture
    scene.add(mwMesh)
})

var render = function () {
    camera.rotateX(rotX)
    camera.rotateY(rotY)
    camera.rotateZ(rotZ)
	requestAnimationFrame( render );
	renderer.render(scene, camera);
};
document.onmousemove =	function(){

}
render();

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

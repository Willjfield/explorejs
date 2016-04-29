var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var controls, renderer;



function init(){
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	controls = new THREE.OrbitControls(camera, renderer.domElement);
						controls.enableDamping = true;
						controls.dampingFactor = 0.25;
						controls.minDistance = 0;
						controls.minPolarAngle = 0; // radians
						controls.maxPolarAngle = Math.PI*2

	camera.position.z = 5;
}

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

var loader = new THREE.OBJLoader( manager );
			loader.load( 'models/chichenitza.obj', function ( object ) {

					object.traverse( function ( child ) {

							if ( child instanceof THREE.Mesh ) {

									var textureLoader = new THREE.TextureLoader();
											textureLoader.load('El_Caracol.1Surface_Color.jpg', function(t){
													child.material.map = texture;
									});
									//	child.material.map = texture;

							}

					} );

					xScale = 3;
					object.scale.x = object.scale.y = object.scale.z = xScale;

					object.position.y = 0;
					scene.add( object );

			} );

function render(){
	requestAnimationFrame( render );

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	controls.update();
	renderer.render(scene, camera);
}

init();
render();

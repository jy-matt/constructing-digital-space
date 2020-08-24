import Stats from './threejs/jsm/libs/stats.module.js';

import {
	OrbitControls
} from './threejs/jsm/controls/OrbitControls.js';
import {
	GLTFLoader
} from './threejs/jsm/loaders/GLTFLoader.js';
import {
	DRACOLoader
} from './threejs/jsm/loaders/DRACOLoader.js';

var scene, camera, dirLight, stats;
var renderer, mixer, controls;

var clock = new THREE.Clock();
var container = document.getElementById("container");

stats = new Stats();
//container.appendChild(stats.dom);

renderer = new THREE.WebGLRenderer({
	antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3dd);

camera = new THREE.PerspectiveCamera(40, 2, 1, 100);
camera.position.set(5, 2, 8);

controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.5, 0);
controls.update();
controls.enablePan = false;
controls.enableDamping = true;

scene.add(new THREE.HemisphereLight(0xffffff, 0x000000, 0.4));

dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 2, 8);
scene.add(dirLight);

// envmap
var path = './threejs/textures/cube/Park2/';
var format = '.jpg';
var envMap = new THREE.CubeTextureLoader().load([
	path + 'posx' + format, path + 'negx' + format,
	path + 'posy' + format, path + 'negy' + format,
	path + 'posz' + format, path + 'negz' + format
]);

var dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./threejs/js/libs/draco/gltf/');

var loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
loader.load('./threejs/models/gltf/LittlestTokyo.glb', function(gltf) {

	var model = gltf.scene;
	model.position.set(1, 1, 0);
	model.scale.set(0.01, 0.01, 0.01);
	model.traverse(function(child) {

		if (child.isMesh) child.material.envMap = envMap;

	});

	scene.add(model);

	mixer = new THREE.AnimationMixer(model);
	mixer.clipAction(gltf.animations[0]).play();

	animate();

}, undefined, function(e) {

	console.error(e);

});

function resizeCanvasToDisplaySize() {
  const canvas = container;
  // look up the size the canvas is being displayed
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  // adjust displayBuffer size to match
  if (canvas.width !== width || canvas.height !== height) {
    // you must pass false here or three.js sadly fights the browser
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // update any render target sizes here
  }
}

window.onresize = resizeCanvasToDisplaySize();


function animate() {
	resizeCanvasToDisplaySize();
	requestAnimationFrame(animate);

	var delta = clock.getDelta();

	mixer.update(delta);

	controls.update();

	stats.update();

	renderer.render(scene, camera);

}

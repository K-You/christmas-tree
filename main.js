import * as THREE from 'THREE';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import dat from 'dat.gui';
import './style.css';

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(74, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.setZ(30);
camera.position.x = -3;

renderer.render(scene, camera);

// Light
const pointLight = new THREE.PointLight(0xFFFFFF);
pointLight.position.set(5,0,0);

const ambientLight = new THREE.AmbientLight(0xFFFFFF);
scene.add(pointLight, ambientLight);

// Helper
// const lightHelper = new THREE.PointLightHelper(pointLight);
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);


// Tree + dat.GUI
// const gui = new dat.GUI();
// gui.add(camera.position, 'x', -50, 50, 1);
// gui.add(camera.position, 'y', -50, 50, 1);
// gui.add(camera.position, 'z', -50, 50, 1);

// Array of animations mixers
const mixers = [];

const gltfLoader = new GLTFLoader();
let tree = null;
gltfLoader.load('assets/low_poly_coniferous_tree/scene.gltf', (gltf) => {
  gltf.scene.position.set(0, -4, 0);

  // gui.add(gltf.scene.position, 'x', -20, 20, 1);
  // gui.add(gltf.scene.position, 'y', -20, 20, 1);
  // gui.add(gltf.scene.position, 'z', -20, 20, 1);

  tree = gltf.scene;
  scene.add(gltf.scene);
});

// Add Snowflakes
const snowflakes = [];
function addSnowflakes(snowflakes_count){
  Array(snowflakes_count).fill().forEach(addSnowflake);
}

function addSnowflake() {
  const geometry = new THREE.SphereGeometry(0.05);
  const material = new THREE.MeshStandardMaterial({color: 0xffffff});
  const snowflake = new THREE.Mesh(geometry, material);

  const [x,y,z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
  
  snowflake.position.set(x,y,z);
  snowflakes.push(snowflake);
  scene.add(snowflake);
}
addSnowflakes(700);

//Animation
let previousRAF = null;
function animate(t){
  requestAnimationFrame(animate);

  camera.position.x = 10*Math.cos(0.0005*t);
  camera.position.z = 10*Math.sin(0.0005*t);

  camera.lookAt(0,0,0);

  snowflakes.forEach(flake => {
    if (flake.position.y > -50) {
      flake.position.y -= 0.25;
    } else {
      flake.position.y = 50;
    }
  })

  renderer.render(scene, camera);
  if(previousRAF === null){
    previousRAF = t;
  }

  const timeElapsed = (t-previousRAF) * 0.001;
  if(mixers){
    mixers.map(m => {m.update(timeElapsed)})
  }
  previousRAF = t;

  // controls.update();

}

// Background 
const spaceTexture = new THREE.TextureLoader().load('assets/space.jpg');
scene.background = spaceTexture;

// Window resizing
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', () => {
  onWindowResize();
}, false);

animate();
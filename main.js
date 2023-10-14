import * as THREE from 'three';
import './style.css';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { checkIntersection} from './helpers'

//popup handling
const popup1 = document.getElementById('popup1');

// Create the scene
const scene = new THREE.Scene();

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

let boatScene;
let tennisBallScene;
let tennisRacketScene;

// Make GLTF loader
const gltfLoader = new GLTFLoader();

// Create the rowboat
gltfLoader.load('./assets/Rowboat.glb', (boatModel) => {
  boatModel.scene.scale.set(0.15, 0.15, 0.15);
  boatModel.scene.rotation.y = Math.PI;
  boatScene = boatModel.scene;
  scene.add(boatScene);
});

// Create tennis ball
gltfLoader.load('./assets/Tennis ball.glb', (tennisBallModel) => {
  tennisBallModel.scene.scale.set(20,20,20);
  tennisBallModel.scene.position.set(0, 5, -50);
  tennisBallScene = tennisBallModel.scene;
  scene.add(tennisBallScene);
});
// Create tennis racket
gltfLoader.load('./assets/Tennis racket.glb', (tennisRacketModel) => {
  tennisRacketModel.scene.scale.set(0.1, 0.1, 0.1);
  tennisRacketModel.scene.position.set(0, 5, -50);
  tennisRacketScene = tennisRacketModel.scene;
  scene.add(tennisRacketScene);
});

// creating self-portrait
const frameGeometry = new THREE.BoxGeometry(10, 10, 1);
frameGeometry.translate(10, 5, -50); // Adjust the position as needed

const textureLoader = new THREE.TextureLoader();
const frontTexture = textureLoader.load('./images/profileImage.jpg');
const frontMaterial = new THREE.MeshBasicMaterial({ map: frontTexture });

const otherMaterial = new THREE.MeshBasicMaterial({ color: 0x999999 });

const frameMaterials = [
  otherMaterial,      // Right face
  otherMaterial,      // Left face
  otherMaterial,      // Top face
  otherMaterial,      // Bottom face
  frontMaterial,      // Front face (with the image texture)
  otherMaterial,      // Back face
];

const frame = new THREE.Mesh(frameGeometry, frameMaterials);
scene.add(frame);

// Create the floor
const floorGeometry = new THREE.PlaneGeometry(150, 150, 30, 30);
floorGeometry.rotateX(-Math.PI * 0.5);
let vertData = [];
let v3 = new THREE.Vector3(); // for re-use
console.log(floorGeometry.attributes.position.count)
for (let i = 0; i < floorGeometry.attributes.position.count; i++) {
  v3.fromBufferAttribute(floorGeometry.attributes.position, i);
  vertData.push({
    initH: v3.y,
    amplitude: THREE.MathUtils.randFloatSpread(2),
    phase: THREE.MathUtils.randFloat(0, Math.PI)
  })
}
let oceanMaterial = new THREE.MeshLambertMaterial({
  color: "aqua"
});
let ocean = new THREE.Mesh(floorGeometry, oceanMaterial);
scene.add(ocean);

//Island 1: About Me
const island1Geometry = new THREE.BoxGeometry(60, 4, 20);
const island1Material = new THREE.MeshLambertMaterial({ color: 0xDa9100 }); // Brown color

const island1Mesh = new THREE.Mesh(island1Geometry, island1Material);
island1Mesh.position.set(0, 0, -50);

scene.add(island1Mesh);

const island1InfoGeometry = new THREE.CylinderGeometry(5, 5, 1);
const island1InfoMaterial = new THREE.MeshLambertMaterial({ color: 0x008000 });

const island1InfoMesh = new THREE.Mesh(island1InfoGeometry, island1InfoMaterial);
island1InfoMesh.position.set(0, 0, -30);

scene.add(island1InfoMesh);

// Light
let light = new THREE.DirectionalLight(0xffffff, 1);
light.position.setScalar(1);
scene.add(light, new THREE.AmbientLight(0xffffff, 0.25));

//const lightHelper = new THREE.PointLightHelper(pointLight);
//const gridHelper = new THREE.GridHelper(200, 50);
//scene.add(lightHelper, gridHelper);

// Camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 20, 40);
scene.add(camera);

// Renderer
const canvas = document.querySelector('.webgl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;

// Arrow key movement for the boat
const boatSpeed = 0.1;
const boatDirection = new THREE.Vector3();

// ball animation parameters
let ballDirection = 1;
let ballSpeed = 0.1;

window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
      boatDirection.z = -boatSpeed;
      boatScene.rotation.y = Math.PI;
      break;
    case 'ArrowDown':
      boatDirection.z = boatSpeed;
      boatScene.rotation.y = 0;
      break;
    case 'ArrowLeft':
      boatDirection.x = -boatSpeed;
      boatScene.rotation.y = -Math.PI/2;
      break;
    case 'ArrowRight':
      boatDirection.x = boatSpeed;
      boatScene.rotation.y = Math.PI/2;
      break;
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'ArrowUp':
    case 'ArrowDown':
      boatDirection.z = 0;
      break;
    case 'ArrowLeft':
    case 'ArrowRight':
      boatDirection.x = 0;
      break;
  }
});

// Resize
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.updateProjectionMatrix();
  camera.aspect = sizes.width / sizes.height;
  renderer.setSize(sizes.width, sizes.height);
});

let clock = new THREE.Clock();

const animate = () => {
  window.requestAnimationFrame(animate);

  let time = clock.getElapsedTime();

  vertData.forEach((vd, idx) => {
    let y = vd.initH + Math.sin(time + vd.phase) * vd.amplitude;
    floorGeometry.attributes.position.setY(idx, y);
  })
  floorGeometry.attributes.position.needsUpdate = true;
  floorGeometry.computeVertexNormals();
  
  //ball animation
  if (tennisBallScene && tennisRacketScene ) {
    tennisBallScene.position.y += ballDirection * ballSpeed;
    var maxHeight = tennisRacketScene.position.y + 10;
    if (ballDirection === 1 & tennisBallScene.position.y >= maxHeight) {
      ballDirection = -1;
    }
    if (ballDirection === -1 & tennisBallScene.position.y <= tennisRacketScene.position.y) {
      ballDirection = 1;
    }
  }

  // Update boat position and rotation
  if (boatScene) {
    boatScene.position.add(boatDirection);

    // Calculate the new camera position relative to the boat
    const offset = new THREE.Vector3(0, 20, 40); // Set your desired offset
    const boatPosition = boatScene.position.clone();

    // Calculate the camera position
    const cameraPosition = boatPosition.clone().add(offset);

    camera.position.copy(cameraPosition);
    camera.lookAt(boatPosition); // Make the camera look at the boat

    // Update the camera matrix for orbit controls
    controls.target.copy(boatPosition);

    if (checkIntersection(boatScene, island1InfoMesh)) {
      island1InfoMesh.material.color.setHex(0x39ff14);
      popup1.style.display = "block";
    } else {
      island1InfoMesh.material.color.setHex(0x008000);
      popup1.style.display = "none";
    }
  }

  controls.update();
  renderer.render(scene, camera);
};

animate();

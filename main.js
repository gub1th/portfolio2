import * as THREE from 'three';
import './style.css';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Create the scene
const scene = new THREE.Scene();

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

let boatScene;

// Make GLTF loader
const gltfLoader = new GLTFLoader();

// Create the rowboat
gltfLoader.load('./assets/Rowboat.glb', (boatModel) => {
  boatModel.scene.scale.set(0.15, 0.15, 0.15);
  boatModel.scene.rotation.y = Math.PI;
  boatScene = boatModel.scene;
  scene.add(boatScene);
});

// Create the floor
const floorGeometry = new THREE.PlaneGeometry(50, 50);
const floorMaterial = new THREE.MeshStandardMaterial({ color: '#aaaaaa', roughness: 0.8 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Light
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 10, 10);
pointLight.intensity = 100;
scene.add(pointLight);

const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper, gridHelper);

// Camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 20, 40);
scene.add(camera);

// Renderer
const canvas = document.querySelector('.webgl');
const renderer = new THREE.WebGLRenderer({ canvas });
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

const animate = () => {
  window.requestAnimationFrame(animate);

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

    console.log(cameraPosition, boatPosition);
  }

  controls.update();
  renderer.render(scene, camera);
};

animate();

animate();

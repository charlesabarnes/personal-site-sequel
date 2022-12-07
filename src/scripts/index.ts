import { Scene, PerspectiveCamera, WebGLRenderer} from 'three'; 
import { Player } from './entities/player';

const scene = new Scene();

const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 40;

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const player = new Player('#ffffff');
scene.add(player.mesh);

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

function animate() {
  requestAnimationFrame(animate);

  player.mesh.rotation.x += 0.01;
  player.mesh.rotation.y += 0.00000001;

  render();
}

function render() {
  renderer.render(scene, camera);
}

animate();
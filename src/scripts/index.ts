import { Scene, PerspectiveCamera, WebGLRenderer} from 'three'; 
import { Player } from './entities/player';
import { WavyBackground } from './entities/wavy-background';

const scene = new Scene();
const camera = new PerspectiveCamera(
  10,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 40;

const renderer = new WebGLRenderer({alpha: true});
renderer.setClearColor(0xffffff, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const player = new Player('#ffffff');
scene.add(player.mesh);
player.mesh.position.z = -250;
player.mesh.position.x = -.4;
player.mesh.position.y = -15;

const background = new WavyBackground(scene, window.innerWidth/10, window.innerHeight/10);

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

background.pointclouds.forEach((pointcloud) => {
  pointcloud.rotation.x += .0;
  pointcloud.rotation.y += 1.571;
  pointcloud.rotation.z +=  4.712;
  pointcloud.position.z += 30;
  pointcloud.position.y += .7;
});


function animate() {
  requestAnimationFrame(animate);

  // player.mesh.rotation.x += 0.01;
  // player.mesh.rotation.y += 0.00000001;


  render();
}

function render() {
  renderer.render(scene, camera);
}

const interval ={};
document.addEventListener('keydown', onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  const speedMultiplier = 5;
  const moveRate = 0.3/speedMultiplier;
  const rotateRate = 0.09/speedMultiplier;

  if (interval[event.key]) {
    return;
  }
  interval[event.key] = setInterval(() => {
    if (event.key == 'up' || event.key == 'ArrowUp') {
      player.mesh.position.y += moveRate * Math.cos(player.mesh.rotation.z);
      player.mesh.position.x -= moveRate * Math.sin(player.mesh.rotation.z);
    } else if (event.key == 'down' || event.key == 'ArrowDown') {
      player.mesh.position.y -= moveRate * Math.cos(player.mesh.rotation.z);
      player.mesh.position.x += moveRate * Math.sin(player.mesh.rotation.z);
    } else if (event.key == 'left' || event.key == 'ArrowLeft') {
      player.mesh.rotation.z += rotateRate;
    }else if (event.key == 'right' || event.key == 'ArrowRight') {
      player.mesh.rotation.z -= rotateRate;
    }
  }, (1000/250)); // 250 fps
}
document.addEventListener('keyup', onDocumentKeyUp, false);

function onDocumentKeyUp(event) {
  clearInterval(interval[event.key]);
  delete interval[event.key];
}

animate();
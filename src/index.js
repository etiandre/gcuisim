import * as THREE from 'three';
import GCNBiosShine from './assets/GCNBiosShine.png';
import CubeObj from './assets/cube.obj';

const OBJLoader = require('three-obj-loader');

OBJLoader(THREE);

let scene;
let camera;
let renderer;
let meshParent;
let mesh;
let redrawUI = true;

const TEXSIZE = 512; // size of the textcanvas


function de2ra(degree) { return degree * (Math.PI / 180); }


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function renderScene() {
  renderer.render(scene, camera);
}

async function init() {
  // SETUP /////////////////////////////
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);

  document.body.appendChild(renderer.domElement);

  const canvas = document.getElementById('textCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = TEXSIZE;
  canvas.height = TEXSIZE;

  camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(0, 0, 8);
  camera.lookAt(scene.position);
  scene.add(camera);

  window.addEventListener('resize', onWindowResize, false);

  // CUBE /////////////////////////////
  const shineTexture = new THREE.CubeTextureLoader().load([
    GCNBiosShine,
    GCNBiosShine,
    GCNBiosShine,
    GCNBiosShine,
    GCNBiosShine,
    GCNBiosShine,
  ]); // ugly but that'll do
  const material = new THREE.MeshPhongMaterial({
    color: 0x636189,
    envMap: shineTexture,
    reflectivity: 1,
    transparent: true,
    side: THREE.BackSide,
    opacity: 0.57,
    shininess: 100,
  });

  mesh = new THREE.Mesh();
  meshParent = new THREE.Group();
  const loader = new THREE.OBJLoader();
  loader.load(CubeObj, (o) => {
    mesh.geometry = o.children[0].geometry;
    mesh.material = material;
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, 0, 0);
    mesh.rotation.y = de2ra(-90);
    mesh.scale.set(1, 1, 1);
    meshParent.add(mesh);
    scene.add(meshParent);
  });

  // LIGHTS //////////////////////////////
  const ambient = new THREE.AmbientLight(0xffffff);
  scene.add(ambient);

  const light1 = new THREE.PointLight(0x5311); // green highlights
  light1.position.set(1, 0, 2);
  scene.add(light1);

  const light2 = new THREE.PointLight(0xdddddd); // white
  light2.position.set(0, 1.5, 2);
  scene.add(light2);

  const light3 = new THREE.PointLight(0x001153); // blue highlights
  light3.position.set(-1, 0, 2);
  scene.add(light3);

  // TEXT / UI ////
  const sourceSansPro = new FontFace('Source Sans Pro',
    'url(https://fonts.gstatic.com/s/sourcesanspro/v11/6xKydSBYKcSV-LCoeQqfX1RYOo3ig4vwlxdu.woff2)',
    {
      weight: 700,
    });

  await sourceSansPro.load();
  document.fonts.add(sourceSansPro);
  ctx.font = 'bold 70px "Source Sans Pro", sans-serif';
  const textTexture = new THREE.Texture(canvas);
  const textPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.7, 1.7),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: textTexture,
      transparent: true,
    }),
  );
  textPlane.position.set(0, 0, 1);
  mesh.add(textPlane);


  // GUI ///////////////////////////////
  // var gui = new dat.GUI();
  // ANIMATION /////////////////////////////////
  const CubeStates = {
    FRONT: new THREE.Euler(0, 0, 0),
    LEFT: new THREE.Euler(0, Math.PI / 2, 0),
    RIGHT: new THREE.Euler(0, -Math.PI / 2, 0),
    UP: new THREE.Euler(Math.PI / 2, 0, 0),
    DOWN: new THREE.Euler(-Math.PI / 2, 0, 0),
  };
  meshParent.cubeState = CubeStates.FRONT;
  (function animate(ts) {
    requestAnimationFrame(animate);
    textTexture.needsUpdate = true;
    // FLOATING ANIMATION //
    mesh.position.y = 0.08 * Math.sin(ts / 800);
    mesh.position.x = 0.05 * Math.sin(ts / 800 + 3 * Math.PI / 4);
    mesh.rotation.x = 0.08 * Math.sin(ts / 800 + Math.PI / 4);
    mesh.rotation.y = 0.08 * Math.sin(ts / 800 / 3); // left-right
    mesh.rotation.z = 0.06 * Math.sin(ts / 800 + 1 * Math.PI / 6); // up-down

    // SIDE TRANSITIONS //
    if (meshParent.rotation.toVector3() !== meshParent.cubeState) {
      meshParent.rotation.setFromVector3(
        meshParent.rotation.toVector3().lerp(meshParent.cubeState, 0.2),
      );
    }
    if (redrawUI) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, TEXSIZE, TEXSIZE);
      switch (meshParent.cubeState) {
        case CubeStates.FRONT:
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText('Game Play', TEXSIZE / 2, 0);
          ctx.textBaseline = 'bottom';
          ctx.fillText('Memory Card', TEXSIZE / 2, TEXSIZE);
          ctx.rotate(Math.PI / 2);
          ctx.textBaseline = 'top';
          ctx.fillText('Calendar', TEXSIZE / 2, -TEXSIZE);
          ctx.rotate(Math.PI);
          ctx.fillText('Options', -TEXSIZE / 2, 0);
          break;
        case CubeStates.RIGHT:
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText('Calendar', TEXSIZE / 2, 0);
          break;
        case CubeStates.LEFT:
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText('Options', TEXSIZE / 2, 0);
          break;
        default:
      }
      redrawUI = false;
    }
    renderScene();
  }());
  // KEY EVENTS ////////////////////////////
  document.addEventListener('keydown', (event) => {
    const keyCode = event.which;
    switch (keyCode) {
      case 38:
        if (meshParent.cubeState === CubeStates.FRONT) {
          meshParent.cubeState = CubeStates.UP;
        } else if (meshParent.cubeState === CubeStates.DOWN) {
          meshParent.cubeState = CubeStates.FRONT;
        }
        break;
      case 40:
        if (meshParent.cubeState === CubeStates.FRONT) {
          meshParent.cubeState = CubeStates.DOWN;
        } else if (meshParent.cubeState === CubeStates.UP) {
          meshParent.cubeState = CubeStates.FRONT;
        }
        break;
      case 37:
        if (meshParent.cubeState === CubeStates.FRONT) {
          meshParent.cubeState = CubeStates.LEFT;
        } else if (meshParent.cubeState === CubeStates.RIGHT) {
          meshParent.cubeState = CubeStates.FRONT;
        }
        break;
      case 39:
        if (meshParent.cubeState === CubeStates.FRONT) {
          meshParent.cubeState = CubeStates.RIGHT;
        } else if (meshParent.cubeState === CubeStates.LEFT) {
          meshParent.cubeState = CubeStates.FRONT;
        }
        break;
      default:
    }
    redrawUI = true;
  }, false);
}

init();

import * as THREE from 'three';
import UIDrawer from './UIDrawer';
import GCNBiosShine from './assets/GCNBiosShine.png';
import CubeObj from './assets/cube.obj';


const OBJLoader = require('three-obj-loader');

OBJLoader(THREE);


// GLOBALS ////////////
let scene;
let camera;
let renderer;
let menu;
let floatingCube;
let redrawUI = true;


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

  floatingCube = new THREE.Mesh();
  menu = new THREE.Group();
  const loader = new THREE.OBJLoader();
  loader.load(CubeObj, (o) => {
    floatingCube.geometry = o.children[0].geometry;
    floatingCube.material = material;
    floatingCube.position.set(0, 0, 0);
    floatingCube.rotation.set(0, 0, 0);
    floatingCube.rotation.y = de2ra(-90);
    floatingCube.scale.set(1, 1, 1);
    menu.add(floatingCube);
    scene.add(menu);
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
  const uiDrawer = new UIDrawer();

  const textTexture = new THREE.Texture(uiDrawer.canvas);
  const textPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.7, 1.7),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: textTexture,
      transparent: true,
    }),
  );
  textPlane.position.set(0, 0, 1);
  floatingCube.add(textPlane);

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
  menu.cubeState = CubeStates.FRONT;
  (function animate(ts) {
    requestAnimationFrame(animate);
    // FLOATING ANIMATION //
    floatingCube.position.y = 0.08 * Math.sin(ts / 800);
    floatingCube.position.x = 0.05 * Math.sin(ts / 800 + 3 * Math.PI / 4);
    floatingCube.rotation.x = 0.08 * Math.sin(ts / 800 + Math.PI / 4);
    floatingCube.rotation.y = 0.08 * Math.sin(ts / 800 / 3); // left-right
    floatingCube.rotation.z = 0.06 * Math.sin(ts / 800 + 1 * Math.PI / 6); // up-down

    // SIDE TRANSITIONS //
    if (menu.rotation.toVector3() !== menu.cubeState) {
      menu.rotation.setFromVector3(
        menu.rotation.toVector3().lerp(menu.cubeState, 0.2), // TODO: make a real linear animation.
      );
    }
    // UI //
    if (redrawUI) {
      redrawUI = false;
      // move the UI to the face facing the camera
      const UIRot = new THREE.Euler(
        -menu.cubeState.x,
        -menu.cubeState.y,
        -menu.cubeState.z,
      ); // this does "let newRot = -1 * menu.cubeState". there has to be a better way... right ?
      textPlane.position.copy(new THREE.Vector3(0, 0, 1).applyEuler(UIRot));
      textPlane.rotation.copy(UIRot);

      textTexture.needsUpdate = true;
      switch (menu.cubeState) {
        case CubeStates.FRONT:
          uiDrawer.drawRadialMenu(['Game Play', 'Calendar', 'Memory Card', 'Options']);
          break;
        case CubeStates.RIGHT:
          uiDrawer.clear();
          uiDrawer.drawTopLabel('Calendar');
          uiDrawer.drawCenteredLabel(new Date().toLocaleDateString(), 110);
          uiDrawer.drawCenteredLabel(new Date().toLocaleTimeString(), 380);
          redrawUI = true; // redraw the UI next frame to get the clock ticking
          break;
        case CubeStates.LEFT:
          uiDrawer.clear();
          uiDrawer.drawTopLabel('Options');
          uiDrawer.drawOptionLabel('Sound', 'Stereo', 180);
          uiDrawer.drawOptionLabel('Screen Position', '0', 310);
          break;
        case CubeStates.UP:
          uiDrawer.clear();
          uiDrawer.drawTopLabel('Game Play');
          break;
        case CubeStates.DOWN:
          uiDrawer.clear();
          uiDrawer.drawTopLabel('Memory Card');
          break;
        default:
      }
    }
    renderScene();
  }());
  // KEY EVENTS ////////////////////////////
  document.addEventListener('keydown', (event) => {
    const keyCode = event.which;
    switch (keyCode) {
      case 38:
        if (menu.cubeState === CubeStates.FRONT) {
          menu.cubeState = CubeStates.UP;
        } else if (menu.cubeState === CubeStates.DOWN) {
          menu.cubeState = CubeStates.FRONT;
        }
        break;
      case 40:
        if (menu.cubeState === CubeStates.FRONT) {
          menu.cubeState = CubeStates.DOWN;
        } else if (menu.cubeState === CubeStates.UP) {
          menu.cubeState = CubeStates.FRONT;
        }
        break;
      case 37:
        if (menu.cubeState === CubeStates.FRONT) {
          menu.cubeState = CubeStates.LEFT;
        } else if (menu.cubeState === CubeStates.RIGHT) {
          menu.cubeState = CubeStates.FRONT;
        }
        break;
      case 39:
        if (menu.cubeState === CubeStates.FRONT) {
          menu.cubeState = CubeStates.RIGHT;
        } else if (menu.cubeState === CubeStates.LEFT) {
          menu.cubeState = CubeStates.FRONT;
        }
        break;
      default:
    }
    redrawUI = true;
  }, false);
}

// MAIN //////////

init();

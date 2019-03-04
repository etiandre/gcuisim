var scene, camera, renderer, threejs, clock, meshParent;
var gui = null;

var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight;

var mesh, color;

var de2ra = function (degree) { return degree * (Math.PI / 180); };

init();
/*
var reflectiveMaterial = new THREE.MeshPhongMaterial({
    color: 0x333333,
    //envMap: shineTexture,
    side: THREE.DoubleSide
});
*/

function init() {
    // SETUP /////////////////////////////
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0x000000, 1);

    document.body.appendChild(renderer.domElement);

    var canvas = document.getElementById('textCanvas');
    var ctx = canvas.getContext("2d");
    canvas.width = canvas.height = 256;

    camera = new THREE.PerspectiveCamera(25, WIDTH / HEIGHT, 1, 1000);
    camera.position.set(0, 0, 8);
    camera.lookAt(scene.position);
    scene.add(camera);

    cameraControls = new THREE.OrbitControls(camera);
    cameraControls.addEventListener('change', renderScene);

    window.addEventListener('resize', onWindowResize, false);

    // CUBE /////////////////////////////
    var shineTexture = new THREE.CubeTextureLoader().load([
        "img/GCNBiosShine.png",
        "img/GCNBiosShine.png",
        "img/GCNBiosShine.png",
        "img/GCNBiosShine.png",
        "img/GCNBiosShine.png",
        "img/GCNBiosShine.png"
    ]); // mdr c'est moche
    color = 0x636189;
    var material = new THREE.MeshPhongMaterial({
        color: color,
        envMap: shineTexture,
        reflectivity: 1,
        transparent: true,
        side: THREE.BackSide,
        opacity: 0.57,
        shininess: 100
    });

    mesh = new THREE.Mesh();
    meshParent = new THREE.Group();
    var loader = new THREE.OBJLoader();
    loader.load("res/cube.obj", function (o) {
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
    var ambient = new THREE.AmbientLight(0xffffff);
    scene.add(ambient);

    var light = new THREE.PointLight(0x5311); // green highlights
    light.position.set(1, 0, 2);
    scene.add(light);

    var light = new THREE.PointLight(0xdddddd); // white
    light.position.set(0, 1.5, 2);
    scene.add(light);

    var light = new THREE.PointLight(0x001153); // blue highlights
    light.position.set(-1, 0, 2);
    scene.add(light);

    // TEXT / UI ////

    ctx.font = '20pt Arial';
    ctx.fillStyle = "red";
    ctx.fillText("je suis une texture", 100, 100);
    var textTexture = new THREE.Texture(canvas);
    var textPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: textTexture
        })
    )
    textPlane.position.set(0,0,2);
    mesh.add(textPlane);


    // GUI ///////////////////////////////
    var controller = new function () {
        this.scaleX = 1;
        this.scaleY = 1;
        this.scaleZ = 1;
        this.positionX = 0;
        this.positionY = 0;
        this.positionZ = 0;
        this.rotationX = 0;
        this.rotationY = 90;
        this.rotationZ = 0;
    }();

    var gui = new dat.GUI();
    var f1 = gui.addFolder('Scale');
    f1.add(controller, 'scaleX', 0.1, 5).onChange(function () {
        mesh.scale.x = (controller.scaleX);
    });
    f1.add(controller, 'scaleY', 0.1, 5).onChange(function () {
        mesh.scale.y = (controller.scaleY);
    });
    f1.add(controller, 'scaleZ', 0.1, 5).onChange(function () {
        mesh.scale.z = (controller.scaleZ);
    });

    var f2 = gui.addFolder('Position');
    f2.add(controller, 'positionX', -5, 5).onChange(function () {
        mesh.position.x = (controller.positionX);
    });
    f2.add(controller, 'positionY', -3, 5).onChange(function () {
        mesh.position.y = (controller.positionY);
    });
    f2.add(controller, 'positionZ', -5, 5).onChange(function () {
        mesh.position.z = (controller.positionZ);
    });

    var f3 = gui.addFolder('Rotation');
    f3.add(controller, 'rotationX', -180, 180).onChange(function () {
        mesh.rotation.x = de2ra(controller.rotationX);
    });
    f3.add(controller, 'rotationY', -180, 180).onChange(function () {
        mesh.rotation.y = de2ra(controller.rotationY);
    });
    f3.add(controller, 'rotationZ', -180, 180).onChange(function () {
        mesh.rotation.z = de2ra(controller.rotationZ);
    });

    // ANIMATION /////////////////////////////////
    CubeStates = {
        "FRONT": new THREE.Vector3(0, 0, 0),
        "LEFT": new THREE.Vector3(0, Math.PI/2, 0),
        "RIGHT": new THREE.Vector3(0, -Math.PI/2, 0),
        "UP": new THREE.Vector3(Math.PI/2, 0, 0),
        "DOWN": new THREE.Vector3(-Math.PI/2, 0, 0)
    }
    meshParent.cubeState = CubeStates.FRONT;
    var clock = THREE.Clock();
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
        if (meshParent.rotation.toVector3() != meshParent.cubeState) {
             meshParent.rotation.setFromVector3(
                meshParent.rotation.toVector3().lerp(meshParent.cubeState, 0.2)
           );
        }
        renderScene();
    })();
    // KEY EVENTS ////////////////////////////
    document.addEventListener("keydown", function (event) {
        var keyCode = event.which;
        switch (keyCode) {
            case 38:
                if (meshParent.cubeState == CubeStates.FRONT)
                    meshParent.cubeState = CubeStates.UP;
                else if (meshParent.cubeState == CubeStates.DOWN)
                    meshParent.cubeState = CubeStates.FRONT
                break;
            case 40:
            if (meshParent.cubeState == CubeStates.FRONT)
                meshParent.cubeState = CubeStates.DOWN;
            else if (meshParent.cubeState == CubeStates.UP)
                meshParent.cubeState = CubeStates.FRONT
            break;
            case 37:
            if (meshParent.cubeState == CubeStates.FRONT)
                meshParent.cubeState = CubeStates.LEFT;
            else if (meshParent.cubeState == CubeStates.RIGHT)
                meshParent.cubeState = CubeStates.FRONT
            break;
            case 39:
            if (meshParent.cubeState == CubeStates.FRONT)
                meshParent.cubeState = CubeStates.RIGHT;
            else if (meshParent.cubeState == CubeStates.LEFT)
                meshParent.cubeState = CubeStates.FRONT
            break;
            case CubeStates.FRONT:
        }
        
    }, false);
}

function dec2hex(i) {
    var result = "0x000000";
    if (i >= 0 && i <= 15) { result = "0x00000" + i.toString(16); }
    else if (i >= 16 && i <= 255) { result = "0x0000" + i.toString(16); }
    else if (i >= 256 && i <= 4095) { result = "0x000" + i.toString(16); }
    else if (i >= 4096 && i <= 65535) { result = "0x00" + i.toString(16); }
    else if (i >= 65535 && i <= 1048575) { result = "0x0" + i.toString(16); }
    else if (i >= 1048575) { result = '0x' + i.toString(16); }
    if (result.length == 8) { return result; }

}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}



function renderScene() {
    renderer.render(scene, camera);
}

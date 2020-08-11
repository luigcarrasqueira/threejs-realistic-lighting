import * as THREE from "./Three.js";
import {OrbitControls} from "./OrbitControls.js";
import GLTFLoader from "./GLTFLoader.js";

let scene;
let camera;
let renderer;
let controls;
let spotLight

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.CubeTextureLoader().setPath("./skybox/").load([
        "posx.jpg", "negx.jpg", "posy.jpg", "negy.jpg", "posz.jpg", "negz.jpg"
    ]);

    camera = new THREE.PerspectiveCamera(25, window.innerWidth/window.innerHeight, .1, 5000);
    camera.position.set(0, 25, 25);

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2.3;
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);

    window.addEventListener("resize", () => updateAspectRatio());

    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    
    const hemisphereLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
    scene.add(hemisphereLight);

    spotLight = new THREE.SpotLight(0xffecdc, 4);
    spotLight.castShadow = true;
    spotLight.shadow.bias = -.0001;
    spotLight.shadow.mapSize.width = 1024*4;
    spotLight.shadow.mapSize.height = 1024*4;
    scene.add(spotLight);

    const loadingManager = new THREE.LoadingManager(function() {
        const loadingScreen = document.getElementById("loading-screen");

        loadingScreen.classList.add("fade-out");
		loadingScreen.addEventListener("transitionend", function(event) {
            event.target.remove();
        });
    });

    const loader = new GLTFLoader(loadingManager);
    loader.load("./model/black_leather_chair.gltf", function(result) {
        for (let model of result.scene.children) {
            model.scale.set(10,10,10)
            model.position.set(0, -5, 0);
            model.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    if (child.material.map) child.material.map.anisotropy = 16;
                }
            });
            scene.add(model);
        }
    });

    animate();
}

function animate() {
    renderer.render(scene, camera);
    spotLight.position.set(
        camera.position.x + 15,
        camera.position.y + 15,
        camera.position.z + 15
    );

    requestAnimationFrame(animate);
}

function updateAspectRatio() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let aspectRatio = width/height;

    renderer.setSize(width, height);
    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();
}

document.addEventListener("DOMContentLoaded", function() {
    init();
});

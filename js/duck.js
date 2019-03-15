var orbitControls;
var container, camera, scene, renderer, loader;
var gltf, background, envMap, mixer, gui, extensionControls;
var clock = new THREE.Clock();
var scenes = {
    Duck: {
        name: 'Duck',
        url: './model/%s/Duck.gltf',
        author: 'Sony',
        authorURL: 'https://www.playstation.com/en-us/corporate/about/',
        cameraPos: new THREE.Vector3(4, 4, -4),
        addLights: true,
        addGround: false,
        shadows: true,
        extensions: ['glTF']
    }
};
var state = {
    scene: Object.keys(scenes)[0],
    extension: scenes[Object.keys(scenes)[0]].extensions[0],
};

function onload() {
    container = document.getElementById('duck-container');
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.gammaOutput = true;
    renderer.physicallyCorrectLights = true;
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);
    initScene(scenes[state.scene]);
    animate();
}

function initScene(sceneInfo) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.001, 1000);
    scene.add(camera);
    var spot1;
    if (sceneInfo.addLights) {
        var ambient = new THREE.AmbientLight(0xffffff);
        scene.add(ambient);
        var directionalLight = new THREE.DirectionalLight(0xffffff, 4);
        directionalLight.position.set(0, 0, 1).normalize();
        scene.add(directionalLight);
        spot1 = new THREE.SpotLight(0xffffff, 1);
        spot1.position.set(2, 5, -5);
        spot1.angle = 0.50;
        spot1.penumbra = 0.75;
        spot1.intensity = 100;
        spot1.decay = 2;
        if (sceneInfo.shadows) {
            spot1.castShadow = true;
            spot1.shadow.bias = 0.0001;
            spot1.shadow.mapSize.width = 2048;
            spot1.shadow.mapSize.height = 2048;
        }
        scene.add(spot1);
    }
    if (sceneInfo.shadows) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    // TODO: Reuse existing OrbitControls, GLTFLoaders, and so on
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    if (sceneInfo.addGround) {
        var groundMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF
        });
        var ground = new THREE.Mesh(new THREE.PlaneBufferGeometry(512, 512), groundMaterial);
        ground.receiveShadow = !!sceneInfo.shadows;
        if (sceneInfo.groundPos) {
            ground.position.copy(sceneInfo.groundPos);
        } else {
            ground.position.z = 0;
        }
        ground.rotation.x = -Math.PI / 2;
        scene.add(ground);
    }

    loader = new THREE.GLTFLoader();

    var url = sceneInfo.url.replace(/%s/g, state.extension);

    var loadStartTime = performance.now();
    loader.load(url, function (data) {
        gltf = data;
        var object = gltf.scene;
        console.info('Load time: ' + (performance.now() - loadStartTime).toFixed(2) + ' ms.');
        if (sceneInfo.cameraPos) {
            camera.position.copy(sceneInfo.cameraPos);
        }
        // if (sceneInfo.center) {

            orbitControls.target.set(0, 0.8, 0);
        // }
        if (sceneInfo.objectPosition) {
            object.position.copy(sceneInfo.objectPosition);
            if (spot1) {
                spot1.target.position.copy(sceneInfo.objectPosition);
            }
        }
        if (sceneInfo.objectRotation) {
            object.rotation.copy(sceneInfo.objectRotation);
        }
        if (sceneInfo.objectScale) {
            object.scale.copy(sceneInfo.objectScale);
        }
        if (sceneInfo.addEnvMap) {
            object.traverse(function (node) {
                if (node.material && (node.material.isMeshStandardMaterial || (node.material
                        .isShaderMaterial && node.material.envMap !== undefined))) {
                    node.material.envMap = envMap;
                    node.material.envMapIntensity = 1.5; // boombox seems too dark otherwise
                }
            });
            scene.background = background;
        }
        object.traverse(function (node) {
            if (node.isMesh || node.isLight) node.castShadow = true;
        });
        var animations = gltf.animations;
        if (animations && animations.length) {
            mixer = new THREE.AnimationMixer(object);
            for (var i = 0; i < animations.length; i++) {
                var animation = animations[i];
                // There's .3333 seconds junk at the tail of the Monster animation that
                // keeps it from looping cleanly. Clip it at 3 seconds
                if (sceneInfo.animationTime) {
                    animation.duration = sceneInfo.animationTime;
                }
                var action = mixer.clipAction(animation);
            }
        }
        scene.add(object);
        onWindowResize();
    }, undefined, function (error) {
        console.error(error);
    });
}

function onWindowResize() {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    if (mixer) mixer.update(clock.getDelta());
    orbitControls.update();
    render();
}

function render() {
    renderer.render(scene, camera);
}

onload();

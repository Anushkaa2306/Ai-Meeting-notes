import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

// ---------------- Scene ----------------

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.z = 45;

// ---------------- Renderer ----------------

const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// ---------------- Create Soft Particle Texture ----------------

function createParticleTexture() {

    const size = 128;

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");

    const gradient = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
    );

    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.2, "rgba(255,255,255,0.9)");
    gradient.addColorStop(0.5, "rgba(255,255,255,0.35)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);

    return texture;
}

const particleTexture = createParticleTexture();

// ---------------- Particles ----------------

const count = 3500;

const geometry = new THREE.BufferGeometry();

const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

const color1 = new THREE.Color("#8B5CF6");
const color2 = new THREE.Color("#38BDF8");

for (let i = 0; i < count; i++) {

    const i3 = i * 3;

    positions[i3] = (Math.random() - 0.5) * 90;
    positions[i3 + 1] = (Math.random() - 0.5) * 90;
    positions[i3 + 2] = (Math.random() - 0.5) * 90;

    const mixed = color1.clone().lerp(color2, Math.random());

    colors[i3] = mixed.r;
    colors[i3 + 1] = mixed.g;
    colors[i3 + 2] = mixed.b;
}

geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
);

geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(colors, 3)
);

// ---------------- Material ----------------

const material = new THREE.PointsMaterial({

    size: 0.45,

    map: particleTexture,

    transparent: true,

    alphaTest: 0.01,

    depthWrite: false,

    vertexColors: true,

    blending: THREE.AdditiveBlending,

    opacity: 0.9

});

// ---------------- Mesh ----------------

const particles = new THREE.Points(
    geometry,
    material
);

scene.add(particles);

// ---------------- Mouse ----------------

let mouse = {
    x: 0,
    y: 0
};

let target = {
    x: 0,
    y: 0
};

window.addEventListener("mousemove", (e) => {

    target.x = (e.clientX / window.innerWidth - 0.5) * 0.35;

    target.y = (e.clientY / window.innerHeight - 0.5) * 0.25;

});

// ---------------- Animation ----------------

const clock = new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();

    mouse.x += (target.x - mouse.x) * 0.04;
    mouse.y += (target.y - mouse.y) * 0.04;

    particles.rotation.y += 0.0004;
    particles.rotation.x += 0.00015;

    particles.rotation.y += mouse.x * 0.01;
    particles.rotation.x += mouse.y * 0.01;

    particles.position.y = Math.sin(t * 0.25) * 0.8;

    camera.position.x += (mouse.x * 8 - camera.position.x) * 0.02;
    camera.position.y += (-mouse.y * 6 - camera.position.y) * 0.02;

    camera.lookAt(scene.position);

    renderer.render(scene, camera);

}

animate();

// ---------------- Resize ----------------

window.addEventListener("resize", () => {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

});
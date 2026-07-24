// import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

// /* ==========================================================
//    MEETINGMIND AI
//    Neural Network Background
//    Part 1
// ========================================================== */

// // ---------------- Scene ----------------

// const scene = new THREE.Scene();

// scene.fog = new THREE.FogExp2(0x050816, 0.018);

// // ---------------- Camera ----------------

// const camera = new THREE.PerspectiveCamera(
//     60,
//     window.innerWidth / window.innerHeight,
//     0.1,
//     1000
// );

// camera.position.set(0, 0, 42);

// // ---------------- Renderer ----------------

// const renderer = new THREE.WebGLRenderer({
//     alpha: true,
//     antialias: true
// });

// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// renderer.setSize(
//     window.innerWidth,
//     window.innerHeight
// );

// renderer.domElement.style.position = "fixed";
// renderer.domElement.style.top = "0";
// renderer.domElement.style.left = "0";
// renderer.domElement.style.zIndex = "-10";
// renderer.domElement.style.pointerEvents = "none";

// document.body.appendChild(renderer.domElement);

// /* ==========================================================
//    COLORS
// ========================================================== */

// const palette = [

//     new THREE.Color("#8B5CF6"),
//     new THREE.Color("#5B7CFA"),
//     new THREE.Color("#38BDF8"),
//     new THREE.Color("#A855F7"),
//     new THREE.Color("#FFFFFF")

// ];

// /* ==========================================================
//    PARTICLE TEXTURE
// ========================================================== */

// function createGlowTexture() {

//     const size = 256;

//     const canvas = document.createElement("canvas");

//     canvas.width = size;
//     canvas.height = size;

//     const ctx = canvas.getContext("2d");

//     const gradient = ctx.createRadialGradient(

//         size / 2,
//         size / 2,
//         0,

//         size / 2,
//         size / 2,
//         size / 2

//     );

//     gradient.addColorStop(0, "rgba(255,255,255,1)");
//     gradient.addColorStop(0.25, "rgba(255,255,255,.95)");
//     gradient.addColorStop(0.5, "rgba(255,255,255,.45)");
//     gradient.addColorStop(1, "rgba(255,255,255,0)");

//     ctx.fillStyle = gradient;

//     ctx.fillRect(0,0,size,size);

//     return new THREE.CanvasTexture(canvas);

// }

// const glowTexture = createGlowTexture();

// /* ==========================================================
//    PARTICLES
// ========================================================== */

// const PARTICLE_COUNT = 1800;

// const particlePositions = new Float32Array(PARTICLE_COUNT * 3);

// const particleColors = new Float32Array(PARTICLE_COUNT * 3);

// const particleData = [];

// for(let i=0;i<PARTICLE_COUNT;i++){

//     const i3 = i*3;

//     const x = (Math.random()-0.5)*70;

//     const y = (Math.random()-0.5)*50;

//     const z = (Math.random()-0.5)*45;

//     particlePositions[i3] = x;
//     particlePositions[i3+1] = y;
//     particlePositions[i3+2] = z;

//     const c = palette[
//         Math.floor(
//             Math.random()*palette.length
//         )
//     ];

//     particleColors[i3] = c.r;
//     particleColors[i3+1] = c.g;
//     particleColors[i3+2] = c.b;

//     particleData.push({

//         baseX:x,
//         baseY:y,
//         baseZ:z,

//         speed:0.3 + Math.random()*0.8,

//         offset:Math.random()*Math.PI*2,

//         size:0.5 + Math.random()

//     });

// }

// /* ==========================================================
//    GEOMETRY
// ========================================================== */

// const particleGeometry = new THREE.BufferGeometry();

// particleGeometry.setAttribute(

//     "position",

//     new THREE.BufferAttribute(
//         particlePositions,
//         3
//     )

// );

// particleGeometry.setAttribute(

//     "color",

//     new THREE.BufferAttribute(
//         particleColors,
//         3
//     )

// );

// /* ==========================================================
//    MATERIAL
// ========================================================== */

// const particleMaterial = new THREE.PointsMaterial({

//     size:0.8,

//     map:glowTexture,

//     transparent:true,

//     opacity:0.95,

//     depthWrite:false,

//     vertexColors:true,

//     blending:THREE.AdditiveBlending,

//     alphaTest:0.01

// });

// /* ==========================================================
//    POINT CLOUD
// ========================================================== */

// const particles = new THREE.Points(

//     particleGeometry,

//     particleMaterial

// );

// scene.add(particles);

// /* ==========================================================
//    CLOCK
// ========================================================== */

// const clock = new THREE.Clock();

// /* ==========================================================
//    NEURAL CONNECTIONS
// ========================================================== */

// const MAX_CONNECTION_DISTANCE = 4.5;

// const MAX_CONNECTIONS = 12000;

// // Line positions

// const linePositions = new Float32Array(MAX_CONNECTIONS * 3 * 2);

// // Line colors

// const lineColors = new Float32Array(MAX_CONNECTIONS * 3 * 2);

// const lineGeometry = new THREE.BufferGeometry();

// lineGeometry.setAttribute(

//     "position",

//     new THREE.BufferAttribute(
//         linePositions,
//         3
//     ).setUsage(THREE.DynamicDrawUsage)

// );

// lineGeometry.setAttribute(

//     "color",

//     new THREE.BufferAttribute(
//         lineColors,
//         3
//     ).setUsage(THREE.DynamicDrawUsage)

// );

// // Line Material

// const lineMaterial = new THREE.LineBasicMaterial({

//     transparent:true,

//     opacity:.25,

//     vertexColors:true,

//     blending:THREE.AdditiveBlending,

//     depthWrite:false

// });

// const neuralLines = new THREE.LineSegments(

//     lineGeometry,

//     lineMaterial

// );

// scene.add(neuralLines);

// /* ==========================================================
//    UPDATE CONNECTIONS
// ========================================================== */

// function updateConnections(){

//     const positions =
//         particleGeometry.attributes.position.array;

//     let index = 0;

//     for(let i=0;i<PARTICLE_COUNT;i++){

//         const ix=i*3;

//         const x1=positions[ix];
//         const y1=positions[ix+1];
//         const z1=positions[ix+2];

//         for(let j=i+1;j<PARTICLE_COUNT;j++){

//             const jx=j*3;

//             const x2=positions[jx];
//             const y2=positions[jx+1];
//             const z2=positions[jx+2];

//             const dx=x1-x2;
//             const dy=y1-y2;
//             const dz=z1-z2;

//             const dist=Math.sqrt(

//                 dx*dx+

//                 dy*dy+

//                 dz*dz

//             );

//             if(dist<MAX_CONNECTION_DISTANCE){

//                 if(index>=MAX_CONNECTIONS*6) break;

//                 linePositions[index]=x1;
//                 linePositions[index+1]=y1;
//                 linePositions[index+2]=z1;

//                 linePositions[index+3]=x2;
//                 linePositions[index+4]=y2;
//                 linePositions[index+5]=z2;

//                 const alpha=

//                     1-(dist/MAX_CONNECTION_DISTANCE);

//                 const c=new THREE.Color();

//                 c.setHSL(

//                     0.72,

//                     1,

//                     .55+.25*alpha

//                 );

//                 for(let k=0;k<2;k++){

//                     lineColors[index+k*3]=c.r;

//                     lineColors[index+k*3+1]=c.g;

//                     lineColors[index+k*3+2]=c.b;

//                 }

//                 index+=6;

//             }

//         }

//     }

//     lineGeometry.setDrawRange(

//         0,

//         index/3

//     );

//     lineGeometry.attributes.position.needsUpdate=true;

//     lineGeometry.attributes.color.needsUpdate=true;

// }

// /* ==========================================================
//    INITIAL DRAW
// ========================================================== */

// updateConnections();    

// /* ==========================================================
//    GLASS ORBS
// ========================================================== */

// const orbGroup = new THREE.Group();

// scene.add(orbGroup);

// const orbGeometry = new THREE.SphereGeometry(1,32,32);

// const orbMaterial = new THREE.MeshBasicMaterial({

//     color:"#8B5CF6",

//     transparent:true,

//     opacity:.08,

//     blending:THREE.AdditiveBlending,

//     depthWrite:false

// });

// const orbs=[];

// for(let i=0;i<28;i++){

//     const orb=new THREE.Mesh(

//         orbGeometry,

//         orbMaterial.clone()

//     );

//     const scale=1+Math.random()*3.5;

//     orb.scale.set(scale,scale,scale);

//     orb.position.set(

//         (Math.random()-.5)*65,

//         (Math.random()-.5)*45,

//         (Math.random()-.5)*35

//     );

//     orb.material.color.copy(

//         palette[
//             Math.floor(Math.random()*palette.length)
//         ]

//     );

//     orb.material.opacity=.05+Math.random()*.05;

//     orb.userData={

//         speed:.15+Math.random()*.4,

//         offset:Math.random()*Math.PI*2

//     };

//     orbGroup.add(orb);

//     orbs.push(orb);

// }

// /* ==========================================================
//    MOUSE
// ========================================================== */

// const mouse=new THREE.Vector2();

// const targetMouse=new THREE.Vector2();

// window.addEventListener("mousemove",(e)=>{

//     targetMouse.x=

//         (e.clientX/window.innerWidth)*2-1;

//     targetMouse.y=

//         -(e.clientY/window.innerHeight)*2+1;

// });

// /* ==========================================================
//    FLOATING ANIMATION
// ========================================================== */

// function animateParticles(time){

//     mouse.lerp(targetMouse,.05);

//     const positions=

//         particleGeometry.attributes.position.array;

//     for(let i=0;i<PARTICLE_COUNT;i++){

//         const i3=i*3;

//         const p=particleData[i];

//         positions[i3]=

//             p.baseX+

//             Math.sin(time*p.speed+p.offset)*.8+

//             mouse.x*2;

//         positions[i3+1]=

//             p.baseY+

//             Math.cos(time*p.speed+p.offset)*.8+

//             mouse.y*1.5;

//         positions[i3+2]=

//             p.baseZ+

//             Math.sin(time*.4+p.offset)*.5;

//     }

//     particleGeometry.attributes.position.needsUpdate=true;

// }

// /* ==========================================================
//    ORB ANIMATION
// ========================================================== */

// function animateOrbs(time){

//     orbs.forEach((orb,index)=>{

//         orb.position.y+=

//             Math.sin(

//                 time*orb.userData.speed+

//                 orb.userData.offset

//             )*.01;

//         orb.position.x+=

//             Math.cos(

//                 time*.15+

//                 index

//             )*.004;

//         orb.rotation.y+=.001;

//         orb.rotation.x+=.0005;

//     });

// }
// /* ==========================================================
//    ANIMATION LOOP
// ========================================================== */

// function animate() {

//     requestAnimationFrame(animate);

//     const time = clock.getElapsedTime();

//     // Animate particles
//     animateParticles(time);

//     // Animate glass orbs
//     animateOrbs(time);

//     // Update neural connections
//     updateConnections();

//     /* ==========================================
//        CAMERA MOVEMENT
//     ========================================== */

//     camera.position.x +=
//         ((mouse.x * 4) - camera.position.x) * 0.02;

//     camera.position.y +=
//         ((mouse.y * 3) - camera.position.y) * 0.02;

//     camera.position.z =
//         42 + Math.sin(time * 0.15) * 1.5;

//     camera.lookAt(scene.position);

//     /* ==========================================
//        PARTICLE ROTATION
//     ========================================== */

//     particles.rotation.y += 0.00035;

//     particles.rotation.x =
//         Math.sin(time * 0.08) * 0.03;

//     orbGroup.rotation.y += 0.00025;

//     orbGroup.rotation.x =
//         Math.cos(time * 0.05) * 0.02;

//     /* ==========================================
//        AI PULSE EFFECT
//     ========================================== */

//     particleMaterial.size =
//         0.8 + Math.sin(time * 2.2) * 0.05;

//     lineMaterial.opacity =
//         0.18 + Math.sin(time * 1.6) * 0.05;

//     renderer.render(scene, camera);

// }

// animate();

// /* ==========================================================
//    WINDOW RESIZE
// ========================================================== */

// window.addEventListener("resize", () => {

//     camera.aspect =
//         window.innerWidth / window.innerHeight;

//     camera.updateProjectionMatrix();

//     renderer.setSize(

//         window.innerWidth,

//         window.innerHeight

//     );

// });

// /* ==========================================================
//    OPTIONAL PARALLAX ON SCROLL
// ========================================================== */

// window.addEventListener("scroll", () => {

//     const scroll =
//         window.scrollY;

//     particles.position.y =
//         scroll * -0.003;

//     orbGroup.position.y =
//         scroll * -0.002;

// });

// /* ==========================================================
//    PERFORMANCE SETTINGS
// ========================================================== */

// renderer.outputColorSpace = THREE.SRGBColorSpace;

// renderer.setAnimationLoop(null);

// /* ==========================================================
//    END
// ========================================================== */
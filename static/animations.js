// ==========================
// Initial Page Animation
// ==========================

window.addEventListener("load", () => {

    gsap.from(".navbar", {
        y: -80,
        opacity: 0,
        duration: 1,
        ease: "power4.out"
    });

    gsap.from(".hero h1", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
        delay: 0.2
    });

    gsap.from(".hero p", {
        y: 40,
        opacity: 0,
        duration: 1,
        delay: 0.4,
        ease: "power3.out"
    });

    gsap.from(".upload-card", {
        scale: 0.92,
        y: 60,
        opacity: 0,
        duration: 1.2,
        delay: 0.6,
        ease: "power4.out"
    });

    gsap.from(".feature-card", {
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.8,
        delay: 0.8,
        ease: "power3.out"
    });

});

// ==========================
// Floating Upload Card
// ==========================

gsap.to(".upload-card", {
    y: -10,
    duration: 2.5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});

// ==========================
// Button Hover Animation
// ==========================

document.querySelectorAll(".btn").forEach(button => {

    button.addEventListener("mouseenter", () => {

        gsap.to(button, {
            scale: 1.05,
            y: -4,
            duration: 0.25,
            ease: "power2.out"
        });

    });

    button.addEventListener("mouseleave", () => {

        gsap.to(button, {
            scale: 1,
            y: 0,
            duration: 0.25
        });

    });

});

// ==========================
// Card Hover Animation
// ==========================

document.querySelectorAll(".glass-card").forEach(card => {

    card.addEventListener("mousemove", e => {

        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotateY = ((x / rect.width) - 0.5) * 12;
        const rotateX = ((y / rect.height) - 0.5) * -12;

        gsap.to(card, {

            rotateX,
            rotateY,

            transformPerspective: 1000,

            duration: 0.4

        });

    });

    card.addEventListener("mouseleave", () => {

        gsap.to(card, {

            rotateX: 0,

            rotateY: 0,

            duration: 0.6,

            ease: "power3.out"

        });

    });

});

// ==========================
// Mouse Glow
// ==========================

const glow = document.querySelector(".cursor-glow");

if(glow){

document.addEventListener("mousemove",(e)=>{

gsap.to(glow,{

x:e.clientX,

y:e.clientY,

duration:.25,

ease:"power3.out"

});

});

}
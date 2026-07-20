gsap.from(".hero-title",{
    y:70,
    opacity:0,
    duration:1.0,
    ease:"expo.out"
});
const input = document.getElementById("audioInput");
const preview = document.getElementById("audioPreview");

const player = document.getElementById("player");
const nameText = document.getElementById("audioName");
const duration = document.getElementById("audioDuration");
const aiButton = document.querySelector(".ai-button");
const sidebar = document.querySelector(".chat-sidebar");
const closeBtn = document.getElementById("closeChat");
const closeChat = document.getElementById("closeChat");

aiButton.addEventListener("click", () => {
    sidebar.classList.add("open");
    aiButton.classList.add("hide");
});

closeChat.addEventListener("click", () => {
    sidebar.classList.remove("open");
    aiButton.classList.remove("hide");
});
// Open Sidebar
aiButton.addEventListener("click", () => {

    sidebar.classList.add("open");

    // Hide floating button
    aiButton.style.opacity = "0";
    aiButton.style.pointerEvents = "none";

});

// Close Sidebar
closeChat.addEventListener("click", () => {

    sidebar.classList.remove("open");

    // Show floating button again
    aiButton.style.opacity = "1";
    aiButton.style.pointerEvents = "auto";

});
aiButton.addEventListener("click", function () {

    sidebar.classList.add("open");

});

closeBtn.addEventListener("click", function () {

    sidebar.classList.remove("open");

});
input.addEventListener("change", function(){

    const file = this.files[0];

    if(!file) return;

    const url = URL.createObjectURL(file);

    player.src = url;

    preview.style.display = "block";

    nameText.innerHTML =
        "📁 " + file.name;

    player.onloadedmetadata = function(){

        const mins = Math.floor(player.duration/60);

        const secs = Math.floor(player.duration%60)
            .toString()
            .padStart(2,"0");

        duration.innerHTML =
            "⏱ Duration : " + mins + ":" + secs;

    };

});
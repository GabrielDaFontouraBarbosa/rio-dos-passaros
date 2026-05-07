const videos = [
  { nome: "Bem-te-vi", videoId: "XXXX" },
  { nome: "Can├írio-da-terra", videoId: "YYYY" },
  { nome: "Sabi├í-laranjeira", videoId: "ZZZZ" }
].sort((a, b) => a.nome.localeCompare(b.nome));

const playlist = document.getElementById("playlist");
const dropdown = document.querySelector(".dropdown");
const input = document.querySelector(".video-search input");
const player = document.getElementById("videoPlayer");

function loadVideo(videoId) {
  player.src = `https://www.youtube.com/embed/${videoId}`;
}

function renderPlaylist() {
  playlist.innerHTML = "";
  videos.forEach(v => {
    const div = document.createElement("div");
    div.className = "playlist-item";
    div.textContent = v.nome;
    div.onclick = () => loadVideo(v.videoId);
    playlist.appendChild(div);
  });
}

function renderDropdown() {
  dropdown.innerHTML = "";
  videos.forEach(v => {
    const li = document.createElement("li");
    li.textContent = v.nome;
    li.onclick = () => {
      loadVideo(v.videoId);
      dropdown.style.display = "none";
    };
    dropdown.appendChild(li);
  });
}

input.onclick = () => {
  dropdown.style.display = "block";
};

renderPlaylist();
renderDropdown();
loadVideo(videos[0].videoId);


const videoData = [
    { title: "Araponga", id: "zfTYHufyaF4" },
    { title: "Arara", id: "WEtqdGiHpZI" },
    { title: "Bacurau", id: "hwdDw3OqqUc" },
    { title: "Beija-Flor", id: "cbdLm7vGpqI" },
    { title: "Bem-te-vi", id: "z3jwepapUcY" },
    { title: "Can├írio Da Terra", id: "qYA-fpSCv60" },
    { title: "Coleiro", id: "RwZU5FWuZs4" },
    { title: "Curi├│", id: "WIN-R_c_Iuk" },
    { title: "Gaivota", id: "vWR-HemrhrY" },
    { title: "Inhambu", id: "4lhFJbviAhI" },
    { title: "Jo├úo-De-Barro", id: "1XRdkVp__XA" },
    { title: "Natal Dos P├íssaros", id: "ZJQkGaVIy1I" },
    { title: "Papagaio", id: "YPnhVCAh3s0" },
    { title: "P├íssaro Preto", id: "79PxStGU0wY" },
    { title: "Quero-Quero", id: "uqcG-IsYbRk" },
    { title: "Rio Dos P├íssaros", id: "uI_I_ApJdpo" },
    { title: "Sabi├í", id: "cbdLm7vGpqI" },
    { title: "Sem-Fim", id: "n5_gkV_cjqg" },
    { title: "Tico-Tico", id: "VN5UprvbgqQ" },
    { title: "Ti├¬-Sangue", id: "2OT1y1yLQvk" },
    { title: "Tiziu", id: "xkxl0binH0I" },
    { title: "Uirapuru", id: "o6lzIXCvpoo" }
].sort((a, b) => a.title.localeCompare(b.title));

function loadVideos(filter = "") {
    const thumbContainer = document.getElementById('videoThumbnails');
    const dropdown = document.getElementById('birdDropdown');
    
    thumbContainer.innerHTML = '';
    dropdown.innerHTML = '<option value="">Todos os P├íssaros</option>';

    videoData.forEach(video => {
        if (video.title.toLowerCase().includes(filter.toLowerCase())) {
            const thumb = document.createElement('div');
            thumb.className = 'thumb-card';
            thumb.onclick = () => playVideo(video.id);
            thumb.innerHTML = `
                <img src="https://img.youtube.com/vi/${video.id}/mqdefault.jpg" class="thumb-img">
                <div class="thumb-info">
                    <h4>${video.title}</h4>
                </div>
            `;
            thumbContainer.appendChild(thumb);
        }
        
        const option = document.createElement('option');
        option.value = video.id;
        option.textContent = video.title;
        dropdown.appendChild(option);
    });
}

function playVideo(id) {
    document.getElementById('mainPlayer').src = `https://www.youtube.com/embed/${id}?autoplay=1`;
}

document.getElementById('videoSearch').addEventListener('input', (e) => {
    loadVideos(e.target.value);
});

document.getElementById('birdDropdown').addEventListener('change', (e) => {
    if (e.target.value) playVideo(e.target.value);
});

document.addEventListener('DOMContentLoaded', () => {
    loadVideos();
});

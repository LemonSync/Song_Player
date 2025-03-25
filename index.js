const image = document.getElementById('cover'),
        title = document.getElementById('music-title'),
        artist = document.getElementById('music-artist'),
        currentTimeEl = document.getElementById('current-time'),
        durationEl = document.getElementById('duration'),
        progress = document.getElementById('progress'),
        playerProgress = document.getElementById('player-progress'),
        prevBtn = document.getElementById('prev'),
        nextBtn = document.getElementById('next'),
        playBtn = document.getElementById('play'),
        background = document.getElementById('bg-img');

const music = new Audio();
let musicIndex = 1;
let isPlaying = false;
let artists = {};
let songName = {};

async function initPlayer() {
        try {
                const response = await fetch('./data.json');
                if (!response.ok) throw new Error('Failed to load data.json');
                
                const data = await response.json();
                artists = data.artist || {};
                songName = data.songName || {};
                
                await loadMusic(musicIndex);
                
                enableControls();
        } catch (error) {
                console.error("Player initialization error:", error);
                showErrorState();
                loadMusic(musicIndex);
        }
}

function enableControls() {
        [prevBtn, nextBtn, playBtn, playerProgress].forEach(el => {
                el.style.opacity = '1';
                el.style.pointerEvents = 'auto';
        });
}

function showErrorState() {
        title.textContent = "Player Error";
        artist.textContent = "Check console for details";
        console.error("Using fallback mode - some features may not work");
}

function togglePlay() {
        if (music.src) {
                isPlaying ? pauseMusic() : playMusic();
        }
}

async function playMusic() {
        try {
                await music.play();
                isPlaying = true;
                playBtn.classList.replace('fa-play', 'fa-pause');
                playBtn.setAttribute('title', 'Pause');
        } catch (err) {
                console.error("Playback failed:", err);
                isPlaying = false;
        }
}

function pauseMusic() {
        music.pause();
        isPlaying = false;
        playBtn.classList.replace('fa-pause', 'fa-play');
        playBtn.setAttribute('title', 'Play');
}

async function loadMusic(index) {
        const audioPath = `assets/song/${index}.mp3`;
        const coverPath = `assets/image/${index}.jpg`;
        
        try {
                const [audioCheck, coverCheck] = await Promise.all([
                        fetch(audioPath, { method: 'HEAD' }),
                        fetch(coverPath, { method: 'HEAD' })
                ]);
                
                if (!audioCheck.ok || !coverCheck.ok) {
                        throw new Error('Audio or cover not found');
                }
                
                music.src = audioPath;
                image.src = coverPath;
                background.src = coverPath;
                
                title.textContent = songName[index] || `Track ${index}`;
                artist.textContent = artists[index] || "Unknown Artist";
                
                if (isPlaying) {
                        await playMusic();
                }
                
                music.addEventListener('loadedmetadata', () => {
                        updateProgressBar();
                });
                
        } catch (error) {
                console.error(`Error loading track ${index}:`, error);
                handleTrackLoadError(index);
        }
}

function handleTrackLoadError(currentIndex) {
        if (currentIndex > 1) {
                musicIndex = currentIndex - 1;
        } else {
                musicIndex = currentIndex + 1;
        }
        
        if (musicIndex > 20 || musicIndex < 1) {
                musicIndex = 1;
                showErrorState();
                return;
        }
        
        loadMusic(musicIndex);
}

function changeMusic(direction) {
        musicIndex += direction;
        
        let nextAudio = new Audio(`assets/song/${musicIndex}.mp3`);
        nextAudio.onerror = () => {
                musicIndex = 1;
                loadMusic(musicIndex);
                playMusic();
        };
        
        loadMusic(musicIndex);
        playMusic();
}

function updateProgressBar() {
        const { duration, currentTime } = music;
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        
        const formatTime = (time) => {
                if (isNaN(time)) return "0:00";
                const minutes = Math.floor(time / 60);
                const seconds = Math.floor(time % 60);
                return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        };
        
        durationEl.textContent = formatTime(duration);
        currentTimeEl.textContent = formatTime(currentTime);
}

function setProgressBar(e) {
        if (!music.src) return;
        const width = playerProgress.clientWidth;
        const clickX = e.offsetX;
        music.currentTime = (clickX / width) * music.duration;
}

playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', () => changeMusic(-1));
nextBtn.addEventListener('click', () => changeMusic(1));
music.addEventListener('ended', () => changeMusic(1));
music.addEventListener('timeupdate', updateProgressBar);
playerProgress.addEventListener('click', setProgressBar);

document.addEventListener('DOMContentLoaded', initPlayer);
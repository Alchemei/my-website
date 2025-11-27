// --- AUDIO SYSTEM ---
const sounds = {
    'click': new Audio('sounds/click.mp3'),
    'success': new Audio('sounds/success.mp3'),
    'error': new Audio('sounds/error.mp3'),
    'sword': new Audio('sounds/sword.mp3')
};

// Preload sounds
Object.values(sounds).forEach(s => s.load());

let soundEnabled = true;
let soundVolume = 1.0;

// Load settings from localStorage
if (localStorage.getItem('soundEnabled') !== null) {
    soundEnabled = localStorage.getItem('soundEnabled') === 'true';
}
if (localStorage.getItem('soundVolume') !== null) {
    soundVolume = parseFloat(localStorage.getItem('soundVolume'));
}

window.playSound = function (type) {
    if (soundEnabled && sounds[type]) {
        sounds[type].currentTime = 0;
        sounds[type].volume = soundVolume;
        sounds[type].play().catch(e => console.log("Audio play failed:", e));
    }
}

window.toggleSound = function (enabled) {
    soundEnabled = enabled;
    localStorage.setItem('soundEnabled', enabled);
}

window.setVolume = function (vol) {
    soundVolume = parseFloat(vol);
    localStorage.setItem('soundVolume', vol);
}

window.openSettings = function () {
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('hidden');
    modal.classList.add('fade-in');
    // Sync UI with state
    document.getElementById('sound-toggle').checked = soundEnabled;
    document.getElementById('volume-slider').value = soundVolume;
}

// --- UTILS ---
window.toast = function (msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.add('show');
    window.playSound('click'); // Sound effect
    setTimeout(() => t.classList.remove('show'), 3000);
}

window.confetti = function () {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f87171'];

    for (let i = 0; i < 100; i++) {
        particles.push({
            x: canvas.width / 2, y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;
        particles.forEach(p => {
            if (p.life > 0) {
                active = true;
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02;
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        if (active) requestAnimationFrame(animate);
    }
    animate();
}



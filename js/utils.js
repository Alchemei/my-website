// --- AUDIO SYSTEM ---
const sounds = {
    'click': new Audio('sounds/click.mp3'),
    'success': new Audio('sounds/success.mp3'),
    'error': new Audio('sounds/error.mp3')
};

// Preload existing sounds
Object.values(sounds).forEach(s => s.load());

// Synthesize a sword sound using Web Audio API
function playSwordSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        // Swoosh (Noise)
        const bufferSize = ctx.sampleRate * 0.3; // 0.3 sec
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(800, ctx.currentTime);
        noiseFilter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
        noiseFilter.Q.value = 1;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.8, ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start();

        // Metal Clang (Oscillator)
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);

        oscGain.gain.setValueAtTime(0.3, ctx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);

    } catch (e) {
        console.error("Synth error:", e);
    }
}

window.playSound = function (type) {
    if (type === 'sword') {
        playSwordSound();
        return;
    }
    if (sounds[type]) {
        sounds[type].currentTime = 0;
        sounds[type].play().catch(e => {
            // console.log("Audio play failed (missing file?):", e);
        });
    }
}

window.toggleSound = function () {
    // Toggle logic if needed, currently always on for UI sounds
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



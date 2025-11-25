// --- AUDIO SYSTEM ---
const AudioSys = {
    ctx: new (window.AudioContext || window.webkitAudioContext)(),
    
    playTone(freq, type, duration, vol = 0.1) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    click() { this.playTone(400, 'sine', 0.1, 0.05); },
    success() { 
        this.playTone(600, 'sine', 0.1, 0.1);
        setTimeout(() => this.playTone(800, 'sine', 0.2, 0.1), 100);
    },
    error() { 
        this.playTone(300, 'sawtooth', 0.1, 0.1);
        setTimeout(() => this.playTone(200, 'sawtooth', 0.2, 0.1), 100);
    },
    levelUp() {
        [400, 500, 600, 800, 1000].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'square', 0.2, 0.1), i * 100);
        });
    }
};

window.playSound = (type) => {
    if (AudioSys[type]) AudioSys[type]();
};

// --- UTILS ---
window.toast = function(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.add('show');
    window.playSound('click'); // Sound effect
    setTimeout(() => t.classList.remove('show'), 3000);
}

window.confetti = function() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const colors = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f87171'];
    
    for(let i=0; i<100; i++) {
        particles.push({
            x: canvas.width/2, y: canvas.height/2,
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
            if(p.life > 0) {
                active = true;
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02;
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
                ctx.fill();
            }
        });
        if(active) requestAnimationFrame(animate);
    }
    animate();
}

window.playTTS = function(text) {
    if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = 0.9;
        window.speechSynthesis.speak(u);
    }
}

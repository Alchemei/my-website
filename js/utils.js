// --- AUDIO SYSTEM ---
// Sounds disabled by user request
window.playSound = function (type) {
    // No-op
}

window.toggleSound = function () {
    // No-op
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

window.playTTS = function (text) {
    if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = 0.9;
        window.speechSynthesis.speak(u);
    }
}

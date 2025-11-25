export function toast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

export function confetti() {
    const c = document.getElementById('confetti-canvas');
    if (!c) return;
    const x = c.getContext('2d');
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    
    const p = Array(40).fill().map(() => ({
        x: c.width / 2,
        y: c.height / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        color: ['#3b82f6', '#8b5cf6', '#10b981'][Math.floor(Math.random() * 3)],
        life: 80
    }));

    function draw() {
        x.clearRect(0, 0, c.width, c.height);
        let active = false;
        p.forEach(i => {
            if (i.life > 0) {
                i.x += i.vx;
                i.y += i.vy;
                i.vy += 0.5;
                i.life--;
                x.fillStyle = i.color;
                x.fillRect(i.x, i.y, 6, 6);
                active = true;
            }
        });
        if (active) requestAnimationFrame(draw);
    }
    draw();
}

export function playTTS(text) {
    const t = new SpeechSynthesisUtterance(text);
    t.lang = 'en-US';
    speechSynthesis.speak(t);
}

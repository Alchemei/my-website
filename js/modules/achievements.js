(function() {
    const achievements = [
        { id: 'first_blood', icon: '🩸', title: 'İlk Adım', desc: 'İlk kelimeni öğren', condition: (s) => s.learned.length >= 1 },
        { id: 'scholar', icon: '🎓', title: 'Bilgin', desc: '50 kelime öğren', condition: (s) => s.learned.length >= 50 },
        { id: 'master', icon: '👑', title: 'Usta', desc: '500 kelime öğren', condition: (s) => s.learned.length >= 500 },
        { id: 'rich', icon: '💰', title: 'Zengin', desc: '1000 altına sahip ol', condition: (s) => s.coins >= 1000 },
        { id: 'streaker', icon: '🔥', title: 'İstikrarlı', desc: '7 gün seri yap', condition: (s) => s.streak >= 7 },
        { id: 'level_5', icon: '⭐', title: 'Yükseliş', desc: '5. Seviyeye ulaş', condition: (s) => s.level >= 5 }
    ];

    window.initAchievements = function() {
        // Check achievements on state update
        window.addEventListener('state-updated', checkAchievements);
        renderAchievements();
    }

    function checkAchievements() {
        const state = window.store.state;
        const unlocked = state.achievements || [];
        let newUnlock = false;

        achievements.forEach(ach => {
            if (!unlocked.includes(ach.id) && ach.condition(state)) {
                unlocked.push(ach.id);
                window.toast(`Başarım Açıldı: ${ach.title} ${ach.icon}`);
                window.confetti();
                window.playSound('success');
                newUnlock = true;
            }
        });

        if (newUnlock) {
            window.store.update('achievements', unlocked);
            renderAchievements();
        }
    }

    function renderAchievements() {
        const container = document.getElementById('achievements-list');
        if (!container) return;

        const unlocked = window.store.state.achievements || [];
        
        let html = '';
        achievements.forEach(ach => {
            const isUnlocked = unlocked.includes(ach.id);
            html += `
                <div class="glass-panel" style="padding:15px; display:flex; align-items:center; gap:15px; opacity:${isUnlocked ? 1 : 0.5}; filter:${isUnlocked ? 'none' : 'grayscale(1)'}">
                    <div style="font-size:2rem;">${ach.icon}</div>
                    <div>
                        <div style="font-weight:700; color:${isUnlocked ? 'var(--neon-green)' : 'var(--text-muted)'}">${ach.title}</div>
                        <div style="font-size:0.8rem; color:var(--text-muted);">${ach.desc}</div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }
})();

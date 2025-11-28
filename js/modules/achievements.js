(function () {
    const achievements = [
        { id: 'first_blood', icon: '🩸', title: 'İlk Adım', desc: 'İlk kelimeni öğren', xp: 50, reward: 100, condition: (s) => s.learned.length >= 1 },
        { id: 'scholar', icon: '🎓', title: 'Bilgin', desc: '50 kelime öğren', xp: 200, reward: 500, condition: (s) => s.learned.length >= 50 },
        { id: 'master', icon: '👑', title: 'Usta', desc: '500 kelime öğren', xp: 1000, reward: 2000, condition: (s) => s.learned.length >= 500 },
        { id: 'rich', icon: '💰', title: 'Zengin', desc: '1000 altına sahip ol', xp: 300, reward: 100, condition: (s) => s.coins >= 1000 },
        { id: 'streaker', icon: '🔥', title: 'İstikrarlı', desc: '7 gün seri yap', xp: 500, reward: 1000, condition: (s) => s.streak >= 7 },
        { id: 'level_5', icon: '⭐', title: 'Yükseliş', desc: '5. Seviyeye ulaş', xp: 250, reward: 500, condition: (s) => s.level >= 5 },
        { id: 'level_10', icon: '🌟', title: 'Deneyimli', desc: '10. Seviyeye ulaş', xp: 500, reward: 1000, condition: (s) => s.level >= 10 },
        { id: 'level_25', icon: '💫', title: 'Efsane', desc: '25. Seviyeye ulaş', xp: 2000, reward: 5000, condition: (s) => s.level >= 25 }
    ];

    window.initAchievements = function () {
        // Check achievements on state update
        window.addEventListener('state-updated', checkAchievements);
        renderAchievements();
    }

    function checkAchievements() {
        const state = window.store.state;
        const unlocked = state.achievements || [];
        let newUnlock = false;
        let totalXpGain = 0;
        let totalCoinGain = 0;

        achievements.forEach(ach => {
            if (!unlocked.includes(ach.id) && ach.condition(state)) {
                unlocked.push(ach.id);

                // Award Rewards
                totalXpGain += (ach.xp || 0);
                totalCoinGain += (ach.reward || 0);

                window.toast(`Başarım Açıldı: ${ach.title} (+${ach.reward} Altın)`);
                window.confetti();
                window.playSound('success');
                newUnlock = true;
            }
        });

        if (newUnlock) {
            // Apply rewards
            if (totalXpGain > 0) window.store.update('xp', state.xp + totalXpGain);
            if (totalCoinGain > 0) window.store.update('coins', state.coins + totalCoinGain);

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

            // Dynamic Styles
            const cardStyle = isUnlocked
                ? `background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)); border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 4px 15px rgba(0,0,0,0.2);`
                : `background: rgba(0,0,0,0.2); border: 1px dashed rgba(255,255,255,0.1); opacity: 0.7;`;

            const iconStyle = isUnlocked
                ? `font-size: 2rem; filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));`
                : `font-size: 2rem; filter: grayscale(1) opacity(0.5);`;

            const titleColor = isUnlocked ? 'var(--text-color)' : 'var(--text-muted)';

            html += `
                <div class="glass-panel achievement-card" style="padding: 12px; display: flex; align-items: flex-start; gap: 12px; margin-bottom: 15px; border-radius: 16px; position: relative; overflow: hidden; ${cardStyle}">
                    ${isUnlocked ? '<div style="position:absolute; top:0; right:0; width:50px; height:50px; background:linear-gradient(135deg, transparent 50%, var(--neon-green) 50%); opacity:0.2; pointer-events:none;"></div>' : ''}
                    
                    <div style="min-width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); border-radius: 12px; flex-shrink: 0; ${iconStyle}">
                        ${ach.icon}
                    </div>
                    
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; gap: 8px; flex-wrap: wrap;">
                            <div style="font-weight: 800; font-size: 1rem; color: ${titleColor}; letter-spacing: 0.5px; word-break: break-word; line-height: 1.2;">${ach.title}</div>
                            ${isUnlocked
                    ? `<div style="background: rgba(16, 185, 129, 0.2); color: #10B981; padding: 2px 6px; border-radius: 6px; font-size: 0.65rem; font-weight: 700; border: 1px solid rgba(16, 185, 129, 0.3); white-space: nowrap; flex-shrink: 0;">AÇIK</div>`
                    : `<div style="background: rgba(255, 255, 255, 0.05); color: var(--text-muted); padding: 2px 6px; border-radius: 6px; font-size: 0.65rem; font-weight: 600; white-space: nowrap; flex-shrink: 0;">KİLİTLİ</div>`}
                        </div>
                        
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px; line-height: 1.3; word-wrap: break-word;">${ach.desc}</div>
                        
                        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                            <div style="display: flex; align-items: center; gap: 4px; background: linear-gradient(90deg, rgba(255, 215, 0, 0.1), transparent); padding: 2px 6px; border-radius: 4px; border-left: 2px solid #FFD700;">
                                <span style="font-size: 0.75rem;">💰</span>
                                <span style="font-size: 0.7rem; font-weight: 700; color: #FFD700;">+${ach.reward}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 4px; background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), transparent); padding: 2px 6px; border-radius: 4px; border-left: 2px solid #3B82F6;">
                                <span style="font-size: 0.75rem;">⚡</span>
                                <span style="font-size: 0.7rem; font-weight: 700; color: #60A5FA;">+${ach.xp} XP</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }
})();

(function() {
    const APP_ID_KEY = 'english-master-global';
    const appId = window.__app_id || APP_ID_KEY;

    window.initLeaderboard = function() {
        // Listen for tab switch to leaderboard to trigger refresh
        const btn = document.querySelector('button[onclick*="leaderboard"]');
        if(btn) {
            btn.addEventListener('click', loadLeaderboard);
        }
    }

    async function loadLeaderboard() {
        const list = document.getElementById('leaderboard-list');
        if(!list) return;
        
        if (!window.Firebase || !window.Firebase.db) {
            list.innerHTML = '<div style="padding:20px; text-align:center;">Bağlantı bekleniyor...</div>';
            return;
        }

        list.innerHTML = '<div style="padding:20px; text-align:center;">Yükleniyor...</div>';

        try {
            const db = window.Firebase.db;
            // Query global leaderboard collection
            const snapshot = await db.collection('artifacts').doc(appId).collection('leaderboard')
                .orderBy('xp', 'desc')
                .limit(20)
                .get();

            if (snapshot.size < 5) {
                // If leaderboard is empty/sparse, add some bots to make it competitive
                generateBots();
            }

            let players = [];
            snapshot.forEach(doc => {
                players.push({ id: doc.id, ...doc.data() });
            });

            // Client-side sort fallback to ensure correct order
            players.sort((a, b) => (b.xp || 0) - (a.xp || 0));

            let html = '';
            let rank = 1;
            
            players.forEach(data => {
                const isMe = window.Firebase.auth.currentUser && window.Firebase.auth.currentUser.uid === data.id;
                
                let rankBadge = `<span style="font-weight:700; width:24px; text-align:center; color:var(--text-muted);">${rank}</span>`;
                if(rank === 1) rankBadge = '🥇';
                if(rank === 2) rankBadge = '🥈';
                if(rank === 3) rankBadge = '🥉';

                html += `
                    <div style="display:flex; align-items:center; padding:15px 20px; border-bottom:1px solid var(--glass-border); ${isMe ? 'background:rgba(139, 92, 246, 0.1);' : ''}">
                        <div style="font-size:1.2rem; margin-right:15px;">${rankBadge}</div>
                        <div style="flex:1;">
                            <div style="font-weight:700; color:${isMe ? 'var(--neon-blue)' : 'white'}">${data.name || 'İsimsiz'}</div>
                            <div style="font-size:0.8rem; color:var(--text-muted);">Lvl ${Math.floor((data.xp || 0)/100)+1}</div>
                        </div>
                        <div style="font-weight:800; color:var(--neon-green);">${data.xp || 0} XP</div>
                    </div>
                `;
                rank++;
            });

            list.innerHTML = html;

        } catch (e) {
            console.error(e);
            list.innerHTML = '<div style="padding:20px; text-align:center; color:var(--neon-red);">Yükleme hatası.</div>';
        }
    }

    async function generateBots() {
        const db = window.Firebase.db;
        const bots = [
            { name: 'KelimeAvcısı', xp: 2500 },
            { name: 'EnglishPro', xp: 1800 },
            { name: 'Polyglot_TR', xp: 3200 },
            { name: 'Student2024', xp: 500 },
            { name: 'MasterMind', xp: 4100 }
        ];

        // Check if bots already exist to avoid infinite loop or duplicates if logic fails
        // But here we just write them.
        
        try {
            const batch = db.batch();
            bots.forEach(bot => {
                const ref = db.collection('artifacts').doc(appId).collection('leaderboard').doc('bot_' + bot.name);
                batch.set(ref, {
                    name: bot.name,
                    xp: bot.xp,
                    isBot: true,
                    updatedAt: new Date()
                });
            });
            await batch.commit();
            console.log("Bots added");
            // We don't reload immediately to avoid loop, user will see them next time or on refresh
        } catch (e) {
            console.error("Bot gen error", e);
        }
    }

    // Expose for manual refresh if needed
    window.refreshLeaderboard = loadLeaderboard;
})();

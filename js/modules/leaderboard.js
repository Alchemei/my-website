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

            if (snapshot.empty) {
                list.innerHTML = '<div style="padding:20px; text-align:center;">Henüz veri yok.</div>';
                return;
            }

            let html = '';
            let rank = 1;
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const isMe = window.Firebase.auth.currentUser && window.Firebase.auth.currentUser.uid === doc.id;
                
                let rankBadge = `<span style="font-weight:700; width:24px; text-align:center; color:var(--text-muted);">${rank}</span>`;
                if(rank === 1) rankBadge = '🥇';
                if(rank === 2) rankBadge = '🥈';
                if(rank === 3) rankBadge = '🥉';

                html += `
                    <div style="display:flex; align-items:center; padding:15px 20px; border-bottom:1px solid var(--glass-border); ${isMe ? 'background:rgba(139, 92, 246, 0.1);' : ''}">
                        <div style="font-size:1.2rem; margin-right:15px;">${rankBadge}</div>
                        <div style="flex:1;">
                            <div style="font-weight:700; color:${isMe ? 'var(--neon-blue)' : 'white'}">${data.name || 'İsimsiz'}</div>
                            <div style="font-size:0.8rem; color:var(--text-muted);">Lvl ${Math.floor(data.xp/100)+1}</div>
                        </div>
                        <div style="font-weight:800; color:var(--neon-green);">${data.xp} XP</div>
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

    // Expose for manual refresh if needed
    window.refreshLeaderboard = loadLeaderboard;
})();

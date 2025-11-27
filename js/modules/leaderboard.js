(function () {
    const APP_ID_KEY = 'english-master-global';
    const appId = window.__app_id || APP_ID_KEY;

    window.initLeaderboard = function () {
        // Listen for tab switch to leaderboard to trigger refresh
        const btn = document.querySelector('button[onclick*="leaderboard"]');
        if (btn) {
            btn.addEventListener('click', loadLeaderboard);
        }
    }

    async function loadLeaderboard() {
        const list = document.getElementById('leaderboard-list');
        if (!list) return;

        if (!window.Firebase || !window.Firebase.db) {
            list.innerHTML = '<div style="padding:20px; text-align:center;">Bağlantı bekleniyor...</div>';
            return;
        }

        list.innerHTML = '<div style="padding:20px; text-align:center;">Yükleniyor...</div>';

        try {
            const db = window.Firebase.db;
            // Real-time listener using onSnapshot
            const query = db.collection('artifacts').doc(appId).collection('leaderboard')
                .orderBy('xp', 'desc')
                .limit(50);

            // Unsubscribe from previous listener if exists
            if (window.leaderboardUnsub) {
                window.leaderboardUnsub();
            }

            window.leaderboardUnsub = query.onSnapshot(snapshot => {
                if (snapshot.empty) {
                    list.innerHTML = '<div style="padding:20px; text-align:center;">Henüz veri yok.</div>';
                    return;
                }

                let players = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.isBot) return;
                    players.push({ id: doc.id, ...data });
                });

                // Sort by XP descending
                players.sort((a, b) => (b.xp || 0) - (a.xp || 0));

                // Take only top 10 real users
                players = players.slice(0, 10);

                let html = '';
                let rank = 1;

                players.forEach(data => {
                    const isMe = window.Firebase.auth.currentUser && window.Firebase.auth.currentUser.uid === data.id;

                    let rankBadge = `<span style="font-weight:700; width:24px; text-align:center; color:var(--text-muted);">${rank}</span>`;
                    if (rank === 1) rankBadge = '🥇';
                    if (rank === 2) rankBadge = '🥈';
                    if (rank === 3) rankBadge = '🥉';

                    // Determine league if not saved
                    let league = data.league;
                    if (!league) {
                        if (data.xp >= 10000) league = '💎';
                        else if (data.xp >= 5000) league = '🥇';
                        else if (data.xp >= 1000) league = '🥈';
                        else league = '🥉';
                    } else {
                        league = league.split(' ')[0];
                    }

                    // Check online status based on lastActive (within 2 mins)
                    let isOnline = false;
                    if (data.lastActive) {
                        const lastActiveDate = data.lastActive.toDate ? data.lastActive.toDate() : new Date(data.lastActive);
                        const diffMinutes = (new Date() - lastActiveDate) / 1000 / 60;
                        if (diffMinutes < 2) isOnline = true;
                    }

                    html += `
                        <div style="display:flex; align-items:center; padding:15px 20px; border-bottom:1px solid var(--glass-border); ${isMe ? 'background:rgba(139, 92, 246, 0.1);' : ''}">
                            <div style="font-size:1.2rem; margin-right:15px;">${rankBadge}</div>
                            <div style="margin-right:10px; font-size:1.2rem;">${league}</div>
                            <div style="flex:1;">
                                <div style="font-weight:700; color:${isMe ? 'var(--neon-blue)' : 'white'}">${data.name || 'İsimsiz'}</div>
                                <div style="font-size:0.8rem; color:var(--text-muted);">Lvl ${Math.floor((data.xp || 0) / 100) + 1}</div>
                            </div>
                            <div class="leaderboard-row-right">
                                <div class="leaderboard-xp">${data.xp || 0} XP</div>
                                ${!isMe ? `<button onclick="window.multiplayer.challengeUser('${data.id}', '${data.name}')" class="btn-mini-challenge">⚔️ Meydan Oku</button>` : ''}
                                <div class="status-dot ${isOnline ? 'online' : 'offline'}" title="${isOnline ? 'Çevrimiçi' : 'Son Görülme: ' + (data.lastActive ? new Date(data.lastActive.toDate ? data.lastActive.toDate() : data.lastActive).toLocaleTimeString() : 'Bilinmiyor')}"></div>
                            </div>
                        </div>
                    `;
                    rank++;
                });

                if (html === '') {
                    list.innerHTML = '<div style="padding:20px; text-align:center;">Henüz başka oyuncu yok.</div>';
                } else {
                    list.innerHTML = html;
                }
            }, error => {
                console.error("Realtime listener error:", error);
                list.innerHTML = '<div style="padding:20px; text-align:center; color:var(--neon-red);">Veri akışı hatası.</div>';
            });

        } catch (e) {
            console.error(e);
            list.innerHTML = '<div style="padding:20px; text-align:center; color:var(--neon-red);">Yükleme hatası.</div>';
        }
    }

    // Expose for manual refresh if needed
    window.refreshLeaderboard = loadLeaderboard;
})();

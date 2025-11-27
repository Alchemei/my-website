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
                    if (rank === 1) rankBadge = `<span style="font-weight:900; color:#FFD700;">1</span>`;
                    if (rank === 2) rankBadge = `<span style="font-weight:900; color:#C0C0C0;">2</span>`;
                    if (rank === 3) rankBadge = `<span style="font-weight:900; color:#CD7F32;">3</span>`;

                    html += `
                        <div class="leaderboard-row ${isMe ? 'me' : ''}">
                            <div class="rank-num">${rankBadge}</div>
                            <div style="flex:1; min-width:0;">
                                <div class="player-name ${isMe ? 'me-text' : ''}">${data.name || 'İsimsiz'}</div>
                                <div class="player-lvl">Lvl ${Math.floor((data.xp || 0) / 100) + 1}</div>
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

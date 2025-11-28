(function () {
    const APP_ID_KEY = 'engApp_v60';
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

        // Frame Color Map (Must match shop catalog)
        const frameColors = {
            'frame_gold': '#FFD700',
            'frame_neon': '#00f2ff',
            'frame_fire': '#ff4500',
            'frame_rainbow': 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)',
            'frame_diamond': '#b9f2ff',
            'frame_cyber': '#00ff00',
            'frame_galaxy': '#9d00ff'
        };

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

                // Take only top 50
                players = players.slice(0, 50);

                let html = '';
                let rank = 1;

                players.forEach(data => {
                    const isMe = window.Firebase.auth.currentUser && window.Firebase.auth.currentUser.uid === data.id;

                    let rankDisplay = `<span class="leaderboard-rank">${rank}</span>`;
                    if (rank === 1) rankDisplay = `<span class="leaderboard-rank rank-1">${rank}</span>`;
                    if (rank === 2) rankDisplay = `<span class="leaderboard-rank rank-2">${rank}</span>`;
                    if (rank === 3) rankDisplay = `<span class="leaderboard-rank rank-3">${rank}</span>`;

                    // Check online status based on lastActive (within 20 seconds)
                    let isOnline = false;
                    if (data.lastActive) {
                        const lastActiveDate = data.lastActive.toDate ? data.lastActive.toDate() : new Date(data.lastActive);
                        const diffSeconds = (new Date() - lastActiveDate) / 1000;
                        if (diffSeconds < 20) isOnline = true;
                    }

                    // Determine Name Style based on Frame
                    let nameStyle = '';
                    if (data.frame && frameColors[data.frame]) {
                        const color = frameColors[data.frame];
                        if (color.includes('gradient')) {
                            nameStyle = `background: ${color}; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800;`;
                        } else {
                            nameStyle = `color: ${color}; font-weight: 700; text-shadow: 0 0 10px ${color}40;`;
                        }
                    }

                    html += `
                        <div class="leaderboard-row ${isMe ? 'me' : ''}">
                            ${rankDisplay}
                            <div class="leaderboard-user-info">
                                <div class="leaderboard-name ${isMe ? 'me-text' : ''}" style="${nameStyle}">${data.name || 'İsimsiz'}</div>
                                <div class="leaderboard-lvl">Lvl ${Math.floor((data.xp || 0) / 100) + 1}</div>
                            </div>
                            <div class="leaderboard-row-right">
                                <div class="leaderboard-xp">${data.xp || 0} XP</div>
                                ${!isMe ? `<button onclick="window.multiplayer.challengeUser('${data.id}', '${data.name}')" class="btn-mini-challenge">⚔️</button>` : ''}
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
                if (error.code === 'permission-denied') {
                    list.innerHTML = '<div style="padding:20px; text-align:center; color:var(--neon-red);">Erişim reddedildi. Lütfen giriş yapın.</div>';
                } else {
                    list.innerHTML = `<div style="padding:20px; text-align:center; color:var(--neon-red);">Veri hatası: ${error.message}</div>`;
                }
            });

        } catch (e) {
            console.error("Leaderboard load exception:", e);
            list.innerHTML = `<div style="padding:20px; text-align:center; color:var(--neon-red);">Yükleme hatası: ${e.message}</div>`;
        }
    }

    // Expose for manual refresh if needed
    window.refreshLeaderboard = loadLeaderboard;
})();

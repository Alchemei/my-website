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

                // Add Fake Bots if players < 10
                const botNames = ['Ahmet Y.', 'Ayşe K.', 'Mehmet D.', 'Elif S.', 'Can B.', 'Zeynep T.', 'Murat Ö.', 'Selin A.', 'Burak Ç.', 'Gizem E.'];
                const userXp = window.store.state.xp || 0;

                // Ensure we have at least 10 players total
                while (players.length < 10) {
                    const name = botNames[Math.floor(Math.random() * botNames.length)];
                    // Generate random XP around user's XP (0.5x to 1.5x) or random 100-5000 if user is 0
                    let botXp = 0;
                    if (userXp > 100) {
                        botXp = Math.floor(userXp * (0.5 + Math.random()));
                    } else {
                        botXp = Math.floor(Math.random() * 2000) + 100;
                    }

                    // Avoid duplicate names if possible (simple check)
                    if (!players.find(p => p.name === name)) {
                        players.push({
                            id: 'bot_' + Math.random(),
                            name: name,
                            xp: botXp,
                            isBot: true,
                            lastActive: new Date() // Bots are always "active" recently
                        });
                    } else {
                        // If name exists, just add a number
                        players.push({
                            id: 'bot_' + Math.random(),
                            name: name + ' ' + Math.floor(Math.random() * 10),
                            xp: botXp,
                            isBot: true,
                            lastActive: new Date()
                        });
                    }
                }

                // Sort by XP descending
                players.sort((a, b) => (b.xp || 0) - (a.xp || 0));

                // Take only top 20
                players = players.slice(0, 20);

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

                    html += `
                        <div class="leaderboard-row ${isMe ? 'me' : ''}">
                            ${rankDisplay}
                            <div class="leaderboard-user-info">
                                <div class="leaderboard-name ${isMe ? 'me-text' : ''}">${data.name || 'İsimsiz'}</div>
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

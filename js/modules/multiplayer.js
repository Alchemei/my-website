(function () {
    // Real-time Multiplayer System using Firebase Firestore

    const APP_ID = 'english-master-global';
    const BET_AMOUNT = 50; // Cost to enter a duel
    let activeListener = null;
    let progressListener = null;

    window.multiplayer = {
        activeChallengeId: null,
        opponent: null,
        isHost: false,

        // Initialize listeners
        init() {
            if (!window.Firebase || !window.Firebase.auth) {
                setTimeout(() => this.init(), 1000);
                return;
            }

            window.Firebase.auth.onAuthStateChanged(user => {
                if (user) {
                    this.listenForChallenges(user.uid);
                }
            });
        },

        listenForChallenges(uid) {
            const db = window.Firebase.db;
            db.collection('challenges')
                .where('targetId', '==', uid)
                .where('status', '==', 'pending')
                .onSnapshot(snapshot => {
                    snapshot.docChanges().forEach(change => {
                        if (change.type === 'added') {
                            const data = change.doc.data();
                            const now = Date.now();
                            const created = data.createdAt?.toMillis() || 0;
                            if (now - created < 60000) {
                                showChallengeModal(change.doc.id, data);
                            }
                        }
                    });
                });
        },

        // Challenge a user
        async challengeUser(targetId, targetName) {
            if (!window.store.state.userId) {
                window.toast("Önce giriş yapmalısın!");
                return;
            }

            if (window.store.state.coins < BET_AMOUNT) {
                window.toast(`Yetersiz Altın! Düello için ${BET_AMOUNT} altına ihtiyacın var.`);
                return;
            }

            // Deduct coins
            window.store.update('coins', window.store.state.coins - BET_AMOUNT);

            const db = window.Firebase.db;
            const myId = window.store.state.userId;
            const myName = window.store.state.username;

            try {
                const docRef = await db.collection('challenges').add({
                    senderId: myId,
                    senderName: myName,
                    targetId: targetId,
                    targetName: targetName,
                    status: 'pending',
                    bet: BET_AMOUNT,
                    createdAt: window.Firebase.firestore.FieldValue.serverTimestamp(),
                    players: {
                        [myId]: { score: 0, total: 10, finished: false },
                        [targetId]: { score: 0, total: 10, finished: false }
                    }
                });

                this.activeChallengeId = docRef.id;
                this.opponent = { id: targetId, name: targetName };
                this.isHost = true;

                window.toast(`${targetName} kişisine meydan okundu! Yanıt bekleniyor...`);

                // Listen for acceptance
                activeListener = docRef.onSnapshot(doc => {
                    const data = doc.data();
                    if (data && data.status === 'accepted') {
                        window.toast("Meydan okuma kabul edildi! Yarış başlıyor!");
                        this.startDuel(docRef.id);
                    }
                });

            } catch (e) {
                console.error("Challenge error:", e);
                window.toast("Meydan okuma gönderilemedi.");
                // Refund on error
                window.store.update('coins', window.store.state.coins + BET_AMOUNT);
            }
        },

        // Accept a challenge
        async acceptChallenge(challengeId, senderId, senderName) {
            if (window.store.state.coins < BET_AMOUNT) {
                window.toast(`Yetersiz Altın! Düello için ${BET_AMOUNT} altına ihtiyacın var.`);
                return;
            }

            // Deduct coins
            window.store.update('coins', window.store.state.coins - BET_AMOUNT);

            const db = window.Firebase.db;
            try {
                await db.collection('challenges').doc(challengeId).update({
                    status: 'accepted',
                    startTime: window.Firebase.firestore.FieldValue.serverTimestamp()
                });

                this.activeChallengeId = challengeId;
                this.opponent = { id: senderId, name: senderName };
                this.isHost = false;

                this.startDuel(challengeId);

            } catch (e) {
                console.error("Accept error:", e);
                window.toast("Hata oluştu.");
                // Refund
                window.store.update('coins', window.store.state.coins + BET_AMOUNT);
            }
        },

        // Start the game logic & Listen for progress
        startDuel(challengeId) {
            if (activeListener) activeListener();

            document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));

            window.switchTab('quiz');
            if (window.startDuelMode) {
                window.startDuelMode(this.opponent);
            }

            const db = window.Firebase.db;
            const myId = window.store.state.userId;

            progressListener = db.collection('challenges').doc(challengeId).onSnapshot(doc => {
                const data = doc.data();
                if (!data) return;

                // Update opponent progress
                const oppData = data.players[this.opponent.id];
                if (oppData) {
                    updateOpponentProgress(oppData.score, oppData.total);
                }

                // Check if BOTH finished
                const myData = data.players[myId];

                if (myData && myData.finished && oppData && oppData.finished) {
                    // Determine winner
                    let winnerId = null;
                    if (myData.score > oppData.score) winnerId = myId;
                    else if (oppData.score > myData.score) winnerId = this.opponent.id;
                    else {
                        // Tie - check time (lower is better)
                        // Note: We are using local time sent to server, which can be cheated, but fine for demo.
                        // Or just declare Draw. Let's do Draw if scores equal.
                        winnerId = 'draw';
                    }

                    if (progressListener) progressListener(); // Stop listening

                    // Call result handler
                    window.handleDuelResult(winnerId, data.bet * 2);
                }
            });
        },

        // Send current progress
        async sendProgress(score, total) {
            if (!this.activeChallengeId) return;
            const db = window.Firebase.db;
            const myId = window.store.state.userId;

            try {
                await db.collection('challenges').doc(this.activeChallengeId).update({
                    [`players.${myId}.score`]: score,
                    [`players.${myId}.total`]: total
                });
            } catch (e) {
                console.error("Progress sync error", e);
            }
        },

        // Send game over
        async sendGameOver(score, time) {
            if (!this.activeChallengeId) return;
            const db = window.Firebase.db;
            const myId = window.store.state.userId;

            try {
                await db.collection('challenges').doc(this.activeChallengeId).update({
                    [`players.${myId}.score`]: score,
                    [`players.${myId}.time`]: time,
                    [`players.${myId}.finished`]: true
                });
            } catch (e) {
                console.error("Game over sync error", e);
            }
        },

        requestRematch() {
            if (this.opponent) {
                this.challengeUser(this.opponent.id, this.opponent.name);
            }
        }
    };

    // UI Helpers
    function showChallengeModal(id, data) {
        let modal = document.getElementById('challenge-modal');
        if (!modal) {
            const div = document.createElement('div');
            div.id = 'challenge-modal';
            div.className = 'modal';
            div.innerHTML = `
                <div class="modal-content" style="text-align:center; border:1px solid var(--neon-purple);">
                    <h2 style="color:var(--neon-purple);">⚔️ Meydan Okuma!</h2>
                    <p id="challenge-msg" style="margin:20px 0; font-size:1.1rem;"></p>
                    <div style="margin-bottom:20px; color:var(--neon-yellow); font-weight:bold;">
                        Giriş Ücreti: ${BET_AMOUNT} Altın 💰
                    </div>
                    <div style="display:flex; gap:10px; justify-content:center;">
                        <button class="btn" onclick="document.getElementById('challenge-modal').classList.add('hidden')" style="background:#334155;">Reddet</button>
                        <button class="btn" id="btn-accept-challenge" style="background:var(--neon-green); color:black; font-weight:bold;">Kabul Et</button>
                    </div>
                </div>
            `;
            document.body.appendChild(div);
            modal = div;
        }

        document.getElementById('challenge-msg').innerHTML = `<span style="color:white; font-weight:bold;">${data.senderName}</span> seni düelloya davet ediyor!`;

        const acceptBtn = document.getElementById('btn-accept-challenge');
        acceptBtn.onclick = () => {
            window.multiplayer.acceptChallenge(id, data.senderId, data.senderName);
            modal.classList.add('hidden');
        };

        modal.classList.remove('hidden');
        window.playSound('success');
    }

    function updateOpponentProgress(score, total) {
        const bar = document.getElementById('duel-opponent-bar');
        if (bar) {
            const pct = (score / total) * 100;
            bar.style.width = `${pct}%`;
        }
    }

    // Expose init
    window.initMultiplayer = function () {
        window.multiplayer.init();
    };

})();

(function () {
    // Real-time Multiplayer System using Firebase Firestore

    const APP_ID = 'english-master-global'; // Using the same app ID as leaderboard
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
            // Listen for incoming challenges
            db.collection('challenges')
                .where('targetId', '==', uid)
                .where('status', '==', 'pending')
                .onSnapshot(snapshot => {
                    snapshot.docChanges().forEach(change => {
                        if (change.type === 'added') {
                            const data = change.doc.data();
                            // Show modal only if it's a fresh challenge (created in last minute)
                            // This prevents showing old stale challenges
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
                    createdAt: window.Firebase.firestore.FieldValue.serverTimestamp(),
                    progress: {
                        [myId]: { score: 0, total: 10 },
                        [targetId]: { score: 0, total: 10 }
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
                        // Challenge accepted!
                        window.toast("Meydan okuma kabul edildi! Yarış başlıyor!");
                        this.startDuel(docRef.id);
                    }
                });

            } catch (e) {
                console.error("Challenge error:", e);
                window.toast("Meydan okuma gönderilemedi.");
            }
        },

        // Accept a challenge
        async acceptChallenge(challengeId, senderId, senderName) {
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
            }
        },

        // Start the game logic & Listen for progress
        startDuel(challengeId) {
            // Unsubscribe from previous listeners if any
            if (activeListener) activeListener();

            // Close modals
            document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));

            // Switch to quiz tab
            window.switchTab('quiz');
            if (window.startDuelMode) {
                window.startDuelMode(this.opponent);
            }

            // Listen for game progress
            const db = window.Firebase.db;
            progressListener = db.collection('challenges').doc(challengeId).onSnapshot(doc => {
                const data = doc.data();
                if (!data) return;

                // Check for opponent progress
                const oppProgress = data.progress[this.opponent.id];
                if (oppProgress) {
                    updateOpponentProgress(oppProgress.score, oppProgress.total);
                }

                // Check for game over / winner
                if (data.winner) {
                    window.handleDuelFinish(data.winner, 0, 0); // Score/time handled locally or via data
                    if (progressListener) progressListener(); // Stop listening
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
                    [`progress.${myId}`]: { score, total }
                });
            } catch (e) {
                console.error("Progress sync error", e);
            }
        },

        // Send game over
        async sendGameOver(score, time) {
            if (!this.activeChallengeId) return;
            // We don't necessarily end the game here in Firestore, 
            // we just ensure our final score is sent.
            // The logic to decide "Winner" could be complex (who finished first?), 
            // for simplicity, let's just mark ourselves as finished.

            // In a real app, we'd use a cloud function or transaction to determine winner safely.
            // Here, we'll just wait for the other player or show result locally.

            // Let's just update our final score.
            await this.sendProgress(score, 10);
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

(function () {
    // Real-time Multiplayer System using Firebase Firestore

    const APP_ID = 'english-master-global';
    const BET_AMOUNT = 50; // Cost to challenge
    let activeListener = null;
    let progressListener = null;

    window.multiplayer = {
        activeChallengeId: null,
        opponent: null,
        isHost: false,
        bet: 0,

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
                            if (now - created < 60000) { // 1 min expiry for notification
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
                window.toast(`Yetersiz altın! Meydan okuma bedeli: ${BET_AMOUNT} 🪙`);
                return;
            }

            // Deduct coins immediately
            window.store.update('coins', window.store.state.coins - BET_AMOUNT);
            window.toast(`-${BET_AMOUNT} Altın (Bahis)`);

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
                    betAmount: BET_AMOUNT,
                    seed: Math.floor(Math.random() * 1000000), // Random seed for same questions
                    createdAt: window.Firebase.firestore.FieldValue.serverTimestamp(),
                    progress: {
                        [myId]: { score: 0, total: 10, finished: false },
                        [targetId]: { score: 0, total: 10, finished: false }
                    }
                });

                this.activeChallengeId = docRef.id;
                this.opponent = { id: targetId, name: targetName };
                this.isHost = true;
                this.bet = BET_AMOUNT;

                window.toast(`${targetName} kişisine meydan okundu! Yanıt bekleniyor...`);

                // Listen for acceptance
                activeListener = docRef.onSnapshot(doc => {
                    const data = doc.data();
                    if (data && data.status === 'accepted') {
                        // Prevent double-firing
                        if (!activeListener) return;

                        window.toast("Meydan okuma kabul edildi! Yarış başlıyor!");

                        // Unsubscribe immediately
                        activeListener();
                        activeListener = null;

                        this.startDuel(docRef.id);
                    } else if (data && data.status === 'rejected') {
                        window.toast("Meydan okuma reddedildi.");
                        // Refund
                        window.store.update('coins', window.store.state.coins + BET_AMOUNT);
                        if (activeListener) {
                            activeListener();
                            activeListener = null;
                        }
                    }
                });

            } catch (e) {
                console.error("Challenge error:", e);
                window.toast("Meydan okuma gönderilemedi.");
                window.store.update('coins', window.store.state.coins + BET_AMOUNT); // Refund on error
            }
        },

        // Accept a challenge
        async acceptChallenge(challengeId, senderId, senderName, betAmount) {
            if (window.store.state.coins < betAmount) {
                window.toast(`Yetersiz altın! Kabul etmek için ${betAmount} 🪙 gerekli.`);
                // Optionally reject automatically or just do nothing
                return;
            }

            const db = window.Firebase.db;
            try {
                // Deduct coins
                window.store.update('coins', window.store.state.coins - betAmount);
                window.toast(`-${betAmount} Altın (Bahis)`);

                await db.collection('challenges').doc(challengeId).update({
                    status: 'accepted',
                    startTime: window.Firebase.firestore.FieldValue.serverTimestamp()
                });

                this.activeChallengeId = challengeId;
                this.opponent = { id: senderId, name: senderName };
                this.isHost = false;
                this.bet = betAmount;

                this.startDuel(challengeId);

            } catch (e) {
                console.error("Accept error:", e);
                window.toast("Hata oluştu.");
                window.store.update('coins', window.store.state.coins + betAmount); // Refund
            }
        },

        rejectChallenge(challengeId) {
            const db = window.Firebase.db;
            db.collection('challenges').doc(challengeId).update({
                status: 'rejected'
            });
        },

        // Start the game logic & Listen for progress
        startDuel(challengeId) {
            // Cleanup previous listeners
            if (activeListener) {
                activeListener();
                activeListener = null;
            }
            if (progressListener) {
                progressListener();
                progressListener = null;
            }

            // Close modals
            document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));

            // Switch to quiz tab
            window.switchTab('quiz');

            // Wait for listener to get data and seed before starting
            if (!this.opponent) {
                console.error("Cannot start duel: Missing opponent");
                return;
            }

            // Listen for game progress
            const db = window.Firebase.db;
            const myId = window.store.state.userId;

            progressListener = db.collection('challenges').doc(challengeId).onSnapshot(doc => {
                const data = doc.data();
                if (!data) return;

                // Initialize duel mode ONCE with seed if not already active
                // Only start if we are NOT currently in a duel
                if ((!window.quizState?.active || window.quizState?.mode !== 'duel') && window.startDuelMode && this.opponent) {
                    window.startDuelMode(this.opponent, data.seed);
                }

                // Robustly find opponent ID from progress keys
                const progressKeys = Object.keys(data.progress || {});
                const otherId = progressKeys.find(k => k !== myId);

                // Check for opponent progress
                if (otherId && data.progress) {
                    const oppProgress = data.progress[otherId];
                    if (oppProgress) {
                        updateOpponentProgress(oppProgress.score, oppProgress.total);
                    }
                }

                // Check if winner is decided
                if (data.winner) {
                    this.handleGameEnd(data.winner, data.betAmount, data.progress);
                    if (progressListener) progressListener(); // Stop listening
                    return;
                }

                // Check if both finished (Client-side check to trigger winner calculation)
                if (otherId && data.progress) {
                    const myP = data.progress[myId];
                    const oppP = data.progress[otherId];

                    if (myP?.finished && oppP?.finished && !data.winner) {
                        // Both finished, calculate winner.
                        // We allow ANY client to calculate this to prevent hanging if Host disconnects.
                        this.determineWinner(challengeId, myId, myP, otherId, oppP);
                    }
                }
            });
        },

        async determineWinner(challengeId, p1Id, p1Data, p2Id, p2Data) {
            let winnerId = null;

            // Deterministic Winner Logic
            if (p1Data.score > p2Data.score) winnerId = p1Id;
            else if (p2Data.score > p1Data.score) winnerId = p2Id;
            else {
                // Tie on score, check time (lower is better)
                // If time is missing, fallback to 0 (which is unfair but prevents crash)
                // Ideally time should always be present if finished=true
                const t1 = p1Data.time || Number.MAX_SAFE_INTEGER;
                const t2 = p2Data.time || Number.MAX_SAFE_INTEGER;

                if (t1 < t2) winnerId = p1Id;
                else if (t2 < t1) winnerId = p2Id;
                else winnerId = p1Id; // Exact tie, p1 wins (Host advantage or random)
            }

            const db = window.Firebase.db;
            try {
                await db.collection('challenges').doc(challengeId).update({
                    winner: winnerId
                });
            } catch (e) {
                console.log("Winner update race", e);
            }
        },

        handleGameEnd(winnerId, betAmount, progress) {
            const myId = window.store.state.userId;
            const isMe = winnerId === myId;

            if (isMe) {
                const pot = betAmount * 2;
                window.store.update('coins', window.store.state.coins + pot);
                window.toast(`KAZANDIN! +${pot} Altın 🏆`);
                window.playSound('success');
            } else {
                window.playSound('error');
            }

            if (window.handleDuelFinish) {
                window.handleDuelFinish(winnerId, betAmount, progress);
            }
        },

        // Send current progress
        async sendProgress(score, total) {
            if (!this.activeChallengeId) return;
            const db = window.Firebase.db;
            const myId = window.store.state.userId;

            try {
                await db.collection('challenges').doc(this.activeChallengeId).update({
                    [`progress.${myId}.score`]: score,
                    [`progress.${myId}.total`]: total
                });
            } catch (e) {
                console.error("Progress sync error", e);
            }
        },

        // Send game over
        async sendGameOver(score, total, time) {
            if (!this.activeChallengeId) return;
            const db = window.Firebase.db;
            const myId = window.store.state.userId;

            // Mark as finished
            await db.collection('challenges').doc(this.activeChallengeId).update({
                [`progress.${myId}`]: {
                    score,
                    total: total,
                    finished: true,
                    time: time
                }
            });

            // Show waiting message
            window.toast("Sonuçlar bekleniyor...");
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
                    <div style="font-size:0.9rem; color:var(--neon-yellow); margin-bottom:20px;">Bahis: 50 🪙</div>
                    <div style="display:flex; gap:10px; justify-content:center;">
                        <button class="btn" id="btn-reject-challenge" style="background:#334155;">Reddet</button>
                        <button class="btn" id="btn-accept-challenge" style="background:var(--neon-green); color:black; font-weight:bold;">Kabul Et (-50🪙)</button>
                    </div>
                </div>
            `;
            document.body.appendChild(div);
            modal = div;
        }

        document.getElementById('challenge-msg').innerHTML = `<span style="color:white; font-weight:bold;">${data.senderName}</span> seni düelloya davet ediyor!`;

        document.getElementById('btn-accept-challenge').onclick = () => {
            window.multiplayer.acceptChallenge(id, data.senderId, data.senderName, data.betAmount || 50);
            modal.classList.add('hidden');
        };

        document.getElementById('btn-reject-challenge').onclick = () => {
            window.multiplayer.rejectChallenge(id);
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
        } else {
            // Try to find it again or log warning
            // console.warn("Opponent bar not found");
        }
    }

    // Expose init
    window.initMultiplayer = function () {
        window.multiplayer.init();
    };

})();

(function () {
    // Multiplayer System using LocalStorage for cross-tab communication
    // This simulates real-time features for demo purposes

    const CHANNEL = 'english-master-multiplayer';
    const SESSION_ID = Math.random().toString(36).substr(2, 9);

    window.multiplayer = {
        activeChallenge: null,
        opponent: null,
        isHost: false,

        // Send a message to other tabs
        broadcast(type, payload) {
            const msg = {
                type,
                payload,
                senderId: window.store.state.userId,
                senderName: window.store.state.username || 'Player',
                sessionId: SESSION_ID,
                timestamp: Date.now()
            };
            localStorage.setItem(CHANNEL, JSON.stringify(msg));
            // Clear it immediately so we can trigger same event again if needed
            // But wait a tiny bit to ensure other tabs catch it
            setTimeout(() => localStorage.removeItem(CHANNEL), 100);
        },

        // Challenge a user
        challengeUser(targetId, targetName) {
            this.broadcast('CHALLENGE_REQUEST', {
                targetId,
                targetName
            });
            window.toast(`${targetName} kişisine meydan okundu!`);
        },

        // Accept a challenge
        acceptChallenge(challengeData) {
            this.activeChallenge = challengeData;
            this.opponent = { id: challengeData.senderId, name: challengeData.senderName };
            this.isHost = false;

            this.broadcast('CHALLENGE_ACCEPTED', {
                challengeId: challengeData.timestamp,
                targetId: challengeData.senderId
            });

            this.startDuel();
        },

        // Start the game logic
        startDuel() {
            // Close any open modals
            document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));

            // Switch to quiz tab and start duel mode
            window.switchTab('quiz');
            if (window.startDuelMode) {
                window.startDuelMode(this.opponent);
            }
        },

        // Send current progress
        sendProgress(score, total) {
            if (!this.opponent) return;
            this.broadcast('GAME_PROGRESS', {
                targetId: this.opponent.id,
                score,
                total
            });
        },

        // Send game over
        sendGameOver(score, time) {
            if (!this.opponent) return;
            this.broadcast('GAME_OVER', {
                targetId: this.opponent.id,
                score,
                time
            });
        }
    };

    // Listen for messages
    window.addEventListener('storage', (e) => {
        if (e.key !== CHANNEL || !e.newValue) return;

        const msg = JSON.parse(e.newValue);
        if (msg.sessionId === SESSION_ID) return; // Ignore own messages from this tab

        // Handle Challenge Request
        if (msg.type === 'CHALLENGE_REQUEST') {
            // In a real app, we check if msg.payload.targetId === myId
            // For demo, we'll accept ALL challenges to simulate "being the other user"
            // OR we can check if we are explicitly the target.
            // Since we don't have a real user list, we'll just show it if we are NOT the sender.

            showChallengeModal(msg);
        }

        // Handle Challenge Accepted
        if (msg.type === 'CHALLENGE_ACCEPTED') {
            // If I am the one who sent the challenge
            // We check if the targetId matches OUR userId. 
            // Since we might share userId in this demo, we also check if we are NOT the one who sent the ACCEPT message.
            if (msg.payload.targetId === window.store.state.userId) {
                window.multiplayer.opponent = { id: msg.senderId, name: msg.senderName };
                window.multiplayer.isHost = true;
                window.multiplayer.startDuel();
                window.toast("Meydan okuma kabul edildi! Yarış başlıyor!");
            }
        }

        // Handle Game Progress
        if (msg.type === 'GAME_PROGRESS') {
            // Check if this message is from our current opponent
            // In demo mode with shared userId, we rely on session ID filtering above to not receive our own progress
            // So we just check if we are in a duel
            if (window.multiplayer.opponent) {
                updateOpponentProgress(msg.payload.score, msg.payload.total);
            }
        }

        // Handle Game Over
        if (msg.type === 'GAME_OVER') {
            if (window.multiplayer.opponent) {
                window.handleDuelFinish(msg.senderId, msg.payload.score, msg.payload.time);
            }
        }
    });

    // UI Helpers
    function showChallengeModal(msg) {
        // Create modal dynamically if not exists
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

        document.getElementById('challenge-msg').innerHTML = `<span style="color:white; font-weight:bold;">${msg.senderName}</span> seni düelloya davet ediyor!`;

        const acceptBtn = document.getElementById('btn-accept-challenge');
        acceptBtn.onclick = () => {
            window.multiplayer.acceptChallenge(msg);
            modal.classList.add('hidden');
        };

        modal.classList.remove('hidden');
        window.playSound('success'); // Notification sound
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
        console.log("Multiplayer system initialized");
    };

})();

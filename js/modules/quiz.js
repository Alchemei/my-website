(function () {
    let quizState = { active: false, currentQ: 0, score: 0, totalQ: 20 };

    window.initQuiz = function () {
        window.startQuiz = startQuiz;
        window.startChallenge = startChallenge;
        window.startMatch = startMatch;
        window.startHangman = startHangman;
        window.showGamesMenu = showGamesMenu;
        window.resetQuiz = showGamesMenu;
        window.handleQuizAns = handleQuizAns;
        window.handleQuizContinue = handleQuizContinue;
    }

    async function handleQuizContinue() {
        try {
            if (window.showInterstitial) {
                await window.showInterstitial();
            }
        } catch (e) {
            console.error("Ad show failed:", e);
        } finally {
            showGamesMenu();
        }
    }

    function showGamesMenu() {
        document.getElementById('games-menu').classList.remove('hidden');
        document.getElementById('quiz-play-area').classList.add('hidden');
        document.getElementById('quiz-result-area').classList.add('hidden');
        document.getElementById('quiz-challenge-area').classList.add('hidden');
        document.getElementById('match-area').classList.add('hidden');
        document.getElementById('hangman-area').classList.add('hidden');
        if (quizState.timer) clearInterval(quizState.timer);
    }

    function startQuiz() {
        showGamesMenu(); // Reset other views
        document.getElementById('games-menu').classList.add('hidden');
        document.getElementById('quiz-play-area').classList.remove('hidden');
        quizState = { active: true, currentQ: 1, score: 0, totalQ: 20, mode: 'normal' };
        renderQuizQ();
    }

    function startChallenge() {
        showGamesMenu();
        document.getElementById('games-menu').classList.add('hidden');
        document.getElementById('quiz-play-area').classList.remove('hidden');
        document.getElementById('quiz-challenge-area').classList.remove('hidden');

        quizState = { active: true, currentQ: 1, score: 0, totalQ: 999, mode: 'challenge', timeLeft: 60 };
        renderQuizQ();

        const timerEl = document.getElementById('challenge-timer');
        quizState.timer = setInterval(() => {
            if (!quizState.active || quizState.mode !== 'challenge') {
                clearInterval(quizState.timer);
                return;
            }

            quizState.timeLeft--;
            timerEl.innerText = quizState.timeLeft;

            if (quizState.timeLeft <= 0) {
                clearInterval(quizState.timer);
                finishQuiz();
            }
        }, 1000);
    }

    // --- Match Game ---
    let matchState = { selected: null, pairs: [], matched: 0, score: 0 };

    function startMatch() {
        showGamesMenu();
        document.getElementById('games-menu').classList.add('hidden');
        document.getElementById('match-area').classList.remove('hidden');

        matchState = { selected: null, pairs: [], matched: 0, score: 0 };
        document.getElementById('match-score').innerText = 0;

        // Pick 6 random words
        const words = [...window.words].sort(() => 0.5 - Math.random()).slice(0, 6);
        let cards = [];
        words.forEach((w, i) => {
            cards.push({ id: i, type: 'en', text: w.en, pairId: i });
            cards.push({ id: i, type: 'tr', text: w.tr, pairId: i });
        });

        // Shuffle cards
        cards.sort(() => 0.5 - Math.random());

        const grid = document.getElementById('match-grid');
        grid.innerHTML = '';

        cards.forEach((card, idx) => {
            const btn = document.createElement('button');
            btn.className = 'glass-panel match-card-btn';
            btn.innerText = card.text;
            btn.dataset.idx = idx;

            btn.onclick = () => handleMatchClick(btn, card);
            grid.appendChild(btn);
        });
    }

    function handleMatchClick(btn, card) {
        if (btn.classList.contains('matched') || btn.classList.contains('selected')) return;

        btn.classList.add('selected');
        btn.classList.add('match-card-selected');

        if (!matchState.selected) {
            matchState.selected = { btn, card };
        } else {
            // Check match
            const first = matchState.selected;
            if (first.card.pairId === card.pairId) {
                // Match!
                btn.classList.add('matched');
                first.btn.classList.add('matched');
                btn.classList.add('match-card-matched');
                first.btn.classList.add('match-card-matched');

                // Remove selected styles
                btn.classList.remove('match-card-selected');
                first.btn.classList.remove('match-card-selected');

                matchState.score += 10;
                matchState.matched++;
                matchState.selected = null;
                document.getElementById('match-score').innerText = matchState.score;
                window.playSound('success');

                if (matchState.matched === 6) {
                    setTimeout(() => finishGame(matchState.score, 'Eşleştirme Tamamlandı!'), 500);
                }
            } else {
                // Mismatch
                window.playSound('error');
                setTimeout(() => {
                    btn.classList.remove('selected');
                    first.btn.classList.remove('selected');
                    btn.classList.remove('match-card-selected');
                    first.btn.classList.remove('match-card-selected');
                }, 500);
                matchState.selected = null;
            }
        }
    }

    // --- Hangman Game ---
    let hangmanState = { word: null, guessed: [], lives: 6 };

    function startHangman() {
        showGamesMenu();
        document.getElementById('games-menu').classList.add('hidden');
        document.getElementById('hangman-area').classList.remove('hidden');

        const w = window.words[Math.floor(Math.random() * window.words.length)];
        hangmanState = { word: w, guessed: [], lives: 6 };

        document.getElementById('hangman-hint').innerText = `İpucu: ${w.tr}`;
        document.getElementById('hangman-lives').innerText = 6;

        renderHangman();
        renderKeyboard();
    }

    function renderHangman() {
        const display = hangmanState.word.en.split('').map(char => {
            if (char === ' ') return ' ';
            return hangmanState.guessed.includes(char.toLowerCase()) ? char : '_';
        }).join(' ');

        document.getElementById('hangman-word').innerText = display;

        if (!display.includes('_')) {
            setTimeout(() => finishGame(50, 'Kelime Bulundu!'), 500);
        }
    }

    function renderKeyboard() {
        const kb = document.getElementById('hangman-keyboard');
        kb.innerHTML = '';
        const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

        letters.forEach(l => {
            const btn = document.createElement('button');
            btn.innerText = l;
            btn.className = 'btn hangman-key-btn';

            if (hangmanState.guessed.includes(l)) {
                btn.disabled = true;
                btn.classList.add('hangman-key-disabled');
                if (hangmanState.word.en.toLowerCase().includes(l)) {
                    btn.classList.add('hangman-key-correct');
                } else {
                    btn.classList.add('hangman-key-wrong');
                }
            } else {
                btn.onclick = () => handleHangmanGuess(l);
            }

            kb.appendChild(btn);
        });
    }

    function handleHangmanGuess(l) {
        hangmanState.guessed.push(l);
        if (!hangmanState.word.en.toLowerCase().includes(l)) {
            hangmanState.lives--;
            document.getElementById('hangman-lives').innerText = hangmanState.lives;
            window.playSound('error');
            if (hangmanState.lives <= 0) {
                setTimeout(() => finishGame(0, 'Kaybettin! Kelime: ' + hangmanState.word.en), 500);
            }
        } else {
            window.playSound('success');
        }
        renderHangman();
        renderKeyboard();
    }

    function finishGame(xp, title) {
        document.getElementById('match-area').classList.add('hidden');
        document.getElementById('hangman-area').classList.add('hidden');
        document.getElementById('quiz-result-area').classList.remove('hidden');

        document.getElementById('res-title').innerText = title;
        document.getElementById('res-score').innerText = xp > 0 ? 'WIN' : 'FAIL';
        document.getElementById('res-xp').innerText = '+' + xp;
        document.getElementById('result-custom-content').innerHTML = ''; // Clear custom content

        if (xp > 0) {
            window.store.update('xp', window.store.state.xp + xp);
            window.store.updateHistory(xp);
            window.dispatchEvent(new CustomEvent('task-update', { detail: { type: 'xp', amount: xp } }));
            window.confetti();
        }
    }

    window.startDuelMode = startDuelMode;
    window.handleDuelFinish = handleDuelFinish;

    function handleDuelFinish(winnerId, betAmount, progress) {
        if (quizState.mode !== 'duel') return;

        const myId = window.store.state.userId;
        const opponentId = window.multiplayer.opponent.id;
        const opponentName = window.multiplayer.opponent.name;

        const myData = progress[myId];
        const oppData = progress[opponentId];

        const isMe = winnerId === myId;
        const title = isMe ? "KAZANDIN!" : "KAYBETTİN";
        const xp = isMe ? 100 : 20;
        const gold = isMe ? `+${betAmount * 2} 🪙` : `-${betAmount} 🪙`;

        finishGame(xp, title);

        // Hide Duel Container explicitly
        document.getElementById('duel-container').classList.add('hidden');
        document.getElementById('quiz-play-area').classList.add('hidden');

        // Set Score
        document.getElementById('res-score').innerText = myData.score;

        // Create Comparison Table in Custom Content Area
        const customArea = document.getElementById('result-custom-content');
        customArea.innerHTML = '';

        const table = document.createElement('div');
        table.className = 'glass-panel duel-result-table';

        table.innerHTML = `
            <div class="duel-result-header">SONUÇLAR</div>
            
            <div class="result-row ${isMe ? 'winner' : 'loser'}">
                <span class="font-bold">Sen</span>
                <span class="font-bold">${myData.score} / ${myData.total}</span>
            </div>
            <div class="result-row ${!isMe ? 'winner' : 'loser'}">
                <span class="font-bold">${opponentName}</span>
                <span class="font-bold">${oppData.score} / ${oppData.total}</span>
            </div>
        `;

        customArea.appendChild(table);
        document.getElementById('res-xp').innerText = `${gold} | +${xp} XP`;

        // Add Rematch Button
        let btn = document.getElementById('btn-rematch');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'btn-rematch';
            btn.className = 'btn w-full btn-rematch';
            btn.innerText = '🔄 Rövanş İste';
            btn.onclick = () => window.multiplayer.requestRematch();
            // Append to actions area if possible, or custom area
            document.querySelector('.result-actions').insertBefore(btn, document.querySelector('.result-actions').firstChild);
        } else {
            btn.style.display = 'block';
        }

        // Move question area back to tab-quiz
        const qArea = document.getElementById('quiz-play-area');
        document.getElementById('tab-quiz').appendChild(qArea);
    }

    function startDuelMode(opponent, questions = []) {
        showGamesMenu();
        document.getElementById('games-menu').classList.add('hidden');

        const qArea = document.getElementById('quiz-play-area');
        qArea.classList.remove('hidden');
        document.getElementById('duel-container').classList.remove('hidden');

        // Move question area inside duel container
        document.getElementById('duel-question-area').appendChild(qArea);

        document.getElementById('duel-opponent-name').innerText = opponent.name;
        document.getElementById('duel-my-bar').style.width = '0%';
        quizState = { active: true, currentQ: 1, score: 0, totalQ: 10, mode: 'duel', questions: questions };
        renderQuizQ();
    }

    function renderQuizQ() {
        document.getElementById('quiz-counter').innerText = `${quizState.currentQ} / ${quizState.totalQ}`;

        let target;
        if (quizState.mode === 'duel' && quizState.questions && quizState.questions.length > 0) {
            // Use pre-selected question
            const qIndex = quizState.questions[quizState.currentQ - 1];
            target = window.words[qIndex];
        } else {
            // Random fallback
            target = window.words[Math.floor(Math.random() * window.words.length)];
        }

        const wordEl = document.getElementById('q-word');
        wordEl.innerText = target.en;

        // Speak the word automatically
        setTimeout(() => window.speakWord(target.en), 300);

        // Allow clicking to hear again
        wordEl.onclick = () => window.speakWord(target.en);

        let opts = window.words.filter(w => w.en !== target.en)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(w => w.tr);

        opts.push(target.tr);
        opts.sort(() => 0.5 - Math.random());

        const div = document.getElementById('q-options');
        div.innerHTML = '';
        opts.forEach(o => {
            const b = document.createElement('button');
            b.className = 'quiz-opt';
            b.innerText = o;
            b.onclick = () => handleQuizAns(b, o, target.tr);
            div.appendChild(b);
        });
    }

    function handleQuizAns(btn, selected, correct) {
        const opts = document.querySelectorAll('.quiz-opt');
        opts.forEach(o => o.onclick = null);

        let isCorrect = (selected === correct);
        if (isCorrect) {
            btn.classList.add('quiz-opt-correct');
            quizState.score++;
            window.confetti();
            window.playSound('success');
        } else {
            btn.classList.add('quiz-opt-wrong');
            opts.forEach(o => {
                if (o.innerText === correct) {
                    o.classList.add('quiz-opt-correct');
                }
            });
            if (navigator.vibrate) navigator.vibrate(200);
            window.playSound('error');
        }

        if (quizState.mode === 'duel') {
            // Update my bar
            const pct = (quizState.score / quizState.totalQ) * 100;
            document.getElementById('duel-my-bar').style.width = `${pct}%`;
            // Send to opponent
            window.multiplayer.sendProgress(quizState.score, quizState.totalQ);
        }

        setTimeout(() => {
            if (quizState.currentQ < quizState.totalQ) {
                quizState.currentQ++;
                renderQuizQ();
            } else {
                finishQuiz();
            }
        }, 1200);
    }

    function finishQuiz() {
        if (quizState.mode === 'duel') {
            window.multiplayer.sendGameOver(quizState.score, Date.now());
            // handleDuelFinish is called by multiplayer when winner is decided
            return;
        }

        document.getElementById('quiz-play-area').classList.add('hidden');
        document.getElementById('quiz-result-area').classList.remove('hidden');
        quizState.active = false;

        let baseXP = quizState.score * 5;
        if (quizState.mode === 'challenge') {
            baseXP = quizState.score * 10; // Double XP for challenge
            document.getElementById('res-title').innerText = "Meydan Okuma Bitti!";
        } else {
            document.getElementById('res-title').innerText = "Quiz Tamamlandı!";
        }

        let finalXP = baseXP;

        if (window.store.state.activeItems.doubleXP > 0) {
            finalXP = baseXP * 2;
            window.store.update('activeItems', {
                ...window.store.state.activeItems,
                doubleXP: Math.max(0, window.store.state.activeItems.doubleXP - 20)
            });
        }

        window.store.update('xp', window.store.state.xp + finalXP);
        window.store.updateHistory(finalXP);

        window.dispatchEvent(new CustomEvent('task-update', { detail: { type: 'xp', amount: finalXP } }));
        window.dispatchEvent(new CustomEvent('task-update', { detail: { type: 'quiz', amount: 1 } }));

        document.getElementById('res-score').innerText = quizState.score;
        document.getElementById('res-xp').innerText = `+${finalXP}`;
        document.getElementById('result-custom-content').innerHTML = ''; // Clear custom content

    }


})();

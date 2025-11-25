(function () {
    let quizState = { active: false, currentQ: 0, score: 0, totalQ: 20 };

    window.initQuiz = function () {
        window.startQuiz = startQuiz;
        window.startChallenge = startChallenge;
        window.startMatch = startMatch;
        window.startHangman = startHangman;
        window.showGamesMenu = showGamesMenu;
        window.resetQuiz = startQuiz;
        window.handleQuizAns = handleQuizAns;
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
            btn.className = 'glass-panel';
            btn.style.padding = '20px 10px';
            btn.style.fontSize = '0.9rem';
            btn.style.fontWeight = '700';
            btn.style.minHeight = '80px';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.innerText = card.text;
            btn.dataset.idx = idx;

            btn.onclick = () => handleMatchClick(btn, card);
            grid.appendChild(btn);
        });
    }

    function handleMatchClick(btn, card) {
        if (btn.classList.contains('matched') || btn.classList.contains('selected')) return;

        btn.classList.add('selected');
        btn.style.background = 'rgba(255,255,255,0.2)';
        btn.style.border = '1px solid var(--neon-blue)';

        if (!matchState.selected) {
            matchState.selected = { btn, card };
        } else {
            // Check match
            const first = matchState.selected;
            if (first.card.pairId === card.pairId) {
                // Match!
                btn.classList.add('matched');
                first.btn.classList.add('matched');
                btn.style.background = 'rgba(34, 197, 94, 0.2)';
                first.btn.style.background = 'rgba(34, 197, 94, 0.2)';
                btn.style.border = '1px solid var(--neon-green)';
                first.btn.style.border = '1px solid var(--neon-green)';
                btn.style.opacity = '0.5';
                first.btn.style.opacity = '0.5';

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
                    btn.style.background = '';
                    first.btn.style.background = '';
                    btn.style.border = '';
                    first.btn.style.border = '';
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
            btn.className = 'btn';
            btn.style.width = '36px';
            btn.style.height = '40px';
            btn.style.margin = '2px';
            btn.style.background = 'rgba(255,255,255,0.1)';
            btn.style.borderRadius = '8px';

            if (hangmanState.guessed.includes(l)) {
                btn.disabled = true;
                btn.style.opacity = '0.3';
                if (hangmanState.word.en.toLowerCase().includes(l)) {
                    btn.style.background = 'var(--neon-green)';
                    btn.style.color = 'black';
                } else {
                    btn.style.background = 'var(--neon-red)';
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
        document.getElementById('res-score').innerText = xp > 0 ? 'Win' : 'Fail';
        document.getElementById('res-xp').innerText = '+' + xp;

        if (xp > 0) {
            window.store.update('xp', window.store.state.xp + xp);
            window.store.updateHistory(xp);
            window.dispatchEvent(new CustomEvent('task-update', { detail: { type: 'xp', amount: xp } }));
            window.confetti();
        }
    }

    window.startDuelMode = startDuelMode;
    window.handleDuelFinish = handleDuelFinish;

    function startDuelMode(opponent) {
        showGamesMenu();
        document.getElementById('games-menu').classList.add('hidden');

        const qArea = document.getElementById('quiz-play-area');
        qArea.classList.remove('hidden');
        document.getElementById('duel-container').classList.remove('hidden');

        // Move question area inside duel container
        document.getElementById('duel-question-area').appendChild(qArea);

        document.getElementById('duel-opponent-name').innerText = opponent.name;
        document.getElementById('duel-my-bar').style.width = '0%';
        quizState = { active: true, currentQ: 1, score: 0, totalQ: 10, mode: 'duel' };
        renderQuizQ();
    }

    function startListeningGame() {
        showGamesMenu();
        document.getElementById('games-menu').classList.add('hidden');
        document.getElementById('quiz-play-area').classList.remove('hidden');
        quizState = { active: true, currentQ: 1, score: 0, totalQ: 10, mode: 'listening' };
        renderQuizQ();
    }

    function renderQuizQ() {
        document.getElementById('quiz-counter').innerText = `${quizState.currentQ} / ${quizState.totalQ}`;
        const target = window.words[Math.floor(Math.random() * window.words.length)];

        const wordEl = document.getElementById('q-word');

        if (quizState.mode === 'listening') {
            wordEl.innerHTML = `<button class="btn" onclick="window.playTTS('${target.en}')" style="background:var(--neon-blue); width:80px; height:80px; border-radius:50%; font-size:2rem;">🔊</button>`;
            setTimeout(() => window.playTTS(target.en), 300);
        } else {
            wordEl.innerText = target.en;
        }

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
            btn.style.background = "rgba(16, 185, 129, 0.4)";
            btn.style.borderColor = "var(--neon-green)";
            quizState.score++;
            window.confetti();
            window.playSound('success');
        } else {
            btn.style.background = "rgba(239, 68, 68, 0.4)";
            btn.style.borderColor = "var(--neon-red)";
            opts.forEach(o => {
                if (o.innerText === correct) {
                    o.style.background = "rgba(16, 185, 129, 0.4)";
                    o.style.borderColor = "var(--neon-green)";
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

        document.getElementById('res-score').innerText = `${quizState.score} Doğru`;
        document.getElementById('res-xp').innerText = `+${finalXP}`;
    }
})();

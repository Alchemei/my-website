(function() {
    let quizState = { active: false, currentQ: 0, score: 0, totalQ: 20 };

    window.initQuiz = function() {
        window.startQuiz = startQuiz;
        window.resetQuiz = startQuiz;
        window.handleQuizAns = handleQuizAns;
    }

    function startQuiz() {
        document.getElementById('quiz-play-area').classList.remove('hidden');
        document.getElementById('quiz-result-area').classList.add('hidden');
        quizState = { active: true, currentQ: 1, score: 0, totalQ: 20 };
        renderQuizQ();
    }

    function renderQuizQ() {
        document.getElementById('quiz-counter').innerText = `${quizState.currentQ} / ${quizState.totalQ}`;
        const target = window.words[Math.floor(Math.random() * window.words.length)];
        document.getElementById('q-word').innerText = target.en;
        
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
        document.getElementById('quiz-play-area').classList.add('hidden');
        document.getElementById('quiz-result-area').classList.remove('hidden');
        
        let baseXP = quizState.score * 5;
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

        document.getElementById('res-score').innerText = `${quizState.score} / 20`;
        document.getElementById('res-xp').innerText = `+${finalXP}`;
    }
})();

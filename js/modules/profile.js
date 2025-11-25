(function() {
    // Global App ID for sync
    const APP_ID_KEY = 'english-master-global';
    const appId = window.__app_id || APP_ID_KEY;

    let currentUser = null;
    let syncTimeout = null;

    window.initProfile = function() {
        renderProfile();
        waitForFirebase();
        
        window.loginGoogle = loginGoogle;
        window.logoutGoogle = logoutGoogle;
        window.resetData = resetData;
        window.retrySync = () => saveCloud();
        window.removeFav = removeFav;
        
        window.addEventListener('state-updated', renderProfile);
        
        window.addEventListener('level-up', (e) => {
            const modal = document.getElementById('level-up-modal');
            const lvlDisplay = document.getElementById('new-level-display');
            if (modal && lvlDisplay) {
                lvlDisplay.innerText = e.detail.level;
                modal.classList.remove('hidden');
                window.confetti();
            }
        });

        window.addEventListener('state-updated', () => {
            save();
        });
    }

    function waitForFirebase() {
        if (!window.Firebase || !window.Firebase.auth) {
            setTimeout(waitForFirebase, 500);
            return;
        }
        initAuth();
    }

    function initAuth() {
        updateSyncStatus('active');
        const auth = window.Firebase.auth;

        auth.onAuthStateChanged(async (u) => {
            if (u) {
                currentUser = u;
                if (!u.isAnonymous) {
                    const btnLogin = document.getElementById('google-login-btn');
                    const btnLogout = document.getElementById('logout-btn');
                    const badge = document.getElementById('career-badge');
                    const emailEl = document.getElementById('user-email');

                    if (btnLogin) btnLogin.classList.add('hidden');
                    if (btnLogout) btnLogout.classList.remove('hidden');
                    if (badge) badge.innerText = `Lvl ${window.store.state.level || 1} • ${u.displayName || 'Kullanıcı'}`;
                    if (emailEl) {
                        emailEl.innerText = u.email;
                        emailEl.style.opacity = 1;
                    }
                    
                    await loadFromCloud(true);
                } else {
                    const btnLogin = document.getElementById('google-login-btn');
                    const btnLogout = document.getElementById('logout-btn');
                    if (btnLogin) btnLogin.classList.remove('hidden');
                    if (btnLogout) btnLogout.classList.add('hidden');
                }
            } else {
                auth.signInAnonymously().catch(console.error);
            }
        });
    }

    async function loginGoogle() {
        try {
            const auth = window.Firebase.auth;
            const provider = window.Firebase.googleProvider;
            await auth.signInWithPopup(provider);
        } catch (error) {
            console.error(error);
            window.toast("Giriş Hatası: " + error.message);
        }
    }

    async function logoutGoogle() {
        try {
            await window.Firebase.auth.signOut();
            location.reload();
        } catch (e) {
            console.error(e);
        }
    }

    async function loadFromCloud(forceOverwrite = false) {
        if (!currentUser) return;
        try {
            const db = window.Firebase.db;
            // Compat API: db.collection(...).doc(...)
            const docRef = db.collection('artifacts').doc(appId).collection('users').doc(currentUser.uid).collection('data').doc('profile');
            const docSnap = await docRef.get();
            
            if (docSnap.exists) {
                const cloudData = docSnap.data();
                if (forceOverwrite || (cloudData.xp || 0) > window.store.state.xp) {
                    window.store.state = { ...window.store.state, ...cloudData };
                    window.store.save(); 
                    window.toast("Bulut verileri yüklendi ✅");
                } else if (window.store.state.xp > (cloudData.xp || 0)) {
                    saveCloud();
                }
            } else {
                saveCloud();
            }
            updateSyncStatus('done');
        } catch (e) {
            console.error("Sync error:", e);
            window.toast("Senkronizasyon Hatası: " + e.message);
            updateSyncStatus('error');
        }
    }

    function save() {
        clearTimeout(syncTimeout);
        updateSyncStatus('active');
        syncTimeout = setTimeout(saveCloud, 2000);
    }

    async function saveCloud() {
        if (!currentUser) return;
        try {
            const db = window.Firebase.db;
            const docRef = db.collection('artifacts').doc(appId).collection('users').doc(currentUser.uid).collection('data').doc('profile');
            await docRef.set(window.store.state);

            // Sync to Leaderboard ONLY if not anonymous (Google Login)
            if (!currentUser.isAnonymous && window.store.state.xp > 0) {
                const lbRef = db.collection('artifacts').doc(appId).collection('leaderboard').doc(currentUser.uid);
                // Ensure we have the namespace before calling
                const timestamp = window.Firebase.firestore ? window.Firebase.firestore.FieldValue.serverTimestamp() : new Date();
                
                await lbRef.set({
                    xp: Number(window.store.state.xp),
                    name: currentUser.displayName || 'Anonim',
                    photo: currentUser.photoURL || null,
                    updatedAt: timestamp,
                    league: getLeague(window.store.state.xp) // Save league info
                });
            }

            updateSyncStatus('done');
        } catch (e) {
            console.error("Save error:", e);
            window.toast("Kaydetme Hatası: " + e.message);
            updateSyncStatus('error');
        }
    }

    function updateSyncStatus(state) {
        const icon = document.getElementById('sync-status');
        if (!icon) return;
        icon.className = 'sync-status';
        if (state === 'active') icon.classList.add('sync-active');
        if (state === 'done') icon.classList.add('sync-done');
        if (state === 'error') icon.classList.add('sync-error');
    }

    function resetData() {
        if (confirm("Tüm verileri sıfırla?")) {
            localStorage.removeItem('engApp_v60');
            location.reload();
        }
    }

    function removeFav(w) {
        const newFavs = window.store.state.favs.filter(x => x !== w);
        window.store.update('favs', newFavs);
    }

    function getLeague(xp) {
        if (xp >= 10000) return '💎 Elmas';
        if (xp >= 5000) return '🥇 Altın';
        if (xp >= 1000) return '🥈 Gümüş';
        return '🥉 Bronz';
    }

    function renderProfile() {
        const streakEl = document.getElementById('streak-display');
        const coinEl = document.getElementById('coin-display');
        const levelEl = document.getElementById('level-display');
        const xpBar = document.getElementById('xp-bar');
        
        if (streakEl) streakEl.innerText = window.store.state.streak;
        if (coinEl) coinEl.innerText = window.store.state.coins;
        if (levelEl) levelEl.innerText = window.store.state.level || 1;
        if (xpBar) xpBar.style.width = (window.store.state.xp % 100) + "%";

        const totalWords = window.words.length;
        const learnedWords = window.store.state.learned.length;
        
        const learnProgText = document.getElementById('learn-progress-text');
        if (learnProgText) learnProgText.innerText = `${learnedWords} / ${totalWords}`;
        
        const statWords = document.getElementById('stat-words');
        if (statWords) statWords.innerText = learnedWords;
        
        const statXp = document.getElementById('stat-xp');
        if (statXp) statXp.innerText = window.store.state.xp;

        const circle = document.getElementById('mastery-ring');
        const masteryPct = document.getElementById('mastery-pct');
        if (circle && masteryPct) {
            const radius = circle.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            const percent = Math.min(100, (learnedWords / totalWords) * 100);
            const offset = circumference - (percent / 100) * circumference;
            circle.style.strokeDashoffset = offset;
            masteryPct.innerText = `${Math.floor(percent)}%`;
        }

        if (currentUser && !currentUser.isAnonymous) {
            const league = getLeague(window.store.state.xp);
            const badge = document.getElementById('career-badge');
            if (badge) badge.innerText = `Lvl ${window.store.state.level || 1} • ${league} Lig`;
        } else {
             const lvl = Math.floor(window.store.state.xp / 100) + 1;
             let title = "Stajyer";
             if (lvl > 2) title = "Çırak";
             if (lvl > 10) title = "Uzman";
             if (lvl > 30) title = "Üstat";
             const badge = document.getElementById('career-badge');
             if (badge) badge.innerText = `Lvl ${lvl} • ${title}`;
        }

        renderChart();
        renderFavs();
    }

    function renderChart() {
        const container = document.getElementById('weekly-chart');
        if (!container) return;
        
        container.innerHTML = '';
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push({
                key: window.store.getLocalKey(d),
                label: d.toLocaleDateString('tr-TR', { weekday: 'short' })
            });
        }
        
        let maxVal = 10;
        days.forEach(d => {
            const val = window.store.state.history[d.key] || 0;
            if (val > maxVal) maxVal = val;
        });
        
        days.forEach(d => {
            const val = window.store.state.history[d.key] || 0;
            const heightPct = (val / maxVal) * 80;
            const isToday = d.key === window.store.getLocalKey(new Date());
            const barColor = isToday ? 'var(--neon-green)' : 'var(--neon-blue)';
            container.innerHTML += `<div class="chart-bar-wrapper"><div class="chart-bar" style="height:${Math.max(5, heightPct)}%; background:${barColor}"></div><div class="chart-label" style="${isToday ? 'color:white; font-weight:bold' : ''}">${d.label}</div></div>`;
        });
    }

    window.openFavs = function() {
        document.getElementById('favs-modal').classList.remove('hidden');
        renderFavs();
    }

    window.openDictionary = function() {
        document.getElementById('dict-modal').classList.remove('hidden');
        renderDictionary();
    }

    window.filterDictionary = function() {
        const q = document.getElementById('dict-search').value.toLowerCase();
        renderDictionary(q);
    }

    function renderFavs() {
        const list = document.getElementById('favorites-list-modal');
        if (!list) return;
        
        list.innerHTML = '';
        if (window.store.state.favs.length === 0) {
            list.innerHTML = '<div style="color:var(--text-muted); font-size:0.9rem; text-align:center; margin-top:50px;">Henüz favori kelimen yok.</div>';
            return;
        }
        
        window.store.state.favs.forEach(wEn => {
            const wObj = window.words.find(x => x.en === wEn);
            if (!wObj) return;
            const div = document.createElement('div');
            div.className = 'glass-panel';
            div.style.padding = '15px';
            div.style.marginBottom = '10px';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            div.innerHTML = `
                <div>
                    <div style="font-weight:700; font-size:1.1rem;">${wObj.en}</div>
                    <div style="font-size:0.9rem; color:var(--text-muted);">${wObj.tr}</div>
                </div>
                <div style="display:flex; gap:10px;">
                    <button class="btn" onclick="window.playTTS('${wObj.en}')" style="background:rgba(255,255,255,0.1); width:36px; height:36px; border-radius:50%;">🔊</button>
                    <button class="btn" onclick="window.removeFav('${wEn}')" style="background:rgba(239,68,68,0.1); color:var(--neon-red); width:36px; height:36px; border-radius:50%;">✕</button>
                </div>`;
            list.appendChild(div);
        });
    }

    function renderDictionary(query = '') {
        const list = document.getElementById('dict-list');
        if (!list) return;
        
        list.innerHTML = '';
        let count = 0;
        
        // Show only first 50 if no query to prevent lag
        const limit = query ? 100 : 50;
        
        for (const w of window.words) {
            if (count >= limit) break;
            if (query && !w.en.toLowerCase().includes(query) && !w.tr.toLowerCase().includes(query)) continue;
            
            const isLearned = window.store.state.learned.includes(w.en);
            const isFav = window.store.state.favs.includes(w.en);
            
            const div = document.createElement('div');
            div.style.padding = '15px';
            div.style.borderBottom = '1px solid var(--glass-border)';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            
            div.innerHTML = `
                <div>
                    <div style="font-weight:700; color:${isLearned ? 'var(--neon-green)' : 'white'}">${w.en}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">${w.tr}</div>
                </div>
                <div style="font-size:1.2rem;">${isFav ? '❤️' : ''}</div>
            `;
            list.appendChild(div);
            count++;
        }
        
        if (count === 0) {
            list.innerHTML = '<div style="text-align:center; color:var(--text-muted); padding:20px;">Sonuç bulunamadı.</div>';
        }
    }
})();

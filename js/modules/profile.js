(function () {
    const appId = 'engApp_v60';
    let currentUser = null;
    let syncTimeout = null;

    // Initialize Profile Module
    window.initProfile = function () {
        console.log("Profile Module Initialized");
        renderProfile();
        waitForFirebase();
        setTimeout(() => saveCloud(), 3000); // Force sync to update leaderboard with new level logic

        window.addEventListener('state-updated', (e) => {
            renderProfile();
        });

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

                    window.store.state.userId = u.uid;
                    window.store.state.username = u.displayName || 'Kullanıcı';
                    window.store.save();

                    await loadFromCloud(true);
                } else {
                    const btnLogin = document.getElementById('google-login-btn');
                    const btnLogout = document.getElementById('logout-btn');
                    if (btnLogin) btnLogin.classList.remove('hidden');
                    if (btnLogout) btnLogout.classList.add('hidden');
                }
            } else {
                console.log("No user, attempting anonymous login...");
                auth.signInAnonymously().catch(err => {
                    console.error("Anonymous Login Error:", err);
                });
            }
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                saveCloud();
            }
        });

        if (window.Capacitor) {
            const App = window.Capacitor.App || (window.Capacitor.Plugins && window.Capacitor.Plugins.App);
            if (App) {
                App.addListener('appStateChange', ({ isActive }) => {
                    if (!isActive) {
                        saveCloud();
                    }
                });
            }
        }

        window.addEventListener('beforeunload', () => {
            if (currentUser && !currentUser.isAnonymous) {
                saveCloud();
            }
        });
    }

    window.loginGoogle = async function () {
        try {
            const isNative = window.Capacitor && window.Capacitor.isNativePlatform();

            if (isNative) {
                try {
                    console.log("Starting Native Login...");
                    const result = await window.Capacitor.Plugins.FirebaseAuthentication.signInWithGoogle();

                    if (!result) throw new Error("No result received from native login");

                    let idToken = null;
                    if (result.credential && result.credential.idToken) {
                        idToken = result.credential.idToken;
                    } else if (result.idToken) {
                        idToken = result.idToken;
                    } else {
                        throw new Error("No identity token found in native login result");
                    }

                    if (!window.Firebase.GoogleAuthProvider) {
                        if (window.firebase && window.firebase.auth && window.firebase.auth.GoogleAuthProvider) {
                            window.Firebase.GoogleAuthProvider = window.firebase.auth.GoogleAuthProvider;
                        } else {
                            throw new Error("Firebase GoogleAuthProvider class is missing");
                        }
                    }

                    const credential = window.Firebase.GoogleAuthProvider.credential(idToken);
                    await window.Firebase.auth.signInWithCredential(credential);
                    window.toast("Giriş Başarılı (Native)");
                    return;
                } catch (nativeError) {
                    console.error("Native Login Error Full:", nativeError);
                    window.toast("Native Giriş Hatası: " + (nativeError.message || nativeError));
                    return;
                }
            }

            const auth = window.Firebase.auth;
            const provider = window.Firebase.googleProvider;

            try {
                await auth.signInWithPopup(provider);
            } catch (popupError) {
                console.warn("Popup login failed:", popupError);
                if (popupError.code === 'auth/popup-closed-by-user' || popupError.code === 'auth/cancelled-popup-request') {
                    window.toast("Giriş iptal edildi.");
                } else if (popupError.code === 'auth/popup-blocked') {
                    window.toast("Pop-up engellendi. Lütfen izin verin.");
                } else {
                    window.toast("Giriş yapılamadı. Hata: " + popupError.message);
                }
            }
        } catch (error) {
            console.error("Login Error:", error);
            window.toast("Giriş Hatası: " + error.message);
        }
    }

    window.logoutGoogle = async function () {
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

                if (window.renderProfile) window.renderProfile();
                if (window.checkDailyLogin) window.checkDailyLogin();

            } else {
                console.log("No cloud data found.");
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
        syncTimeout = setTimeout(saveCloud, 5000);
    }

    async function saveCloud() {
        if (!currentUser) return;
        try {
            const db = window.Firebase.db;
            const docRef = db.collection('artifacts').doc(appId).collection('users').doc(currentUser.uid).collection('data').doc('profile');
            await docRef.set(window.store.state);

            if (!currentUser.isAnonymous && window.store.state.xp > 0) {
                const lbRef = db.collection('artifacts').doc(appId).collection('leaderboard').doc(currentUser.uid);
                const timestamp = window.Firebase.firestore ? window.Firebase.firestore.FieldValue.serverTimestamp() : new Date();

                await lbRef.set({
                    xp: Number(window.store.state.xp),
                    name: currentUser.displayName || 'Anonim',
                    photo: currentUser.photoURL || null,
                    updatedAt: timestamp,
                    lastActive: timestamp,
                    league: getLeague(window.store.state.xp),
                    frame: window.store.state.profileStyle?.frame || null
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

    window.resetData = function () {
        if (confirm("Tüm verileri sıfırla?")) {
            localStorage.removeItem('engApp_v60');
            location.reload();
        }
    }

    window.removeFav = function (w) {
        const newFavs = window.store.state.favs.filter(x => x !== w);
        window.store.update('favs', newFavs);
    }

    window.openFavs = function () {
        const favs = window.store.state.favs || [];
        const modal = document.createElement('div');
        modal.className = 'modal-overlay fade-in';
        modal.style.zIndex = '1000';

        let listHtml = '';
        if (favs.length === 0) {
            listHtml = '<div style="color:var(--text-muted); padding:40px; text-align:center;">Henüz favori kelimen yok. <br><br> Kelime kartlarındaki ❤️ ikonuna basarak ekleyebilirsin.</div>';
        } else {
            favs.forEach(wordEn => {
                const w = window.words.find(x => x.en === wordEn);
                if (w) {
                    listHtml += `
                        <div class="glass-panel" style="margin-bottom:10px; padding:15px; display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <div style="font-weight:800; font-size:1.1rem; color:white;">${w.en}</div>
                                <div style="font-size:0.9rem; color:var(--text-muted); margin-top:2px;">${w.tr}</div>
                            </div>
                            <button class="btn-icon" onclick="window.removeFav('${w.en}'); this.parentElement.remove();" style="color:#ef4444; background:rgba(255,255,255,0.1); width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:none;">✕</button>
                        </div>
                    `;
                }
            });
        }

        modal.innerHTML = `
            <div class="modal-content" style="max-height:80vh; display:flex; flex-direction:column; padding:0; overflow:hidden;">
                <div style="padding:20px; border-bottom:1px solid var(--glass-border); display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.02);">
                    <h2 style="margin:0; font-size:1.4rem;">Favoriler ❤️</h2>
                    <button class="btn" onclick="this.closest('.modal-overlay').remove()" style="background:transparent; font-size:1.2rem; padding:5px;">✕</button>
                </div>
                <div style="overflow-y:auto; flex:1; padding:20px;">
                    ${listHtml}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    window.openDictionary = function () {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay fade-in';
        modal.style.zIndex = '1000';

        const sorted = [...window.words].sort((a, b) => a.en.localeCompare(b.en));

        let listHtml = '';
        sorted.forEach(w => {
            listHtml += `
                <div style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between;">
                    <span style="color:white; font-weight:600;">${w.en}</span>
                    <span style="color:var(--text-muted);">${w.tr}</span>
                </div>
            `;
        });

        modal.innerHTML = `
            <div class="modal-content" style="max-height:80vh; display:flex; flex-direction:column; padding:0; overflow:hidden;">
                <div style="padding:20px; border-bottom:1px solid var(--glass-border); display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.02);">
                    <h2 style="margin:0; font-size:1.4rem;">Sözlük 📚</h2>
                    <button class="btn" onclick="this.closest('.modal-overlay').remove()" style="background:transparent; font-size:1.2rem; padding:5px;">✕</button>
                </div>
                <div style="padding:15px; background:rgba(0,0,0,0.2);">
                    <input type="text" placeholder="Kelime ara..." class="w-full" style="padding:12px; border-radius:12px; background:rgba(255,255,255,0.1); border:1px solid var(--glass-border); color:white; outline:none;" onkeyup="
                        const val = this.value.toLowerCase();
                        const items = this.parentElement.nextElementSibling.children;
                        for(let item of items) {
                            item.style.display = item.innerText.toLowerCase().includes(val) ? 'flex' : 'none';
                        }
                    ">
                </div>
                <div style="overflow-y:auto; flex:1; padding:0 20px 20px 20px;">
                    ${listHtml}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    function getLeague(xp) {
        if (xp >= 7500) return '💎 Elmas';
        if (xp >= 3500) return '🥇 Altın';
        if (xp >= 800) return '🥈 Gümüş';
        return '🥉 Bronz';
    }

    window.renderProfile = function () {
        const streakEl = document.getElementById('streak-display');
        const coinEl = document.getElementById('coin-display');
        const levelEl = document.getElementById('level-display');
        const xpBar = document.getElementById('xp-bar');

        if (streakEl) streakEl.innerText = window.store.state.streak;
        if (coinEl) coinEl.innerText = window.store.state.coins;
        const progress = window.store.getLevelProgress(window.store.state.xp);
        if (levelEl) levelEl.innerText = progress.level;
        if (xpBar) xpBar.style.width = progress.percent + "%";

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
            const lvl = window.store.getLevel(window.store.state.xp);
            let title = "Stajyer";
            if (lvl > 2) title = "Çırak";
            if (lvl > 10) title = "Uzman";
            if (lvl > 30) title = "Üstat";
            const badge = document.getElementById('career-badge');
            if (badge) badge.innerText = `Lvl ${lvl} • ${title}`;
        }

        // Apply Profile Styles
        const style = window.store.state.profileStyle || { frame: null, theme: 'default' };

        // Apply Theme
        const root = document.documentElement;
        const appBg = document.querySelector('.aurora-bg');

        if (style.theme === 'theme_ocean') {
            root.style.setProperty('--bg-dark', '#0f172a');
            root.style.setProperty('--glass-surface', 'rgba(30, 58, 138, 0.6)');
            root.style.setProperty('--neon-blue', '#38bdf8');
            root.style.setProperty('--neon-purple', '#818cf8');
            root.style.setProperty('--card-bg-front', 'linear-gradient(145deg, #1e40af, #0f172a)');
            root.style.setProperty('--card-bg-back', 'linear-gradient(145deg, #2563eb, #1e3a8a)');
            if (appBg) appBg.style.background = 'radial-gradient(circle at 50% 0%, #0369a1, #0f172a)';
        }
        else if (style.theme === 'theme_sunset') {
            root.style.setProperty('--bg-dark', '#2a0a18');
            root.style.setProperty('--glass-surface', 'rgba(88, 28, 135, 0.6)');
            root.style.setProperty('--neon-blue', '#fb7185');
            root.style.setProperty('--neon-purple', '#c084fc');
            root.style.setProperty('--card-bg-front', 'linear-gradient(145deg, #9d174d, #4a044e)');
            root.style.setProperty('--card-bg-back', 'linear-gradient(145deg, #db2777, #831843)');
            if (appBg) appBg.style.background = 'radial-gradient(circle at 50% 0%, #be123c, #2a0a18)';
        }
        else if (style.theme === 'theme_forest') {
            root.style.setProperty('--bg-dark', '#022c22');
            root.style.setProperty('--glass-surface', 'rgba(6, 78, 59, 0.6)');
            root.style.setProperty('--neon-blue', '#34d399');
            root.style.setProperty('--neon-purple', '#a7f3d0');
            root.style.setProperty('--card-bg-front', 'linear-gradient(145deg, #065f46, #022c22)');
            root.style.setProperty('--card-bg-back', 'linear-gradient(145deg, #10b981, #064e3b)');
            if (appBg) appBg.style.background = 'radial-gradient(circle at 50% 0%, #047857, #022c22)';
        }
        else if (style.theme === 'theme_space') {
            root.style.setProperty('--bg-dark', '#000000');
            root.style.setProperty('--glass-surface', 'rgba(30, 27, 75, 0.6)');
            root.style.setProperty('--neon-blue', '#818cf8');
            root.style.setProperty('--neon-purple', '#c084fc');
            root.style.setProperty('--card-bg-front', 'linear-gradient(145deg, #312e81, #1e1b4b)');
            root.style.setProperty('--card-bg-back', 'linear-gradient(145deg, #4338ca, #312e81)');
            if (appBg) appBg.style.background = 'radial-gradient(circle at 50% 0%, #4c1d95, #000000)';
        }
        else if (style.theme === 'theme_midnight') {
            root.style.setProperty('--bg-dark', '#0f172a');
            root.style.setProperty('--glass-surface', 'rgba(15, 23, 42, 0.8)');
            root.style.setProperty('--neon-blue', '#38bdf8');
            root.style.setProperty('--neon-purple', '#94a3b8');
            root.style.setProperty('--card-bg-front', 'linear-gradient(145deg, #1e293b, #0f172a)');
            root.style.setProperty('--card-bg-back', 'linear-gradient(145deg, #334155, #1e293b)');
            if (appBg) appBg.style.background = 'linear-gradient(to bottom, #0f172a, #000000)';
        }
        else if (style.theme === 'theme_royal') {
            root.style.setProperty('--bg-dark', '#2e1065');
            root.style.setProperty('--glass-surface', 'rgba(76, 29, 149, 0.6)');
            root.style.setProperty('--neon-blue', '#a78bfa');
            root.style.setProperty('--neon-purple', '#ddd6fe');
            root.style.setProperty('--card-bg-front', 'linear-gradient(145deg, #5b21b6, #2e1065)');
            root.style.setProperty('--card-bg-back', 'linear-gradient(145deg, #7c3aed, #5b21b6)');
            if (appBg) appBg.style.background = 'radial-gradient(circle at 50% 0%, #6d28d9, #2e1065)';
        }
        else {
            root.style.setProperty('--bg-dark', '#000000');
            root.style.setProperty('--glass-surface', 'rgba(255, 255, 255, 0.08)');
            root.style.setProperty('--neon-blue', '#0A84FF');
            root.style.setProperty('--neon-purple', '#BF5AF2');
            root.style.setProperty('--card-bg-front', 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.03) 100%)');
            root.style.setProperty('--card-bg-back', 'linear-gradient(135deg, #5e5ce6 0%, #4744ca 100%)');
            if (appBg) appBg.style.background = 'radial-gradient(circle at 50% 0%, #2c2c2e 0%, #000 100%)';
        }

        // Apply Frame
        const levelBadge = document.querySelector('.level-badge');
        const profileRing = document.querySelector('.progress-ring-container');

        if (levelBadge) {
            levelBadge.style.border = '1px solid var(--glass-border)';
            levelBadge.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            levelBadge.style.background = 'rgba(255, 255, 255, 0.1)';
        }
        if (profileRing) {
            profileRing.style.border = 'none';
            profileRing.style.borderRadius = '50%';
            profileRing.style.boxShadow = 'none';
        }

        if (style.frame) {
            let border = '', shadow = '', bg = '';

            if (style.frame === 'frame_gold') {
                border = '2px solid gold';
                shadow = '0 0 15px gold, inset 0 0 5px gold';
            } else if (style.frame === 'frame_neon') {
                border = '2px solid var(--neon-blue)';
                shadow = '0 0 15px var(--neon-blue), inset 0 0 5px var(--neon-blue)';
            } else if (style.frame === 'frame_fire') {
                border = '2px solid #f97316';
                shadow = '0 0 15px #f97316, inset 0 0 5px #f97316';
            } else if (style.frame === 'frame_rainbow') {
                border = '3px solid transparent';
                shadow = '0 0 15px rgba(255,255,255,0.5)';
                // Note: Gradient borders are tricky, using simple fallback for badge
                levelBadge.style.backgroundImage = 'linear-gradient(#000, #000), linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)';
                levelBadge.style.backgroundOrigin = 'border-box';
                levelBadge.style.backgroundClip = 'content-box, border-box';
            } else if (style.frame === 'frame_diamond') {
                border = '2px solid #b9f2ff';
                shadow = '0 0 15px #b9f2ff, inset 0 0 5px #b9f2ff';
            } else if (style.frame === 'frame_cyber') {
                border = '2px dashed #00ff00';
                shadow = '0 0 10px #00ff00';
            } else if (style.frame === 'frame_galaxy') {
                border = '2px solid #9d00ff';
                shadow = '0 0 20px #9d00ff';
            }

            if (levelBadge && border) {
                levelBadge.style.border = border;
                levelBadge.style.boxShadow = shadow;
            }
            if (profileRing && border) {
                profileRing.style.border = border.replace('2px', '4px').replace('3px', '4px');
                profileRing.style.boxShadow = shadow.replace('15px', '25px');
            }
        }

        // Render Weekly Chart
        const chartContainer = document.getElementById('weekly-chart');
        if (chartContainer) {
            chartContainer.innerHTML = '';
            const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
            const activity = window.store.state.weeklyActivity || [0, 0, 0, 0, 0, 0, 0];
            const max = Math.max(...activity, 10);

            activity.forEach((val, idx) => {
                const barWrapper = document.createElement('div');
                barWrapper.className = 'chart-bar-wrapper';

                const bar = document.createElement('div');
                bar.className = 'chart-bar';
                const height = (val / max) * 100;
                bar.style.height = `${height}%`;

                const todayIdx = (new Date().getDay() + 6) % 7;
                if (idx === todayIdx) {
                    bar.style.background = 'var(--neon-blue)';
                    bar.style.boxShadow = '0 0 10px var(--neon-blue)';
                }

                const label = document.createElement('div');
                label.className = 'chart-label';
                label.innerText = days[idx];

                barWrapper.appendChild(bar);
                barWrapper.appendChild(label);
                chartContainer.appendChild(barWrapper);
            });
        }
    }

})();

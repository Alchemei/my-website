import { store } from '../store.js';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously, doc, setDoc, getDoc, db } from '../firebase-config.js';
import { toast } from '../utils.js';
import { words } from './learn.js';

// Global App ID for sync
const APP_ID_KEY = 'english-master-global';
const appId = window.__app_id || APP_ID_KEY;

let currentUser = null;
let syncTimeout = null;

export function initProfile() {
    initAuth();
    renderProfile();
    
    window.loginGoogle = loginGoogle;
    window.logoutGoogle = logoutGoogle;
    window.resetData = resetData;
    window.retrySync = () => saveCloud();
    window.removeFav = removeFav;
    
    // Listen for state updates to re-render profile
    window.addEventListener('state-updated', renderProfile);
    // Listen for custom state-updated event from store.save()
    // But store.save() calls window.dispatchEvent(new CustomEvent('state-updated'));
    // We also need to trigger cloud save on significant changes
    window.addEventListener('state-updated', () => {
        save();
    });
}

async function initAuth() {
    updateSyncStatus('active');
    
    onAuthStateChanged(auth, async (u) => {
        if (u) {
            currentUser = u;
            if (!u.isAnonymous) {
                document.getElementById('google-login-btn').classList.add('hidden');
                document.getElementById('logout-btn').classList.remove('hidden');
                document.getElementById('career-badge').innerText = `Lvl ${Math.floor(store.state.xp / 100) + 1} • ${u.displayName || 'Kullanıcı'}`;
                const emailEl = document.getElementById('user-email');
                if (emailEl) {
                    emailEl.innerText = u.email;
                    emailEl.style.opacity = 1;
                }
                
                await loadFromCloud(true);
            } else {
                document.getElementById('google-login-btn').classList.remove('hidden');
                document.getElementById('logout-btn').classList.add('hidden');
            }
        } else {
            await signInAnonymously(auth);
        }
    });
}

async function loginGoogle() {
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        console.error(error);
        toast("Giriş Hatası: " + error.message);
    }
}

async function logoutGoogle() {
    try {
        await signOut(auth);
        location.reload();
    } catch (e) {
        console.error(e);
    }
}

async function loadFromCloud(forceOverwrite = false) {
    if (!currentUser) return;
    try {
        const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'data', 'profile');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const cloudData = docSnap.data();
            if (forceOverwrite || cloudData.xp > store.state.xp) {
                store.state = { ...store.state, ...cloudData };
                store.save(); // This triggers render via event listener
                toast("Bulut verileri yüklendi ✅");
            } else if (store.state.xp > cloudData.xp) {
                saveCloud();
            }
        } else {
            saveCloud();
        }
        updateSyncStatus('done');
    } catch (e) {
        console.error("Sync error:", e);
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
        await setDoc(doc(db, 'artifacts', appId, 'users', currentUser.uid, 'data', 'profile'), store.state);
        updateSyncStatus('done');
    } catch (e) {
        console.error(e);
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
    const newFavs = store.state.favs.filter(x => x !== w);
    store.update('favs', newFavs);
}

function renderProfile() {
    // Header Stats
    const streakEl = document.getElementById('streak-display');
    const coinEl = document.getElementById('coin-display');
    const xpBar = document.getElementById('xp-bar');
    
    if (streakEl) streakEl.innerText = store.state.streak;
    if (coinEl) coinEl.innerText = store.state.coins;
    if (xpBar) xpBar.style.width = (store.state.xp % 100) + "%";

    // Profile Tab Stats
    const totalWords = words.length;
    const learnedWords = store.state.learned.length;
    
    const learnProgText = document.getElementById('learn-progress-text');
    if (learnProgText) learnProgText.innerText = `${learnedWords} / ${totalWords}`;
    
    const statWords = document.getElementById('stat-words');
    if (statWords) statWords.innerText = learnedWords;
    
    const statXp = document.getElementById('stat-xp');
    if (statXp) statXp.innerText = store.state.xp;

    // Mastery Ring
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

    // Career Badge (if anonymous)
    if (currentUser && currentUser.isAnonymous) {
        const lvl = Math.floor(store.state.xp / 100) + 1;
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
            key: store.getLocalKey(d),
            label: d.toLocaleDateString('tr-TR', { weekday: 'short' })
        });
    }
    
    let maxVal = 10;
    days.forEach(d => {
        const val = store.state.history[d.key] || 0;
        if (val > maxVal) maxVal = val;
    });
    
    days.forEach(d => {
        const val = store.state.history[d.key] || 0;
        const heightPct = (val / maxVal) * 80;
        const isToday = d.key === store.getLocalKey(new Date());
        const barColor = isToday ? 'var(--neon-green)' : 'var(--neon-blue)';
        container.innerHTML += `<div class="chart-bar-wrapper"><div class="chart-bar" style="height:${Math.max(5, heightPct)}%; background:${barColor}"></div><div class="chart-label" style="${isToday ? 'color:white; font-weight:bold' : ''}">${d.label}</div></div>`;
    });
}

function renderFavs() {
    const list = document.getElementById('favorites-list');
    if (!list) return;
    
    list.innerHTML = '';
    if (store.state.favs.length === 0) {
        list.innerHTML = '<div style="color:var(--text-muted); font-size:0.9rem; text-align:center;">Liste boş.</div>';
        return;
    }
    
    store.state.favs.forEach(wEn => {
        const wObj = words.find(x => x.en === wEn);
        if (!wObj) return;
        const div = document.createElement('div');
        div.className = 'glass-panel';
        div.style.padding = '15px';
        div.style.marginBottom = '10px';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.innerHTML = `<div><div style="font-weight:700;">${wObj.en}</div><div style="font-size:0.85rem; color:var(--text-muted);">${wObj.tr}</div></div><button class="btn" onclick="window.removeFav('${wEn}')" style="background:transparent; color:var(--neon-red);">✕</button>`;
        list.appendChild(div);
    });
}

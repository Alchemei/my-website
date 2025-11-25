import { store } from '../store.js';
import { toast, confetti } from '../utils.js';

const taskTemplates = [
    { id: 'learn', text: '5 Yeni Kelime', target: 5, reward: 50, type: 'learn' },
    { id: 'xp', text: '100 XP Kazan', target: 100, reward: 30, type: 'xp' },
    { id: 'quiz', text: 'Quiz Tamamla', target: 1, reward: 40, type: 'quiz' }
];

export function initQuests() {
    checkDailyTasks();
    renderTasks();
    
    window.claimReward = claimReward;
    
    // Listen for task updates
    window.addEventListener('task-update', (e) => {
        updateTask(e.detail.type, e.detail.amount);
    });
}

function checkDailyTasks() {
    const today = new Date().toDateString();
    if (store.state.lastLogin !== today) {
        const yesterday = new Date(); 
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (store.state.lastLogin !== yesterday.toDateString()) {
            if (store.state.activeItems.freeze) {
                store.update('activeItems', { ...store.state.activeItems, freeze: false });
                toast("❄️ Seri Korundu!");
            } else {
                store.update('streak', 1);
            }
        } else {
            store.update('streak', store.state.streak + 1);
        }
        store.update('lastLogin', today);
        generateNewTasks();
    } else if (store.state.tasks.length === 0) {
        generateNewTasks();
    }
}

function generateNewTasks() {
    const newTasks = [...taskTemplates]
        .sort(() => 0.5 - Math.random())
        .map(t => ({ ...t, progress: 0, claimed: false }));
    store.update('tasks', newTasks);
}

function updateTask(type, amt) {
    let updated = false;
    const newTasks = store.state.tasks.map(t => {
        if (t.type === type && !t.claimed && t.progress < t.target) {
            let newProgress = t.progress + amt;
            if (newProgress >= t.target) {
                newProgress = t.target;
                toast(`Görev: ${t.text}`);
            }
            updated = true;
            return { ...t, progress: newProgress };
        }
        return t;
    });
    
    if (updated) {
        store.update('tasks', newTasks);
        renderTasks();
    }
}

function claimReward(idx) {
    const t = store.state.tasks[idx];
    if (t.progress >= t.target && !t.claimed) {
        const newTasks = [...store.state.tasks];
        newTasks[idx].claimed = true;
        store.update('tasks', newTasks);
        
        store.update('coins', store.state.coins + t.reward);
        store.update('xp', store.state.xp + 10);
        store.updateHistory(10);
        
        confetti();
        toast(`+${t.reward} Altın!`);
        renderTasks();
    }
}

export function renderTasks() {
    const c = document.getElementById('quests-container');
    if (!c) return;
    
    c.innerHTML = '';
    store.state.tasks.forEach((t, i) => {
        const isDone = t.progress >= t.target;
        const pct = (t.progress / t.target) * 100;
        
        let action = isDone && !t.claimed 
            ? `<button class="btn" style="background:var(--neon-green); color:#064e3b; padding:6px 12px; border-radius:8px; font-size:0.8rem; font-weight:700;" onclick="window.claimReward(${i})">Al</button>` 
            : (t.claimed ? `<span style="color:var(--neon-green); font-size:0.8rem; font-weight:700;">Tamamlandı</span>` : `<span style="font-size:0.8rem; color:var(--text-muted);">${t.progress}/${t.target}</span>`);
            
        c.innerHTML += `
            <div class="glass-panel quest-card ${isDone ? 'completed' : ''}">
                <div class="quest-row">
                    <span class="quest-title">${t.text}</span>
                    <span class="quest-reward">+${t.reward}</span>
                </div>
                <div style="display:flex; align-items:center; gap:15px;">
                    <div style="flex:1; height:8px; background:rgba(255,255,255,0.1); border-radius:10px; overflow:hidden;">
                        <div style="height:100%; background:var(--neon-green); width:${pct}%"></div>
                    </div>
                    ${action}
                </div>
            </div>`;
    });
}

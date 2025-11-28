// Daily Login & Notifications Module

// Global functions exposed to window
window.initDaily = async function () {
    const LocalNotifications = window.Capacitor ? window.Capacitor.Plugins.LocalNotifications : null;

    if (LocalNotifications) {
        await requestNotificationPermission(LocalNotifications);
        scheduleDailyReminder(LocalNotifications);
    }
};

window.checkDailyLogin = function () {
    const today = new Date().toDateString();
    const lastLogin = window.store.state.lastLogin;

    console.log("Checking Daily Login...", { today, lastLogin, streak: window.store.state.streak });

    // If first time or different day
    if (lastLogin !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastLogin === yesterday.toDateString()) {
            // Consecutive day
            window.store.update('streak', (window.store.state.streak || 0) + 1);
            showDailyReward(window.store.state.streak);
        } else {
            // Streak broken
            // Check for streak freeze
            if (window.store.state.activeItems && window.store.state.activeItems.freeze) {
                window.toast("Seri dondurucu sayesinde serin korundu! ❄️");
                window.store.update('activeItems', { ...window.store.state.activeItems, freeze: false });
                // Keep streak, but don't increment
            } else {
                if (window.store.state.streak > 1) {
                    window.toast("Serin bozuldu! 😢");
                }
                window.store.update('streak', 1);
                showDailyReward(1);
            }
        }

        window.store.update('lastLogin', today);
    }
};

window.openDailyStatus = function () {
    const streak = window.store.state.streak || 0;
    const today = new Date().toDateString();
    const lastLogin = window.store.state.lastLogin;
    const isClaimed = lastLogin === today;

    let reward = 50;
    if ((streak + 1) % 7 === 0) reward = 200;
    else reward += ((streak + 1) * 5);

    const modal = document.createElement('div');
    modal.className = 'modal-overlay fade-in';
    modal.style.zIndex = '1000';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:320px; text-align:center; padding:30px; border-radius:30px; background:rgba(20,20,20,0.9); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.1); animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            <button class="btn" onclick="this.closest('.modal-overlay').remove()" style="position:absolute; right:15px; top:15px; background:transparent; font-size:1.2rem; color:var(--text-muted);">✕</button>
            
            <div style="font-size:4rem; margin-bottom:10px; filter:drop-shadow(0 0 20px rgba(255,165,0,0.5));">🔥</div>
            <h2 style="margin:0 0 5px 0; color:white; font-size:1.8rem;">Günlük Seri</h2>
            <p style="color:var(--text-muted); margin:0 0 25px 0; font-size:0.9rem;">Her gün gir, ödülleri katla!</p>
            
            <div style="background:linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02)); padding:20px; border-radius:20px; margin-bottom:25px; border:1px solid rgba(255,255,255,0.1);">
                <div style="font-size:3rem; font-weight:800; color:white; line-height:1;">${streak}</div>
                <div style="color:var(--neon-blue); font-size:0.8rem; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-top:5px;">Gün</div>
            </div>

            <div style="margin-bottom:25px; display:flex; align-items:center; justify-content:center; gap:15px;">
                <div style="text-align:right;">
                    <div style="color:var(--text-muted); font-size:0.8rem;">${isClaimed ? 'Yarınki Ödül' : 'Bugünkü Ödül'}</div>
                    <div style="font-size:1.4rem; font-weight:800; color:#FFD700; text-shadow:0 0 10px rgba(255,215,0,0.3);">+${reward}</div>
                </div>
                <div style="font-size:2rem;">🪙</div>
            </div>

            <button class="btn w-full" onclick="this.closest('.modal-overlay').remove()" style="background:var(--glass-border); padding:15px; border-radius:15px;">
                ${isClaimed ? 'Yarın Görüşürüz 👋' : 'Giriş Yapılmadı'}
            </button>
        </div>
    `;
    document.body.appendChild(modal);
};

// Helper functions (internal to this file scope, but hoisted)
function showDailyReward(streakDay) {
    // Calculate reward based on streak
    let reward = 50;
    if (streakDay % 7 === 0) reward = 200; // Big reward every 7 days
    else reward += (streakDay * 5); // Increasing reward

    // Show Modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay fade-in';
    modal.style.zIndex = '1000';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:320px; text-align:center; padding:30px; border-radius:30px; background:rgba(20,20,20,0.9); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.1); animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            <div style="font-size:4rem; margin-bottom:15px; animation: bounce 2s infinite;">🎁</div>
            <h2 style="margin:0 0 10px 0; color:white; font-size:1.8rem;">Günlük Ödül!</h2>
            <p style="color:var(--text-muted); margin:0 0 25px 0;">${streakDay}. Gün Serisi</p>
            
            <div style="font-size:3.5rem; font-weight:800; color:#FFD700; margin-bottom:30px; text-shadow:0 0 20px rgba(255,215,0,0.5);">
                +${reward} 🪙
            </div>

            <button class="btn w-full" id="claim-daily-btn" style="background:var(--primary); padding:16px; border-radius:16px; font-size:1.1rem; box-shadow:0 10px 30px var(--primary-glow);">
                Ödülü Al
            </button>
        </div>
    `;
    document.body.appendChild(modal);

    // Confetti
    setTimeout(() => window.confetti(), 300);
    window.playSound('success');

    document.getElementById('claim-daily-btn').onclick = () => {
        window.store.update('coins', window.store.state.coins + reward);
        window.toast("Ödül alındı! 💰");
        modal.remove();
    };
}

async function requestNotificationPermission(LocalNotifications) {
    try {
        const result = await LocalNotifications.requestPermissions();
        if (result.display === 'granted') {
            console.log("Notification permission granted");
        }
    } catch (e) {
        console.error("Notification permission error:", e);
    }
}

async function scheduleDailyReminder(LocalNotifications) {
    try {
        // Cancel existing to avoid duplicates
        await LocalNotifications.cancel({ notifications: [{ id: 1 }] });

        // Schedule for 19:00 every day
        await LocalNotifications.schedule({
            notifications: [
                {
                    title: "İngilizce Zamanı! 🇬🇧",
                    body: "Serini bozma! Bugünün kelimelerini öğrenmek için hemen gel.",
                    id: 1,
                    schedule: {
                        on: { hour: 19, minute: 0 },
                        allowWhileIdle: true
                    },
                    sound: null,
                    attachments: null,
                    actionTypeId: "",
                    extra: null
                }
            ]
        });
        console.log("Daily notification scheduled for 19:00");
    } catch (e) {
        console.error("Schedule error:", e);
    }
}

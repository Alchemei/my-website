// Initialize App
function init() {
    window.store.init();

    window.initLearn();
    window.initQuests();
    window.initQuiz();
    window.initShop();
    window.initProfile();
    window.initLeaderboard();
    window.initAchievements();
    window.initMultiplayer();
    window.initAds();
    window.initDaily();

    // Initial Render
    // If no tasks yet, generate them now to prevent empty screen
    // This is handled in quests.js initQuests -> checkDailyTasks
}

function switchTab(id, btn) {
    // Stop any active quiz/timer immediately when switching tabs
    if (window.resetQuiz) window.resetQuiz();

    document.querySelectorAll('main > div').forEach(d => d.classList.add('hidden'));
    const tab = document.getElementById('tab-' + id);
    if (tab) tab.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    if (id === 'quiz') window.resetQuiz();
    if (id === 'profile' && window.renderProfile) window.renderProfile();
}

// Expose globally immediately
window.switchTab = switchTab;

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);

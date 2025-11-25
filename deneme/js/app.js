    // Initialize App
    function init() {
        window.store.init();
        
        window.initLearn();
        window.initQuests();
        window.initQuiz();
        window.initShop();
        window.initProfile();
        
        // Initial Render
        // If no tasks yet, generate them now to prevent empty screen
        // This is handled in quests.js initQuests -> checkDailyTasks
    }

    function switchTab(id, btn) {
        document.querySelectorAll('main > div').forEach(d => d.classList.add('hidden'));
        const tab = document.getElementById('tab-' + id);
        if (tab) tab.classList.remove('hidden');
        
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        
        if (id === 'quiz') window.resetQuiz();
        // Profile chart render is handled by event listener in profile.js
    }

    // Expose globally immediately
    window.switchTab = switchTab;

    // Start the app when DOM is ready
    document.addEventListener('DOMContentLoaded', init);

export const store = {
    state: {
        xp: 0,
        coins: 200,
        streak: 1,
        learned: [],
        favs: [],
        wordIndex: 0,
        lastLogin: new Date().toDateString(),
        tasks: [],
        activeItems: { freeze: false, doubleXP: 0 },
        history: {}
    },

    init() {
        const saved = localStorage.getItem('engApp_v60');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
                if (!this.state.history) this.state.history = {};
            } catch (e) {
                console.error('Error loading state:', e);
            }
        }
    },

    save() {
        localStorage.setItem('engApp_v60', JSON.stringify(this.state));
        // Trigger a custom event for UI updates if needed
        window.dispatchEvent(new CustomEvent('state-updated'));
    },

    update(key, value) {
        this.state[key] = value;
        this.save();
    },

    // Helper to get local date key for history
    getLocalKey(dateObj) {
        const offset = dateObj.getTimezoneOffset() * 60000;
        return new Date(dateObj.getTime() - offset).toISOString().split('T')[0];
    },

    updateHistory(amount) {
        const todayKey = this.getLocalKey(new Date());
        if (!this.state.history[todayKey]) this.state.history[todayKey] = 0;
        this.state.history[todayKey] += amount;
        this.save();
    }
};

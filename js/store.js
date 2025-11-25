window.store = {
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
        level: 1,
        history: {},
        inventory: { frames: [], themes: [] },
        profileStyle: { frame: null, theme: 'default', accent: 'blue' },
        totalQ: 0,
        correctQ: 0
    },

    init() {
        const saved = localStorage.getItem('engApp_v60');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
                if (!this.state.history) this.state.history = {};
                // Ensure level is set if migrating from old version
                if (!this.state.level) this.state.level = Math.floor(this.state.xp / 100) + 1;
            } catch (e) {
                console.error('Error loading state:', e);
            }
        }
    },

    save() {
        localStorage.setItem('engApp_v60', JSON.stringify(this.state));
        window.dispatchEvent(new CustomEvent('state-updated'));
    },

    update(key, value) {
        const oldXp = this.state.xp;
        this.state[key] = value;
        
        if (key === 'xp') {
            const newLevel = Math.floor(value / 100) + 1;
            if (newLevel > this.state.level) {
                this.state.level = newLevel;
                window.dispatchEvent(new CustomEvent('level-up', { detail: { level: newLevel } }));
            }
        }
        
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

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
        profileStyle: { frame: null, theme: 'default' },
        soundEnabled: true,
        userId: null,
        username: 'Player',
        weeklyActivity: [0, 0, 0, 0, 0, 0, 0]
    },

    init() {
        const saved = localStorage.getItem('engApp_v60');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
                if (!this.state.history) this.state.history = {};
                if (!this.state.weeklyActivity) this.state.weeklyActivity = [0, 0, 0, 0, 0, 0, 0];
                // Ensure level is set if migrating from old version
                if (!this.state.level) this.state.level = Math.floor(this.state.xp / 100) + 1;
            } catch (e) {
                console.error('Error loading state:', e);
            }
        }

        if (!this.state.userId) {
            this.state.userId = 'user_' + Math.random().toString(36).substr(2, 9);
            this.save();
        }
    },

    save() {
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            localStorage.setItem('engApp_v60', JSON.stringify(this.state));
        }, 1000); // Save only once per second max
    },

    forceSave() {
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        localStorage.setItem('engApp_v60', JSON.stringify(this.state));
    },

    update(key, value) {
        // Handle Weekly Activity Update
        if (key === 'xp') {
            const diff = value - (this.state.xp || 0);
            if (diff > 0) {
                const todayIdx = (new Date().getDay() + 6) % 7; // 0=Mon, 6=Sun
                const activity = [...(this.state.weeklyActivity || [0, 0, 0, 0, 0, 0, 0])];
                activity[todayIdx] = (activity[todayIdx] || 0) + diff;
                this.state.weeklyActivity = activity;
            }

            // Check Level Up
            const newLevel = Math.floor(value / 100) + 1;
            if (newLevel > (this.state.level || 1)) {
                this.state.level = newLevel;
                window.dispatchEvent(new CustomEvent('level-up', { detail: { level: newLevel } }));
            }
        }

        this.state[key] = value;
        this.save();

        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('state-updated', { detail: { key, value } }));
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

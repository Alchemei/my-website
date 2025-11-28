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
                if (!this.state.level) this.state.level = this.getLevel(this.state.xp);
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
        localStorage.setItem('engApp_v60', JSON.stringify(this.state));
        // Note: We don't dispatch state-updated here to avoid infinite loops if called from listeners
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
            const newLevel = this.getLevel(value);
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

    // Leveling System Helpers
    // New Formula (Easier): 
    // XP for next level = 100 + (CurrentLevel - 1) * 20
    // Total XP for Level L = 10 * (L - 1) * (L + 8)
    getLevel(xp) {
        if (xp < 0) return 1;
        // Inverse of 10 * (L^2 + 7L - 8) = XP
        // L^2 + 7L - (8 + XP/10) = 0
        // L = (-7 + sqrt(49 + 4 * (8 + XP/10))) / 2
        // L = (-7 + sqrt(81 + 0.4 * XP)) / 2
        return Math.floor((-7 + Math.sqrt(81 + 0.4 * xp)) / 2) || 1;
    },

    getXPForLevel(level) {
        if (level <= 1) return 0;
        return 10 * (level - 1) * (level + 8);
    },

    getLevelProgress(xp) {
        const currentLevel = this.getLevel(xp);
        const nextLevel = currentLevel + 1;
        const xpStart = this.getXPForLevel(currentLevel);
        const xpEnd = this.getXPForLevel(nextLevel);

        const xpInLevel = xp - xpStart;
        const xpRequired = xpEnd - xpStart;

        return {
            level: currentLevel,
            current: xpInLevel,
            required: xpRequired,
            percent: Math.min(100, Math.max(0, (xpInLevel / xpRequired) * 100))
        };
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

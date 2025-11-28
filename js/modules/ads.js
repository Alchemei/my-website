(function () {
    const AdMob = window.Capacitor ? window.Capacitor.Plugins.AdMob : null;

    // Test IDs
    const INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';
    const REWARD_ID = 'ca-app-pub-3940256099942544/5224354917';

    window.initAds = async function () {
        if (!AdMob) {
            console.warn("AdMob plugin not found.");
            return;
        }

        // Listeners MUST be registered before initialization/showing
        AdMob.addListener('onInterstitialDismissed', () => {
            prepareInterstitial(); // Reload for next time
        });

        AdMob.addListener('onRewardedVideoDismissed', () => {
            prepareReward(); // Reload for next time
        });

        AdMob.addListener('onRewardVideoReward', (rewardItem) => {
            console.log("Reward received:", rewardItem);
            window.store.update('coins', window.store.state.coins + 50);
            window.toast("Tebrikler! 50 Altın kazandın! 💰");
            window.confetti();
        });

        AdMob.addListener('onRewardedVideoCompleted', () => {
            console.log("Legacy reward completed event");
            window.store.update('coins', window.store.state.coins + 50);
            window.toast("Tebrikler! 50 Altın kazandın! 💰");
            window.confetti();
        });

        try {
            await AdMob.initialize({
                requestTrackingAuthorization: true,
                testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'],
                initializeForTesting: true,
            });
            console.log("AdMob initialized");

            // Preload ads
            prepareInterstitial();
            prepareReward();

        } catch (e) {
            console.error("AdMob init error:", e);
        }
    };

    async function prepareInterstitial() {
        if (!AdMob) return;
        try {
            console.log("Preparing Interstitial...");
            await AdMob.prepareInterstitial({
                adId: INTERSTITIAL_ID,
                isTesting: true
            });
            console.log("Interstitial Prepared");
        } catch (e) {
            console.error("Prepare Interstitial Failed:", e);
            // Retry after 10 seconds
            setTimeout(prepareInterstitial, 10000);
        }
    }

    async function prepareReward() {
        if (!AdMob) return;
        try {
            console.log("Preparing Reward Video...");
            await AdMob.prepareRewardVideoAd({
                adId: REWARD_ID,
                isTesting: true
            });
            console.log("Reward Video Prepared");
        } catch (e) {
            console.error("Prepare Reward Failed:", e);
            setTimeout(prepareReward, 10000);
        }
    }

    window.showInterstitial = async function () {
        if (!AdMob) return;
        try {
            console.log("Showing Interstitial...");
            await AdMob.showInterstitial();
        } catch (e) {
            console.error("Show Interstitial Failed:", e);
            // If failed, try to load again for next time
            prepareInterstitial();
        }
    };

    window.showRewardVideo = async function () {
        if (!AdMob) {
            window.toast("Reklam yüklenemedi (Plugin yok).");
            return;
        }
        try {
            const result = await AdMob.showRewardVideoAd();
            console.log("Show Result:", result);

            // Check if result contains reward info (some versions return it here)
            if (result && (result.type || result.amount)) {
                window.store.update('coins', window.store.state.coins + 50);
                window.toast("Tebrikler! 50 Altın kazandın! 💰");
                window.confetti();
            }
        } catch (e) {
            console.error("Show Reward Failed:", e);
            window.toast("Reklam şu an hazır değil, lütfen tekrar dene.");
            prepareReward();
        }
    };

})();

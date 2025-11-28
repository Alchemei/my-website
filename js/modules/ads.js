(function () {
    const AdMob = window.Capacitor ? window.Capacitor.Plugins.AdMob : null;

    // Test IDs
    const INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';
    const REWARD_ID = 'ca-app-pub-3940256099942544/5224354917';

    // Mock Ad Helper for Web/Browser
    function showMockAd(type, onComplete) {
        console.log(`Showing mock ${type} ad...`);

        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.9)', zIndex: '99999',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontFamily: 'system-ui, sans-serif', backdropFilter: 'blur(5px)'
        });

        const text = document.createElement('h2');
        text.innerText = type === 'reward' ? 'Reklam İzleniyor (Demo)...' : 'Reklam (Demo)';
        text.style.marginBottom = '20px';
        overlay.appendChild(text);

        const spinner = document.createElement('div');
        spinner.className = 'loader'; // Assuming you have a loader class, otherwise simple text
        spinner.style.border = '4px solid #f3f3f3';
        spinner.style.borderTop = '4px solid #3498db';
        spinner.style.borderRadius = '50%';
        spinner.style.width = '40px';
        spinner.style.height = '40px';
        spinner.style.animation = 'spin 1s linear infinite';

        // Add keyframes for spin if not exists
        if (!document.getElementById('mock-ad-style')) {
            const style = document.createElement('style');
            style.id = 'mock-ad-style';
            style.innerHTML = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
            document.head.appendChild(style);
        }
        overlay.appendChild(spinner);

        const counter = document.createElement('div');
        counter.style.fontSize = '18px';
        counter.style.marginTop = '20px';
        overlay.appendChild(counter);

        const closeBtn = document.createElement('button');
        closeBtn.innerText = 'Kapat ve Ödülü Al';
        Object.assign(closeBtn.style, {
            marginTop: '30px', padding: '12px 24px', fontSize: '16px',
            backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '50px',
            cursor: 'pointer', display: 'none', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)'
        });

        closeBtn.onmouseover = () => closeBtn.style.transform = 'scale(1.05)';
        closeBtn.onmouseout = () => closeBtn.style.transform = 'scale(1)';
        closeBtn.style.transition = 'transform 0.2s';

        closeBtn.onclick = () => {
            document.body.removeChild(overlay);
            if (onComplete) onComplete();
        };
        overlay.appendChild(closeBtn);

        document.body.appendChild(overlay);

        let seconds = 3; // 3 seconds mock duration
        counter.innerText = `Kalan süre: ${seconds}`;

        const interval = setInterval(() => {
            seconds--;
            if (seconds > 0) {
                counter.innerText = `Kalan süre: ${seconds}`;
            } else {
                clearInterval(interval);
                counter.innerText = "Teşekkürler!";
                spinner.style.display = 'none';
                closeBtn.style.display = 'block';
            }
        }, 1000);
    }

    window.initAds = async function () {
        if (!AdMob) {
            console.warn("AdMob plugin not found. Web fallback enabled.");
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
        if (!AdMob) {
            showMockAd('interstitial');
            return;
        }
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
            showMockAd('reward', () => {
                window.store.update('coins', window.store.state.coins + 50);
                window.toast("Tebrikler! 50 Altın kazandın! 💰");
                if (window.confetti) window.confetti();
            });
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

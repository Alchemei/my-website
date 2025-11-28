(function () {
    const shopCatalog = {
        frames: [
            { id: 'frame_gold', name: 'Altın Çerçeve', price: 250, minLevel: 5, icon: '🟡', color: '#FFD700', css: 'border: 3px solid gold; box-shadow: 0 0 15px gold;' },
            { id: 'frame_neon', name: 'Neon Çerçeve', price: 500, minLevel: 10, icon: '💠', color: '#00f2ff', css: 'border: 3px solid var(--neon-blue); box-shadow: 0 0 15px var(--neon-blue), inset 0 0 10px var(--neon-blue);' },
            { id: 'frame_cyber', name: 'Siber', price: 1000, minLevel: 15, icon: '🤖', color: '#00ff00', css: 'border: 3px dashed #00ff00; box-shadow: 0 0 10px #00ff00;' },
            { id: 'frame_fire', name: 'Alev Çerçeve', price: 800, minLevel: 20, icon: '🔥', color: '#ff4500', css: 'border: 3px solid #f97316; box-shadow: 0 0 20px #f97316;' },
            { id: 'frame_diamond', name: 'Elmas', price: 1200, minLevel: 30, icon: '💎', color: '#b9f2ff', css: 'border: 3px solid #b9f2ff; box-shadow: 0 0 15px #b9f2ff, inset 0 0 10px #b9f2ff;' },
            { id: 'frame_galaxy', name: 'Galaksi', price: 1500, minLevel: 40, icon: '🌌', color: '#9d00ff', css: 'border: 3px solid #9d00ff; box-shadow: 0 0 20px #9d00ff;' },
            { id: 'frame_rainbow', name: 'Gökkuşağı', price: 2000, minLevel: 50, icon: '🌈', color: 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)', css: 'border: 3px solid transparent; background-image: linear-gradient(#000, #000), linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet); background-origin: border-box; background-clip: content-box, border-box; box-shadow: 0 0 15px rgba(255,255,255,0.5);' }
        ],
        themes: [
            { id: 'theme_dark', name: 'Karanlık Mod', price: 0, minLevel: 1, icon: '🌑', css: 'background: var(--glass-surface);' },
            { id: 'theme_ocean', name: 'Okyanus', price: 300, minLevel: 5, icon: '🌊', css: 'background: linear-gradient(135deg, #1e3a8a, #0f172a);' },
            { id: 'theme_sunset', name: 'Gün Batımı', price: 400, minLevel: 10, icon: '🌅', css: 'background: linear-gradient(135deg, #7c2d12, #1e1b4b);' },
            { id: 'theme_forest', name: 'Orman', price: 500, minLevel: 15, icon: '🌲', css: 'background: linear-gradient(135deg, #064e3b, #022c22);' },
            { id: 'theme_space', name: 'Uzay', price: 800, minLevel: 25, icon: '🚀', css: 'background: radial-gradient(circle at center, #1e1b4b, #000000);' },
            { id: 'theme_midnight', name: 'Gece Yarısı', price: 600, minLevel: 35, icon: '🌃', css: 'background: linear-gradient(to bottom, #0f172a, #000000);' },
            { id: 'theme_royal', name: 'Kraliyet', price: 1000, minLevel: 45, icon: '👑', css: 'background: linear-gradient(135deg, #4c1d95, #2e1065);' }
        ]
    };

    window.initShop = function () {
        renderShop();
        window.purchaseItem = purchaseItem; // Renamed from buyItem to break cache
        window.equipItem = equipItem;

        // Re-render shop when state changes (e.g. coins update)
        window.addEventListener('state-updated', renderShop);
    }

    function purchaseItem(type, id, cost) {
        // Security: Look up item in catalog to verify level requirement
        let item = null;
        if (type === 'frames') item = shopCatalog.frames.find(x => x.id === id);
        else if (type === 'themes') item = shopCatalog.themes.find(x => x.id === id);

        // Allow buffs (no level req for now, or handle separately)
        if (type === 'buff') {
            // Buff logic...
            if (id === 'freeze') {
                if (window.store.state.activeItems.freeze) { window.toast("Zaten Aktif!"); return; }
                if (window.store.state.coins < cost) { window.toast("Yetersiz Bakiye"); return; }
                window.store.update('activeItems', { ...window.store.state.activeItems, freeze: true });
            }
            if (id === 'double') {
                if (window.store.state.coins < cost) { window.toast("Yetersiz Bakiye"); return; }
                window.store.update('activeItems', { ...window.store.state.activeItems, doubleXP: window.store.state.activeItems.doubleXP + 20 });
            }
            window.store.update('coins', window.store.state.coins - cost);
            window.toast("Satın Alındı! 🎉");
            renderShop();
            return;
        }

        if (!item) {
            window.toast("Eşya bulunamadı!");
            return;
        }

        const minLevel = item.minLevel || 1;
        const currentLevel = window.store.state.level || 1;

        if (currentLevel < minLevel) {
            window.toast(`⛔ Bu eşya için Seviye ${minLevel} gerekli! (Sen: ${currentLevel})`);
            return;
        }

        if (window.store.state.coins >= cost) {
            const inventory = window.store.state.inventory || { frames: [], themes: [] };
            if (!inventory[type]) inventory[type] = [];

            if (inventory[type].includes(id)) { window.toast("Zaten Sahipsin!"); return; }

            inventory[type].push(id);
            window.store.update('inventory', inventory);
            window.store.update('coins', window.store.state.coins - cost);

            window.dispatchEvent(new CustomEvent('task-update', { detail: { type: 'shop', amount: 1 } }));

            window.toast("Satın Alındı! 🎉");
            window.confetti();
            renderShop();
        } else {
            window.toast("Yetersiz Bakiye");
        }
    }

    function equipItem(type, id) {
        const style = window.store.state.profileStyle || { frame: null, theme: 'default' };
        // Toggle off if already equipped
        if (type === 'frame' && style.frame === id) style.frame = null;
        else if (type === 'theme' && style.theme === id) style.theme = 'default';
        else {
            if (type === 'frame') style.frame = id;
            if (type === 'theme') style.theme = id;
        }

        window.store.update('profileStyle', style);
        window.toast("Kuşanıldı! ✨");
        renderShop();
    }

    function renderShop() {
        const buffContainer = document.getElementById('active-buffs-container');
        const framesContainer = document.getElementById('shop-frames');
        const themesContainer = document.getElementById('shop-themes');
        const currentLevel = window.store.state.level || 1;

        // Render Buffs Status
        if (buffContainer) {
            buffContainer.innerHTML = '';
            if (window.store.state.activeItems.freeze) {
                buffContainer.innerHTML += `<div style="background:rgba(255,255,255,0.1); padding:5px 10px; border-radius:20px; font-size:0.8rem; margin-right:5px; display:inline-block;">❄️ Korumada</div>`;
            }
            if (window.store.state.activeItems.doubleXP > 0) {
                buffContainer.innerHTML += `<div style="background:rgba(59, 130, 246, 0.2); color:var(--neon-blue); padding:5px 10px; border-radius:20px; font-size:0.8rem; display:inline-block;">⚡ 2x Aktif (${window.store.state.activeItems.doubleXP})</div>`;
            }
        }

        // Render Frames
        if (framesContainer) {
            framesContainer.innerHTML = '';
            shopCatalog.frames.forEach(item => {
                const owned = (window.store.state.inventory?.frames || []).includes(item.id);
                const equipped = window.store.state.profileStyle?.frame === item.id;
                const locked = currentLevel < (item.minLevel || 1);

                let btnHtml = '';
                if (owned) {
                    btnHtml = `<button class="btn" onclick="window.equipItem('frame', '${item.id}')" style="background:${equipped ? 'var(--neon-green)' : 'rgba(255,255,255,0.1)'}; padding:8px 15px; border-radius:8px;">${equipped ? 'Çıkar' : 'Kuşan'}</button>`;
                } else if (locked) {
                    btnHtml = `<button class="btn" disabled style="background:rgba(255,255,255,0.05); color:var(--text-muted); cursor:not-allowed; font-size: 1.2rem;">🔒</button>`;
                } else {
                    btnHtml = `<button class="btn price-btn" onclick="window.purchaseItem('frames', '${item.id}', ${item.price})">${item.price}</button>`;
                }

                framesContainer.innerHTML += `
                    <div class="glass-panel shop-item ${locked ? 'locked-item' : ''}" style="${locked ? 'opacity:0.6;' : ''}">
                        <div style="display:flex; gap:15px; align-items:center;">
                            <div class="item-icon" style="${item.css} border-radius:50%;">${item.icon}</div>
                            <div>
                                <div style="font-weight:700; font-size:1.1rem;">${item.name}</div>
                                <div style="font-size:0.8rem; color:var(--text-muted);">${locked ? `🔒 Seviye ${item.minLevel} Gerekli` : 'Profil Çerçevesi'}</div>
                            </div>
                        </div>
                        ${btnHtml}
                    </div>`;
            });
        }

        // Render Themes
        if (themesContainer) {
            themesContainer.innerHTML = '';
            shopCatalog.themes.forEach(item => {
                // Default theme is always owned
                const owned = item.price === 0 || (window.store.state.inventory?.themes || []).includes(item.id);
                const equipped = (window.store.state.profileStyle?.theme || 'default') === item.id || (item.id === 'theme_dark' && (!window.store.state.profileStyle?.theme || window.store.state.profileStyle.theme === 'default'));
                const locked = !owned && currentLevel < (item.minLevel || 1);

                let btnHtml = '';
                if (owned) {
                    btnHtml = `<button class="btn" onclick="window.equipItem('theme', '${item.id}')" style="background:${equipped ? 'var(--neon-green)' : 'rgba(255,255,255,0.1)'}; padding:8px 15px; border-radius:8px;">${equipped ? 'Seçili' : 'Seç'}</button>`;
                } else if (locked) {
                    btnHtml = `<button class="btn" disabled style="background:rgba(255,255,255,0.05); color:var(--text-muted); cursor:not-allowed; font-size: 1.2rem;">🔒</button>`;
                } else {
                    btnHtml = `<button class="btn price-btn" onclick="window.purchaseItem('themes', '${item.id}', ${item.price})">${item.price}</button>`;
                }

                themesContainer.innerHTML += `
                    <div class="glass-panel shop-item ${locked ? 'locked-item' : ''}" style="${locked ? 'opacity:0.6;' : ''}">
                        <div style="display:flex; gap:15px; align-items:center;">
                            <div class="item-icon" style="${item.css} border-radius:8px;">${item.icon}</div>
                            <div>
                                <div style="font-weight:700; font-size:1.1rem;">${item.name}</div>
                                <div style="font-size:0.8rem; color:var(--text-muted);">${locked ? `🔒 Seviye ${item.minLevel} Gerekli` : 'Arka Plan Teması'}</div>
                            </div>
                        </div>
                        ${btnHtml}
                    </div>`;
            });
        }

        // Update Buff Buttons (Legacy ID support)
        const btnFreeze = document.getElementById('btn-freeze');
        if (btnFreeze) {
            if (window.store.state.activeItems.freeze) {
                btnFreeze.innerText = "Aktif ✅";
                btnFreeze.disabled = true;
                btnFreeze.style.opacity = 0.6;
            } else {
                btnFreeze.innerText = "100";
                btnFreeze.disabled = false;
                btnFreeze.style.opacity = 1;
            }
            // Update onclick to use new signature
            btnFreeze.onclick = () => window.purchaseItem('buff', 'freeze', 100);
        }

        const btnDouble = document.getElementById('btn-double');
        if (btnDouble) {
            btnDouble.onclick = () => window.purchaseItem('buff', 'double', 150);
        }
    }
})();

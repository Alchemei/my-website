(function () {
    const shopCatalog = {
        frames: [
            { id: 'frame_gold', name: 'Altın Çerçeve', price: 500, icon: '🟡', color: '#FFD700', css: 'border: 3px solid gold; box-shadow: 0 0 15px gold;' },
            { id: 'frame_neon', name: 'Neon Çerçeve', price: 1000, icon: '💠', color: '#00f2ff', css: 'border: 3px solid var(--neon-blue); box-shadow: 0 0 15px var(--neon-blue), inset 0 0 10px var(--neon-blue);' },
            { id: 'frame_fire', name: 'Alev Çerçeve', price: 2000, icon: '🔥', color: '#ff4500', css: 'border: 3px solid #f97316; box-shadow: 0 0 20px #f97316;' },
            { id: 'frame_rainbow', name: 'Gökkuşağı', price: 5000, icon: '🌈', color: 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)', css: 'border: 3px solid transparent; background-image: linear-gradient(#000, #000), linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet); background-origin: border-box; background-clip: content-box, border-box; box-shadow: 0 0 15px rgba(255,255,255,0.5);' },
            { id: 'frame_diamond', name: 'Elmas', price: 3500, icon: '💎', color: '#b9f2ff', css: 'border: 3px solid #b9f2ff; box-shadow: 0 0 15px #b9f2ff, inset 0 0 10px #b9f2ff;' },
            { id: 'frame_cyber', name: 'Siber', price: 2500, icon: '🤖', color: '#00ff00', css: 'border: 3px dashed #00ff00; box-shadow: 0 0 10px #00ff00;' },
            { id: 'frame_galaxy', name: 'Galaksi', price: 4000, icon: '🌌', color: '#9d00ff', css: 'border: 3px solid #9d00ff; box-shadow: 0 0 20px #9d00ff;' }
        ],
        themes: [
            { id: 'theme_dark', name: 'Karanlık Mod', price: 0, icon: '🌑', css: 'background: var(--glass-surface);' },
            { id: 'theme_ocean', name: 'Okyanus', price: 750, icon: '🌊', css: 'background: linear-gradient(135deg, #1e3a8a, #0f172a);' },
            { id: 'theme_sunset', name: 'Gün Batımı', price: 1200, icon: '🌅', css: 'background: linear-gradient(135deg, #7c2d12, #1e1b4b);' },
            { id: 'theme_forest', name: 'Orman', price: 1500, icon: '🌲', css: 'background: linear-gradient(135deg, #064e3b, #022c22);' },
            { id: 'theme_space', name: 'Uzay', price: 2000, icon: '🚀', css: 'background: radial-gradient(circle at center, #1e1b4b, #000000);' },
            { id: 'theme_midnight', name: 'Gece Yarısı', price: 1800, icon: '🌃', css: 'background: linear-gradient(to bottom, #0f172a, #000000);' },
            { id: 'theme_royal', name: 'Kraliyet', price: 3000, icon: '👑', css: 'background: linear-gradient(135deg, #4c1d95, #2e1065);' }
        ]
    };

    window.initShop = function () {
        renderShop();
        window.buyItem = buyItem;
        window.equipItem = equipItem;

        // Re-render shop when state changes (e.g. coins update)
        window.addEventListener('state-updated', renderShop);
    }

    function buyItem(type, id, cost) {
        if (window.store.state.coins >= cost) {
            // Handle Consumables
            if (type === 'buff') {
                if (id === 'freeze') {
                    if (window.store.state.activeItems.freeze) { window.toast("Zaten Aktif!"); return; }
                    window.store.update('activeItems', { ...window.store.state.activeItems, freeze: true });
                }
                if (id === 'double') {
                    window.store.update('activeItems', { ...window.store.state.activeItems, doubleXP: window.store.state.activeItems.doubleXP + 20 });
                }
            }
            // Handle Cosmetics
            else {
                const inventory = window.store.state.inventory || { frames: [], themes: [] };
                if (!inventory[type]) inventory[type] = [];

                if (inventory[type].includes(id)) { window.toast("Zaten Sahipsin!"); return; }

                inventory[type].push(id);
                window.store.update('inventory', inventory);
            }

            window.store.update('coins', window.store.state.coins - cost);
            window.dispatchEvent(new CustomEvent('task-update', { detail: { type: 'shop', amount: 1 } }));

            window.toast("Satın Alındı! 🎉");
            window.confetti();
            renderShop(); // Force re-render to show Equip button
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

                let btnHtml = '';
                if (owned) {
                    btnHtml = `<button class="btn" onclick="window.equipItem('frame', '${item.id}')" style="background:${equipped ? 'var(--neon-green)' : 'rgba(255,255,255,0.1)'}; padding:8px 15px; border-radius:8px;">${equipped ? 'Çıkar' : 'Kuşan'}</button>`;
                } else {
                    btnHtml = `<button class="btn price-btn" onclick="window.buyItem('frames', '${item.id}', ${item.price})">${item.price}</button>`;
                }

                framesContainer.innerHTML += `
                    <div class="glass-panel shop-item">
                        <div style="display:flex; gap:15px; align-items:center;">
                            <div class="item-icon" style="${item.css} border-radius:50%;">${item.icon}</div>
                            <div>
                                <div style="font-weight:700; font-size:1.1rem;">${item.name}</div>
                                <div style="font-size:0.8rem; color:var(--text-muted);">Profil Çerçevesi</div>
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

                let btnHtml = '';
                if (owned) {
                    btnHtml = `<button class="btn" onclick="window.equipItem('theme', '${item.id}')" style="background:${equipped ? 'var(--neon-green)' : 'rgba(255,255,255,0.1)'}; padding:8px 15px; border-radius:8px;">${equipped ? 'Seçili' : 'Seç'}</button>`;
                } else {
                    btnHtml = `<button class="btn price-btn" onclick="window.buyItem('themes', '${item.id}', ${item.price})">${item.price}</button>`;
                }

                themesContainer.innerHTML += `
                    <div class="glass-panel shop-item">
                        <div style="display:flex; gap:15px; align-items:center;">
                            <div class="item-icon" style="${item.css} border-radius:8px;">${item.icon}</div>
                            <div>
                                <div style="font-weight:700; font-size:1.1rem;">${item.name}</div>
                                <div style="font-size:0.8rem; color:var(--text-muted);">Arka Plan Teması</div>
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
                btnFreeze.innerText = "200";
                btnFreeze.disabled = false;
                btnFreeze.style.opacity = 1;
            }
            // Update onclick to use new signature
            btnFreeze.onclick = () => window.buyItem('buff', 'freeze', 200);
        }

        const btnDouble = document.getElementById('btn-double');
        if (btnDouble) {
            btnDouble.onclick = () => window.buyItem('buff', 'double', 350);
        }
    }
})();

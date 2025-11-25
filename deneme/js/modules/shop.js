(function() {
    window.initShop = function() {
        renderShop();
        window.buyItem = buyItem;
        
        // Re-render shop when state changes (e.g. coins update)
        window.addEventListener('state-updated', renderShop);
    }

    function buyItem(type, cost) {
        if (window.store.state.coins >= cost) {
            if (type === 'freeze') {
                if (window.store.state.activeItems.freeze) {
                    window.toast("Zaten Aktif!");
                    return;
                }
                window.store.update('activeItems', { ...window.store.state.activeItems, freeze: true });
            }
            if (type === 'double') {
                window.store.update('activeItems', { ...window.store.state.activeItems, doubleXP: window.store.state.activeItems.doubleXP + 20 });
            }
            
            window.store.update('coins', window.store.state.coins - cost);
            window.dispatchEvent(new CustomEvent('task-update', { detail: { type: 'shop', amount: 1 } }));
            
            window.toast("Satın Alındı! 🎉");
            window.confetti();
        } else {
            window.toast("Yetersiz Bakiye");
        }
    }

    function renderShop() {
        const btnFreeze = document.getElementById('btn-freeze');
        const buffContainer = document.getElementById('active-buffs-container');
        
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
        }
        
        if (buffContainer) {
            buffContainer.innerHTML = '';
            if (window.store.state.activeItems.freeze) {
                buffContainer.innerHTML += `<div style="background:rgba(255,255,255,0.1); padding:5px 10px; border-radius:20px; font-size:0.8rem; margin-right:5px; display:inline-block;">❄️ Korumada</div>`;
            }
            if (window.store.state.activeItems.doubleXP > 0) {
                buffContainer.innerHTML += `<div style="background:rgba(59, 130, 246, 0.2); color:var(--neon-blue); padding:5px 10px; border-radius:20px; font-size:0.8rem; display:inline-block;">⚡ 2x Aktif (${window.store.state.activeItems.doubleXP})</div>`;
            }
        }
    }
})();

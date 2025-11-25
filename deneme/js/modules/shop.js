import { store } from '../store.js';
import { toast, confetti } from '../utils.js';

export function initShop() {
    renderShop();
    window.buyItem = buyItem;
    
    // Re-render shop when state changes (e.g. coins update)
    window.addEventListener('state-updated', renderShop);
}

function buyItem(type, cost) {
    if (store.state.coins >= cost) {
        if (type === 'freeze') {
            if (store.state.activeItems.freeze) {
                toast("Zaten Aktif!");
                return;
            }
            store.update('activeItems', { ...store.state.activeItems, freeze: true });
        }
        if (type === 'double') {
            store.update('activeItems', { ...store.state.activeItems, doubleXP: store.state.activeItems.doubleXP + 20 });
        }
        
        store.update('coins', store.state.coins - cost);
        window.dispatchEvent(new CustomEvent('task-update', { detail: { type: 'shop', amount: 1 } }));
        
        toast("Satın Alındı! 🎉");
        confetti();
    } else {
        toast("Yetersiz Bakiye");
    }
}

function renderShop() {
    const btnFreeze = document.getElementById('btn-freeze');
    const buffContainer = document.getElementById('active-buffs-container');
    
    if (btnFreeze) {
        if (store.state.activeItems.freeze) {
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
        if (store.state.activeItems.freeze) {
            buffContainer.innerHTML += `<div style="background:rgba(255,255,255,0.1); padding:5px 10px; border-radius:20px; font-size:0.8rem; margin-right:5px; display:inline-block;">❄️ Korumada</div>`;
        }
        if (store.state.activeItems.doubleXP > 0) {
            buffContainer.innerHTML += `<div style="background:rgba(59, 130, 246, 0.2); color:var(--neon-blue); padding:5px 10px; border-radius:20px; font-size:0.8rem; display:inline-block;">⚡ 2x Aktif (${store.state.activeItems.doubleXP})</div>`;
        }
    }
}

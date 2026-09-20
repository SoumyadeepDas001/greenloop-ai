import { SEED_EXCHANGE } from '../mock_db.js';

export function renderExchange() {
    return `
        <div class="screen" id="exchange-screen">
            <h2>Seed & Sapling Exchange</h2>
            <p class="mb-4">Connect with neighbors to share plants, seeds, and cuttings.</p>
            
            <div class="flex-col gap-4">
                ${SEED_EXCHANGE.map(item => `
                    <div class="card flex-row align-center gap-4">
                        <div style="width: 80px; height: 80px; border-radius: 8px; background: url('${item.image}') center/cover; flex-shrink: 0;"></div>
                        <div style="flex: 1;">
                            <h3 style="font-size: 16px; margin-bottom: 4px;">${item.plant}</h3>
                            <p style="font-size: 12px; color: var(--text-light);">Offered by ${item.user} • ${item.distance}</p>
                            <button class="btn mt-2" style="padding: 8px 12px; font-size: 12px;" onclick="alert('Message sent to ${item.user}!')">Claim</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="height: 40px;"></div>
        </div>
    `;
}

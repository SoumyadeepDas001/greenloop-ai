import { MARKETPLACE_LISTINGS } from '../mock_db.js?v=2';

function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
}

// User mock location for distance
const userLat = 12.9716;
const userLon = 77.5946;

// --- Visual Helpers ---

// Deterministic hash-based avatar color from a name string
const AVATAR_PALETTE = [
    '#4A9D6A', '#C97B4A', '#6B8EC4', '#D4785C',
    '#7E9B5A', '#B06890', '#5A8F8F', '#C7A54A'
];

function getInitials(name) {
    const parts = name.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (parts[0] || 'M').substring(0, 2).toUpperCase();
}

function hashName(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
}

function getAvatarColor(name) {
    return AVATAR_PALETTE[hashName(name) % AVATAR_PALETTE.length];
}

// Category badge: tinted background + dark text of same hue
const CATEGORY_COLORS = {
    'Upcycled Decor':   { bg: '#DCE5F2', text: '#3E6599' },
    'Compost/Planters':  { bg: '#D6EDE0', text: '#2D5A3D' },
    'Pest Control':      { bg: '#DDE8D2', text: '#4A6B30' },
};
const DEFAULT_BADGE = { bg: '#EDEBE8', text: '#4A4540' };

function getBadgeStyle(category) {
    const c = CATEGORY_COLORS[category] || DEFAULT_BADGE;
    return `background:${c.bg}; color:${c.text};`;
}

export function renderMarketplace() {
    // Generate feed HTML
    const getFeedHTML = (sortBy = 'newest') => {
        let listings = [...MARKETPLACE_LISTINGS];
        
        // Calculate distance
        listings.forEach(item => {
            item.distKm = haversineDistance(userLat, userLon, item.location.lat, item.location.lng);
        });

        if (sortBy === 'distance') {
            listings.sort((a, b) => a.distKm - b.distKm);
        } else if (sortBy === 'category') {
            listings.sort((a, b) => a.category.localeCompare(b.category));
        } else {
            // newest
            listings.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        }

        return listings.map((item, idx) => {
            const initials = getInitials(item.maker);
            const avatarBg = getAvatarColor(item.maker);
            const animDelay = idx * 40;

            return `
            <div class="mk-card" style="animation-delay: ${animDelay}ms;">
                <!-- Image with gradient overlay -->
                <div class="mk-card__img-wrap">
                    <div class="mk-card__img" style="background-image: url('${item.image}');"></div>
                    <div class="mk-card__img-gradient"></div>
                    <span class="mk-card__badge" style="${getBadgeStyle(item.category)}">${item.category}</span>
                </div>
                
                <div class="mk-card__body">
                    <div class="flex-row justify-between align-center mb-1">
                        <h3 class="mk-card__title">${item.item}</h3>
                        <span class="mk-card__dist"><i class="fas fa-map-marker-alt"></i> ${item.distKm.toFixed(1)} km</span>
                    </div>
                    
                    <p class="mk-card__exchange">Free · Community Exchange</p>
                    
                    <div class="mk-card__maker">
                        <span class="mk-card__avatar" style="background:${avatarBg};">${initials}</span>
                        <span class="mk-card__maker-name">${item.maker}</span>
                    </div>
                    <p class="mk-card__desc">${item.description}</p>
                    
                    <div class="flex-row gap-2">
                        <button class="btn mk-card__btn-primary" onclick="alert('Claim request sent to ${item.maker} for ${item.item}.')">Request This</button>
                        <button class="btn-outline mk-card__btn-outline" onclick="window.app.navigate('chat', 'Hi ${item.maker.split(' ')[0]}, I have a question about your ${item.item}... ')">Ask Maker</button>
                    </div>
                </div>
            </div>
        `}).join('');
    };

    // Attach global updater
    window.updateMarketplaceFeed = (select) => {
        const feed = document.getElementById('marketplace-feed-container');
        if (feed) {
            feed.innerHTML = getFeedHTML(select.value);
        }
    };

    return `
        <div class="screen" id="marketplace-screen">
            <h2>Craft Marketplace</h2>
            <p class="mb-4">Support local makers by upcycling and exchanging sustainable crafts.</p>
            
            <div class="flex-row justify-between align-center mb-4">
                <h3 style="font-size: 14px; color: var(--text-light);">Available Items</h3>
                <select onchange="window.updateMarketplaceFeed(this)" style="padding: 6px; border-radius: 4px; border: 1px solid #ddd; background: white; font-size: 12px;">
                    <option value="newest">Sort by Newest</option>
                    <option value="distance">Sort by Distance</option>
                    <option value="category">Sort by Category</option>
                </select>
            </div>
            
            <div id="marketplace-feed-container" class="marketplace-feed flex-col gap-4">
                ${getFeedHTML('newest')}
            </div>
            <div style="height: 40px;"></div>
        </div>
    `;
}

export function renderRecyclingGuide(data) {
    const rec = data.recycling;
    
    // Fallback if confidence is low
    if (rec.confidence < 60) {
        return `
            <div class="screen" id="recycling-guide-screen">
                <h2>Recycling Guide</h2>
                <div class="confidence-badge mb-4" style="background: var(--terracotta); color: white;">
                    Low Confidence Classification
                </div>
                
                <p class="mb-4">We aren't completely sure how to categorize this item. To be safe, please do not throw it in the general trash. Take it to a general center for proper sorting.</p>
                
                <h3 style="margin-bottom: 12px; font-size: 16px;">Suggested Facility</h3>
                <div class="card" style="border-left: 4px solid var(--terracotta);">
                    <div class="flex-row gap-2 mb-2">
                        <span class="tag tag-terracotta" style="font-size: 14px;">📍 ${rec.facility.distanceKm.toFixed(1)} km away</span>
                    </div>
                    <h3 style="margin-bottom: 8px; color: var(--terracotta); font-size: 18px;">${rec.facility.name}</h3>
                    
                    <p style="font-size: 13px; color: var(--text-light); margin-bottom: 4px;"><strong>Hours:</strong> ${rec.facility.hours}</p>
                    
                    <div class="mt-3">
                        <p style="font-size: 12px; font-weight: bold; margin-bottom: 6px; color: var(--text-light);">Accepts:</p>
                        <div class="flex-row gap-2" style="flex-wrap: wrap;">
                            ${rec.facility.accepts.map(item => `<span class="tag" style="background-color: var(--pale-green); color: var(--primary-green);">${item}</span>`).join('')}
                        </div>
                    </div>
                </div>
                
                <button class="btn btn-secondary mt-4" onclick="window.app.navigate('home')">Back to Home</button>
                <div style="height: 40px;"></div>
            </div>
        `;
    }

    return `
        <div class="screen" id="recycling-guide-screen">
            <h2>Recycling Guide</h2>
            <div class="confidence-badge mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                ${rec.confidence}% ${rec.category}
            </div>
            
            <p class="mb-4">Please sort this item into the correct recycling bin or drop it off at a specialized facility.</p>
            
            <h3 style="margin-bottom: 12px; font-size: 16px;">Nearest Facility</h3>
            <div class="card" style="border-left: 4px solid var(--primary-green);">
                <div class="flex-row gap-2 mb-2">
                    <span class="tag" style="font-size: 14px;">📍 ${rec.facility.distanceKm.toFixed(1)} km away</span>
                </div>
                <h3 style="margin-bottom: 8px; color: var(--primary-green); font-size: 18px;">${rec.facility.name}</h3>
                
                <p style="font-size: 13px; color: var(--text-light); margin-bottom: 4px;"><strong>Hours:</strong> ${rec.facility.hours}</p>
                
                <div class="mt-3">
                    <p style="font-size: 12px; font-weight: bold; margin-bottom: 6px; color: var(--text-light);">Accepts:</p>
                    <div class="flex-row gap-2" style="flex-wrap: wrap;">
                        ${rec.facility.accepts.map(item => `<span class="tag" style="background-color: var(--pale-green); color: var(--primary-green);">${item}</span>`).join('')}
                    </div>
                </div>
            </div>
            
            <button class="btn btn-secondary mt-4" onclick="window.app.navigate('home')">Back to Home</button>
            <div style="height: 40px;"></div>
        </div>
    `;
}

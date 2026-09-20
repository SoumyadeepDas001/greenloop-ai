export function renderInorganicBranch(data) {
    // Escaping the JSON data to prevent syntax errors when embedded in the onclick attribute
    const dataStr = JSON.stringify(data).replace(/"/g, '&quot;');
    
    return `
        <div class="screen" id="inorganic-branch-screen">
            <h2>Scan Complete</h2>
            
            <div class="card mb-4" style="text-align: center; padding: 24px;">
                <h3 style="color: var(--primary-green); margin-bottom: 8px; font-size: 20px; text-transform: capitalize;">
                    ${data.material}
                </h3>
                <div class="confidence-badge" style="display: inline-flex; margin: 0 auto;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    ${data.confidence}% Confidence
                </div>
                <p style="margin-top: 16px; color: var(--text-light); font-size: 14px;">
                    We've identified your item. What would you like to do with it?
                </p>
            </div>
            
            <div class="flex-col gap-4 mt-4">
                <button class="btn btn-primary" onclick="window.app.navigate('craft_advisor', ${dataStr})" style="padding: 16px; font-size: 16px;">
                    🎨 Upcycle to Craft
                </button>
                <button class="btn btn-primary" onclick="window.app.navigate('recycling_guide', ${dataStr})" style="padding: 16px; font-size: 16px; background-color: var(--terracotta); color: white;">
                    ♻️ Recycle Correctly
                </button>
            </div>
            
            <button class="btn btn-secondary mt-4" onclick="window.app.navigate('home')">Cancel</button>
            <div style="height: 40px;"></div>
        </div>
    `;
}

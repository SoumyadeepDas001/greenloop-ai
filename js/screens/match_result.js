export function renderMatchResult(data) {
    const { unit, message, classification } = data;
    
    return `
        <div class="screen" id="match-result-screen">
            <div class="flex-row justify-between mb-2">
                <h2>Match Found!</h2>
                <div class="confidence-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    ${classification.confidence}%
                </div>
            </div>
            <p>Based on your ${classification.quantityKg}kg of ${classification.type} waste.</p>
            
            <details class="card mt-4" style="padding: 12px; cursor: pointer;">
                <summary style="font-size: 14px; font-weight: 600; color: var(--primary-green);">View Match Score Breakdown (${unit.matchScore})</summary>
                <div class="flex-col gap-2 mt-2" style="font-size: 13px; color: var(--text-light);">
                    <div class="flex-row justify-between"><span>Distance (${unit.distanceKm}km)</span><span>${unit.scoreBreakdown?.distance || '—'}%</span></div>
                    <div class="flex-row justify-between"><span>Available Capacity (${unit.availableCapacityKg || unit.capacityKg}kg free)</span><span>${unit.scoreBreakdown?.capacity || '—'}%</span></div>
                    <div class="flex-row justify-between"><span>Rating (${unit.rating}★)</span><span>${unit.scoreBreakdown?.rating || '—'}%</span></div>
                    <div class="flex-row justify-between"><span>Material Fit Bonus</span><span>+${unit.scoreBreakdown?.materialFit || '0'}</span></div>
                </div>
            </details>
            
            <div class="card mt-4">
                <div class="flex-row justify-between mb-2">
                    <h3>${unit.name}</h3>
                    <div style="font-size: 12px; font-weight: 600; color: #f59e0b;">${unit.rating}★</div>
                </div>
                <div style="font-size: 12px; color: var(--text-light); margin-bottom: 8px;">
                    ${unit.pickupsCompleted} pickups completed${unit.type ? ` · ${unit.type.replace('_', ' ')}` : ''}
                </div>
                <div style="font-size: 12px; color: var(--text-light); margin-bottom: 8px;">
                    🕒 ${unit.operatingHours || 'Contact for hours'}
                </div>
                <div class="flex-row gap-2 mt-2" style="color: var(--terracotta); font-weight: 600; font-size: 14px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    ${unit.distanceKm} km away
                </div>
                
                <div class="map-preview" style="background: #e0e0e0; overflow: hidden; display: block; padding: 0;">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        frameborder="0" 
                        scrolling="no" 
                        marginheight="0" 
                        marginwidth="0" 
                        src="https://www.openstreetmap.org/export/embed.html?bbox=${unit.location.lng - 0.005}%2C${unit.location.lat - 0.005}%2C${unit.location.lng + 0.005}%2C${unit.location.lat + 0.005}&layer=mapnik&marker=${unit.location.lat}%2C${unit.location.lng}" 
                        style="border-radius: var(--radius-md);">
                    </iframe>
                </div>
                
                <div class="flex-row gap-2 mb-2" style="flex-wrap: wrap;">
                    <span class="tag">Accepts: ${unit.acceptedMaterials.join(', ')}</span>
                    <span class="tag tag-terracotta">Capacity: ${unit.availableCapacityKg || unit.capacityKg}kg available</span>
                </div>
            </div>
            
            <div class="card">
                <h3 style="font-size: 15px; color: var(--text-light); margin-bottom: 12px;">Drafted Coordination Message</h3>
                <textarea style="width: 100%; height: 80px; padding: 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-family: inherit; font-size: 14px; margin-bottom: 16px; resize: none;">${message}</textarea>
                
                <div class="flex-row gap-4">
                    <button class="btn" style="flex: 1;" onclick="window.app.confirmMatch(${classification.quantityKg}, '${data.flowType}')">Send Message</button>
                    <button class="btn btn-secondary" style="width: 60px; padding: 16px 0;" onclick="alert('Directions opened')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                    </button>
                </div>
            </div>
            
            ${data.flowType === 'compost' ? `
            <div class="card" style="background: var(--pale-green); border: none; box-shadow: none;">
                <h4 style="color: var(--primary-green); margin-bottom: 8px;">Environmental Impact</h4>
                <p style="font-size: 13px; color: var(--primary-green);">By diverting this waste, you are preventing approx ${(classification.quantityKg * 0.4).toFixed(1)}kg of CO2 equivalent emissions!</p>
            </div>
            ` : ''}
            
            <p style="font-size: 11px; color: var(--text-light); text-align: center; margin-top: 16px;">Source: Local GreenLoop database (verified today)</p>
            
            <div style="height: 40px;"></div> <!-- Spacer -->
        </div>
    `;
}

export function renderPlantDetail(data) {
    return `
        <div class="screen" id="plant-detail-screen">
            <div class="camera-view" style="height: 200px; margin-bottom: 16px; background: url('https://images.unsplash.com/photo-1558234320-00109ecf02f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80') center/cover;">
                <div class="confidence-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    ${data.confidence}%
                </div>
            </div>
            
            <h1>${data.species}</h1>
            <p>Plant Care Assistant Guide</p>
            
            <div class="care-grid">
                <div class="care-item">
                    <span class="care-label flex-row gap-2">
                        <svg class="care-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        Watering
                    </span>
                    <span class="care-value">${data.watering}</span>
                </div>
                <div class="care-item">
                    <span class="care-label flex-row gap-2">
                        <svg class="care-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                        Sunlight
                    </span>
                    <span class="care-value">${data.sunlight}</span>
                </div>
                <div class="care-item">
                    <span class="care-label flex-row gap-2">
                        <svg class="care-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
                        Soil pH
                    </span>
                    <span class="care-value">${data.soilPH}</span>
                </div>
                <div class="care-item">
                    <span class="care-label flex-row gap-2">
                        <svg class="care-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>
                        Temperature
                    </span>
                    <span class="care-value">${data.tempRange}</span>
                </div>
                <div class="care-item">
                    <span class="care-label flex-row gap-2">
                        <svg class="care-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        Fertilizer
                    </span>
                    <span class="care-value">${data.fertilizer}</span>
                </div>
                <div class="care-item">
                    <span class="care-label flex-row gap-2">
                        <svg class="care-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>
                        Pruning
                    </span>
                    <span class="care-value">${data.pruning}</span>
                </div>
            </div>
            
            <div class="card mt-4">
                <h3 style="font-size: 15px;">Common Issues to Watch</h3>
                <ul style="padding-left: 20px; font-size: 14px; color: var(--text-light); margin-top: 8px;">
                    ${data.commonIssues.map(issue => `<li>${issue}</li>`).join('')}
                </ul>
            </div>
            
            <details class="rag-note">
                <summary style="font-weight: 600; cursor: pointer; color: var(--primary-green);">How this was generated (RAG Trace)</summary>
                <div style="margin-top: 8px; font-family: monospace; font-size: 11px; color: var(--text-light);">
                    1. Vision Model -> Confirmed Species: ${data.species}<br>
                    2. RAG Retrieval -> Queried local 'mock_db.json'<br>
                    3. Generation -> Extracted verified parameters. No hallucinated care data allowed.<br>
                    <br>
                    Source Document ID: kb_${data.species.split(' ')[0].toLowerCase()}
                </div>
            </details>
            <div class="card mt-4">
                <h3 style="font-size: 15px;">Similar Plants</h3>
                <div class="flex-row gap-2 mt-2" style="overflow-x: auto; padding-bottom: 8px;">
                    ${data.similarPlants.map(plant => `
                        <div style="flex-shrink: 0; width: 80px; text-align: center;">
                            <div style="width: 80px; height: 80px; border-radius: 8px; background: #e0e0e0; margin-bottom: 4px; overflow: hidden;">
                                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="#666" style="padding: 24px;"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            </div>
                            <span style="font-size: 11px; font-weight: 600;">${plant}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <button class="btn mt-4" onclick="window.app.completePlantCare()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M12 5v14M5 12h14"></path></svg>
                Add to My Green Garden
            </button>
            
            <p style="font-size: 11px; color: var(--text-light); text-align: center; margin-top: 16px;">Source: Local GreenLoop Database (Verified)</p>
            
            <div style="height: 40px;"></div>
        </div>
    `;
}

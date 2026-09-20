export function renderCraftAdvisor(data) {
    const ideas = data.craftIdeas || [];
    
    const materialIcons = {
        "plastic bottle": "🥤",
        "cardboard": "📦",
        "glass jar": "🫙",
        "tin/metal container": "🥫",
        "old clothes": "👕",
        "aluminum can": "🥫",
        "wine cork": "🍾",
        "e-waste/old electronics": "🔌",
        "broken ceramic": "☕",
        "paper waste": "📰",
        "mixed waste": "🗑️"
    };
    
    const icon = materialIcons[data.material] || "♻️";
    
    const difficultyColors = {
        "Very Easy": "var(--primary-green)",
        "Easy": "var(--primary-green)",
        "Medium": "#E0935C", // Lightened terracotta for medium
        "Hard": "var(--terracotta)"
    };
    
    return `
        <div class="screen" id="craft-advisor-screen">
            <h2>Waste-to-Craft Advisor</h2>
            
            <div class="confidence-badge mb-4" style="background: var(--pale-green); color: var(--primary-green);">
                <span style="font-size: 16px; margin-right: 6px;">${icon}</span>
                ${data.confidence}% ${data.material}
            </div>
            
            ${ideas.length > 0 ? `<p class="mb-4">Here are some upcycling ideas for your ${data.material}:</p>` : `<p class="mb-4">We don't have any specific craft ideas for this material right now.</p>`}
            
            <div class="flex-col gap-4">
                ${ideas.map((idea) => {
                    const borderColor = difficultyColors[idea.difficulty] || "var(--primary-green)";
                    return `
                    <div class="card" style="border-left: 4px solid ${borderColor};">
                        <h3 style="color: var(--primary-green); margin-bottom: 8px;">${idea.title}</h3>
                        
                        ${idea.impact ? `
                            <p style="font-size: 13px; color: var(--primary-green); font-weight: 600; margin-bottom: 12px;">
                                🌱 ${idea.impact}
                            </p>
                        ` : ''}
                        
                        <div class="flex-row gap-2 mb-2" style="font-size: 12px;">
                            <span class="tag">Difficulty: ${idea.difficulty}</span>
                            <span class="tag tag-terracotta">Time: ${idea.time}</span>
                        </div>
                        <details style="margin-top: 12px; cursor: pointer;">
                            <summary style="font-size: 13px; font-weight: 600; color: var(--text-light);">Why this idea?</summary>
                            <p style="font-size: 13px; color: var(--text-light); margin-top: 4px; padding-left: 12px; border-left: 2px solid var(--pale-green);">${idea.reason}</p>
                        </details>
                    </div>
                    `;
                }).join('')}
            </div>
            
            <button class="btn btn-secondary mt-4" onclick="window.app.navigate('home')">Back to Home</button>
            <div style="height: 40px;"></div>
        </div>
    `;
}

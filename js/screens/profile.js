import { getUserMetrics } from '../supabase_client.js';

export async function renderProfile() {
    const metrics = await getUserMetrics(window.app?.userId);
    
    // Mock user data based on existing Home dashboard stats
    const userStats = {
        name: "Eco Explorer",
        joinDate: "Aug 2026",
        kgDiverted: metrics.kg,
        matches: metrics.matches,
        streakDays: metrics.streak, // calculated in getUserMetrics
        co2Prevented: metrics.co2
    };

    // Calculate tier
    let tier = "Sprout";
    if (userStats.kgDiverted >= 20) tier = "Green Guardian";
    else if (userStats.kgDiverted >= 5) tier = "Compost Champion";

    return `
        <div class="screen" id="profile-screen" style="padding-bottom: 120px;">
            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 28px;">
                <div style="width: 76px; height: 76px; border-radius: 38px; background: #FAF7F2; border: 2px solid var(--primary-green); display: flex; align-items: center; justify-content: center; font-size: 36px; box-shadow: var(--shadow-sm);">
                    🌱
                </div>
                <div>
                    <h1 style="margin: 0; font-size: 26px;">${userStats.name}</h1>
                    <div style="color: var(--primary-green); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; font-size: 13px; margin-top: 2px;">${tier}</div>
                    <div style="color: var(--text-light); font-size: 13px; margin-top: 2px;">Joined ${userStats.joinDate}</div>
                </div>
            </div>

            <button class="btn btn-secondary" style="width: 100%; padding: 12px; margin-bottom: 24px; font-weight: 700;" onclick="window.app.navigate('dashboard')">
                📊 View Detailed Analytics
            </button>

            <!-- Stats Grid -->
            <h3 style="font-size: 15px; font-weight: 700; color: var(--text-dark); margin-bottom: 14px;">Lifetime Impact</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 28px;" class="care-grid">
                <div class="card" style="padding: 18px; margin-bottom: 0;">
                    <div style="font-size: 11px; color: var(--text-light); text-transform: uppercase; font-weight: 700;">Diverted Waste</div>
                    <div style="font-size: 26px; font-weight: 800; color: var(--primary-green); margin-top: 6px;">${userStats.kgDiverted}<span style="font-size: 14px; font-weight: normal; color: var(--text-light);">kg</span></div>
                </div>
                <div class="card" style="padding: 18px; margin-bottom: 0;">
                    <div style="font-size: 11px; color: var(--text-light); text-transform: uppercase; font-weight: 700;">Matches Completed</div>
                    <div style="font-size: 26px; font-weight: 800; color: var(--primary-green); margin-top: 6px;">${userStats.matches}</div>
                </div>
                <div class="card" style="padding: 18px; margin-bottom: 0;">
                    <div style="font-size: 11px; color: var(--text-light); text-transform: uppercase; font-weight: 700;">Current Streak</div>
                    <div style="font-size: 26px; font-weight: 800; color: var(--primary-green); margin-top: 6px;">${userStats.streakDays}<span style="font-size: 14px; font-weight: normal; color: var(--text-light);">d</span></div>
                </div>
                <div class="card" style="padding: 18px; margin-bottom: 0;">
                    <div style="font-size: 11px; color: var(--text-light); text-transform: uppercase; font-weight: 700;">CO₂ Prevented</div>
                    <div style="font-size: 26px; font-weight: 800; color: var(--primary-green); margin-top: 6px;">${userStats.co2Prevented}<span style="font-size: 14px; font-weight: normal; color: var(--text-light);">kg</span></div>
                </div>
            </div>

            <!-- Impact Summary -->
            <div class="card" style="padding: 20px; border-left: 4px solid var(--primary-green); margin-bottom: 28px;">
                <p style="font-size: 15px; color: var(--text-dark); margin: 0; line-height: 1.5;">
                    ${userStats.co2Prevented > 0 
                        ? `You've helped prevent <strong style="color: var(--primary-green);">${userStats.co2Prevented}kg of CO₂</strong> — that's equivalent to planting <strong style="color: var(--primary-green);">${Math.max(1, Math.round(userStats.co2Prevented / 21))} trees</strong>! 🌳` 
                        : `Complete a match to start tracking your impact and see how many trees you've saved! 🌳`}
                </p>
            </div>

            <!-- Badges -->
            <h3 style="font-size: 15px; font-weight: 700; color: var(--text-dark); margin-bottom: 14px;">Achievements</h3>
            <div style="display: flex; gap: 16px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 24px;">
                <div style="min-width: 80px; text-align: center;">
                    <div style="width: 60px; height: 60px; border-radius: 30px; margin: 0 auto 8px auto; display: flex; align-items: center; justify-content: center; font-size: 24px; transition: all 0.3s ease;" class="${userStats.matches >= 1 ? 'badge-unlocked' : 'badge-locked'}">
                        🤝
                    </div>
                    <div style="font-size: 12px; font-weight: 600; color: var(--text-dark);">First Match</div>
                </div>
                <div style="min-width: 80px; text-align: center;">
                    <div style="width: 60px; height: 60px; border-radius: 30px; margin: 0 auto 8px auto; display: flex; align-items: center; justify-content: center; font-size: 24px; transition: all 0.3s ease;" class="${userStats.streakDays >= 7 ? 'badge-unlocked' : 'badge-locked'}">
                        🔥
                    </div>
                    <div style="font-size: 12px; font-weight: 600; color: var(--text-dark);">7-Day Streak</div>
                </div>
                <div style="min-width: 80px; text-align: center;">
                    <div style="width: 60px; height: 60px; border-radius: 30px; margin: 0 auto 8px auto; display: flex; align-items: center; justify-content: center; font-size: 24px; transition: all 0.3s ease;" class="${userStats.kgDiverted >= 10 ? 'badge-unlocked' : 'badge-locked'}">
                        🌍
                    </div>
                    <div style="font-size: 12px; font-weight: 600; color: var(--text-dark);">10kg Diverted</div>
                </div>
                <div style="min-width: 80px; text-align: center;">
                    <div style="width: 60px; height: 60px; border-radius: 30px; margin: 0 auto 8px auto; display: flex; align-items: center; justify-content: center; font-size: 24px; transition: all 0.3s ease;" class="badge-locked">
                        🌺
                    </div>
                    <div style="font-size: 12px; font-weight: 600; color: var(--text-light);">5 Plants Id'd</div>
                </div>
            </div>

            <!-- Activity History -->
            <h3 style="font-size: 15px; font-weight: 700; color: var(--text-dark); margin-bottom: 14px;">Past Loops</h3>
            <div class="card flex-col" style="padding: 0; overflow: hidden;">
                <div style="padding: 16px; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 14px; font-weight: 700; color: var(--text-dark);">Temple Trust Incense</div>
                        <div style="font-size: 12px; color: var(--text-light); margin-top: 2px;">5kg Marigold • Aug 14</div>
                    </div>
                    <span class="tag">Completed</span>
                </div>
                <div style="padding: 16px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 14px; font-weight: 700; color: var(--text-dark);">Sunrise Organic Garden</div>
                        <div style="font-size: 12px; color: var(--text-light); margin-top: 2px;">2.5kg Veg Scraps • Aug 10</div>
                    </div>
                    <span class="tag">Completed</span>
                </div>
            </div>
        </div>
    `;
}

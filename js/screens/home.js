import { SEASONAL_RULES } from '../mock_db.js';
import { getUserMetrics } from '../supabase_client.js';

export async function renderHome() {
    const metrics = await getUserMetrics(window.app?.userId);
    
    const today = new Date();
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const past7Days = [];
    const co2PerDay = [0, 0, 0, 0, 0, 0, 0];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        past7Days.push(d.toISOString().split('T')[0]);
    }

    (metrics.loops || []).forEach(loop => {
        if (loop.status === 'completed' && loop.created_at) {
            const loopDate = loop.created_at.split('T')[0];
            const idx = past7Days.indexOf(loopDate);
            if (idx !== -1) {
                co2PerDay[idx] += parseFloat(loop.co2_prevented || 0);
            }
        }
    });

    const maxCo2 = Math.max(...co2PerDay, 0);
    const isAllZero = co2PerDay.every(v => v === 0);
    
    let chartHtml = '';
    
    if (isAllZero) {
        chartHtml = `
            <div style="height: 120px; display: flex; align-items: center; justify-content: center; text-align: center; color: var(--text-light); font-size: 13px; padding: 0 20px;">
                <p>Complete your first loop to start tracking your impact here.</p>
            </div>
        `;
    } else {
        let bars = '';
        past7Days.forEach((dateStr, i) => {
            const val = co2PerDay[i];
            const heightPct = maxCo2 > 0 ? Math.round((val / maxCo2) * 100) : 0;
            const dayLetter = dayNames[new Date(dateStr).getDay()];
            
            // Subtle color gradient: deeper green for higher values
            const opacity = 0.4 + (0.6 * (heightPct / 100)); // 0.4 to 1.0
            
            bars += `
                <div class="bar-col" title="${val.toFixed(1)} kg CO₂" style="display: flex; flex-direction: column; justify-content: flex-end; align-items: center; height: 120px; flex: 1; cursor: pointer;">
                    <div class="bar" style="width: 28px; background: rgba(45, 90, 61, ${opacity}); border-radius: 4px; height: calc(${heightPct}% + 6px); min-height: 6px; transition: height 0.3s ease, opacity 0.3s ease; animation: slideUp 0.5s ease backwards; animation-delay: 0.${i + 2}s;"></div>
                    <span class="bar-label" style="margin-top: 8px; font-size: 11px; font-weight: 600; color: var(--text-light);">${dayLetter}</span>
                </div>
            `;
        });
        chartHtml = `<div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; padding: 10px 0;">${bars}</div>`;
    }

    let activeLoopsHtml = '';
    const activeLoops = (metrics.loops || []).filter(l => l.status !== 'completed');
    if (activeLoops.length > 0) {
        activeLoopsHtml = activeLoops.map((loop, idx) => `
            <div class="card animate-card" style="padding: 20px; border-left: 4px solid var(--primary-green); margin-bottom: 12px; animation-delay: ${idx * 0.05}s;">
                <div class="flex-row justify-between mb-2">
                    <div>
                        <h4 style="font-size: 17px; font-weight: 700; text-transform: capitalize;">${loop.item_type || 'Waste'} Exchange</h4>
                        <p style="font-size: 13px; color: var(--text-light); margin-top: 2px;">Awaiting pickup</p>
                    </div>
                    <span class="tag">Active</span>
                </div>
                <div style="background: var(--pale-green); height: 6px; border-radius: 3px; width: 100%; overflow: hidden; margin: 14px 0 8px 0;">
                    <div style="background: var(--primary-green); height: 100%; width: 66%; border-radius: 3px;"></div>
                </div>
                <p style="font-size: 12px; color: var(--text-light); font-weight: 600;">Step 2 of 3 · In progress</p>
            </div>
        `).join('');
    } else {
        activeLoopsHtml = `<p class="animate-card" style="color: var(--text-light); font-size: 14px;">Your first loop is one scan away — try that ${SEASONAL_RULES.currentSeason} tip below 👇</p>`;
    }

    let marqueeText = '';
    const completedLoops = (metrics.loops || []).filter(l => l.status === 'completed');
    if (completedLoops.length > 0) {
        marqueeText = completedLoops.map(l => {
            return `🌱 Diverted ${l.kg_diverted}kg of ${l.item_type || 'waste'} to compost &nbsp;&nbsp;&bull;&nbsp;&nbsp;`;
        }).join(' ');
        marqueeText += marqueeText; // Duplicate for smooth scroll
    } else {
        marqueeText = `🌱 Recent activity: Community compost bin added in Zone 3 &nbsp;&nbsp;&bull;&nbsp;&nbsp; 🌼 5kg marigold flowers matched to Temple Trust &nbsp;&nbsp;&bull;&nbsp;&nbsp; 🍃 12kg organic waste diverted from landfill &nbsp;&nbsp;&bull;&nbsp;&nbsp; 🤝 Sunrise Garden accepted 10kg vegetable scraps &nbsp;&nbsp;&bull;&nbsp;&nbsp;`;
    }
    
    // Dynamic Greeting Logic
    const hour = today.getHours();
    let greetingTime = 'Good evening';
    if (hour >= 5 && hour < 12) greetingTime = 'Good morning';
    else if (hour >= 12 && hour < 17) greetingTime = 'Good afternoon';

    let greetingMsg = `${greetingTime}! 🌱`;
    
    const motivations = [
        "Every kg counts.",
        "Small loops, big impact.",
        "Your waste, someone else's resource.",
        "Nature recycles everything. So can we."
    ];
    let subGreeting = motivations[hour % motivations.length];

    if (metrics.kg === 0) {
        greetingMsg = `Welcome to GreenLoop! 🌱`;
        subGreeting = 'Ready to make your first match?';
    } else if (metrics.kg >= 25) {
        greetingMsg = `${greetingTime}! You just crossed 25kg diverted — amazing work! 🎉`;
    } else if (metrics.kg >= 10) {
        greetingMsg = `${greetingTime}! You just crossed 10kg diverted — amazing work! 🎉`;
    } else if (metrics.kg >= 5) {
        greetingMsg = `${greetingTime}! You just crossed 5kg diverted — amazing work! 🎉`;
    } else if (metrics.streak) {
        greetingMsg = `${greetingTime}! 🌱 Day ${metrics.streak} — keep it going!`;
    }

    // Set timeout to animate counters once DOM is populated
    setTimeout(() => {
        document.querySelectorAll('.metric-counter').forEach(el => {
            const target = parseFloat(el.getAttribute('data-target')) || 0;
            if (target === 0) return; // leave at 0
            const duration = 500;
            const steps = 20;
            const stepTime = duration / steps;
            const increment = target / steps;
            let current = 0;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    el.innerText = target % 1 === 0 ? target : target.toFixed(1);
                    clearInterval(timer);
                } else {
                    el.innerText = current % 1 === 0 ? Math.floor(current) : current.toFixed(1);
                }
            }, stepTime);
        });
    }, 100);

    return `
        <div class="screen animate-card" id="home-screen" style="padding-bottom: 120px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px;">
                <div>
                    <h1 style="margin: 0; font-size: 28px;">${greetingMsg}</h1>
                    <p style="margin-top: 4px; color: var(--text-light); font-size: 14px;">${subGreeting}</p>
                </div>
            </div>

            <!-- Activity Feed -->
            <div class="marquee-container">
                <div class="marquee-content">
                    ${marqueeText}
                </div>
            </div>

            <!-- CO2 Chart Data -->
            <h3 style="margin-top: 28px; margin-bottom: 12px; font-size: 15px; font-weight: 700; color: var(--text-dark);">7-Day CO₂ Offset (kg)</h3>
            <div class="bar-chart">
                ${chartHtml}
            </div>

            <!-- Loop Metrics -->
            <h3 style="margin-top: 28px; margin-bottom: 12px; font-size: 15px; font-weight: 700; color: var(--text-dark);">Your Loop Metrics</h3>
            <div class="loop-metrics-grid flex-row gap-4 mb-4">
                <div class="card animate-card" style="flex: 1; text-align: center; animation-delay: 0.1s;">
                    <div class="metric-counter" data-target="${metrics.kg}" style="font-size: 30px; font-weight: 800; color: var(--primary-green);">0</div>
                    <div style="font-size: 12px; color: var(--text-light); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">kg Diverted</div>
                </div>
                <div class="card animate-card" style="flex: 1; text-align: center; animation-delay: 0.15s;">
                    <div class="metric-counter" data-target="${metrics.activeMatches || 0}" style="font-size: 30px; font-weight: 800; color: var(--terracotta);">0</div>
                    <div style="font-size: 12px; color: var(--text-light); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Active Loops</div>
                </div>
            </div>

            <h3 style="font-size: 15px; font-weight: 700; color: var(--text-dark); margin-bottom: 12px;">Active Loops</h3>
            <div class="active-loops-container">
                ${activeLoopsHtml}
            </div>

            <!-- Seasonal Nudge -->
            <div class="card animate-card" style="margin-top: 24px; padding: 24px; background: linear-gradient(135deg, var(--bg-card), var(--bg-dark)); border-left: 4px solid var(--terracotta); animation-delay: 0.2s;">
                <div class="flex-row justify-between mb-2">
                    <h3 style="font-size: 18px; margin: 0;">${SEASONAL_RULES.currentSeason} Tip</h3>
                    <span class="tag tag-terracotta">${SEASONAL_RULES.timeLeft}</span>
                </div>
                <p style="color: var(--text-light); margin-top: 6px;">${SEASONAL_RULES.message}</p>
                <button class="btn mt-4 ${activeLoops.length === 0 ? 'btn-pulse' : ''}" onclick="window.app.navigate('scan')">🌿 Scan Waste</button>
            </div>
        </div>
    `;
}

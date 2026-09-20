import { supabase } from '../supabase_client.js';

export async function renderDashboard(userId) {
    return `
        <div class="screen fade-in" id="dashboard-screen" style="padding-bottom: 80px;">
            <div class="flex-row justify-between align-center mb-4">
                <h2>Your Impact</h2>
                <button class="btn" style="width: auto; padding: 8px 16px; font-size: 13px;" onclick="window.app.exportData()">
                    <i class="fas fa-download"></i> Export CSV
                </button>
            </div>
            
            <!-- Quick Stats -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                <div class="card" style="padding: 15px; text-align: center; animation-delay: 0ms;">
                    <div style="font-size: 24px; font-weight: 800; color: var(--text-dark);" id="dash-kg">...</div>
                    <div style="font-size: 12px; color: var(--text-light); font-weight: 500;">Total kg Diverted</div>
                </div>
                <div class="card" style="padding: 15px; text-align: center; animation-delay: 40ms;">
                    <div style="font-size: 24px; font-weight: 800; color: var(--text-dark);" id="dash-co2">...</div>
                    <div style="font-size: 12px; color: var(--text-light); font-weight: 500;">kg CO₂ Prevented</div>
                </div>
                <div class="card" style="padding: 15px; text-align: center; animation-delay: 80ms;">
                    <div style="font-size: 24px; font-weight: 800; color: var(--text-dark);" id="dash-matches">...</div>
                    <div style="font-size: 12px; color: var(--text-light); font-weight: 500;">Completed Loops</div>
                </div>
                <div class="card" style="padding: 15px; text-align: center; animation-delay: 120ms;">
                    <div style="font-size: 24px; font-weight: 800; color: var(--text-dark);" id="dash-active">...</div>
                    <div style="font-size: 12px; color: var(--text-light); font-weight: 500;">Active Loops</div>
                </div>
            </div>

            <div class="card mb-4" style="padding: 15px; animation-delay: 160ms;">
                <h3 style="font-size: 15px; font-weight: 700; color: var(--text-dark); margin-bottom: 12px;">Diversion by Type (kg)</h3>
                <div style="display: flex; gap: 10px;">
                    <div style="flex: 1; background: var(--pale-green); border-radius: 8px; padding: 12px; text-align: center;">
                        <div style="font-size: 18px; font-weight: 800; color: var(--primary-green);" id="dash-organic">...</div>
                        <div style="font-size: 11px; font-weight: 600; color: var(--primary-green);">Organic</div>
                    </div>
                    <div style="flex: 1; background: var(--terracotta-pale); border-radius: 8px; padding: 12px; text-align: center;">
                        <div style="font-size: 18px; font-weight: 800; color: var(--terracotta);" id="dash-reuse">...</div>
                        <div style="font-size: 11px; font-weight: 600; color: var(--terracotta);">Reuse</div>
                    </div>
                </div>
            </div>

            <!-- Chart -->
            <div class="card mb-4" style="padding: 15px; animation-delay: 200ms;">
                <div class="flex-row justify-between align-center mb-3">
                    <h3 style="font-size: 15px; font-weight: 700; color: var(--text-dark);">7-Day CO₂ Offset (kg)</h3>
                </div>
                <div style="height: 180px; width: 100%; position: relative;" id="chart-container">
                    <canvas id="impactChart"></canvas>
                </div>
            </div>

            <!-- Top Plants -->
            <div class="card" style="padding: 15px; animation-delay: 240ms;">
                <h3 style="font-size: 15px; font-weight: 700; color: var(--text-dark); margin-bottom: 12px;">Top Queried Plants</h3>
                <ul id="dash-plants" style="list-style: none; padding: 0; font-size: 13px; color: var(--text-light);">
                    <li>Loading...</li>
                </ul>
            </div>
            
            <button class="btn-outline mt-4" style="width: 100%;" onclick="window.app.navigate('profile')">Back to Profile</button>
        </div>
    `;
}

export async function populateDashboardData(userId) {
    console.log("populateDashboardData called with userId:", userId);
    if (!userId) {
        setDashText('dash-kg', '0.0');
        setDashText('dash-co2', '0.0');
        setDashText('dash-matches', '0');
        setDashText('dash-active', '0');
        setDashText('dash-organic', '0.0');
        setDashText('dash-reuse', '0.0');
        setDashText('dash-plants', '<li>No data</li>');
        renderChart([]);
        return;
    }

    try {
        let loopArray = [];
        // Fetch loops from Supabase
        const { data: loops, error: loopsError } = await supabase
            .from('user_loops')
            .select('*')
            .eq('user_id', userId);
        
        console.log("Dashboard: Supabase loops query result:", { loops, loopsError });
        if (!loopsError && loops) loopArray = [...loops];

        // Merge local loops (always, to cover mock-user fallback)
        const localLoops = JSON.parse(localStorage.getItem('greenloop_user_loops') || '[]');
        if (localLoops.length > 0) {
            // Deduplicate: local loops have numeric string IDs, Supabase has UUIDs
            const existingIds = new Set(loopArray.map(l => l.id));
            localLoops.forEach(ll => {
                if (!existingIds.has(ll.id)) {
                    loopArray.push(ll);
                }
            });
        }
        
        console.log("Dashboard: merged loopArray before aggregation:", loopArray);

        let totalKg = 0;
        let totalCo2 = 0;
        let completed = 0;
        let active = 0;
        let organicKg = 0;
        let reuseKg = 0;
        const chartData = {};

        // Initialize last 7 days for chart
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            chartData[dateStr] = 0;
        }

        loopArray.forEach(row => {
            const kg = parseFloat(row.kg_diverted || 0);
            if (row.status === 'completed') {
                completed++;
                totalKg += kg;
                totalCo2 += parseFloat(row.co2_prevented || 0);
                
                if (['compost', 'flowers'].includes(row.item_type)) {
                    organicKg += kg;
                } else {
                    reuseKg += kg;
                }
                
                // Chart aggregation
                if (row.created_at) {
                    const dateStr = row.created_at.split('T')[0];
                    if (chartData[dateStr] !== undefined) {
                        chartData[dateStr] += parseFloat(row.co2_prevented || 0);
                    }
                }
            } else {
                active++;
            }
        });

        console.log("Dashboard aggregates:", { totalKg, totalCo2, completed, active, organicKg, reuseKg });

        setDashText('dash-kg', totalKg.toFixed(1));
        setDashText('dash-co2', totalCo2.toFixed(1));
        setDashText('dash-matches', completed);
        setDashText('dash-active', active);
        setDashText('dash-organic', organicKg.toFixed(1));
        setDashText('dash-reuse', reuseKg.toFixed(1));

        renderChart(chartData);

        // Fetch chat messages for plants — Supabase + localStorage fallback
        let allChats = [];
        const { data: chats } = await supabase
            .from('chat_messages')
            .select('content')
            .eq('user_id', userId)
            .eq('role', 'user');
        if (chats) allChats = [...chats];
        
        // Merge local chat history
        const localChats = JSON.parse(localStorage.getItem('greenloop_chat_history') || '[]');
        localChats.forEach(c => {
            if (c.role === 'user') allChats.push({ content: c.content });
        });
            
        const commonPlants = ['marigold', 'tulsi', 'hibiscus', 'rose', 'aloe', 'tomato', 'mint'];
        const plantCounts = {};
        
        allChats.forEach(chat => {
            const text = (chat.content || '').toLowerCase();
            commonPlants.forEach(p => {
                if (text.includes(p)) {
                    plantCounts[p] = (plantCounts[p] || 0) + 1;
                }
            });
        });
        
        const sortedPlants = Object.entries(plantCounts).sort((a,b) => b[1] - a[1]).slice(0, 3);
        const plantsHtml = sortedPlants.length > 0 
            ? sortedPlants.map(p => `<li style="margin-bottom: 5px; text-transform: capitalize;">${p[0]} <span style="float: right; font-weight: bold;">${p[1]} queries</span></li>`).join('')
            : '<li>No plant queries yet</li>';
            
        document.getElementById('dash-plants').innerHTML = plantsHtml;

    } catch (e) {
        console.error("Dashboard error:", e);
    }
}

function setDashText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = text;
}

function renderChart(chartData) {
    const container = document.getElementById('chart-container');
    const ctx = document.getElementById('impactChart');
    if (!ctx || !container) return;
    
    // Format dates to short strings like "Sep 15"
    const labels = Object.keys(chartData).map(d => {
        const date = new Date(d);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const data = Object.values(chartData);
    const isAllZero = data.every(v => v === 0);

    // Empty state fallback
    if (isAllZero) {
        container.innerHTML = `
            <div style="height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; color: var(--text-light); font-size: 13px; padding: 0 20px;">
                <p>Complete your first loop to start tracking your impact here.</p>
            </div>
        `;
        return;
    }

    const canvasCtx = ctx.getContext('2d');
    const gradient = canvasCtx.createLinearGradient(0, 0, 0, 180);
    gradient.addColorStop(0, 'rgba(45, 90, 61, 0.85)'); // Primary green, slightly transparent
    gradient.addColorStop(1, 'rgba(61, 115, 79, 0.4)'); // Lighter green fade

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'kg CO₂',
                data: data,
                backgroundColor: gradient,
                borderRadius: 4,
                borderSkipped: false,
                minBarLength: 5 // Ensures even 0 has a minimal bar
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.04)' },
                    border: { display: false },
                    ticks: {
                        color: 'rgba(43, 36, 32, 0.5)',
                        font: { size: 10, family: 'Nunito' }
                    }
                },
                x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: {
                        color: 'rgba(43, 36, 32, 0.5)',
                        font: { size: 10, family: 'Nunito' }
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(43, 36, 32, 0.9)',
                    padding: 10,
                    titleFont: { family: 'Nunito', size: 12 },
                    bodyFont: { family: 'Nunito', size: 13, weight: 'bold' },
                    callbacks: {
                        label: (context) => `${context.raw.toFixed(1)} kg CO₂`
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
}

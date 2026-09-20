const SUPABASE_URL = "https://avvazrheakewmdbrxvze.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_F0wXm7WzusL8XNX49Mqsaw_cajlqmSz";

// The script tag in index.html exposes supabase on the window object
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getUserMetrics(userId) {
    if (!userId) return { kg: 0, matches: 0, streak: 0, co2: 0 };
    console.log("getUserMetrics querying for user_id:", userId);
    let { data, error } = await supabase.from('user_loops')
        .select('*')
        .eq('user_id', userId);
        
    console.log("Supabase raw rows returned for getUserMetrics:", data);

    // Always merge local loops with deduplication (same strategy as dashboard)
    const localLoops = JSON.parse(localStorage.getItem('greenloop_user_loops') || '[]');
    let loopArray = data || [];
    if (localLoops.length > 0) {
        const existingIds = new Set(loopArray.map(l => l.id));
        localLoops.forEach(ll => {
            if (!existingIds.has(ll.id)) {
                loopArray.push(ll);
            }
        });
    }
    console.log("getUserMetrics: merged loopArray:", loopArray);
    console.log(`%c[METRICS DEBUG] user_id=${userId} | supabase_rows=${(data||[]).length} | local_rows=${localLoops.length} | merged_total=${loopArray.length}`, 'color: #00FF66; font-weight: bold');
    
    if (!loopArray || loopArray.length === 0) {
        console.log("%c[METRICS DEBUG] No loops found — metrics will show 0. Activity Feed will show DEMO placeholder text.", 'color: #FF3366; font-weight: bold');
        return { kg: 0, matches: 0, streak: 0, co2: 0 };
    }
    
    let kg = 0;
    let co2 = 0;
    let matches = 0;
    let activeMatches = 0;
    
    loopArray.forEach(row => {
        if (row.status === 'completed') {
            kg += parseFloat(row.kg_diverted || 0);
            co2 += parseFloat(row.co2_prevented || 0);
            if (row.item_type === 'compost') {
                matches += 1;
            }
        } else {
            activeMatches += 1;
        }
    });

    console.log(`%c[METRICS DEBUG] Aggregated: kg=${kg.toFixed(1)} | co2=${co2.toFixed(1)} | completed_matches=${matches} | active=${activeMatches}`, 'color: #00FF66');
    console.table(loopArray.map(l => ({ id: l.id, type: l.item_type, status: l.status, kg: l.kg_diverted, co2: l.co2_prevented, created: l.created_at })));

    return {
        kg: parseFloat(kg.toFixed(1)),
        co2: parseFloat(co2.toFixed(1)),
        matches,
        activeMatches,
        streak: matches > 0 ? 1 : 0,
        loops: loopArray
    };
}

export async function loadChatHistory(userId) {
    if (!userId) return getLocalChatHistory();
    
    try {
        const { data, error } = await supabase.from('chat_messages')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);
            
        console.log("Supabase select chat_messages:", { data, error });
        if (error || !data) return getLocalChatHistory();
        return data.reverse(); // Return in chronological order
    } catch (e) {
        return getLocalChatHistory();
    }
}

export async function saveChatMessage(userId, role, content) {
    saveLocalChatMessage(role, content);
    if (!userId) return;
    
    try {
        const { data, error } = await supabase.from('chat_messages').insert([{
            user_id: userId,
            role,
            content
        }]);
        console.log("Supabase insert chat_messages:", { data, error });
        if (error) console.error("Error inserting chat message:", error);
    } catch (e) {
        console.error("Exception inserting chat message:", e);
    }
}

function getLocalChatHistory() {
    try {
        const history = localStorage.getItem('greenloop_chat_history');
        return history ? JSON.parse(history) : [];
    } catch (e) {
        return [];
    }
}

function saveLocalChatMessage(role, content) {
    try {
        const history = getLocalChatHistory();
        history.push({ role, content });
        // Keep last 20
        if (history.length > 20) history.shift();
        localStorage.setItem('greenloop_chat_history', JSON.stringify(history));
    } catch (e) {}
}

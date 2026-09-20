import { renderHome } from './screens/home.js?v=12';
import { renderScan } from './screens/scan.js?v=10';
import { renderMatchResult } from './screens/match_result.js?v=10';
import { renderPlantDetail } from './screens/plant_detail.js?v=10';
import { renderListItem } from './screens/list_item.js?v=10';
import { renderPlantationGuide } from './screens/plantation_guide.js?v=2';
import { renderExchange } from './screens/exchange.js?v=10';
import { renderCraftAdvisor } from './screens/craft_advisor.js?v=11';
import { renderMarketplace } from './screens/marketplace.js?v=12';
import { renderChat } from './screens/chat.js?v=8';
import { renderProfile } from './screens/profile.js?v=10';
import { renderInorganicBranch } from './screens/inorganic_branch.js?v=2';
import { renderRecyclingGuide } from './screens/recycling_guide.js?v=2';
import { renderDashboard, populateDashboardData } from './screens/dashboard.js?v=11';
import { matchWasteToCompost, generatePlantCareGuide, matchItemToStudent, advisePlantation, analyzeInorganicWaste, diagnosePlantDisease, coordinateCommunityGarden, answerGardenQuestion } from './ai_flows.js?v=2';
import { processChatMessage } from './chat_assistant.js?v=8';
import { supabase, loadChatHistory, saveChatMessage } from './supabase_client.js?v=3';

class GreenLoopApp {
    constructor() {
        this.mainContent = document.getElementById('main-content');
        this.navItems = document.querySelectorAll('.nav-item');
        
        this.init();
    }

    async init() {
        // Initialize view mode from localStorage
        const storedMode = localStorage.getItem('viewMode');
        if (storedMode === 'desktop') {
            document.body.classList.add('desktop-mode');
            const btn = document.getElementById('view-toggle');
            if (btn) btn.innerHTML = '📱 Mobile';
        }

        // Initialize theme from localStorage
        const storedTheme = localStorage.getItem('themeMode');
        if (storedTheme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            const tbtn = document.getElementById('theme-toggle');
            if (tbtn) tbtn.innerHTML = '☀️';
        }

        // Anonymous auth setup with persistence
        let savedUserId = localStorage.getItem('greenloop_user_id');
        if (savedUserId) {
            console.log("Using persisted User ID:", savedUserId);
            this.userId = savedUserId;
        } else {
            const { data, error } = await supabase.auth.signInAnonymously();
            console.log("Supabase signInAnonymously:", { data, error });
            if (error) {
                console.error("Auth error:", error);
                // Fallback to local mock user since anon auth might be disabled
                savedUserId = 'mock-user-' + Math.floor(Math.random() * 1000000);
                this.userId = savedUserId;
                localStorage.setItem('greenloop_user_id', savedUserId);
                console.log("Using fallback mock User ID:", savedUserId);
            } else {
                console.log("Supabase Auth User ID:", data.user.id);
                this.userId = data.user.id;
                localStorage.setItem('greenloop_user_id', data.user.id);
            }
        }

        this.navigate('home');
    }

    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const btn = document.getElementById('theme-toggle');
        
        if (currentTheme === 'dark') {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('themeMode', 'light');
            if (btn) btn.innerHTML = '🌙';
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('themeMode', 'dark');
            if (btn) btn.innerHTML = '☀️';
        }
    }

    toggleViewMode() {
        const isDesktop = document.body.classList.contains('desktop-mode');
        this.setDesktopMode(!isDesktop);
    }

    setDesktopMode(isDesktop) {
        const btn = document.getElementById('view-toggle');
        if (isDesktop) {
            document.body.classList.add('desktop-mode');
            localStorage.setItem('viewMode', 'desktop');
            if (btn) btn.textContent = '📱 Mobile';
        } else {
            document.body.classList.remove('desktop-mode');
            localStorage.setItem('viewMode', 'mobile');
            if (btn) btn.textContent = '🖥️ Desktop';
        }
    }

    async navigate(screen, data = null) {
        // Update nav active state
        this.navItems.forEach(item => {
            if (item.dataset.tab === screen) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Hide toggle on non-home screens
        const viewToggle = document.getElementById('view-toggle');
        const themeToggle = document.getElementById('theme-toggle');
        if (viewToggle) {
            viewToggle.style.display = (screen === 'home') ? 'block' : 'none';
        }
        if (themeToggle) {
            themeToggle.style.display = (screen === 'home') ? 'block' : 'none';
        }

        // Render screen
        let html = '';
        switch (screen) {
            case 'home':
                html = await renderHome();
                break;
            case 'scan':
                html = await renderScan();
                break;
            case 'match_result':
                html = await renderMatchResult(data);
                break;
            case 'plant_detail':
                html = await renderPlantDetail(data);
                break;
            case 'list_item':
                html = await renderListItem();
                break;
            case 'plantation_guide':
                html = await renderPlantationGuide(data);
                break;
            case 'exchange':
                html = await renderExchange();
                break;
            case 'craft_advisor':
                html = await renderCraftAdvisor(data);
                break;
            case 'inorganic_branch':
                html = await renderInorganicBranch(data);
                break;
            case 'recycling_guide':
                html = await renderRecyclingGuide(data);
                break;
            case 'marketplace':
                html = await renderMarketplace();
                break;
            case 'chat':
                html = await renderChat();
                break;
            case 'profile':
                html = await renderProfile(this.userId);
                break;
            case 'dashboard':
                html = await renderDashboard(this.userId);
                break;
            default:
                html = await renderHome();
        }

        this.mainContent.innerHTML = html;
        window.scrollTo(0, 0);
        
        if (screen === 'scan') {
            this.initCamera();
        } else {
            this.stopCamera();
        }
        
        if (screen === 'chat') {
            this.loadAndRenderChatHistory();
            if (data && typeof data === 'string') {
                setTimeout(() => this.fillChat(data), 100);
            }
        }
        
        if (screen === 'dashboard') {
            setTimeout(() => populateDashboardData(this.userId), 100);
        }
    }

    async recordUserLoop(itemType, kgDiverted, co2Prevented) {
        console.log("recordUserLoop writing with userId:", this.userId, "itemType:", itemType, "kg:", kgDiverted, "co2:", co2Prevented);
        // Local fallback
        const localLoop = {
            id: Date.now().toString(),
            item_type: itemType,
            status: 'completed',
            kg_diverted: kgDiverted,
            co2_prevented: co2Prevented,
            created_at: new Date().toISOString()
        };
        const history = JSON.parse(localStorage.getItem('greenloop_user_loops') || '[]');
        history.push(localLoop);
        localStorage.setItem('greenloop_user_loops', JSON.stringify(history));

        if (!this.userId) return;
        
        const { data, error } = await supabase.from('user_loops').insert([{
            user_id: this.userId,
            item_type: itemType,
            status: 'completed',
            kg_diverted: kgDiverted,
            co2_prevented: co2Prevented
        }]);
        
        console.log("Supabase insert user_loops:", { data, error });
        if (error) {
            console.error("Failed to save match:", error);
        }
    }

    async confirmMatch(kgDiverted, flowType) {
        const co2 = kgDiverted * 0.4;
        await this.recordUserLoop('compost', kgDiverted, co2);
        alert('Message Sent!');
        this.navigate(flowType === 'compost' ? 'plantation_guide' : 'home');
    }

    async completePlantCare() {
        await this.recordUserLoop('plant_care', 0, 0);
        alert('Added to your Green Garden!');
        this.navigate('home');
    }
    
    async initCamera() {
        const video = document.getElementById('webcam');
        const placeholder = document.getElementById('camera-placeholder');
        if (!video) return;
        
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            video.srcObject = this.stream;
            if (placeholder) placeholder.style.display = 'none';
        } catch (err) {
            console.error("Camera access denied:", err);
            if (placeholder) {
                placeholder.textContent = "No camera? No problem — just describe it below.";
            }
            const mockInput = document.getElementById('mock-input');
            if (mockInput) {
                mockInput.focus();
            }
        }
    }
    
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    captureImageBase64() {
        const video = document.getElementById('webcam');
        if (!video || !this.stream) return null;
        
        try {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg', 0.8);
        } catch (e) {
            console.error("Failed to capture image:", e);
            return null;
        }
    }

    // Helper to append logs to the UI
    logToUI(payload) {
        if (typeof payload === 'string') {
            const logContainer = document.getElementById('agent-log');
            if (logContainer) {
                const entry = document.createElement('div');
                entry.className = 'log-entry';
                entry.textContent = `> ${payload}`;
                logContainer.appendChild(entry);
                logContainer.scrollTop = logContainer.scrollHeight;
            }
            console.log(`[AI Flow] ${payload}`);
            return;
        }

        if (payload.type === 'system') {
            console.log(`[System] ${payload.message}`);
            return;
        }

        if (payload.type === 'agent') {
            const stepperContainer = document.getElementById('agent-stepper');
            if (!stepperContainer) return;

            const safeAgentId = payload.agent.replace(/\\s+/g, '-').toLowerCase();
            let stepEl = document.getElementById(`step-${safeAgentId}`);
            
            if (!stepEl) {
                stepEl = document.createElement('div');
                stepEl.id = `step-${safeAgentId}`;
                stepEl.className = 'agent-step';
                
                const icon = document.createElement('div');
                icon.className = 'step-icon';
                icon.innerHTML = `<div class="spinner"></div>`;
                
                const content = document.createElement('div');
                content.className = 'step-content';
                
                const title = document.createElement('div');
                title.className = 'step-title';
                title.textContent = payload.agent;
                
                const status = document.createElement('div');
                status.className = 'step-status';
                status.textContent = payload.status;
                
                content.appendChild(title);
                content.appendChild(status);
                stepEl.appendChild(icon);
                stepEl.appendChild(content);
                
                stepperContainer.appendChild(stepEl);
            } else {
                const statusEl = stepEl.querySelector('.step-status');
                statusEl.textContent = payload.status;
                
                if (payload.state === 'done') {
                    stepEl.classList.add('done');
                    const iconEl = stepEl.querySelector('.step-icon');
                    iconEl.innerHTML = `✓`;
                }
            }
            console.log(`[${payload.agent}] ${payload.status}`);
        }
    }

    /**
     * Requests the browser's real geolocation with a visible UI state.
     * Caches the result on `this.userLocation` for the session.
     * If permission is denied or unavailable, shows an inline manual input form
     * and resolves once the user submits coordinates.
     */
    async getUserLocation() {
        // Return cached value immediately (avoid re-prompting mid-session)
        if (this.userLocation) return this.userLocation;

        const FALLBACK = { lat: 12.9716, lon: 77.5946 }; // Bangalore city centre

        return new Promise((resolve) => {
            // 1 — Show a location permission modal
            const overlay = document.createElement('div');
            overlay.id = 'geo-overlay';
            overlay.style.cssText = `
                position:fixed;inset:0;z-index:9999;
                background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);
                display:flex;align-items:center;justify-content:center;
            `;
            overlay.innerHTML = `
                <div style="
                    background:var(--card-bg,#fff);border-radius:20px;
                    padding:28px 24px;max-width:340px;width:90%;text-align:center;
                    box-shadow:0 8px 40px rgba(0,0,0,0.25);
                ">
                    <div style="font-size:36px;margin-bottom:12px">📍</div>
                    <h3 style="margin:0 0 8px;font-size:18px;color:var(--text-primary,#1a1a1a)">
                        Allow Location Access
                    </h3>
                    <p style="font-size:13px;color:var(--text-light,#666);margin:0 0 20px;line-height:1.5">
                        GreenLoop uses your location to find the closest composting
                        and recycling facilities near you.
                    </p>
                    <button id="geo-allow-btn" style="
                        width:100%;padding:14px;border:none;border-radius:12px;
                        background:var(--primary-green,#2d7a4f);color:#fff;
                        font-size:15px;font-weight:700;cursor:pointer;margin-bottom:10px;
                    ">Allow Location</button>
                    <button id="geo-deny-btn" style="
                        width:100%;padding:12px;border:1px solid #ddd;border-radius:12px;
                        background:transparent;color:var(--text-light,#666);
                        font-size:14px;cursor:pointer;
                    ">Enter location manually</button>
                    <div id="geo-manual-form" style="display:none;margin-top:16px;text-align:left">
                        <p style="font-size:12px;color:var(--text-light,#888);margin:0 0 8px">
                            Enter your city or approximate coordinates:
                        </p>
                        <input id="geo-city-input" placeholder="e.g. Bangalore, or 12.97, 77.59"
                            style="
                                width:100%;box-sizing:border-box;padding:10px 12px;
                                border:1px solid #ddd;border-radius:8px;font-size:14px;
                                font-family:inherit;outline:none;
                            "
                        />
                        <button id="geo-submit-btn" style="
                            width:100%;margin-top:10px;padding:12px;border:none;
                            border-radius:10px;background:var(--primary-green,#2d7a4f);
                            color:#fff;font-size:14px;font-weight:600;cursor:pointer;
                        ">Use This Location</button>
                        <p id="geo-error-msg" style="
                            color:#e74c3c;font-size:12px;margin:8px 0 0;display:none
                        ">Couldn't find that location. Using Bangalore as fallback.</p>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            const dismiss = (loc) => {
                this.userLocation = loc;
                overlay.remove();
                resolve(loc);
            };

            // City name → approx coordinates lookup (basic set, covers common Indian cities)
            const CITY_MAP = {
                'bangalore': { lat: 12.9716, lon: 77.5946 },
                'bengaluru': { lat: 12.9716, lon: 77.5946 },
                'mumbai': { lat: 19.0760, lon: 72.8777 },
                'delhi': { lat: 28.6139, lon: 77.2090 },
                'hyderabad': { lat: 17.3850, lon: 78.4867 },
                'chennai': { lat: 13.0827, lon: 80.2707 },
                'kolkata': { lat: 22.5726, lon: 88.3639 },
                'pune': { lat: 18.5204, lon: 73.8567 },
                'ahmedabad': { lat: 23.0225, lon: 72.5714 },
            };

            // 2 — "Allow" button → fire the real browser permission
            document.getElementById('geo-allow-btn').addEventListener('click', () => {
                const btn = document.getElementById('geo-allow-btn');
                if (btn) { btn.textContent = 'Requesting…'; btn.disabled = true; }
                navigator.geolocation.getCurrentPosition(
                    (pos) => dismiss({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                    (err) => {
                        // Permission denied or unavailable → slide open manual form
                        console.warn('Geolocation denied:', err);
                        const manualForm = document.getElementById('geo-manual-form');
                        if (manualForm) manualForm.style.display = 'block';
                        if (btn) { btn.style.display = 'none'; }
                        const denyBtn = document.getElementById('geo-deny-btn');
                        if (denyBtn) denyBtn.style.display = 'none';
                    },
                    { timeout: 10000, enableHighAccuracy: true }
                );
            });

            // 3 — "Enter manually" button → skip the browser prompt, show form directly
            document.getElementById('geo-deny-btn').addEventListener('click', () => {
                const manualForm = document.getElementById('geo-manual-form');
                const denyBtn = document.getElementById('geo-deny-btn');
                const allowBtn = document.getElementById('geo-allow-btn');
                if (manualForm) manualForm.style.display = 'block';
                if (denyBtn) denyBtn.style.display = 'none';
                if (allowBtn) allowBtn.style.display = 'none';
                document.getElementById('geo-city-input')?.focus();
            });

            // 4 — Manual submit: parse "12.97, 77.59" or "Bangalore"
            document.getElementById('geo-submit-btn').addEventListener('click', () => {
                const raw = (document.getElementById('geo-city-input')?.value || '').trim().toLowerCase();
                const errMsg = document.getElementById('geo-error-msg');

                // Try direct decimal coords first: "12.97, 77.59" or "12.97 77.59"
                const parts = raw.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
                if (parts.length >= 2 && Math.abs(parts[0]) <= 90 && Math.abs(parts[1]) <= 180) {
                    return dismiss({ lat: parts[0], lon: parts[1] });
                }

                // Try city name lookup
                const city = CITY_MAP[raw];
                if (city) return dismiss(city);

                // Unknown — show error, use fallback anyway
                if (errMsg) errMsg.style.display = 'block';
                setTimeout(() => dismiss(FALLBACK), 2000);
            });

            // Allow Enter key on the city input
            document.getElementById('geo-city-input')?.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') document.getElementById('geo-submit-btn')?.click();
            });
        });
    }

    async startFlow1() {
        const actions = document.getElementById('scan-actions');
        const pipeline = document.getElementById('ai-pipeline-container');
        const logContainer = document.getElementById('agent-log');
        const stepperContainer = document.getElementById('agent-stepper');
        const pipelineTitle = document.getElementById('pipeline-title');
        
        actions.style.display = 'none';
        pipeline.style.display = 'block';
        logContainer.style.display = 'none';
        stepperContainer.style.display = 'flex';
        stepperContainer.innerHTML = '';
        if (pipelineTitle) pipelineTitle.textContent = "Agentic Pipeline Active";
        
        try {
            const inputDesc = document.getElementById('mock-input')?.value || "3.2kg of wilted marigold";
            const imageBase64 = this.captureImageBase64();

            // Get real user location — shows permission UI, falls back to manual input
            const { lat: userLat, lon: userLon } = await this.getUserLocation();
            
            const result = await matchWasteToCompost(this.logToUI.bind(this), inputDesc, imageBase64, userLat, userLon);
            // Add slight delay before transitioning so user can read the final log
            setTimeout(() => {
                this.navigate('match_result', result);
            }, 1000);
        } catch (error) {
            console.error(error);
            if (pipelineTitle) {
                pipelineTitle.textContent = "Pipeline Error";
                pipelineTitle.style.color = "var(--terracotta)";
            }
            logContainer.style.display = 'block';
            this.logToUI(`Error: ${error.message}`);
            setTimeout(() => {
                actions.style.display = 'block';
                pipeline.style.display = 'none';
                if (pipelineTitle) pipelineTitle.style.color = "var(--text-primary)";
            }, 5000);
        }
    }

    async startFlow2() {
        const actions = document.getElementById('scan-actions');
        const pipeline = document.getElementById('ai-pipeline-container');
        const logContainer = document.getElementById('agent-log');
        const stepperContainer = document.getElementById('agent-stepper');
        const pipelineTitle = document.getElementById('pipeline-title');
        
        actions.style.display = 'none';
        pipeline.style.display = 'block';
        stepperContainer.style.display = 'none';
        logContainer.style.display = 'block';
        logContainer.innerHTML = '';
        if (pipelineTitle) {
            pipelineTitle.textContent = "Analyzing...";
            pipelineTitle.style.color = "var(--text-primary)";
        }
        
        try {
            const inputDesc = document.getElementById('mock-input')?.value || "hibiscus";
            const imageBase64 = this.captureImageBase64();
            const result = await generatePlantCareGuide(this.logToUI.bind(this), inputDesc, imageBase64);
            setTimeout(() => {
                this.navigate('plant_detail', result);
            }, 1000);
        } catch (error) {
            console.error(error);
            if (pipelineTitle) {
                pipelineTitle.textContent = "Error";
                pipelineTitle.style.color = "var(--terracotta)";
            }
            this.logToUI(`Error: ${error.message}`);
            setTimeout(() => {
                actions.style.display = 'block';
                pipeline.style.display = 'none';
                if (pipelineTitle) pipelineTitle.style.color = "var(--text-primary)";
            }, 5000);
        }
    }

    async startItemMatchFlow() {
        const pipeline = document.getElementById('ai-pipeline-container');
        const logContainer = document.getElementById('agent-log');
        const stepperContainer = document.getElementById('agent-stepper');
        const pipelineTitle = document.getElementById('pipeline-title');
        
        // Hide form actions if any (simulate it by just showing the pipeline)
        const oldScreen = document.getElementById('list-item-screen');
        if (oldScreen) {
            oldScreen.innerHTML = `
                <div id="ai-pipeline-container" style="display: block; margin-top: 16px;">
                    <h3 style="color: var(--terracotta);" id="pipeline-title">Agentic Pipeline Active</h3>
                    <div class="agent-stepper" id="agent-stepper" style="display: flex;"></div>
                </div>
            `;
            // We re-query since we just injected it
            this.activePipelineContainer = document.getElementById('ai-pipeline-container');
            this.activeStepperContainer = document.getElementById('agent-stepper');
            this.activeLogContainer = null;
        }
        
        try {
            const result = await matchItemToStudent(this.logToUI.bind(this));
            setTimeout(() => {
                // Reuse match_result screen but we might want to tweak it?
                // Wait, the prompt says "same layout as Module 1's, different data".
                // I can just map the data to match the expected format of renderMatchResult:
                // unit -> student, classification -> classification, message -> message
                this.navigate('match_result', {
                    unit: {
                        name: result.student.name,
                        distanceKm: result.student.distanceKm,
                        capacityKg: result.student.needScore + "% Need",
                        acceptedMaterials: result.student.needs,
                        rating: 5.0,
                        pickupsCompleted: 2,
                        operatingHours: 'School Hours'
                    },
                    classification: {
                        type: result.classification.type,
                        quantityKg: "1 item", // Hack to fit the text
                        confidence: result.classification.confidence
                    },
                    message: result.message,
                    flowType: 'item'
                });
            }, 1000);
        } catch (error) {
            this.logToUI(`Error: ${error.message}`);
        }
    }

    async startPlantationFlow(spaceType) {
        const pipeline = document.getElementById('ai-pipeline-container');
        const logContainer = document.getElementById('agent-log');
        
        pipeline.style.display = 'block';
        logContainer.style.display = 'block';
        logContainer.innerHTML = '';
        
        try {
            const result = await advisePlantation(spaceType, this.logToUI.bind(this));
            setTimeout(() => {
                this.navigate('plantation_guide', result);
            }, 1000);
        } catch (error) {
            this.logToUI(`Error: ${error.message}`);
        }
    }

    async advisePlantationFlow(spaceType) {
        const container = document.getElementById('ai-pipeline-container');
        const logContainer = document.getElementById('agent-log');
        
        container.style.display = 'block';
        logContainer.style.display = 'block';
        logContainer.innerHTML = '';

        const logger = (msg) => {
            let text = typeof msg === 'string' ? msg : msg.status || msg.message;
            if (text) {
                const entry = document.createElement('div');
                entry.className = 'log-entry';
                entry.textContent = `> ${text}`;
                logContainer.appendChild(entry);
                logContainer.scrollTop = logContainer.scrollHeight;
            }
        };

        try {
            const result = await advisePlantation(spaceType, logger);
            this.navigate('plantation_guide', result);
        } catch (error) {
            logger({ type: "system", message: "Error: " + error.message });
        }
    }
    
    async askGardenQuestion() {
        const inputEl = document.getElementById('garden-question-input');
        if (!inputEl) return;
        const question = inputEl.value.trim();
        if (!question) return;
        
        inputEl.value = '';

        const container = document.getElementById('garden-rag-container');
        const logContainer = document.getElementById('garden-rag-log');
        const chatMessages = document.getElementById('garden-chat-messages');
        
        // Append user question
        const userBubble = document.createElement('div');
        userBubble.className = 'chat-bubble user';
        userBubble.textContent = question;
        chatMessages.appendChild(userBubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        container.style.display = 'block';
        logContainer.style.display = 'block';
        logContainer.innerHTML = '';

        const logger = (msg) => {
            let text = typeof msg === 'string' ? msg : msg.status || msg.message;
            if (text) {
                const entry = document.createElement('div');
                entry.className = 'log-entry';
                entry.textContent = `> ${text}`;
                logContainer.appendChild(entry);
                logContainer.scrollTop = logContainer.scrollHeight;
            }
        };

        const result = await answerGardenQuestion(question, logger);
        
        // Wait a moment for final UI transition
        await new Promise(r => setTimeout(r, 500));
        
        logContainer.style.display = 'none';
        container.style.display = 'none';
        
        // Append assistant answer
        const assistantBubble = document.createElement('div');
        assistantBubble.className = 'chat-bubble assistant';
        
        let htmlContent = result.answer;
        if (result.found && result.sourceEntry) {
            htmlContent += `
                <details style="font-size: 11px; color: var(--text-dark); background: rgba(0,0,0,0.05); padding: 8px; border-radius: 4px; cursor: pointer; margin-top: 8px;">
                    <summary style="outline: none;">Source: GreenLoop Knowledge Base</summary>
                    <pre style="margin-top: 8px; white-space: pre-wrap; font-family: monospace;">${JSON.stringify(result.sourceEntry, null, 2)}</pre>
                </details>
            `;
        }
        
        assistantBubble.innerHTML = htmlContent;
        chatMessages.appendChild(assistantBubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async startInorganicFlow() {
        const actions = document.getElementById('scan-actions');
        const pipeline = document.getElementById('ai-pipeline-container');
        const logContainer = document.getElementById('agent-log');
        const stepperContainer = document.getElementById('agent-stepper');
        const pipelineTitle = document.getElementById('pipeline-title');
        
        actions.style.display = 'none';
        pipeline.style.display = 'block';
        logContainer.style.display = 'none';
        stepperContainer.style.display = 'flex';
        stepperContainer.innerHTML = '';
        if (pipelineTitle) pipelineTitle.textContent = "Agentic Pipeline Active";
        
        try {
            const inputDesc = document.getElementById('mock-input')?.value || "plastic bottle";
            const imageBase64 = this.captureImageBase64();

            // Get real user location — shows permission UI, falls back to manual input
            const { lat: userLat, lon: userLon } = await this.getUserLocation();
            
            const result = await analyzeInorganicWaste(this.logToUI.bind(this), inputDesc, imageBase64, userLat, userLon);
            
            setTimeout(() => {
                this.navigate('inorganic_branch', result);
            }, 1000);
        } catch (error) {
            this.logToUI(`Error: ${error.message}`);
        }
    }

    async startPestDiagnosisFlow() {
        const actions = document.getElementById('scan-actions');
        const pipeline = document.getElementById('ai-pipeline-container');
        const logContainer = document.getElementById('agent-log');
        const stepperContainer = document.getElementById('agent-stepper');
        const pipelineTitle = document.getElementById('pipeline-title');
        
        actions.style.display = 'none';
        pipeline.style.display = 'block';
        logContainer.style.display = 'none';
        stepperContainer.style.display = 'flex';
        stepperContainer.innerHTML = '';
        if (pipelineTitle) pipelineTitle.textContent = "Agentic Pipeline Active";
        
        try {
            const inputDesc = document.getElementById('mock-input')?.value || "white web and tiny mites on my rose plant";
            const result = await diagnosePlantDisease(this.logToUI.bind(this), inputDesc);
            setTimeout(() => {
                // Reuse plant_detail for now but add an alert to show it worked
                alert(`Pipeline complete! Diagnosis: ${result.disease}. Check console for full details.`);
                console.log(result);
                this.navigate('home'); // Go home after showing alert
            }, 1000);
        } catch (error) {
            this.logToUI(`Error: ${error.message}`);
            setTimeout(() => {
                actions.style.display = 'flex';
                pipeline.style.display = 'none';
            }, 2000);
        }
    }

    async startCommunityGardenFlow() {
        const actions = document.getElementById('scan-actions');
        const pipeline = document.getElementById('ai-pipeline-container');
        const logContainer = document.getElementById('agent-log');
        const stepperContainer = document.getElementById('agent-stepper');
        const pipelineTitle = document.getElementById('pipeline-title');
        
        actions.style.display = 'none';
        pipeline.style.display = 'block';
        logContainer.style.display = 'none';
        stepperContainer.style.display = 'flex';
        stepperContainer.innerHTML = '';
        if (pipelineTitle) pipelineTitle.textContent = "Agentic Pipeline Active";
        
        try {
            const inputDesc = document.getElementById('mock-input')?.value || "I have a sunny terrace of 100sqft";
            const result = await coordinateCommunityGarden(this.logToUI.bind(this), inputDesc);
            setTimeout(() => {
                alert(`Pipeline complete! Recommended crops: ${result.suitableCrops.map(c=>c.species).join(', ')}. Broadcast message drafted!`);
                console.log(result);
                this.navigate('plantation_guide'); 
            }, 1000);
        } catch (error) {
            this.logToUI(`Error: ${error.message}`);
            setTimeout(() => {
                actions.style.display = 'flex';
                pipeline.style.display = 'none';
            }, 2000);
        }
    }

    fillChat(text) {
        const input = document.getElementById('chat-input');
        if (input) {
            input.value = text;
            input.focus();
        }
    }

    async submitChat(forceMessage = null, isImage = false) {
        const input = document.getElementById('chat-input');
        let message = forceMessage;
        
        if (!message) {
            if (!input || !input.value.trim()) return;
            message = input.value.trim();
            input.value = '';
        }
        
        // Render user message
        if (isImage) {
            this.appendChatMessage(`<img src="${isImage}" style="max-width: 100%; border-radius: 8px;"><br>[Image Attached]`, 'user');
        } else {
            this.appendChatMessage(message, 'user');
        }
        
        // Show thinking indicator
        const thinkingId = 'thinking-' + Date.now();
        this.appendChatMessage('<div class="dot-typing"></div><div class="dot-typing"></div><div class="dot-typing"></div>', 'assistant thinking', thinkingId, true);
        
        // Process and render response
        const responseData = await processChatMessage(message, isImage, this.userId);
        
        // Remove thinking indicator
        const thinkingEl = document.getElementById(thinkingId);
        if (thinkingEl) thinkingEl.remove();
        
        let htmlContent = responseData.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        if (responseData.buttons && responseData.buttons.length > 0) {
            htmlContent += `<div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">`;
            responseData.buttons.forEach(btn => {
                htmlContent += `<button onclick="window.app.navigate('${btn.action}')" style="padding: 6px 12px; border-radius: 12px; border: 1px solid var(--primary-green); background: transparent; color: var(--text-dark); cursor: pointer; font-size: 0.85rem;">${btn.label}</button>`;
            });
            htmlContent += `</div>`;
        }
        
        if (responseData.handledBy) {
            htmlContent += `
                <details style="font-size: 11px; color: var(--text-light); background: rgba(0,0,0,0.05); padding: 8px; border-radius: 4px; cursor: pointer; margin-top: 12px;">
                    <summary style="outline: none;">How this was answered</summary>
                    <div style="margin-top: 8px; font-family: monospace;">Handled by: ${responseData.handledBy}</div>
                </details>
            `;
        }
        
        this.appendChatMessage(htmlContent, 'assistant');
    }

    toggleChatAttachMenu() {
        const menu = document.getElementById('chat-attach-menu');
        if (menu) {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        }
    }

    handleChatImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            // e.target.result is the base64 string
            const fakeDescription = "plant image"; // Simplified for prototype
            this.submitChat(fakeDescription, e.target.result);
        };
        reader.readAsDataURL(file);
    }

    async loadAndRenderChatHistory() {
        const history = await loadChatHistory(this.userId);
        if (history && history.length > 0) {
            const container = document.getElementById('chat-messages');
            if (!container) return;
            
            // Keep the initial welcome message, but add history after it
            // Actually, just clear and re-render everything
            container.innerHTML = `
                <div class="chat-bubble assistant" data-skip-save="true">
                    Hi! I'm the GreenLoop Assistant. I can help with plant care questions or check the status of your active compost matches. How can I help you today?
                </div>
            `;
            
            history.forEach(msg => {
                this.appendChatMessage(msg.content, msg.role, null, true);
            });
        }
    }

    appendChatMessage(htmlContent, typeClass, id = null, skipSave = false) {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        
        const bubble = document.createElement('div');
        bubble.className = "chat-bubble " + typeClass;
        if (id) bubble.id = id;
        bubble.innerHTML = htmlContent;
        
        container.appendChild(bubble);
        container.scrollTop = container.scrollHeight;
        
        if (!skipSave && (typeClass === 'user' || typeClass === 'assistant')) {
            saveChatMessage(this.userId, typeClass, htmlContent);
        }
    }
    
    async exportData() {
        if (!this.userId) {
            alert("No user ID found. Please login.");
            return;
        }

        try {
            // Fetch loops
            const { data: loops } = await supabase.from('user_loops').select('*').eq('user_id', this.userId);
            // Fetch chats
            const { data: chats } = await supabase.from('chat_messages').select('*').eq('user_id', this.userId);

            const allLoops = [...(loops || []), ...JSON.parse(localStorage.getItem('greenloop_user_loops') || '[]')];
            const allChats = [...(chats || []), ...JSON.parse(localStorage.getItem('greenloop_chat_history') || '[]')];

            let csvContent = "type,id,created_at,item_type,kg_diverted,co2_prevented,status,role,content\n";

            allLoops.forEach(loop => {
                const kg = loop.kg_diverted || '';
                const co2 = loop.co2_prevented || '';
                csvContent += `loop,${loop.id || ''},${loop.created_at || ''},${loop.item_type || ''},${kg},${co2},${loop.status || ''},,\n`;
            });

            allChats.forEach(chat => {
                const content = chat.content ? `"${chat.content.replace(/"/g, '""')}"` : '';
                csvContent += `chat,${chat.id || ''},${chat.created_at || ''},,,,,${chat.role || ''},${content}\n`;
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "greenloop_data_export.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (e) {
            console.error("Export failed:", e);
            alert("Failed to export data.");
        }
    }
}

// Make app accessible globally for onclick handlers in HTML strings
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GreenLoopApp();
});

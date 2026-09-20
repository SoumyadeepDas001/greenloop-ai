export function renderScan() {
    return `
        <div class="screen" id="scan-screen">
            <h2>Scan & Identify</h2>
            <p class="mb-2">Upload or capture an image to begin.</p>
            
            <div class="camera-view" id="camera-view" style="margin-bottom: 8px; position: relative; overflow: hidden; background: #E8E2D8;">
                <video id="webcam" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;"></video>
                <div class="camera-overlay" style="z-index: 10; pointer-events: none;"></div>
                <span id="camera-placeholder" style="color: var(--text-light); font-weight: 600; position: relative; z-index: 1;">Starting camera...</span>
            </div>
            <p style="font-size: 11px; color: var(--text-light); text-align: center; margin-bottom: 12px;">Tip: capture in natural light for better classification accuracy</p>
            
            <textarea id="mock-input" class="input-field" placeholder="Describe the waste or plant (e.g., '3.2kg of wilted marigold', 'hibiscus leaves')" style="width: 100%; min-height: 60px; margin-bottom: 16px; padding: 8px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-family: inherit; font-size: 14px;"></textarea>

            <div id="scan-actions" class="flex-col gap-2">
                <button class="btn" onclick="window.app.startFlow1()">♻️ Match Waste to Compost</button>
                <button class="btn" style="background: var(--terracotta);" onclick="window.app.startInorganicFlow()">📦 Analyze Inorganic Waste</button>
                <button class="btn btn-secondary" onclick="window.app.startPestDiagnosisFlow()">🐛 Diagnose Pest & Disease</button>
                <button class="btn btn-secondary" onclick="window.app.startCommunityGardenFlow()">🏡 Coordinate Community Garden</button>
                <button class="btn btn-secondary" onclick="window.app.startFlow2()">🌱 Identify & Care Guide</button>
                <button class="btn btn-secondary" onclick="window.app.navigate('list_item')">🎒 List an Item (Books/Uniforms)</button>
            </div>

            <!-- Reusable Stepper Container (hidden by default) -->
            <div id="ai-pipeline-container" style="display: none;">
                <h3 style="color: var(--terracotta);" id="pipeline-title">Analyzing...</h3>
                <div class="agent-stepper" id="agent-stepper"></div>
                <div class="agent-log" id="agent-log">
                    <!-- Logs injected here -->
                </div>
            </div>
        </div>
    `;
}

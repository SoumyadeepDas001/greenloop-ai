export function renderPlantationGuide(data) {
    if (!data) {
        return `
        <div class="screen animate-card" id="plantation-guide-screen">
            <h2>Plantation Guide</h2>
            <p>Select your space to get plant recommendations for your new compost!</p>
            <div class="card mt-4">
                <label style="font-size: 13px; font-weight: 600;">Where will you plant?</label>
                <select id="space-type-select" style="width: 100%; padding: 12px; margin-top: 4px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-body); color: var(--text-dark);">
                    <option value="Balcony (Pots/Containers)">Balcony (Pots/Containers)</option>
                    <option value="Rooftop Garden">Rooftop Garden</option>
                    <option value="Community Plot">Community Plot</option>
                    <option value="Windowsill">Windowsill</option>
                    <option value="Backyard/Ground Bed">Backyard/Ground Bed</option>
                    <option value="Vertical Wall Garden">Vertical Wall Garden</option>
                    <option value="Indoor Space">Indoor Space</option>
                </select>
                <button class="btn mt-4" onclick="window.app.startPlantationFlow(document.getElementById('space-type-select').value)">Get Recommendations</button>
            </div>
            
            <div id="ai-pipeline-container" style="display: none; margin-top: 16px;">
                <h3 style="color: var(--terracotta);" id="pipeline-title">Analyzing...</h3>
                <div class="agent-log" id="agent-log" style="display: none;"></div>
            </div>
        </div>`;
    }

    // Determine space type from the select box state, or fallback
    const selectEl = document.getElementById('space-type-select');
    const spaceType = selectEl ? selectEl.value : 'your space';

    // Helper to get an emoji based on species
    const getEmoji = (species) => {
        const lower = species.toLowerCase();
        if (lower.includes('rose') || lower.includes('hibiscus') || lower.includes('zinnia') || lower.includes('petunia') || lower.includes('chrysanthemum') || lower.includes('orchid')) return '🌸';
        if (lower.includes('marigold') || lower.includes('sunflower')) return '🌻';
        if (lower.includes('tulsi') || lower.includes('mint') || lower.includes('coriander') || lower.includes('curry leaf')) return '🌿';
        if (lower.includes('aloe vera') || lower.includes('money plant') || lower.includes('areca palm')) return '🪴';
        if (lower.includes('tree') || lower.includes('neem')) return '🌳';
        if (lower.includes('lotus')) return '🪷';
        if (lower.includes('tomato')) return '🍅';
        return '🌱';
    };

    // Helper for reason
    const getWhyFits = (plant, space) => {
        const reasons = [
            `Perfectly sized and suited for a ${space.toLowerCase()}.`,
            `Thrives in the conditions typical of a ${space.toLowerCase()}.`,
            `A beautiful, easy addition to any ${space.toLowerCase()}.`
        ];
        if (plant.sunlight.includes('Full Sun')) return `Loves the sun — perfect for your ${space.toLowerCase()}.`;
        if (plant.watering.includes('Low') || plant.watering.includes('weeks')) return `Low maintenance and drought-tolerant for a ${space.toLowerCase()}.`;
        return reasons[Math.floor(Math.random() * reasons.length)];
    };

    const carouselId = 'plant-carousel-' + Date.now();

    // Render result state with Carousel
    const html = `
        <div class="screen animate-card" id="plantation-guide-result">
            <h2>Recommended for You</h2>
            <p>Based on your compost and space type, here are the best plants to grow:</p>
            
            <div class="carousel-container" id="${carouselId}-container">
                <div class="carousel-track" id="${carouselId}-track">
                    ${data.map((plant, idx) => `
                        <div class="carousel-slide" data-index="${idx}">
                            <div class="plant-card-rich">
                                <div class="plant-emoji">${getEmoji(plant.species)}</div>
                                <h3 style="color: var(--primary-green); margin-bottom: 4px; font-size: 22px;">${plant.species}</h3>
                                <p style="font-size: 13px; color: var(--text-light);">Difficulty: <strong style="color: var(--text-dark);">${plant.difficulty}</strong></p>
                                
                                <div class="plant-badges">
                                    <div class="plant-badge">💧 ${plant.watering}</div>
                                    <div class="plant-badge">☀️ ${plant.sunlight}</div>
                                </div>
                                
                                <div class="plant-reason">
                                    "${getWhyFits(plant, spaceType)}"
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="carousel-nav">
                    <button class="carousel-arrow" id="${carouselId}-prev">←</button>
                    <div class="carousel-dots" id="${carouselId}-dots">
                        ${data.map((_, idx) => `<div class="carousel-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></div>`).join('')}
                    </div>
                    <button class="carousel-arrow" id="${carouselId}-next">→</button>
                </div>
            </div>
            
            <div class="card mt-4" style="padding: 0; display: flex; flex-direction: column; height: 350px;">
                <h3 style="color: var(--text-dark); font-size: 15px; margin: 16px 16px 8px 16px;">Ask About Your Garden</h3>
                
                <div id="garden-chat-messages" style="flex: 1; overflow-y: auto; padding: 0 16px; display: flex; flex-direction: column; gap: 10px;">
                    <!-- Messages will be appended here -->
                </div>
                
                <div id="garden-rag-container" style="display: none; padding: 0 16px;">
                    <div class="agent-log" id="garden-rag-log" style="display: none; margin: 0; padding: 8px; border-radius: 8px; font-size: 11px;"></div>
                </div>

                <div class="chat-chips-container" style="padding: 10px 16px; overflow-x: auto; white-space: nowrap; display: flex; gap: 8px; border-top: 1px solid var(--glass-border);">
                    <button class="chip" style="font-size: 0.8rem; padding: 6px 12px;" onclick="document.getElementById('garden-question-input').value = 'Why are my marigold leaves turning yellow?'; window.app.askGardenQuestion();">Why are my marigold leaves turning yellow?</button>
                    <button class="chip" style="font-size: 0.8rem; padding: 6px 12px;" onclick="document.getElementById('garden-question-input').value = 'How often should I water my tulsi?'; window.app.askGardenQuestion();">How often should I water my tulsi?</button>
                    <button class="chip" style="font-size: 0.8rem; padding: 6px 12px;" onclick="document.getElementById('garden-question-input').value = 'Best plants for my balcony?'; window.app.askGardenQuestion();">Best plants for my balcony?</button>
                </div>
                
                <div style="padding: 12px 16px; background: var(--bg-body); border-top: 1px solid var(--glass-border); display: flex; gap: 8px; align-items: center;">
                    <input type="text" id="garden-question-input" placeholder="Type your message..." style="flex: 1; padding: 10px 14px; border-radius: 20px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-dark); font-size: 0.9rem; outline: none;" onkeypress="if(event.key === 'Enter') window.app.askGardenQuestion()">
                    <button onclick="window.app.askGardenQuestion()" style="background: var(--primary-green); color: white; border: none; border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
            </div>
            
            <button class="btn btn-secondary mt-4" onclick="window.app.navigate('home')">Back to Home</button>
            <div style="height: 40px;"></div>
        </div>
    `;

    // Script to initialize carousel interaction
    setTimeout(() => {
        const track = document.getElementById(`${carouselId}-track`);
        const dots = document.querySelectorAll(`#${carouselId}-dots .carousel-dot`);
        const prevBtn = document.getElementById(`${carouselId}-prev`);
        const nextBtn = document.getElementById(`${carouselId}-next`);
        if (!track) return;

        // Update dots on scroll
        track.addEventListener('scroll', () => {
            const index = Math.round(track.scrollLeft / track.clientWidth);
            dots.forEach((dot, i) => {
                if (i === index) dot.classList.add('active');
                else dot.classList.remove('active');
            });
        });

        // Click dots
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
            });
        });

        // Arrows
        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
        });

        // Mouse Drag to scroll (since desktop doesn't swipe nicely natively)
        let isDown = false;
        let startX;
        let scrollLeft;

        track.addEventListener('mousedown', (e) => {
            isDown = true;
            track.style.scrollSnapType = 'none'; // Disable snap while dragging
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
        });
        track.addEventListener('mouseleave', () => {
            if(isDown) {
                isDown = false;
                track.style.scrollSnapType = 'x mandatory';
            }
        });
        track.addEventListener('mouseup', () => {
            isDown = false;
            track.style.scrollSnapType = 'x mandatory';
            // Snap to nearest
            const index = Math.round(track.scrollLeft / track.clientWidth);
            track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
        });
        track.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 2; // Scroll-fast
            track.scrollLeft = scrollLeft - walk;
        });

    }, 50);

    return html;
}

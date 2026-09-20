export function renderListItem() {
    return `
        <div class="screen" id="list-item-screen">
            <h2>List an Item</h2>
            <p class="mb-4">Donate books or uniforms to students in need.</p>
            
            <div class="camera-view" style="height: 150px; margin-bottom: 16px;">
                <div class="camera-overlay"></div>
                <span style="color: #666; font-weight: 600;">[Photo Placeholder]</span>
            </div>
            
            <div class="card mb-4">
                <label style="font-size: 13px; font-weight: 600;">Item Type</label>
                <select style="width: 100%; padding: 12px; margin-top: 4px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <option>Textbook (Grade 8)</option>
                    <option>School Uniform (Size M)</option>
                    <option>School Bag</option>
                </select>
                
                <label style="font-size: 13px; font-weight: 600; display: block; margin-top: 12px;">Condition</label>
                <select style="width: 100%; padding: 12px; margin-top: 4px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <option>Good (Gently Used)</option>
                    <option>Fair (Visible Wear)</option>
                    <option>Like New</option>
                </select>
            </div>
            
            <button class="btn" onclick="window.app.startItemMatchFlow()">Find a Match</button>
        </div>
    `;
}

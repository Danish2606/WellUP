/**
 * Personal Care Page - JavaScript
 * Handles adding, tracking, and managing personal care routines
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Load saved care items from localStorage
    loadCareItems();
    
    // ===================================
    // Form Submission Handler
    // ===================================
    const careForm = document.getElementById('careForm');
    
    if (careForm) {
        careForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const careName = document.getElementById('careName').value.trim();
            const careFrequency = document.getElementById('careFrequency').value;
            const careNotes = document.getElementById('careNotes').value.trim();
            
            if (!careName || !careFrequency) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Create care item object
            const careItem = {
                id: Date.now(),
                name: careName,
                frequency: careFrequency,
                notes: careNotes,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            // Add to list
            addCareItem(careItem);
            
            // Save to localStorage
            saveCareItems();
            
            // Show success message
            showNotification('Personal care item added successfully! ✨', 'success');
            
            // Reset form
            careForm.reset();
        });
    }
});

// ===================================
// Add Care Item to DOM
// ===================================
function addCareItem(item) {
    const careItems = document.getElementById('careItems');
    
    const careItemElement = document.createElement('div');
    careItemElement.className = 'care-item';
    careItemElement.dataset.id = item.id;
    
    if (item.completed) {
        careItemElement.classList.add('completed');
    }
    
    careItemElement.innerHTML = `
        <div class="care-item-header">
            <h5>${escapeHtml(item.name)}</h5>
            <span class="frequency-badge">${escapeHtml(item.frequency)}</span>
        </div>
        ${item.notes ? `<p class="care-notes">${escapeHtml(item.notes)}</p>` : ''}
        <div class="care-actions">
            <button class="btn-complete" onclick="toggleComplete(this)">✓ Done</button>
            <button class="btn-delete" onclick="deleteItem(this)">🗑️ Delete</button>
        </div>
    `;
    
    careItems.appendChild(careItemElement);
}

// ===================================
// Toggle Complete Status
// ===================================
function toggleComplete(button) {
    const careItem = button.closest('.care-item');
    const itemId = careItem.dataset.id;
    
    careItem.classList.toggle('completed');
    
    // Update localStorage
    const items = getCareItems();
    const item = items.find(i => i.id == itemId);
    if (item) {
        item.completed = !item.completed;
        localStorage.setItem('wellup_care_items', JSON.stringify(items));
    }
    
    // Update button text
    if (careItem.classList.contains('completed')) {
        button.textContent = '↺ Undo';
        showNotification('Great job! Keep up the good work! 🎉', 'success');
    } else {
        button.textContent = '✓ Done';
    }
}

// ===================================
// Delete Care Item
// ===================================
function deleteItem(button) {
    const careItem = button.closest('.care-item');
    const itemId = careItem.dataset.id;
    
    // Confirm deletion
    if (confirm('Are you sure you want to delete this personal care item?')) {
        // Remove from DOM with animation
        careItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        careItem.style.opacity = '0';
        careItem.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            careItem.remove();
            
            // Check if empty
            const careItems = document.getElementById('careItems');
            if (careItems.children.length === 0) {
                showEmptyState();
            }
        }, 300);
        
        // Remove from localStorage
        let items = getCareItems();
        items = items.filter(i => i.id != itemId);
        localStorage.setItem('wellup_care_items', JSON.stringify(items));
        
        showNotification('Care item deleted', 'info');
    }
}

// ===================================
// localStorage Functions
// ===================================
function getCareItems() {
    const items = localStorage.getItem('wellup_care_items');
    return items ? JSON.parse(items) : [];
}

function saveCareItems() {
    const careItems = document.getElementById('careItems');
    const items = [];
    
    careItems.querySelectorAll('.care-item').forEach(item => {
        const id = item.dataset.id;
        const name = item.querySelector('h5').textContent;
        const frequency = item.querySelector('.frequency-badge').textContent;
        const notesElement = item.querySelector('.care-notes');
        const notes = notesElement ? notesElement.textContent : '';
        const completed = item.classList.contains('completed');
        
        items.push({
            id: parseInt(id),
            name,
            frequency,
            notes,
            completed,
            createdAt: new Date().toISOString()
        });
    });
    
    localStorage.setItem('wellup_care_items', JSON.stringify(items));
}

function loadCareItems() {
    const items = getCareItems();
    const careItems = document.getElementById('careItems');
    
    // Clear existing items except sample items
    careItems.innerHTML = '';
    
    if (items.length === 0) {
        // Show sample items if no saved items
        return;
    }
    
    // Add saved items
    items.forEach(item => {
        addCareItem(item);
    });
}

// ===================================
// Show Empty State
// ===================================
function showEmptyState() {
    const careItems = document.getElementById('careItems');
    careItems.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">✨</div>
            <p>No personal care items yet. Add your first care routine above!</p>
        </div>
    `;
}

// ===================================
// Utility Functions
// ===================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===================================
// Export Data Feature
// ===================================
function exportCareRoutine() {
    const items = getCareItems();
    const dataStr = JSON.stringify(items, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wellup-personal-care-routine.json';
    link.click();
    
    showNotification('Care routine exported successfully!', 'success');
}

// ===================================
// Scroll Animations
// ===================================
const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Observe tip cards
document.querySelectorAll('.tip-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Observe quick tips
document.querySelectorAll('.quick-tip').forEach((tip, index) => {
    tip.style.opacity = '0';
    tip.style.transform = 'translateY(30px)';
    tip.style.transition = `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`;
    observer.observe(tip);
});

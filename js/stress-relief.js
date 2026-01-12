/**
 * Stress Relief Page - JavaScript
 * Handles breathing exercises, hobbies tracking, and stress relief techniques
 */

let hobbies = [];
let breathingActive = false;
let breathingInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    // Load hobbies from localStorage
    loadHobbies();
    
    // Setup event listeners
    setupEventListeners();
    
    // Render hobbies list
    renderHobbiesList();
    
    // Add notification styles
    addNotificationStyles();
});

// ===================================
// Setup Event Listeners
// ===================================
function setupEventListeners() {
    // Hobby form submission
    const hobbyForm = document.getElementById('hobbyForm');
    hobbyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveHobby();
    });
    
    // Filter buttons
    const filterTags = document.querySelectorAll('.filter-tag');
    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            filterTags.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            filterHobbies(this.dataset.filter);
        });
    });
    
    // Breathing circle click
    const breathingCircle = document.getElementById('breathingCircle');
    breathingCircle.addEventListener('click', startBreathingExercise);
}

// ===================================
// Breathing Exercise
// ===================================
function startBreathingExercise() {
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    const btn = document.getElementById('breathingBtn');
    
    if (breathingActive) {
        // Stop exercise
        stopBreathingExercise();
        return;
    }
    
    breathingActive = true;
    btn.textContent = 'Stop Exercise';
    btn.classList.add('btn-secondary');
    btn.classList.remove('btn-primary');
    
    let phase = 0; // 0 = breathe in, 1 = hold, 2 = breathe out, 3 = hold
    const phases = ['Breathe In', 'Hold', 'Breathe Out', 'Hold'];
    const durations = [4000, 2000, 4000, 2000]; // milliseconds
    
    function nextPhase() {
        if (!breathingActive) return;
        
        text.textContent = phases[phase];
        
        // Visual animation
        if (phase === 0) {
            circle.style.transform = 'scale(1.5)';
            circle.style.transition = 'transform 4s ease-in-out';
        } else if (phase === 2) {
            circle.style.transform = 'scale(1)';
            circle.style.transition = 'transform 4s ease-in-out';
        }
        
        setTimeout(() => {
            phase = (phase + 1) % 4;
            if (breathingActive) {
                nextPhase();
            }
        }, durations[phase]);
    }
    
    nextPhase();
    showNotification('Breathing exercise started. Focus on your breath. 🧘', 'info');
}

function stopBreathingExercise() {
    breathingActive = false;
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    const btn = document.getElementById('breathingBtn');
    
    circle.style.transform = 'scale(1)';
    circle.style.transition = 'transform 0.5s ease';
    text.textContent = 'Click to Start';
    btn.textContent = 'Start Exercise';
    btn.classList.remove('btn-secondary');
    btn.classList.add('btn-primary');
    
    showNotification('Great job! You completed a breathing session. ✨', 'success');
}

// ===================================
// Hobby Management
// ===================================
function saveHobby() {
    const name = document.getElementById('hobbyName').value.trim();
    const category = document.getElementById('hobbyCategory').value;
    const description = document.getElementById('hobbyDescription').value.trim();
    const duration = document.getElementById('hobbyDuration').value.trim();
    const rating = document.getElementById('hobbyRating').value;
    
    if (!name || !category) {
        showNotification('Please fill in the required fields', 'error');
        return;
    }
    
    const hobby = {
        id: Date.now(),
        name,
        category,
        description,
        duration,
        rating: rating || '0',
        usedToday: false,
        createdAt: new Date().toISOString()
    };
    
    hobbies.push(hobby);
    saveToLocalStorage();
    renderHobbiesList();
    
    // Reset form
    document.getElementById('hobbyForm').reset();
    
    showNotification('Activity added successfully! 🎉', 'success');
}

function editHobby(button) {
    const card = button.closest('.hobby-card');
    const hobbyId = parseInt(card.dataset.id);
    const hobby = hobbies.find(h => h.id === hobbyId);
    
    if (!hobby) return;
    
    // Populate form
    document.getElementById('hobbyName').value = hobby.name;
    document.getElementById('hobbyCategory').value = hobby.category;
    document.getElementById('hobbyDescription').value = hobby.description || '';
    document.getElementById('hobbyDuration').value = hobby.duration || '';
    document.getElementById('hobbyRating').value = hobby.rating || '';
    
    // Delete the old one
    hobbies = hobbies.filter(h => h.id !== hobbyId);
    saveToLocalStorage();
    renderHobbiesList();
    
    // Scroll to form
    document.querySelector('.add-hobby-form').scrollIntoView({ behavior: 'smooth' });
    
    showNotification('Edit your activity and save it again', 'info');
}

function deleteHobby(button) {
    const card = button.closest('.hobby-card');
    const hobbyId = parseInt(card.dataset.id);
    
    if (confirm('Are you sure you want to delete this activity?')) {
        hobbies = hobbies.filter(h => h.id !== hobbyId);
        saveToLocalStorage();
        
        // Animate removal
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            renderHobbiesList();
            showNotification('Activity deleted', 'info');
        }, 300);
    }
}

function markAsUsed(button) {
    const card = button.closest('.hobby-card');
    const hobbyId = parseInt(card.dataset.id);
    const hobby = hobbies.find(h => h.id === hobbyId);
    
    if (!hobby) return;
    
    hobby.usedToday = !hobby.usedToday;
    saveToLocalStorage();
    
    // Update UI
    if (hobby.usedToday) {
        card.classList.add('used-today');
        button.textContent = '✓ Done Today!';
        button.style.background = '#059669';
        showNotification('Great! Keep up the stress relief! 🌟', 'success');
    } else {
        card.classList.remove('used-today');
        button.textContent = '✓ Did This Today';
        button.style.background = '';
    }
}

// ===================================
// Render Hobbies List
// ===================================
function renderHobbiesList() {
    const container = document.getElementById('hobbiesContainer');
    
    if (hobbies.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">🧘</div>
                <p>No activities added yet. Add your first stress relief activity above!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = hobbies.map(hobby => createHobbyCard(hobby)).join('');
}

function createHobbyCard(hobby) {
    const stars = hobby.rating > 0 ? '⭐'.repeat(parseInt(hobby.rating)) : '';
    
    return `
        <div class="hobby-card ${hobby.usedToday ? 'used-today' : ''}" data-id="${hobby.id}" data-category="${hobby.category}">
            <div class="hobby-header">
                <h5>${escapeHtml(hobby.name)}</h5>
                <span class="category-badge ${hobby.category}">${capitalize(hobby.category)}</span>
            </div>
            ${hobby.description ? `<p class="hobby-description">${escapeHtml(hobby.description)}</p>` : ''}
            <div class="hobby-meta">
                ${hobby.duration ? `<span class="hobby-duration">⏱️ ${escapeHtml(hobby.duration)}</span>` : ''}
                ${stars ? `<span class="hobby-rating">${stars}</span>` : ''}
            </div>
            <div class="hobby-actions">
                <button class="btn-use" onclick="markAsUsed(this)" style="${hobby.usedToday ? 'background: #059669;' : ''}">
                    ${hobby.usedToday ? '✓ Done Today!' : '✓ Did This Today'}
                </button>
                <button class="btn-edit" onclick="editHobby(this)">✏️</button>
                <button class="btn-delete" onclick="deleteHobby(this)">🗑️</button>
            </div>
        </div>
    `;
}

// ===================================
// Filter Hobbies
// ===================================
function filterHobbies(category) {
    const cards = document.querySelectorAll('.hobby-card');
    
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// ===================================
// LocalStorage Functions
// ===================================
function saveToLocalStorage() {
    localStorage.setItem('wellup_hobbies', JSON.stringify(hobbies));
}

function loadHobbies() {
    const stored = localStorage.getItem('wellup_hobbies');
    hobbies = stored ? JSON.parse(stored) : [];
}

// ===================================
// Utility Functions
// ===================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function addNotificationStyles() {
    if (!document.getElementById('notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '0.5rem',
        color: '#fff',
        fontWeight: '600',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        zIndex: '10000',
        animation: 'slideInRight 0.3s ease',
        maxWidth: '400px'
    });
    
    // Set background color based on type
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #EF4444 0%, #EC4899 100%)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)';
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

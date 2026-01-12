/**
 * Exercise Plans - JavaScript
 * Handles exercise routine creation, scheduling, and tracking
 */

let exerciseRoutines = [];

document.addEventListener('DOMContentLoaded', function() {
    // Load routines from localStorage
    loadRoutines();
    
    // Setup event listeners
    setupEventListeners();
    
    // Render weekly schedule
    renderWeeklySchedule();
    
    // Render all routines
    renderAllRoutines();
    
    // Add notification styles
    addNotificationStyles();
});

// ===================================
// Setup Event Listeners
// ===================================
function setupEventListeners() {
    const exerciseForm = document.getElementById('exerciseForm');
    exerciseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveExerciseRoutine();
    });
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterRoutines(this.dataset.filter);
        });
    });
}

// ===================================
// Save Exercise Routine
// ===================================
function saveExerciseRoutine() {
    const name = document.getElementById('exerciseName').value.trim();
    const day = document.getElementById('exerciseDay').value;
    const time = document.getElementById('exerciseTime').value;
    const duration = parseInt(document.getElementById('exerciseDuration').value);
    const type = document.getElementById('exerciseType').value;
    const description = document.getElementById('exerciseDescription').value.trim();
    const location = document.getElementById('exerciseLocation').value.trim();
    const reminder = document.getElementById('exerciseReminder').checked;
    
    if (!name || !day || !time || !duration || !type || !description) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const routine = {
        id: Date.now(),
        name,
        day,
        time,
        duration,
        type,
        description,
        location,
        reminder,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    exerciseRoutines.push(routine);
    saveToLocalStorage();
    
    // Update UI
    renderWeeklySchedule();
    renderAllRoutines();
    
    // Reset form
    document.getElementById('exerciseForm').reset();
    
    showNotification('Exercise routine added successfully! 💪', 'success');
}

// ===================================
// Render Weekly Schedule
// ===================================
function renderWeeklySchedule() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
        const container = document.getElementById(`${day}-workouts`);
        const dayRoutines = exerciseRoutines.filter(r => r.day === day);
        
        if (dayRoutines.length === 0) {
            container.innerHTML = '<p class="no-workout">Rest Day</p>';
        } else {
            // Sort by time
            dayRoutines.sort((a, b) => a.time.localeCompare(b.time));
            
            container.innerHTML = dayRoutines.map(routine => `
                <div class="workout-item">
                    <span class="workout-time">${formatTime(routine.time)}</span>
                    <span class="workout-name">${escapeHtml(routine.name)}</span>
                </div>
            `).join('');
        }
    });
}

// ===================================
// Render All Routines
// ===================================
function renderAllRoutines() {
    const routinesList = document.getElementById('routinesList');
    const emptyState = document.getElementById('emptyState');
    
    if (exerciseRoutines.length === 0) {
        routinesList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    routinesList.style.display = 'grid';
    emptyState.style.display = 'none';
    
    routinesList.innerHTML = exerciseRoutines.map(routine => createRoutineCard(routine)).join('');
}

function createRoutineCard(routine) {
    const dayName = routine.day.charAt(0).toUpperCase() + routine.day.slice(1);
    
    return `
        <div class="routine-card" data-id="${routine.id}" data-type="${routine.type}">
            <div class="routine-header">
                <h4>${escapeHtml(routine.name)}</h4>
                <span class="type-badge ${routine.type}">${capitalize(routine.type)}</span>
            </div>
            <div class="routine-schedule">
                <span class="schedule-item">📅 ${dayName}</span>
                <span class="schedule-item">⏰ ${formatTime(routine.time)}</span>
                <span class="schedule-item">⏱️ ${routine.duration} mins</span>
            </div>
            <p class="routine-description">${escapeHtml(routine.description)}</p>
            ${routine.location ? `<p class="routine-location">📍 ${escapeHtml(routine.location)}</p>` : ''}
            <div class="routine-actions">
                <button class="btn-complete" onclick="markAsComplete(${routine.id})">✓ Mark Complete</button>
                <button class="btn-edit-routine" onclick="editRoutine(${routine.id})">✏️</button>
                <button class="btn-delete-routine" onclick="deleteRoutine(${routine.id})">🗑️</button>
            </div>
        </div>
    `;
}

// ===================================
// Mark as Complete
// ===================================
function markAsComplete(id) {
    const routine = exerciseRoutines.find(r => r.id === id);
    if (!routine) return;
    
    showNotification(`Great job completing ${routine.name}! 🎉`, 'success');
    
    // Could add completion tracking here in future
}

// ===================================
// Edit Routine
// ===================================
function editRoutine(id) {
    const routine = exerciseRoutines.find(r => r.id === id);
    if (!routine) return;
    
    // Populate form
    document.getElementById('exerciseName').value = routine.name;
    document.getElementById('exerciseDay').value = routine.day;
    document.getElementById('exerciseTime').value = routine.time;
    document.getElementById('exerciseDuration').value = routine.duration;
    document.getElementById('exerciseType').value = routine.type;
    document.getElementById('exerciseDescription').value = routine.description;
    document.getElementById('exerciseLocation').value = routine.location || '';
    document.getElementById('exerciseReminder').checked = routine.reminder;
    
    // Delete the old one
    exerciseRoutines = exerciseRoutines.filter(r => r.id !== id);
    saveToLocalStorage();
    renderWeeklySchedule();
    renderAllRoutines();
    
    // Scroll to form
    document.querySelector('.exercise-form-container').scrollIntoView({ behavior: 'smooth' });
    
    showNotification('Edit your routine and save it again', 'info');
}

// ===================================
// Delete Routine
// ===================================
function deleteRoutine(id) {
    if (confirm('Are you sure you want to delete this exercise routine?')) {
        exerciseRoutines = exerciseRoutines.filter(r => r.id !== id);
        saveToLocalStorage();
        
        renderWeeklySchedule();
        renderAllRoutines();
        
        showNotification('Exercise routine deleted', 'info');
    }
}

// ===================================
// Filter Routines
// ===================================
function filterRoutines(type) {
    const cards = document.querySelectorAll('.routine-card');
    
    cards.forEach(card => {
        if (type === 'all' || card.dataset.type === type) {
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
    localStorage.setItem('wellup_exercise_routines', JSON.stringify(exerciseRoutines));
}

function loadRoutines() {
    const stored = localStorage.getItem('wellup_exercise_routines');
    exerciseRoutines = stored ? JSON.parse(stored) : [];
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

function formatTime(time) {
    // Convert 24h to 12h format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
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
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #EF4444 0%, #EC4899 100%)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

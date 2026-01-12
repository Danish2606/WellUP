/**
 * Sleep Management - JavaScript
 * Handles sleep tracking, statistics, and visualization
 */

let sleepEntries = [];
let currentView = 'week';
let sleepGoal = 8;

document.addEventListener('DOMContentLoaded', function() {
    // Load data from localStorage
    loadSleepData();
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sleepDate').value = today;
    
    // Setup event listeners
    setupEventListeners();
    
    // Update statistics
    updateStatistics();
    
    // Render entries
    renderEntries();
    
    // Render chart
    renderChart();
    
    // Add notification styles
    addNotificationStyles();
});

// ===================================
// Setup Event Listeners
// ===================================
function setupEventListeners() {
    const sleepForm = document.getElementById('sleepForm');
    sleepForm.addEventListener('submit', function(e) {
        e.preventDefault();
        logSleep();
    });
}

// ===================================
// Log Sleep Entry
// ===================================
function logSleep() {
    const date = document.getElementById('sleepDate').value;
    const hours = parseFloat(document.getElementById('sleepHours').value);
    const bedtime = document.getElementById('bedtime').value;
    const wakeTime = document.getElementById('wakeTime').value;
    const quality = document.getElementById('sleepQuality').value;
    const notes = document.getElementById('sleepNotes').value.trim();
    
    if (!date || !hours || !quality) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (hours < 0 || hours > 24) {
        showNotification('Sleep hours must be between 0 and 24', 'error');
        return;
    }
    
    // Check if entry already exists for this date
    const existingIndex = sleepEntries.findIndex(e => e.date === date);
    
    const entry = {
        id: existingIndex >= 0 ? sleepEntries[existingIndex].id : Date.now(),
        date,
        hours,
        bedtime,
        wakeTime,
        quality: parseInt(quality),
        notes,
        createdAt: existingIndex >= 0 ? sleepEntries[existingIndex].createdAt : new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
        sleepEntries[existingIndex] = entry;
        showNotification('Sleep entry updated! 💤', 'success');
    } else {
        sleepEntries.push(entry);
        showNotification('Sleep logged successfully! 😴', 'success');
    }
    
    // Save to localStorage
    saveSleepData();
    
    // Update UI
    updateStatistics();
    renderEntries();
    renderChart();
    
    // Reset form
    document.getElementById('sleepForm').reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sleepDate').value = today;
}

// ===================================
// Update Statistics
// ===================================
function updateStatistics() {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = sleepEntries.find(e => e.date === today);
    
    // Today's sleep
    document.getElementById('todaySleep').textContent = 
        todayEntry ? `${todayEntry.hours}h` : '0h';
    
    // Weekly average
    const weekAvg = calculateAverage(7);
    document.getElementById('weekAverage').textContent = 
        weekAvg > 0 ? `${weekAvg}h` : '0h';
    
    // Monthly average
    const monthAvg = calculateAverage(30);
    document.getElementById('monthAverage').textContent = 
        monthAvg > 0 ? `${monthAvg}h` : '0h';
    
    // Goal
    document.getElementById('sleepGoal').textContent = `${sleepGoal}h`;
}

function calculateAverage(days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentEntries = sleepEntries.filter(e => {
        const entryDate = new Date(e.date);
        return entryDate >= cutoffDate;
    });
    
    if (recentEntries.length === 0) return 0;
    
    const total = recentEntries.reduce((sum, entry) => sum + entry.hours, 0);
    return (total / recentEntries.length).toFixed(1);
}

// ===================================
// Render Entries
// ===================================
function renderEntries() {
    const entriesList = document.getElementById('entriesList');
    const emptyState = document.getElementById('emptyState');
    
    if (sleepEntries.length === 0) {
        entriesList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    entriesList.style.display = 'flex';
    emptyState.style.display = 'none';
    
    // Sort by date descending
    const sortedEntries = [...sleepEntries].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    // Show last 10 entries
    const displayEntries = sortedEntries.slice(0, 10);
    
    entriesList.innerHTML = displayEntries.map(entry => createEntryCard(entry)).join('');
}

function createEntryCard(entry) {
    const date = new Date(entry.date);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const dayName = date.toLocaleString('en-US', { weekday: 'long' });
    
    const qualityText = ['', 'Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'];
    const qualityClass = ['', 'poor', 'poor', 'fair', 'good', 'excellent'];
    
    return `
        <div class="entry-card" data-id="${entry.id}">
            <div class="entry-date">
                <span class="entry-day">${day}</span>
                <span class="entry-month">${month}</span>
            </div>
            <div class="entry-details">
                <h5>${dayName} - ${entry.hours} hours of sleep</h5>
                <div class="entry-meta">
                    ${entry.bedtime ? `<span class="entry-info">🛏️ ${entry.bedtime}</span>` : ''}
                    ${entry.wakeTime ? `<span class="entry-info">⏰ ${entry.wakeTime}</span>` : ''}
                    <span class="quality-badge quality-${qualityClass[entry.quality]}">${qualityText[entry.quality]}</span>
                </div>
                ${entry.notes ? `<p class="entry-notes">"${escapeHtml(entry.notes)}"</p>` : ''}
            </div>
            <div class="entry-actions">
                <button class="btn-delete-entry" onclick="deleteEntry(${entry.id})">🗑️ Delete</button>
            </div>
        </div>
    `;
}

// ===================================
// Delete Entry
// ===================================
function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this sleep entry?')) {
        sleepEntries = sleepEntries.filter(e => e.id !== id);
        saveSleepData();
        
        updateStatistics();
        renderEntries();
        renderChart();
        
        showNotification('Sleep entry deleted', 'info');
    }
}

// ===================================
// Chart Visualization
// ===================================
function renderChart() {
    const chartContainer = document.querySelector('.chart-container');
    
    if (sleepEntries.length === 0) {
        chartContainer.innerHTML = `
            <div class="chart-placeholder">
                <div class="chart-placeholder-icon">📊</div>
                <p>No data to display yet. Start logging your sleep!</p>
            </div>
        `;
        return;
    }
    
    // Get data for current view
    const days = currentView === 'week' ? 7 : 30;
    const chartData = getChartData(days);
    
    // Simple bar chart visualization
    chartContainer.innerHTML = createBarChart(chartData);
}

function getChartData(days) {
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const entry = sleepEntries.find(e => e.date === dateStr);
        
        data.push({
            date: dateStr,
            label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            hours: entry ? entry.hours : 0
        });
    }
    
    return data;
}

function createBarChart(data) {
    const maxHours = Math.max(12, ...data.map(d => d.hours));
    
    let html = '<div style="padding: 20px;">';
    html += '<div style="display: flex; align-items: flex-end; justify-content: space-around; height: 250px; gap: 5px;">';
    
    data.forEach(item => {
        const height = (item.hours / maxHours) * 100;
        const color = item.hours >= sleepGoal ? '#10B981' : 
                     item.hours >= sleepGoal - 1 ? '#FBBF24' : '#EF4444';
        
        html += `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end;">
                <div style="
                    width: 100%;
                    height: ${height}%;
                    background: ${color};
                    border-radius: 4px 4px 0 0;
                    position: relative;
                    min-height: ${item.hours > 0 ? '20px' : '0'};
                    transition: all 0.3s ease;
                " title="${item.label}: ${item.hours}h">
                    ${item.hours > 0 ? `<span style="
                        position: absolute;
                        top: -20px;
                        left: 50%;
                        transform: translateX(-50%);
                        font-size: 0.75rem;
                        font-weight: 600;
                        color: #374151;
                    ">${item.hours}h</span>` : ''}
                </div>
                <div style="
                    font-size: 0.7rem;
                    color: #6B7280;
                    margin-top: 8px;
                    text-align: center;
                    transform: rotate(-45deg);
                    white-space: nowrap;
                ">${item.label}</div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // Goal line
    const goalPercent = (sleepGoal / maxHours) * 100;
    html += `
        <div style="
            position: relative;
            border-top: 2px dashed #8B5CF6;
            margin-top: -${goalPercent}%;
            pointer-events: none;
        ">
            <span style="
                position: absolute;
                right: 0;
                top: -10px;
                background: #8B5CF6;
                color: white;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: 600;
            ">Goal: ${sleepGoal}h</span>
        </div>
    `;
    
    html += '</div>';
    return html;
}

// ===================================
// Switch View
// ===================================
function switchView(view) {
    currentView = view;
    
    // Update button states
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        }
    });
    
    renderChart();
}

// ===================================
// Update Goal
// ===================================
function updateGoal() {
    const goalInput = document.getElementById('goalHours');
    const newGoal = parseFloat(goalInput.value);
    
    if (newGoal < 4 || newGoal > 12) {
        showNotification('Please set a goal between 4 and 12 hours', 'error');
        return;
    }
    
    sleepGoal = newGoal;
    localStorage.setItem('wellup_sleep_goal', sleepGoal);
    
    updateStatistics();
    renderChart();
    
    showNotification(`Sleep goal updated to ${sleepGoal} hours! 🎯`, 'success');
}

// ===================================
// LocalStorage Functions
// ===================================
function saveSleepData() {
    localStorage.setItem('wellup_sleep_entries', JSON.stringify(sleepEntries));
}

function loadSleepData() {
    const stored = localStorage.getItem('wellup_sleep_entries');
    sleepEntries = stored ? JSON.parse(stored) : [];
    
    const storedGoal = localStorage.getItem('wellup_sleep_goal');
    if (storedGoal) {
        sleepGoal = parseFloat(storedGoal);
        document.getElementById('goalHours').value = sleepGoal;
    }
}

// ===================================
// Utility Functions
// ===================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

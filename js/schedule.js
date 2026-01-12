/**
 * Schedule Optimizer - JavaScript
 * Handles calendar functionality and event management
 */

let currentDate = new Date();
let selectedDate = null;
let events = [];
let editingEventId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Load events from localStorage
    loadEvents();
    
    // Initialize calendar
    renderCalendar();
    
    // Setup event listeners
    setupEventListeners();
    
    // Render events list
    renderEventsList();
    
    // Add notification styles if not present
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
});

// ===================================
// Setup Event Listeners
// ===================================
function setupEventListeners() {
    // Calendar navigation
    document.getElementById('prevMonth').addEventListener('click', previousMonth);
    document.getElementById('nextMonth').addEventListener('click', nextMonth);
    
    // Event form submission
    const eventForm = document.getElementById('eventForm');
    eventForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveEvent();
    });
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterEvents(this.dataset.filter);
        });
    });
    
    // Close modal on outside click
    const modal = document.getElementById('eventModal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeEventModal();
        }
    });
}

// ===================================
// Calendar Functions
// ===================================
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    // Previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = createDayElement(day, true, year, month - 1);
        calendarDays.appendChild(dayElement);
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createDayElement(day, false, year, month);
        calendarDays.appendChild(dayElement);
    }
    
    // Next month's days
    const totalCells = calendarDays.children.length;
    const remainingCells = 42 - totalCells; // 6 rows x 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, true, year, month + 1);
        calendarDays.appendChild(dayElement);
    }
}

function createDayElement(day, isOtherMonth, year, month) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    dayElement.dataset.date = dateStr;
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    // Check if today
    const today = new Date();
    if (year === today.getFullYear() && 
        month === today.getMonth() && 
        day === today.getDate() && 
        !isOtherMonth) {
        dayElement.classList.add('today');
    }
    
    // Check if has events
    if (hasEventOnDate(dateStr)) {
        dayElement.classList.add('has-event');
    }
    
    // Click event
    dayElement.addEventListener('click', function() {
        selectDate(dateStr);
    });
    
    return dayElement;
}

function hasEventOnDate(dateStr) {
    return events.some(event => event.date === dateStr);
}

function selectDate(dateStr) {
    selectedDate = dateStr;
    
    // Update UI
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('selected');
        if (day.dataset.date === dateStr) {
            day.classList.add('selected');
        }
    });
    
    // Open add event modal with selected date
    showAddEventModal(dateStr);
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

function goToToday() {
    currentDate = new Date();
    renderCalendar();
}

// ===================================
// Event Management
// ===================================
function showAddEventModal(date = null) {
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');
    
    // Reset form
    form.reset();
    editingEventId = null;
    
    // Set title
    document.getElementById('modalTitle').textContent = 'Add New Event';
    
    // Set date if provided
    if (date) {
        document.getElementById('eventDate').value = date;
    } else if (selectedDate) {
        document.getElementById('eventDate').value = selectedDate;
    } else {
        // Set to today
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        document.getElementById('eventDate').value = dateStr;
    }
    
    modal.classList.add('active');
}

function closeEventModal() {
    const modal = document.getElementById('eventModal');
    modal.classList.remove('active');
    editingEventId = null;
}

function saveEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const description = document.getElementById('eventDescription').value.trim();
    const category = document.getElementById('eventCategory').value;
    const priority = document.getElementById('eventPriority').value;
    
    if (!title || !date || !category || !priority) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const event = {
        id: editingEventId || Date.now(),
        title,
        date,
        time,
        description,
        category,
        priority,
        createdAt: editingEventId ? events.find(e => e.id === editingEventId).createdAt : new Date().toISOString()
    };
    
    if (editingEventId) {
        // Update existing event
        const index = events.findIndex(e => e.id === editingEventId);
        events[index] = event;
        showNotification('Event updated successfully! ✅', 'success');
    } else {
        // Add new event
        events.push(event);
        showNotification('Event added successfully! 🎉', 'success');
    }
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Re-render
    renderCalendar();
    renderEventsList();
    
    // Close modal
    closeEventModal();
}

function editEvent(button) {
    const eventCard = button.closest('.event-card');
    const eventId = parseInt(eventCard.dataset.id);
    const event = events.find(e => e.id === eventId);
    
    if (!event) return;
    
    // Populate form
    editingEventId = eventId;
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventTime').value = event.time || '';
    document.getElementById('eventDescription').value = event.description || '';
    document.getElementById('eventCategory').value = event.category;
    document.getElementById('eventPriority').value = event.priority;
    
    // Update modal title
    document.getElementById('modalTitle').textContent = 'Edit Event';
    
    // Show modal
    document.getElementById('eventModal').classList.add('active');
}

function deleteEvent(button) {
    const eventCard = button.closest('.event-card');
    const eventId = parseInt(eventCard.dataset.id);
    
    if (confirm('Are you sure you want to delete this event?')) {
        events = events.filter(e => e.id !== eventId);
        saveToLocalStorage();
        
        // Animate removal
        eventCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        eventCard.style.opacity = '0';
        eventCard.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            renderCalendar();
            renderEventsList();
            showNotification('Event deleted', 'info');
        }, 300);
    }
}

// ===================================
// Render Events List
// ===================================
function renderEventsList() {
    const eventsList = document.getElementById('eventsList');
    const emptyState = document.getElementById('emptyState');
    
    if (events.length === 0) {
        eventsList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    eventsList.style.display = 'flex';
    emptyState.style.display = 'none';
    
    // Sort events by date
    const sortedEvents = [...events].sort((a, b) => {
        const dateA = new Date(a.date + (a.time ? 'T' + a.time : ''));
        const dateB = new Date(b.date + (b.time ? 'T' + b.time : ''));
        return dateA - dateB;
    });
    
    eventsList.innerHTML = sortedEvents.map(event => createEventCard(event)).join('');
}

function createEventCard(event) {
    const date = new Date(event.date);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    
    return `
        <div class="event-card" data-id="${event.id}" data-category="${event.category}">
            <div class="event-date">
                <span class="day">${day}</span>
                <span class="month">${month}</span>
            </div>
            <div class="event-details">
                <h4>${escapeHtml(event.title)}</h4>
                ${event.description ? `<p>${escapeHtml(event.description)}</p>` : ''}
                <div class="event-meta">
                    <span class="event-type ${event.category}">${capitalize(event.category)}</span>
                    <span class="event-priority ${event.priority}">${capitalize(event.priority)} Priority</span>
                    ${event.time ? `<span style="color: var(--gray); font-size: 0.875rem;">⏰ ${event.time}</span>` : ''}
                </div>
            </div>
            <div class="event-actions">
                <button class="btn-edit" onclick="editEvent(this)">✏️</button>
                <button class="btn-delete" onclick="deleteEvent(this)">🗑️</button>
            </div>
        </div>
    `;
}

// ===================================
// Filter Events
// ===================================
function filterEvents(category) {
    const eventCards = document.querySelectorAll('.event-card');
    
    eventCards.forEach(card => {
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
    localStorage.setItem('wellup_events', JSON.stringify(events));
}

function loadEvents() {
    const stored = localStorage.getItem('wellup_events');
    events = stored ? JSON.parse(stored) : [];
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

// ===================================
// Export/Import Functions (Future Enhancement)
// ===================================
function exportEvents() {
    const dataStr = JSON.stringify(events, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wellup-schedule.json';
    link.click();
    
    showNotification('Schedule exported successfully!', 'success');
}

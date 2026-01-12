/**
 * Nutrition Tracking - JavaScript
 * Handles meal logging, calorie estimation, and nutrition tracking
 */

let meals = [];
let dailyGoal = 2000;
let waterIntake = [];
let waterGoal = 8;

// Common food calorie estimates (per serving/portion)
const calorieDatabase = {
    // Breakfast items
    'bread': { small: 70, medium: 140, large: 210 },
    'toast': { small: 70, medium: 140, large: 210 },
    'egg': { small: 70, medium: 90, large: 120 },
    'cereal': { small: 110, medium: 220, large: 330 },
    'oatmeal': { small: 150, medium: 300, large: 450 },
    'pancake': { small: 90, medium: 180, large: 270 },
    'waffle': { small: 100, medium: 200, large: 300 },
    'yogurt': { small: 80, medium: 150, large: 220 },
    
    // Asian breakfast
    'nasi lemak': { small: 400, medium: 600, large: 800 },
    'roti prata': { small: 150, medium: 300, large: 450 },
    'kaya toast': { small: 200, medium: 300, large: 400 },
    'dim sum': { small: 50, medium: 100, large: 150 },
    'congee': { small: 100, medium: 200, large: 300 },
    
    // Rice dishes
    'rice': { small: 150, medium: 250, large: 350 },
    'chicken rice': { small: 400, medium: 600, large: 800 },
    'fried rice': { small: 450, medium: 650, large: 850 },
    'biryani': { small: 400, medium: 600, large: 800 },
    'nasi goreng': { small: 450, medium: 650, large: 850 },
    
    // Noodles
    'noodles': { small: 200, medium: 350, large: 500 },
    'pasta': { small: 200, medium: 350, large: 500 },
    'laksa': { small: 350, medium: 500, large: 650 },
    'mee goreng': { small: 400, medium: 550, large: 700 },
    'hokkien mee': { small: 400, medium: 550, large: 700 },
    'char kway teow': { small: 450, medium: 650, large: 850 },
    
    // Proteins
    'chicken': { small: 150, medium: 250, large: 350 },
    'beef': { small: 200, medium: 300, large: 400 },
    'pork': { small: 180, medium: 280, large: 380 },
    'fish': { small: 120, medium: 200, large: 280 },
    'tofu': { small: 70, medium: 140, large: 210 },
    
    // Fast food
    'burger': { small: 250, medium: 450, large: 650 },
    'pizza': { small: 200, medium: 300, large: 400 },
    'fries': { small: 220, medium: 350, large: 480 },
    'sandwich': { small: 250, medium: 400, large: 550 },
    
    // Snacks
    'chips': { small: 150, medium: 250, large: 350 },
    'cookie': { small: 50, medium: 100, large: 150 },
    'candy': { small: 50, medium: 100, large: 150 },
    'chocolate': { small: 100, medium: 200, large: 300 },
    'nuts': { small: 100, medium: 200, large: 300 },
    'granola': { small: 100, medium: 200, large: 300 },
    
    // Fruits
    'apple': { small: 50, medium: 95, large: 140 },
    'banana': { small: 70, medium: 105, large: 140 },
    'orange': { small: 45, medium: 80, large: 115 },
    'fruit': { small: 50, medium: 80, large: 110 },
    
    // Beverages
    'milk': { small: 60, medium: 120, large: 180 },
    'juice': { small: 60, medium: 120, large: 180 },
    'soda': { small: 100, medium: 150, large: 200 },
    'coffee': { small: 5, medium: 10, large: 15 },
    'tea': { small: 2, medium: 5, large: 8 },
    
    // Defaults
    'meal': { small: 300, medium: 500, large: 700 },
    'snack': { small: 100, medium: 150, large: 200 }
};

document.addEventListener('DOMContentLoaded', function() {
    // Load data from localStorage
    loadMeals();
    loadDailyGoal();
    loadWaterIntake();
    
    // Setup event listeners
    setupEventListeners();
    
    // Render UI
    updateDashboard();
    renderTodaysMeals();
    renderHistoryChart();
    updateWaterDisplay();
    
    // Add notification styles
    addNotificationStyles();
});

// ===================================
// Setup Event Listeners
// ===================================
function setupEventListeners() {
    const mealForm = document.getElementById('mealForm');
    mealForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveMeal();
    });
    
    const setGoalBtn = document.getElementById('setGoalBtn');
    setGoalBtn.addEventListener('click', openGoalModal);
    
    const modal = document.getElementById('goalModal');
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', closeGoalModal);
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeGoalModal();
        }
    });
    
    const goalForm = document.getElementById('goalForm');
    goalForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveDailyGoal();
    });
    
    // Set current time as default
    const now = new Date();
    const timeInput = document.getElementById('mealTime');
    timeInput.value = now.toTimeString().slice(0, 5);
}

// ===================================
// Save Meal
// ===================================
function saveMeal() {
    const mealType = document.getElementById('mealType').value;
    const time = document.getElementById('mealTime').value;
    const foodItems = document.getElementById('foodItems').value.trim();
    const portionSize = document.getElementById('portionSize').value;
    const manualCalories = document.getElementById('manualCalories').value;
    const notes = document.getElementById('mealNotes').value.trim();
    
    if (!mealType || !time || !foodItems || !portionSize) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Estimate calories
    let calories;
    if (manualCalories && manualCalories > 0) {
        calories = parseInt(manualCalories);
    } else {
        calories = estimateCalories(foodItems, portionSize);
    }
    
    const meal = {
        id: Date.now(),
        type: mealType,
        time: time,
        description: foodItems,
        portion: portionSize,
        calories: calories,
        notes: notes,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString()
    };
    
    meals.push(meal);
    saveToLocalStorage();
    
    // Update UI
    updateDashboard();
    renderTodaysMeals();
    renderHistoryChart();
    
    // Reset form
    document.getElementById('mealForm').reset();
    const now = new Date();
    document.getElementById('mealTime').value = now.toTimeString().slice(0, 5);
    
    showNotification(`Meal logged! Estimated ${calories} calories 🍽️`, 'success');
}

// ===================================
// Estimate Calories
// ===================================
function estimateCalories(foodText, portion) {
    const lowerText = foodText.toLowerCase();
    let totalCalories = 0;
    let foundMatches = 0;
    
    // Check for each food in our database
    for (const [food, calories] of Object.entries(calorieDatabase)) {
        if (lowerText.includes(food)) {
            totalCalories += calories[portion];
            foundMatches++;
        }
    }
    
    // If no matches found, use default meal/snack estimate
    if (foundMatches === 0) {
        totalCalories = calorieDatabase['meal'][portion];
    }
    
    // Add modifier for certain keywords
    if (lowerText.includes('fried') || lowerText.includes('deep fried')) {
        totalCalories *= 1.3;
    }
    if (lowerText.includes('grilled') || lowerText.includes('steamed')) {
        totalCalories *= 0.9;
    }
    if (lowerText.includes('oil') || lowerText.includes('butter')) {
        totalCalories += 100;
    }
    if (lowerText.includes('salad') && lowerText.includes('dressing')) {
        totalCalories += 150;
    }
    
    // Round to nearest 10
    return Math.round(totalCalories / 10) * 10;
}

// ===================================
// Update Dashboard
// ===================================
function updateDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const todaysMeals = meals.filter(m => m.date === today);
    
    const totalCalories = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const mealsCount = todaysMeals.length;
    const remaining = dailyGoal - totalCalories;
    const percentage = Math.min((totalCalories / dailyGoal) * 100, 100);
    
    document.getElementById('totalCalories').textContent = totalCalories;
    document.getElementById('mealsCount').textContent = mealsCount;
    document.getElementById('dailyGoal').textContent = dailyGoal;
    document.getElementById('remainingCalories').textContent = remaining > 0 ? remaining : 0;
    document.getElementById('progressPercent').textContent = Math.round(percentage) + '%';
    
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = percentage + '%';
    
    if (totalCalories > dailyGoal) {
        progressFill.classList.add('over-goal');
        document.getElementById('remainingCalories').style.color = '#EF4444';
    } else {
        progressFill.classList.remove('over-goal');
        document.getElementById('remainingCalories').style.color = '#10B981';
    }
}

// ===================================
// Render Today's Meals
// ===================================
function renderTodaysMeals() {
    const today = new Date().toISOString().split('T')[0];
    const todaysMeals = meals.filter(m => m.date === today);
    
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    
    mealTypes.forEach(type => {
        const container = document.getElementById(`${type}Meals`);
        const typeMeals = todaysMeals.filter(m => m.type === type);
        
        if (typeMeals.length === 0) {
            container.innerHTML = `<p class="no-meals">No ${type} logged yet</p>`;
        } else {
            container.innerHTML = typeMeals.map(meal => createMealCard(meal)).join('');
        }
    });
}

function createMealCard(meal) {
    return `
        <div class="meal-entry" data-id="${meal.id}">
            <div class="meal-info">
                <div class="meal-header-row">
                    <span class="meal-time">${formatTime(meal.time)}</span>
                    <span class="meal-portion">${meal.portion}</span>
                </div>
                <p class="meal-description">${escapeHtml(meal.description)}</p>
                ${meal.notes ? `<p class="meal-notes">📝 ${escapeHtml(meal.notes)}</p>` : ''}
            </div>
            <div class="meal-calories">
                <div class="calories-amount">${meal.calories}</div>
                <div class="calories-label">kcal</div>
                <div class="meal-actions">
                    <button class="btn-delete-meal" onclick="deleteMeal(${meal.id})">🗑️</button>
                </div>
            </div>
        </div>
    `;
}

// ===================================
// Delete Meal
// ===================================
function deleteMeal(id) {
    if (confirm('Delete this meal entry?')) {
        meals = meals.filter(m => m.id !== id);
        saveToLocalStorage();
        
        updateDashboard();
        renderTodaysMeals();
        renderHistoryChart();
        
        showNotification('Meal deleted', 'info');
    }
}

// ===================================
// Render History Chart
// ===================================
function renderHistoryChart() {
    const chartContainer = document.getElementById('historyChart');
    const last7Days = getLast7Days();
    
    let maxCalories = dailyGoal * 1.2; // Set max to 120% of goal for scaling
    
    // Calculate calories for each day
    const dailyData = last7Days.map(date => {
        const dayMeals = meals.filter(m => m.date === date);
        const total = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
        maxCalories = Math.max(maxCalories, total);
        return { date, total };
    });
    
    const chartHTML = `
        <div class="chart-bars">
            ${dailyData.map(day => {
                const height = (day.total / maxCalories) * 100;
                const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                return `
                    <div class="chart-bar-container">
                        <div class="chart-bar" style="height: ${height}%">
                            ${day.total > 0 ? `<span class="chart-bar-value">${day.total}</span>` : ''}
                        </div>
                        <div class="chart-bar-label">${dayName}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    chartContainer.innerHTML = chartHTML;
}

function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }
    return days;
}

// ===================================
// Goal Modal Functions
// ===================================
function openGoalModal() {
    const modal = document.getElementById('goalModal');
    document.getElementById('goalCalories').value = dailyGoal;
    modal.classList.add('show');
}

function closeGoalModal() {
    const modal = document.getElementById('goalModal');
    modal.classList.remove('show');
}

function saveDailyGoal() {
    const newGoal = parseInt(document.getElementById('goalCalories').value);
    
    if (newGoal < 1000 || newGoal > 5000) {
        showNotification('Please enter a goal between 1000 and 5000 calories', 'error');
        return;
    }
    
    dailyGoal = newGoal;
    localStorage.setItem('wellup_daily_goal', dailyGoal);
    
    updateDashboard();
    renderHistoryChart();
    closeGoalModal();
    
    showNotification(`Daily goal updated to ${dailyGoal} kcal 🎯`, 'success');
}

// ===================================
// LocalStorage Functions
// ===================================
function saveToLocalStorage() {
    localStorage.setItem('wellup_meals', JSON.stringify(meals));
}

function loadMeals() {
    const stored = localStorage.getItem('wellup_meals');
    meals = stored ? JSON.parse(stored) : [];
}

function loadDailyGoal() {
    const stored = localStorage.getItem('wellup_daily_goal');
    dailyGoal = stored ? parseInt(stored) : 2000;
}

// ===================================
// Water Intake Functions
// ===================================
function toggleGlass(glassNumber) {
    const today = new Date().toISOString().split('T')[0];
    const todayWater = waterIntake.filter(w => w.date === today);
    
    const glass = document.querySelector(`.glass[data-glass="${glassNumber}"]`);
    
    if (glass.classList.contains('filled')) {
        // Remove this glass
        const index = todayWater.findIndex(w => w.glass === glassNumber);
        if (index > -1) {
            const globalIndex = waterIntake.findIndex(w => w.date === today && w.glass === glassNumber);
            waterIntake.splice(globalIndex, 1);
        }
        glass.classList.remove('filled');
    } else {
        // Add this glass
        waterIntake.push({
            glass: glassNumber,
            date: today,
            timestamp: new Date().toISOString()
        });
        glass.classList.add('filled');
    }
    
    saveWaterToLocalStorage();
    updateWaterDisplay();
    
    // Check if goal reached
    const currentCount = waterIntake.filter(w => w.date === today).length;
    if (currentCount === waterGoal) {
        showNotification('🎉 Great job! You\'ve reached your water goal for today!', 'success');
    }
}

function addGlass() {
    const today = new Date().toISOString().split('T')[0];
    const todayWater = waterIntake.filter(w => w.date === today);
    
    // Find the first unfilled glass
    for (let i = 1; i <= 8; i++) {
        const glass = document.querySelector(`.glass[data-glass="${i}"]`);
        if (!glass.classList.contains('filled')) {
            toggleGlass(i);
            return;
        }
    }
    
    showNotification('All glasses are already filled! 💧', 'info');
}

function resetWater() {
    if (confirm('Reset today\'s water intake?')) {
        const today = new Date().toISOString().split('T')[0];
        waterIntake = waterIntake.filter(w => w.date !== today);
        saveWaterToLocalStorage();
        updateWaterDisplay();
        showNotification('Water intake reset', 'info');
    }
}

function updateWaterDisplay() {
    const today = new Date().toISOString().split('T')[0];
    const todayWater = waterIntake.filter(w => w.date === today);
    
    // Update count
    document.getElementById('waterCount').textContent = todayWater.length;
    document.getElementById('waterGoal').textContent = waterGoal;
    
    // Update glass visuals
    for (let i = 1; i <= 8; i++) {
        const glass = document.querySelector(`.glass[data-glass="${i}"]`);
        if (todayWater.some(w => w.glass === i)) {
            glass.classList.add('filled');
        } else {
            glass.classList.remove('filled');
        }
    }
}

function saveWaterToLocalStorage() {
    localStorage.setItem('wellup_water_intake', JSON.stringify(waterIntake));
}

function loadWaterIntake() {
    const stored = localStorage.getItem('wellup_water_intake');
    waterIntake = stored ? JSON.parse(stored) : [];
}

// ===================================
// Utility Functions
// ===================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(time) {
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

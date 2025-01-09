let timeLeft;
let timerId = null;
let isWorkTime = true;

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const modeText = document.getElementById('mode-text');
const toggleButton = document.getElementById('toggle-mode');
const settingsButton = document.getElementById('settings');
const settingsModal = document.getElementById('settings-modal');
const saveSettingsButton = document.getElementById('save-settings');
const workTimeInput = document.getElementById('work-time');
const volumeSlider = document.getElementById('volume');
const volumeValue = document.getElementById('volume-value');

let WORK_TIME = 25 * 60; // Now it can be modified
const BREAK_TIME = 5 * 60; // 5 minutes in seconds
const NOTIFICATION_DURATION = 3000; // How long the visual notification shows (3 seconds)
let notificationVolume = 1.0;

// Use the reliable notification sound we know works
const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    // Format the time with leading zeros
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    
    // Update display
    minutesDisplay.textContent = formattedMinutes;
    secondsDisplay.textContent = formattedSeconds;
    
    // Update page title
    document.title = `${formattedMinutes}:${formattedSeconds} Left`;
}

function switchMode(isManualToggle = false) {
    isWorkTime = !isWorkTime;
    timeLeft = isWorkTime ? WORK_TIME : BREAK_TIME;
    modeText.textContent = isWorkTime ? 'Work Time' : 'Break Time';
    
    // Only reset the timer if it's a manual toggle
    if (isManualToggle) {
        clearInterval(timerId);
        timerId = null;
        startButton.disabled = false;
    }
    
    updateDisplay();
}

// Simplified notification function with double sound
function createNotification() {
    const playSound = async () => {
        const audio = new Audio(NOTIFICATION_SOUND);
        audio.volume = notificationVolume;
        
        try {
            // Play first time
            await audio.play();
            
            // Wait 500ms
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Play second time
            const secondAudio = new Audio(NOTIFICATION_SOUND);
            secondAudio.volume = notificationVolume;
            await secondAudio.play();
            
            console.log('Notification sounds played successfully');
        } catch (err) {
            console.error('Notification sound failed:', err);
        }
    };
    
    // Play the double notification
    playSound();
    
    // Create visual notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = `${isWorkTime ? 'Work' : 'Break'} time is up!`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, NOTIFICATION_DURATION);
}

function startTimer() {
    if (timerId === null) {
        if (timeLeft === undefined) {
            timeLeft = WORK_TIME;
        }
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();
            
            if (timeLeft === 0) {
                clearInterval(timerId);
                timerId = null;
                startButton.disabled = false;
                createNotification();
            }
        }, 1000);
        startButton.disabled = true;
    }
}

function pauseTimer() {
    clearInterval(timerId);
    timerId = null;
    startButton.disabled = false;
}

function resetTimer() {
    clearInterval(timerId);
    timerId = null;
    isWorkTime = true;
    timeLeft = WORK_TIME;
    modeText.textContent = 'Work Time';
    updateDisplay();
    startButton.disabled = false;
}

function openSettings() {
    settingsModal.classList.add('show');
    workTimeInput.value = Math.floor(WORK_TIME / 60);
    volumeSlider.value = notificationVolume * 100;
    updateVolumeDisplay();
}

function closeSettings() {
    settingsModal.classList.remove('show');
}

function saveSettings() {
    const newWorkTime = parseInt(workTimeInput.value);
    if (newWorkTime && newWorkTime > 0 && newWorkTime <= 120) {
        WORK_TIME = newWorkTime * 60;
        if (isWorkTime) {
            timeLeft = WORK_TIME;
            updateDisplay();
        }
    }
    notificationVolume = volumeSlider.value / 100;
    closeSettings();
}

function updateVolumeDisplay() {
    volumeValue.textContent = `${volumeSlider.value}%`;
}

// Simplified volume test function
function playVolumeTestSound() {
    const audio = new Audio(NOTIFICATION_SOUND);
    audio.volume = volumeSlider.value / 100;
    
    // Simple play with error logging
    audio.play()
        .then(() => console.log('Test sound played successfully'))
        .catch(err => console.error('Test sound failed:', err));
}

// Debounced volume slider event listener
let volumeTestTimeout;
volumeSlider.addEventListener('input', () => {
    updateVolumeDisplay();
    
    // Clear previous timeout
    clearTimeout(volumeTestTimeout);
    
    // Set new timeout
    volumeTestTimeout = setTimeout(playVolumeTestSound, 200);
});

// Just keep these event listeners
startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);
toggleButton.addEventListener('click', () => switchMode(true));
settingsButton.addEventListener('click', openSettings);
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        closeSettings();
    }
});
saveSettingsButton.addEventListener('click', saveSettings);

// Initialize the display
resetTimer(); 
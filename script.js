/* ========================================
   DOM ELEMENTS AND CONSTANTS
   ======================================== */

const scheduleContainer = document.getElementById('scheduleContainer');
const statusDiv = document.getElementById('status');
const currentScheduleDisplay = document.getElementById('currentSchedule');
const scheduleSelect = document.getElementById('scheduleSelect');

const scheduleFiles = {
    '1': 'SridarSchedule.json',
    '2': 'AadarshSchedule.json',
    '3': 'ChangSchedule.json',
    '4': 'HankSchedule.json'
};

const scheduleNames = {
    'SridarSchedule.json': 'Sridar',
    'AadarshSchedule.json': 'Aadarsh',
    'ChangSchedule.json': 'Chang',
    'HankSchedule.json': 'Hank'
};

/* ========================================
   MAIN FUNCTION - ASYNC SCHEDULE LOADER
   ======================================== */

async function loadSchedule(fileName) {
    try {
        statusDiv.innerHTML = `<div class="alert alert-info"><div class="loading-spinner"></div>Loading schedule...</div>`;
        scheduleContainer.innerHTML = "";

        const response = await fetch(`./json/${fileName}`);

        if (!response.ok) {
            throw new Error(`Failed to load schedule: ${response.status}`);
        }

        const scheduleData = await response.json();

        scheduleData.sort((a, b) => a.period - b.period);

        statusDiv.innerHTML = "";
        currentScheduleDisplay.textContent = `${scheduleNames[fileName]}'s Schedule`;

        scheduleData.forEach((classItem, index) => {
            const cardHTML = `
                <div class="schedule-card" style="animation-delay: ${index * 0.1}s">
                    <div class="period-badge">
                        ${classItem.period}
                    </div>
                    <div class="class-name">
                        ${classItem.className}
                    </div>
                    <div class="class-info">
                        ${classItem.teacher}
                    </div>
                    <div class="class-info">
                        Room ${classItem.roomNumber}
                    </div>
                    <span class="subject-badge">${classItem.subjectArea}</span>
                </div>
            `;

            scheduleContainer.insertAdjacentHTML('beforeend', cardHTML);
        });

    } catch (error) {
        console.error('Error loading schedule:', error);
        statusDiv.innerHTML = `
            <div class="alert alert-danger error-message">
                <strong>Error!</strong> Unable to load the schedule. Please check the file path and try again.
                <br><small>Error details: ${error.message}</small>
            </div>
        `;
        currentScheduleDisplay.textContent = 'Error loading schedule';
    }
}

/* ========================================
   EVENT LISTENERS
   ======================================== */

scheduleSelect.addEventListener('change', (event) => {
    const selectedFile = event.target.value;
    loadSchedule(selectedFile);
});

document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (scheduleFiles[key]) {
        const fileName = scheduleFiles[key];
        scheduleSelect.value = fileName;
        loadSchedule(fileName);
    }
});

/* ========================================
   PAGE INITIALIZATION
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    loadSchedule('SridarSchedule.json');
});
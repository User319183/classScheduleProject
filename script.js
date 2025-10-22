/* ========================================
   DOM ELEMENTS AND CONSTANTS
   ======================================== */

const scheduleContainer = document.getElementById("scheduleContainer");
const statusDiv = document.getElementById("status");
const currentScheduleDisplay = document.getElementById("currentSchedule");
const scheduleSelect = document.getElementById("scheduleSelect");

const scheduleFiles = {
	1: "SathvikSchedule.json",
	2: "AadarshSchedule.json",
	3: "EthanSchedule.json",
	4: "HankSchedule.json",
};

const scheduleNames = {
	"SathvikSchedule.json": "Sathvik",
	"AadarshSchedule.json": "Aadarsh",
	"EthanSchedule.json": "Ethan",
	"HankSchedule.json": "Hank",
};

/* ========================================
   HELPER FUNCTION - Get Font Awesome Icon
   ======================================== */

/**
 * Returns the appropriate Font Awesome icon class based on subject area
 * @param {string} subjectArea - The subject area of the class
 * @returns {string} Font Awesome icon class
 */
function getSubjectIcon(subjectArea) {
	const iconMap = {
		Math: "fa-solid fa-calculator",
		Technology: "fa-solid fa-laptop-code",
		English: "fa-solid fa-book",
		Science: "fa-solid fa-flask",
		Health: "fa-solid fa-heart-pulse",
		"Physical Education": "fa-solid fa-person-running",
		"Social Studies": "fa-solid fa-landmark",
		"Financial Literacy": "fa-solid fa-chart-line",
	};

	return iconMap[subjectArea] || "fa-solid fa-book-open";
}

/**
 * Calculates animation delay using a fibonacci-inspired algorithm combined with subject weighting
 * Creates a more natural, organic animation pattern instead of linear progression
 * @param {number} index - The index position of the class in the array
 * @param {number} period - The class period number
 * @param {string} subjectArea - The subject area for additional weighting
 * @returns {number} Animation delay in seconds
 */
function calculateFibonacciDelay(index, period, subjectArea) {
	// Generate a fibonacci-like sequence but cap it to prevent overly long delays
	const fib = (n) => {
		if (n <= 1) return n;
		let a = 0, b = 1;
		for (let i = 2; i <= n; i++) {
			[a, b] = [b, a + b];
		}
		return b;
	};

	// Create subject area weights for variety
	const subjectWeights = {
		"Math": 0.05,
		"Technology": 0.08,
		"English": 0.12,
		"Science": 0.15,
		"Health": 0.07,
		"Physical Education": 0.03,
		"Social Studies": 0.10,
		"Financial Literacy": 0.09
	};

	// Base fibonacci calculation with modular arithmetic to keep delays reasonable
	const fibValue = fib(index + 1) % 8;
	
	// Add period-based offset (early periods animate faster)
	const periodWeight = (9 - period) * 0.02;
	
	// Add subject-specific timing
	const subjectWeight = subjectWeights[subjectArea] || 0.1;
	
	// Combine all factors with some randomization based on index
	const randomFactor = (index * 7) % 3 * 0.02; // Creates 0, 0.02, or 0.04 second variations
	
	// Final calculation: fibonacci base + period weight + subject weight + random factor
	// Multiply by 0.1 to keep delays reasonable (similar scale to original but more varied)
	return (fibValue * 0.1) + periodWeight + subjectWeight + randomFactor;
}

/* ========================================
   MAIN FUNCTION - ASYNC SCHEDULE LOADER
   ======================================== */

/**
 * Loads and displays a student's schedule from a JSON file
 * @param {string} fileName - The name of the JSON file to load (e.g., "SridarSchedule.json")
 *
 * This function uses async/await to handle asynchronous fetch operations:
 * - async: Marks this function as asynchronous, allowing use of await inside
 * - await: Pauses execution until the Promise resolves, making async code look synchronous
 *
 * Template literal usage:
 * - `./json/${fileName}` - Uses template literal with ${} to inject the fileName parameter
 *   into the fetch path, enabling dynamic file loading based on user selection
 */
async function loadSchedule(fileName) {
	try {
		// Show loading message while fetching data
		statusDiv.innerHTML = `<div class="alert alert-info"><div class="loading-spinner"></div>Loading schedule...</div>`;
		scheduleContainer.innerHTML = "";

		// Fetch data from JSON file using template literal for dynamic path
		// The await keyword pauses execution until fetch completes
		const response = await fetch(`./json/${fileName}`);

		// Check if the fetch was successful
		if (!response.ok) {
			throw new Error(`Failed to load schedule: ${response.status}`);
		}

		// Parse the JSON response - await ensures we wait for parsing to complete
		const scheduleData = await response.json();

		// EXTRA CREDIT: Sort classes by period number before displaying
		scheduleData.sort((a, b) => a.period - b.period);

		// Clear loading message and update current schedule display
		statusDiv.innerHTML = "";
		currentScheduleDisplay.textContent = `${scheduleNames[fileName]}'s Schedule`;

		// Loop through each class and create a card for it
		// Using forEach instead of building one large HTML string
		scheduleData.forEach((classItem, index) => {
			// Get Font Awesome icon based on subject area
			const subjectIcon = getSubjectIcon(classItem.subjectArea);

			// Calculate dynamic animation delay
			const fibonacciDelay = calculateFibonacciDelay(index, classItem.period, classItem.subjectArea);

			// Build HTML for each class card using template literals
			// Template literals allow us to inject data dynamically with ${}
			const cardHTML = `
                <div class="schedule-card" style="animation-delay: ${fibonacciDelay}s">
                    <div class="period-badge">
                        <i class="fa-solid fa-clock"></i> ${classItem.period}
                    </div>
                    <div class="class-name">
                        <i class="${subjectIcon}"></i> ${classItem.className}
                    </div>
                    <div class="class-info">
                        <i class="fa-solid fa-chalkboard-user"></i> ${
							classItem.teacher
						}
                    </div>
                    <div class="class-info">
                        <i class="fa-solid fa-door-open"></i> Room ${
							classItem.roomNumber
						}
                    </div>
                    <span class="subject-badge"><i class="fa-solid fa-tag"></i> ${
						classItem.subjectArea
					}</span>
                </div>
            `;

			/**
			 * insertAdjacentHTML('beforeend', html) adds HTML to the container
			 * - 'beforeend': Inserts the HTML just before the closing tag of scheduleContainer
			 * - This is more efficient than innerHTML += because it doesn't re-parse existing content
			 * - Each card is added one at a time inside the loop, building up the schedule gradually
			 */
			scheduleContainer.insertAdjacentHTML("beforeend", cardHTML);
		});
	} catch (error) {
		console.error("Error loading schedule:", error);
		statusDiv.innerHTML = `
            <div class="alert alert-danger error-message">
                <strong>Error!</strong> Unable to load the schedule. Please check the file path and try again.
                <br><small>Error details: ${error.message}</small>
            </div>
        `;
		currentScheduleDisplay.textContent = "Error loading schedule";
	}
}

/* ========================================
   EVENT LISTENERS - Non-Button Event Switching
   ======================================== */

/**
 * Event Listener #1: Dropdown (change event)
 * This 'change' event fires when the user selects a different option in the dropdown
 * NOT a simple button click - uses a select element's change event
 */
scheduleSelect.addEventListener("change", (event) => {
	const selectedFile = event.target.value;
	loadSchedule(selectedFile); // Pass fileName parameter to async function
});

/**
 * Event Listener #2: Keyboard (keydown event)
 * This 'keydown' event fires when the user presses a key
 * NOT a simple button click - responds to keyboard input (1, 2, 3, 4)
 * Provides an alternative navigation method for accessibility and convenience
 */
document.addEventListener("keydown", (event) => {
	const key = event.key;
	// Check if the pressed key corresponds to a schedule file
	if (scheduleFiles[key]) {
		const fileName = scheduleFiles[key];
		scheduleSelect.value = fileName; // Update dropdown to match
		loadSchedule(fileName); // Pass fileName parameter to async function
	}
});

/* ========================================
   PAGE INITIALIZATION
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {
	loadSchedule("SathvikSchedule.json");
});

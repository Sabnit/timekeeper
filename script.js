/// Time variables in seconds
let setupTime = 3 * 60;          // 3 minutes for setup
let presentationTime = 10 * 60;  // 10 minutes for demo
let qaTime = 10 * 60;            // 10 minutes for Q/A
let disassembleTime = 2 * 60;    // 2 minutes to disassemble
let judgeTime = 5 * 60;          // 5 minutes for judge
let totalSeconds = 30 * 60;      // 30 minutes total

let countdown;
let currentPhase = "setup";
let endSoundPlayedAt1703 = false;
let demoCompletedEarly = false;
let qaSoundPlayed = false;        // Track whether QA sound has been played
let twoMinWarningGivenAt19 = false;   // Flag to track if the 2-minute warning at 19:00 has been given
let twoMinWarningGivenAt9 = false;    // Flag to track if the 2-minute warning at 9:00 has been given
let speedMultiplier = 1;          // Speed multiplier for fast-forward (1x, 8x, 16x)

const setupDuration = totalSeconds - setupTime;
const presentationDuration = setupDuration - presentationTime;
const qaDuration = presentationDuration - qaTime;
const disassembleDuration = qaDuration - disassembleTime;
const judgeDuration = disassembleDuration - judgeTime;

const initialSeconds = totalSeconds;
const timerDisplay = document.getElementById("timer-display");
const startButton = document.getElementById("start-button");
const demoCompletedButton = document.getElementById("demo-completed-button");
const resetButton = document.getElementById("reset-button");
const fastForwardButton = document.getElementById("fast-forward-button");
const skipDemoButton = document.getElementById("skip-demo");
const statusDisplay = document.getElementById("status");

const countdownSound = document.getElementById("countdown-sound");
const endSound = document.getElementById("end-sound");
const qaSound = document.getElementById("qa-sound");
const twoMinRemainingSound = document.getElementById("2-min-remaining-sound");
const stopDemo = document.getElementById("stop-presentation");
const stopQnA = document.getElementById("stop-QnA");

startButton.addEventListener("click", startTimer);
demoCompletedButton.addEventListener("click", demoCompletedEarlyHandler);
resetButton.addEventListener("click", resetTimer);
fastForwardButton.addEventListener("click", toggleFastForward);

function startTimer() {
  startButton.disabled = true;
  demoCompletedButton.disabled = true;
  resetButton.disabled = false;
  fastForwardButton.disabled = false; // Enable fast forward
  statusDisplay.textContent = "Setup phase ongoing...";
  qaSoundPlayed = false; // Reset the sound flag at the start
  twoMinWarningGivenAt19 = false; // Reset the 2-minute warning flag for 19:00
  twoMinWarningGivenAt9 = false; // Reset the 2-minute warning flag for 9:00

  countdown = setInterval(updateTimer, 1000 / speedMultiplier); // Use speed multiplier here
}

function updateTimer() {
  if (totalSeconds <= 0) {
    clearInterval(countdown);
    timerDisplay.textContent = "00:00";
    statusDisplay.textContent = "Session complete!";
    startButton.disabled = true;
    demoCompletedButton.disabled = true;
    resetButton.disabled = false;
    skipDemoButton.disabled = true;
    return;
  }

  totalSeconds--;

  // Trigger countdown sound at 27:05 (1625 seconds remaining) only if the demo is not completed early
  if (totalSeconds === 1624 && !demoCompletedEarly) {
    countdownSound.play();
  }

  // Show "2 min remaining" message at 19:00 (1140 seconds remaining) only if the demo is not completed early
  if (totalSeconds === 1142 && !twoMinWarningGivenAt19 && !demoCompletedEarly) {
    twoMinRemainingSound.play();
    // statusDisplay.textContent = "2 minutes remaining!";
    twoMinWarningGivenAt19 = true; // Ensure the 19:00 warning is only given once
  }

  // Play stop sound at 17:03 (1023 seconds remaining), only once and only if the demo is not completed early
  if (totalSeconds === 1023 && !endSoundPlayedAt1703 && !demoCompletedEarly) {
    stopDemo.play();
    endSoundPlayedAt1703 = true; // Set the flag to true after playing the sound
  }

  // Show "2 min remaining" message at 9:00 (540 seconds remaining) regardless of demo completion
  if (totalSeconds === 543 && !twoMinWarningGivenAt9) {
    twoMinRemainingSound.play();  // Play the sound at 9:00 mark
    // statusDisplay.textContent = "2 minutes remaining!";
    twoMinWarningGivenAt9 = true; // Ensure the 9:00 warning is only given once
  }

  // Play stop sound at 7:03 (423 seconds remaining), only once
  if (totalSeconds === 423) {
    stopQnA.play();
  }

  // Other transition logic based on remaining seconds
  if (totalSeconds > setupDuration) {
    currentPhase = "setup";
    statusDisplay.textContent = "Setup phase ongoing...";
  } else if (totalSeconds > presentationDuration && !demoCompletedEarly) {
    currentPhase = "presentation";
    statusDisplay.textContent = "Presentation phase ongoing...";
    demoCompletedButton.disabled = false;

    if (totalSeconds <= 1023 && !demoCompletedEarly) {
      stopDemo.play();
    }
  } else if (totalSeconds > qaDuration) {
    currentPhase = "q&a";
    statusDisplay.textContent = "Q/A phase ongoing...";

    demoCompletedButton.disabled = true;

    if ((totalSeconds === 1080 || demoCompletedEarly) && !qaSoundPlayed) {
      qaSound.play();
      qaSoundPlayed = true; // Ensure sound plays only once
    }

    if (totalSeconds <= 420) {
      stopQnA.play();
    }
  } else if (totalSeconds > disassembleDuration) {
    currentPhase = "disassemble";
    statusDisplay.textContent = "Disassemble phase ongoing...";
  } else {
    currentPhase = "judge";
    statusDisplay.textContent = "Judge discussion ongoing...";

  }

  updateDisplay();
}

function demoCompletedEarlyHandler() {
  demoCompletedEarly = true;

  if (currentPhase === "presentation" && totalSeconds > 30) {
    const remainingDemoTime = totalSeconds - 30;
    totalSeconds = 30 + remainingDemoTime;
  }

  demoCompletedButton.disabled = true;
  statusDisplay.textContent = "Q/A phase ongoing...";
  // Reset warnings and sounds that should not occur after demo completion
  twoMinWarningGivenAt19 = true; // Prevent 2-minute warning for demo phase after early completion
  endSoundPlayedAt1703 = true;  // Prevent end sound for demo phase
}

function resetTimer() {
  // Show confirmation dialog
  if (confirm("Are you sure you want to reset the timer?")) {
    clearInterval(countdown);
    totalSeconds = initialSeconds;
    currentPhase = "setup";
    demoCompletedEarly = false;
    qaSoundPlayed = false; // Reset the sound flag during reset
    twoMinWarningGivenAt19 = false; // Reset the 2-minute warning flag for 19:00
    twoMinWarningGivenAt9 = false; // Reset the 2-minute warning flag for 9:00
    endSoundPlayedAt1703 = false; // Reset the end sound flag at 17:03 during reset
    speedMultiplier = 1; // Reset speed to normal
    
    timerDisplay.textContent = "30:00";
    statusDisplay.textContent = "";
    
    startButton.disabled = false;
    demoCompletedButton.disabled = true;
    fastForwardButton.disabled = true;
    resetButton.disabled = true;
    skipDemoButton.disabled =  false;
  }
}

skipDemoButton.addEventListener("click", () => {
  totalSeconds = 1626; // Jump to 27:05
  skipDemoButton.disabled = true;
  updateDisplay();
});

function toggleFastForward() {
  // Toggle between normal (1x), fast (8x), and faster (16x)
  if (speedMultiplier === 1) {
    speedMultiplier = 8;
    fastForwardButton.textContent = "Fast Forward 16x";
  } else if (speedMultiplier === 8) {
    speedMultiplier = 16;
    fastForwardButton.textContent = "Normal Speed";
  } else {
    speedMultiplier = 1;
    fastForwardButton.textContent = "Fast Forward 8x";
  }

  clearInterval(countdown);  // Clear existing interval
  countdown = setInterval(updateTimer, 1000 / speedMultiplier);  // Apply new speed
}

function updateDisplay() {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}
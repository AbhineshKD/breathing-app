const durationSelect =
  document.getElementById("duration");

const customMinutes =
  document.getElementById("customMinutes");

const startBtn =
  document.getElementById("startBtn");

const pauseBtn =
  document.getElementById("pauseBtn");

const stopBtn =
  document.getElementById("stopBtn");

const voiceToggle =
  document.getElementById("voiceToggle");

const instruction =
  document.getElementById("instruction");

const cycle =
  document.getElementById("cycle");

const countdown =
  document.getElementById("countdown");

const progressBar =
  document.getElementById("progressBar");

const breathOrb =
  document.getElementById("breathOrb");

const status =
  document.getElementById("status");


/*
  Timer variables
*/

let totalSeconds = 300;

let remainingSeconds = totalSeconds;

// Seconds remaining in the current breathing phase
let phaseSeconds = 10;

// Current breathing phase
let phase = "in";

// JavaScript interval
let timerId = null;

let running = false;

let paused = false;


/*
  Duration selection
*/

durationSelect.addEventListener("change", () => {

  const custom =
    durationSelect.value === "custom";

  customMinutes.hidden = !custom;

  if (!running) {

    totalSeconds =
      getSelectedDuration();

    remainingSeconds =
      totalSeconds;

    updateDisplay();
  }
});


customMinutes.addEventListener("input", () => {

  if (!running) {

    totalSeconds =
      getSelectedDuration();

    remainingSeconds =
      totalSeconds;

    updateDisplay();
  }
});


/*
  Buttons
*/

startBtn.addEventListener(
  "click",
  startOrResume
);

pauseBtn.addEventListener(
  "click",
  pause
);

stopBtn.addEventListener(
  "click",
  stop
);


/*
  Get selected duration
*/

function getSelectedDuration() {

  if (durationSelect.value === "custom") {

    const minutes =
      Math.max(
        1,
        Math.min(
          180,
          Number(customMinutes.value) || 1
        )
      );

    return minutes * 60;
  }

  return Number(
    durationSelect.value
  );
}


/*
  Start / Resume
*/

function startOrResume() {

  if (running) {
    return;
  }


  /*
    If the timer has finished,
    start a new session.
  */

  if (remainingSeconds <= 0) {

    totalSeconds =
      getSelectedDuration();

    remainingSeconds =
      totalSeconds;

    phase = "in";

    phaseSeconds = 10;
  }


  /*
    Browser speech normally requires
    a user interaction.

    The Start button provides that interaction.
  */

  if (!paused) {

    phase = "in";

    phaseSeconds = 10;

    announce("Breathe in");
  }


  running = true;

  paused = false;


  startBtn.disabled = true;

  pauseBtn.disabled = false;

  stopBtn.disabled = false;


  durationSelect.disabled = true;

  customMinutes.disabled = true;


  startBtn.textContent = "Start";


  status.textContent =
    "Session in progress.";


  setPhaseUI();


  /*
    Run every 1 second.
  */

  timerId =
    setInterval(tick, 1000);
}


/*
  Main timer
*/

function tick() {

  remainingSeconds--;

  phaseSeconds--;


  /*
    Has the entire session finished?
  */

  if (remainingSeconds <= 0) {

    finish();

    return;
  }


  /*
    Has the current 10-second
    breathing phase finished?
  */

  if (phaseSeconds <= 0) {

    /*
      Switch:

      in -> out
      out -> in
    */

    phase =
      phase === "in"
        ? "out"
        : "in";


    /*
      Reset the breathing phase
      back to 10 seconds.
    */

    phaseSeconds = 10;


    /*
      Speak the new instruction.
    */

    announce(
      phase === "in"
        ? "Breathe in"
        : "Breathe out"
    );


    setPhaseUI();
  }


  updateDisplay();
}


/*
  Pause
*/

function pause() {

  if (!running) {
    return;
  }


  clearInterval(timerId);

  timerId = null;

  running = false;

  paused = true;


  pauseBtn.disabled = true;

  startBtn.disabled = false;

  startBtn.textContent = "Resume";


  status.textContent = "Paused.";


  instruction.textContent =
    "Paused";


  breathOrb.classList.remove(
    "in",
    "out"
  );
}


/*
  Stop
*/

function stop() {

  clearInterval(timerId);

  timerId = null;


  running = false;

  paused = false;


  totalSeconds =
    getSelectedDuration();

  remainingSeconds =
    totalSeconds;


  phase = "in";

  phaseSeconds = 10;


  startBtn.disabled = false;

  startBtn.textContent = "Start";


  pauseBtn.disabled = true;

  stopBtn.disabled = true;


  durationSelect.disabled = false;

  customMinutes.disabled = false;


  instruction.textContent =
    "Ready?";


  cycle.textContent =
    "Press Start to begin";


  status.textContent =
    "Choose a duration and press Start.";


  breathOrb.classList.remove(
    "in",
    "out"
  );


  updateDisplay();
}


/*
  Finish session
*/

function finish() {

  clearInterval(timerId);

  timerId = null;


  running = false;

  paused = false;


  if (voiceToggle.checked) {

    announce("Session complete");
  }


  instruction.textContent =
    "Well done";


  cycle.textContent =
    "Your breathing session is complete.";


  countdown.textContent =
    "00:00";


  progressBar.style.transform =
    "scaleX(0)";


  breathOrb.classList.remove(
    "in",
    "out"
  );


  status.textContent =
    "Session complete.";


  startBtn.disabled = false;

  startBtn.textContent =
    "Start Again";


  pauseBtn.disabled = true;

  stopBtn.disabled = true;


  durationSelect.disabled = false;

  customMinutes.disabled = false;
}


/*
  Update breathing instruction
*/

function setPhaseUI() {

  if (phase === "in") {

    instruction.textContent =
      "Breathe in";

  } else {

    instruction.textContent =
      "Breathe out";
  }


  cycle.textContent =
    `${phaseSeconds} seconds`;


  /*
    Reset animation
  */

  breathOrb.classList.remove(
    "in",
    "out"
  );


  /*
    Force browser to restart
    the CSS animation.
  */

  void breathOrb.offsetWidth;


  /*
    Start new animation.
  */

  breathOrb.classList.add(
    phase
  );
}


/*
  Update main countdown
*/

function updateDisplay() {

  countdown.textContent =
    formatTime(remainingSeconds);


  const ratio =
    Math.max(
      0,
      Math.min(
        1,
        remainingSeconds / totalSeconds
      )
    );


  progressBar.style.transform =
    `scaleX(${ratio})`;


  cycle.textContent =
    `${phaseSeconds} seconds`;
}


/*
  Convert seconds to MM:SS
*/

function formatTime(seconds) {

  const minutes =
    Math.floor(seconds / 60);

  const secs =
    seconds % 60;


  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0")
  );
}


/*
  Text-to-speech
*/

function announce(text) {

  /*
    Don't speak if voice is disabled.
  */

  if (
    !voiceToggle.checked ||
    !("speechSynthesis" in window)
  ) {

    return;
  }


  /*
    Stop anything currently speaking.
  */

  window.speechSynthesis.cancel();


  const utterance =
    new SpeechSynthesisUtterance(text);


  /*
    Make the voice calm and slower.
  */

  utterance.rate = 0.85;

  utterance.pitch = 1;

  utterance.volume = 1;


  window.speechSynthesis.speak(
    utterance
  );
}


/*
  Initial state
*/

totalSeconds =
  getSelectedDuration();

remainingSeconds =
  totalSeconds;

updateDisplay();
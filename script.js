//Global Constants
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait betfore starting playback of the clue sequence

//Global Variables
var clueHoldTime = 1000; //how long to hold each clue's light/sound
var pattern = [];
var progress = 0;
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5;
var guessCounter = 0;
var hard = false; //hard difficulty toggle; Makes game have 6 tiles, faster clues, 2 longer pattern, 1 life
var lives = 3;
var time = 60;
var interval;

function changeDifficulty() {
  //Changes game to add 2 more buttons and change speed at a different rate.
  if (!hard) {
    document.getElementById("normalBtn").classList.add("hidden");
    document.getElementById("hardBtn").classList.remove("hidden");
    document.getElementById("button5").classList.remove("hidden");
    document.getElementById("button6").classList.remove("hidden");
    hard = true;
  } else {
    document.getElementById("normalBtn").classList.remove("hidden");
    document.getElementById("hardBtn").classList.add("hidden");
    document.getElementById("button5").classList.add("hidden");
    document.getElementById("button6").classList.add("hidden");
    hard = false;
  }
}

function startGame() {
  //initialize game variables
  progress = 0;
  gamePlaying = true;
  clueHoldTime = 1000;
  lives = hard ? 1 : 3;
  time = 60;
  generatePattern();
  startTimer();

  // swap the Start and Stop Buttons
  document.getElementById("timer").innerText = 60;
  document.getElementById("timer").classList.remove("hidden");
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  playClueSequence();
}

function stopGame() {
  //change state of gamePlaying
  gamePlaying = false;

  document.getElementById("stopBtn").classList.add("hidden");
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("timer").classList.add("hidden");
  pauseTimer();
}

// Sound Synthesis Functions
const freqMap = {
  1: 261.6,
  2: 293.66,
  3: 329.63,
  4: 349.23,
  5: 392,
  6: 440
};

function playTone(btn, len) {
  o.frequency.value = freqMap[btn];
  g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
  tonePlaying = true;
  setTimeout(function() {
    stopTone();
  }, len);
}

function startTone(btn) {
  if (!tonePlaying) {
    o.frequency.value = freqMap[btn];
    g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
    tonePlaying = true;
  }
}

function stopTone() {
  g.gain.setTargetAtTime(0, context.currentTime + 0.05, 0.025);
  tonePlaying = false;
}

function lightButton(btn) {
  document.getElementById("button" + btn).classList.add("lit");
}

function clearButton(btn) {
  document.getElementById("button" + btn).classList.remove("lit");
}

function playSingleClue(btn) {
  if (gamePlaying) {
    lightButton(btn);
    playTone(btn, clueHoldTime);
    setTimeout(clearButton, clueHoldTime, btn);
  }
}

function playClueSequence() {
  pauseTimer();
  guessCounter = 0;
  let speedDown = hard ? 0.08 : 0.03; //A conditional operator saying that the speed is higher if hard.
  clueHoldTime = clueHoldTime - clueHoldTime * speedDown * progress;

  let delay = nextClueWaitTime; //set delay to initial wait time
  for (let i = 0; i <= progress; i++) {
    // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms");
    setTimeout(playSingleClue, delay, pattern[i]); // set a timeout to play that clue
    delay += clueHoldTime;
    delay += cluePauseTime;
  }
  setTimeout(startTimer, delay);
}

function loseGame() {
  stopGame();
  alert("Game Over. You lost.");
}

function winGame() {
  stopGame();
  alert("Game Over. You won!");
}

function guess(btn) {
  console.log("user guessed: " + btn);
  if (!gamePlaying) {
    return;
  }

  if (btn == pattern[guessCounter]) {
    //correct
    if (guessCounter < progress) {
      guessCounter++;
    } else if (progress == pattern.length - 1) {
      winGame();
    } else if (guessCounter == progress) {
      progress++;
      playClueSequence();
    }
  } else if (lives > 1) {
    lives = lives - 1;
    alert("Missed! " + lives + " left!");
  } else {
    loseGame();
  }
}

function generatePattern() {
  pattern = [];
  console.log(pattern);
  let size = hard ? 8 : 6;
  let max = hard ? 6 : 4;

  for (let i = 0; i < size; i++) {
    pattern.push(Math.floor(Math.random() * Math.floor(max)) + 1);
    console.log(pattern);
  }
}

function startTimer() {
  pauseTimer();
  interval = setInterval(() => {
    timer();
  }, 1000);
}

function timer() {
  time--;
  if (time == 0) {
    loseGame();
  }
  document.getElementById("timer").innerText = time;
}

function pauseTimer() {
  clearInterval(interval);
}

//Page Initialization
// Init Sound Synthesizer
var context = new AudioContext();
var o = context.createOscillator();
var g = context.createGain();
g.connect(context.destination);
g.gain.setValueAtTime(0, context.currentTime);
o.connect(g);
o.start(0);

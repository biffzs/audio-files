const urls = [
  "https://biffzs.github.io/audio-files/audio/goodbye_blue_sky_17-Click.mp3",
  "https://biffzs.github.io/audio-files/audio/goodbye_blue_sky_17-Soprano-Bass.mp3",
  "https://biffzs.github.io/audio-files/audio/goodbye_blue_sky_17-Soprano-Tenor.mp3",
  "https://biffzs.github.io/audio-files/audio/goodbye_blue_sky_17-Soprano-Alto.mp3",
  "https://biffzs.github.io/audio-files/audio/goodbye_blue_sky_17-Soprano-Soprano.mp3"
];

const playBtn = document.querySelector('#play');
const stopBtn = document.querySelector('#stop');
const activateBtn = document.querySelector('#activate');
const volumeSliders = [];
const sounds = [];
let loadedSounds = 0;
Howler.html5PoolSize=30; // It's because I play a lot of sounds

// Create a single Howler object
var all_sounds = new Howl({
  src: urls,
  preload: true,
  html5: true,
  buffer: 8192, // custom buffer size in bytes
  loop: false,
  volume: 1,
  onload: function () {
    startProgram();
  },
  onplayerror: function () {
    console.log("HTML5 Audio pool exhausted, returning potentially locked audio object.");
  }
});


function activateSounds() {
  // Load all sounds
  urls.forEach((url, index) => {
    const sound = new Howl({
      src: url,
      preload: true,
      html5: true,
      buffer: 8192, // custom buffer size in bytes
      onload: function () {
        loadedSounds++;
        console.log(`Sound ${index} loaded`);
        if (loadedSounds === urls.length) {
          console.log("Finished loading");
          startProgram();
        }
      },
      onplayerror: function () {
        console.log("HTML5 Audio pool exhausted, returning potentially locked audio object.");
      }
    });
    sounds.push(sound);
  });
  activateBtn.removeEventListener("click", activateSounds);
  activateBtn.disabled = true; // disable the button
}

activateBtn.addEventListener("click", activateSounds);


function startProgram() {

  document.getElementById("play").addEventListener("click", () => {

    let allPaused = true;

    // Check if all sounds are paused
    sounds.forEach(sound => {
      if (sound.playing()) {
        allPaused = false;
        return;
      }
    });

    // Play or pause sounds depending on their current state
    var elapsedTime = sounds[0].seek()

    console.log("Elapsed time: " + elapsedTime)
    if (allPaused) {
      sounds.forEach(sound => {
        document.getElementById("play").textContent = "Pause";
        sound.play();
        sound.seek(elapsedTime);
        console.log("Elapsed time: " + elapsedTime)
      });
    } else {
      sounds.forEach(sound => {
        document.getElementById("play").textContent = "Play";
        sound.pause();
        sound.seek(elapsedTime);
        console.log("Elapsed time: " + elapsedTime)
      });
    }
  });


  document.getElementById("stop").addEventListener("click", () => {
    // Play all sounds at once
    document.getElementById("play").textContent = "Play";
    sounds.forEach(sound => {
      sound.stop();
    });
  });


  // Add event listeners to the fader elements
  sounds.forEach((sound, index) => {
    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = 0.001;
    volumeSlider.max = 1.001;
    volumeSlider.step = 0.2;
    volumeSlider.value = 1;
    volumeSlider.id = 'volume-slider'

    const parts = sound._src.split("/");
    const fileNameWithEnding = parts.pop();
    const fileNameWithoutEnding = fileNameWithEnding.split(".")[0];

    // Add the slider to the DOM
    const label = document.createElement('label');
    label.textContent = index + ` Volume`;
    label.appendChild(volumeSlider);
    label.classList.add('text-rotated'); // Add the 'my-label' class to the label
    document.body.appendChild(label);

    // Add the slider to the volumeSliders array
    volumeSliders.push(volumeSlider);

    // Add an event listener to the slider to update the player's volume
    volumeSlider.addEventListener('input', () => {
      const newVolume = parseFloat(volumeSlider.value);
      sound.volume(newVolume);
    });


  });

  var isDragging = false; // variable to track if the user is dragging the timeline

  // update timeline
  var max_duration = sounds[0].duration();
  var loopId;
  sounds[0].on('play', function () {
    loopId = setInterval(function () {
      if (!isDragging) { // only update the timeline if the user is not dragging it
        const seek_time_ref = sounds[0].seek();
        timeline.value = seek_time_ref * 100 / max_duration;
      }
  
      // try disabling de-sync
      sounds.forEach((sound, index) => {
        // console.log("diff time: " + Math.abs(seek_time_ref - sound.seek()))
        if (Math.abs(seek_time_ref - sound.seek()) > 0.03) {
          sound.seek(seek_time_ref);
        }
      });
  
    }, 16);
  });
  
  timeline.addEventListener('mousedown', () => {
    isDragging = true; // user started dragging the timeline
  });
  
  timeline.addEventListener('mouseup', () => {
    isDragging = false; // user stopped dragging the timeline
  });
  
  timeline.addEventListener('input', () => {
    var max_duration = sounds[0].duration();
    const seekTime = (parseFloat(timeline.value) / 100) * max_duration; // between 0 and 100%
    //timeline.value = sounds[0].seek() / max_duration;
    console.log("Seek time = " + seekTime);
    console.log("Max duration = " + max_duration);
    sounds.forEach((sound, index) => {
      sound.seek(seekTime);
    });
  });
  
  // Stop the loop when the sound file ends
  sounds[0].on('end', function() {
    clearInterval(loopId);
  });

  var speedSlider = document.getElementById('speed');
  speedSlider.addEventListener('input', function() {
    var speed = parseFloat(speedSlider.value);
    sounds.forEach((sound, index) => {
      sound.rate(speed);
    });
  });

}

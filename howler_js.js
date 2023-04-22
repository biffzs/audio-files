const playBtn = document.querySelector('#play');
const stopBtn = document.querySelector('#stop');
const activateBtn = document.querySelector('#activate');

let loadedSounds = 0;
var goodbye_blue_sky
let allPaused = false;
let pausePositions = []
let ids = []

function activateSounds() {

  // Load all sounds
  goodbye_blue_sky = new Howl({
    preload: true,
    html5: true,
    buffer: 8192,
    "src": [
      "./audio/goodbye_blue_sky.webm",
      "./audio/goodbye_blue_sky.mp3"
    ],
    "sprite": {
      "goodbye_blue_sky_17-Click": [
        0,
        149748.0045351474
      ],
      "goodbye_blue_sky_17-Soprano-Alto": [
        151000,
        149748.0045351474
      ],
      "goodbye_blue_sky_17-Soprano-Bass": [
        302000,
        149748.0045351474
      ],
      "goodbye_blue_sky_17-Soprano-Soprano": [
        453000,
        149748.0045351474
      ],
      "goodbye_blue_sky_17-Soprano-Tenor": [
        604000,
        149748.0045351474
      ]
    },
  });
  activateBtn.disabled = true; // disable the button
  activateBtn.removeEventListener("click", activateSounds);

  ids.push(goodbye_blue_sky.play("goodbye_blue_sky_17-Click"))
  ids.push(goodbye_blue_sky.play("goodbye_blue_sky_17-Soprano-Alto"))
  ids.push(goodbye_blue_sky.play("goodbye_blue_sky_17-Soprano-Bass"))
  ids.push(goodbye_blue_sky.play("goodbye_blue_sky_17-Soprano-Soprano"))
  ids.push(goodbye_blue_sky.play("goodbye_blue_sky_17-Soprano-Tenor"))
  goodbye_blue_sky.stop()

  const spriteNames = Object.keys(goodbye_blue_sky._sprite);

  // Add event listeners to the fader elements
  ids.forEach((sound, index) => {
    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = 0.001;
    volumeSlider.max = 1.001;
    volumeSlider.step = 0.2;
    volumeSlider.value = 1;
    volumeSlider.id = 'volume-slider'

    const parts = spriteNames[index].split("-");
    const file_name = parts[parts.length - 1];
    
    // Add the slider to the DOM
    const label = document.createElement('label');
    label.textContent = file_name;
    label.appendChild(volumeSlider);
    label.classList.add('text-rotated'); // Add the 'my-label' class to the label
    document.body.appendChild(label);

    // Add an event listener to the slider to update the player's volume
    volumeSlider.addEventListener('input', () => {
      const newVolume = parseFloat(volumeSlider.value);
      goodbye_blue_sky.volume(newVolume, ids[index]);
    });


  });
  
}

activateBtn.addEventListener("click", activateSounds);


// Add an event listener to the play button to start or pause the sound
playBtn.addEventListener('click', () => {

  // if (!goodbye_blue_sky) {
  //   alert("Please activate sounds first!");
  //   return;
  // }

  // if (Howler.ctx.state === 'suspended') {
  //   Howler.ctx.resume();
  // }
  // if (Howler._muted) {
  //   Howler.unmute();
  // }
  // if (Howler._muted) {
  //   alert("Please unmute your browser to use this app.");
  //   return;
  // }
  // if (Howler._autoSuspend) {
  //   Howler._autoSuspend = false;
  // }

  // if (Howler._suspendTimer) {
  //   clearTimeout(Howler._suspendTimer);
  //   Howler._suspendTimer = null;
  // }
  // if (Howler.ctx && Howler.ctx.state === 'suspended') {
  //   Howler.ctx.resume();
  // }

  if (!allPaused) {
    allPaused = true;
    document.getElementById("play").textContent = "Pause";
    ids.forEach((id, index) => {
      goodbye_blue_sky.play(id)
    });

  } else {
    document.getElementById("play").textContent = "Play";
    allPaused = false;
    ids.forEach((id, index) => {
      goodbye_blue_sky.pause(id)
    });
  }

});

stopBtn.addEventListener('click', () => {
  document.getElementById("play").textContent = "Play";
  allPaused = false;
  ids.forEach((id, index) => {
    goodbye_blue_sky.stop(id)
  });
});

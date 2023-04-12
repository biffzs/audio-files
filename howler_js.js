const urls = [
  "https://biffzs.github.io/audio-files/goodbye_blue_sky_17-Click.mp3",
  "https://biffzs.github.io/audio-files/goodbye_blue_sky_17-Soprano-Bass.mp3",
  "https://biffzs.github.io/audio-files/goodbye_blue_sky_17-Soprano-Tenor.mp3",
  "https://biffzs.github.io/audio-files/goodbye_blue_sky_17-Soprano-Alto.mp3",
  "https://biffzs.github.io/audio-files/goodbye_blue_sky_17-Soprano-Soprano.mp3"
];



const buffers = [];
let loadedBuffers = 0;

// Load all buffers
urls.forEach((url, index) => {
  const buffer = new Tone.Buffer(url, function () {
    loadedBuffers++;
    console.log(`Buffer ${index} loaded`);
    if (loadedBuffers === urls.length) {
      // All buffers have been loaded, start the program
      startProgram();
    }
  });
  buffers.push(buffer);
});



function startProgram() { // APP

  var max_duration = 1e-5

  urls.forEach((url, index) => {
    var buffer = new Tone.Buffer(url, function () {
      //the buffer is now available.
      const duration = buffer.get().duration;
      if (duration > max_duration) {
        max_duration = duration
      }
    });
  });

  const players = urls.map(url => {
    const player = new Tone.Player(url);
    player.playbackRate = 1;
    return player;
  });

  const pitchShifts = players.map(() => new Tone.PitchShift({ pitch: 0 }));
  const volumes = players.map(() => new Tone.Volume({ volume: 0 }));

  players.forEach((player, index) => {
    player.chain(pitchShifts[index], volumes[index], Tone.Destination);
  });

  const playBtn = document.querySelector('#play');
  const stopBtn = document.querySelector('#stop');
  const activateBtn = document.querySelector('#activate');


  // Add an event listener to the play button to set the initial volume of each player
  playBtn.addEventListener('click', () => {
    if (Tone.Transport.state == 'paused' || Tone.Transport.state === 'stopped') {
      Tone.Transport.start();
      playBtn.textContent = 'Pause';
    } else {
      Tone.Transport.pause();
      playBtn.textContent = 'Play';
    }
  });


  stopBtn.addEventListener('click', () => {
    if (Tone.Transport.state != "stopped") {
      Tone.Transport.stop()
      playBtn.textContent = 'Play';
      timeline.value = 0;
    }
  });


  activateBtn.addEventListener('click', async () => {
    await Tone.start()
    console.log('audio is ready')
  })


  // Create a slider for adjusting the playback rate
  const speedSlider = document.querySelector('#speed');
  speedSlider.addEventListener('input', () => {
    const speed = parseFloat(speedSlider.value);
    // Set the playback rate and pitch shift to maintain the same pitch

    players.forEach((player, index) => {
      player.playbackRate = speed;
      pitchShifts[index].pitch = -12 * Math.log2(speed);
    });

  });

  // Create an array to hold the volume sliders
  const volumeSliders = [];

  // Loop through the players array and create a volume slider for each player
  players.forEach((player, index) => {
    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = -60;
    volumeSlider.max = 0;
    volumeSlider.step = 12;
    volumeSlider.value = 0;
    volumeSlider.id = 'volume-slider'

    // Add the slider to the DOM
    const label = document.createElement('label');
    label.textContent = `File ${index + 1} Volume: `;
    label.appendChild(volumeSlider);
    document.body.appendChild(label);

    // Add the slider to the volumeSliders array
    volumeSliders.push(volumeSlider);

    // Add an event listener to the slider to update the player's volume
    volumeSlider.addEventListener('input', () => {
      volumes[index].volume.value = volumeSlider.valueAsNumber
    });
    player.sync().start(0);
  });

  // Update the timeline slider as the file plays
  Tone.Transport.scheduleRepeat(() => {
    timeline.value = Tone.Transport.seconds * 100 / max_duration;
  }, "16n");

  // Add an event listener to the timeline slider to seek to a specific time in the file
  timeline.addEventListener('input', () => {
    Tone.Transport.seconds = max_duration * (timeline.value / 100);
  });

  Tone.setContext(new Tone.Context({ latencyHint: "playback" }))
  Tone.setContext(new Tone.Context({ lookAhead: 2 }))



} // APP



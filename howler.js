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
var sound_sprite;
let loadedSounds = 0;
Howler.html5PoolSize=30; // It's because I play a lot of sounds


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


  // timeline.addEventListener('mousedown', function() {
  //   // Clear the loop when the timeline is clicked
  //   clearInterval(loopId);
  // });

  // timeline.addEventListener('mouseup', function() {
  //   loopId = setInterval(function () {
  //     const seek_time_ref = sounds[0].seek()
  //     timeline.value = seek_time_ref * 100 / max_duration;

  //     sounds.forEach((sound, index) => {
  //       console.log("diff time: " + abs(seek_time_ref - sound.seek()))
  //       if (abs(seek_time_ref - sound.seek()) > 0.001) {
  //         sound.seek(seek_time_ref)
  //       }
  //     });
  //   }, 16);
  // });



  var speedSlider = document.getElementById('speed');
  speedSlider.addEventListener('input', function() {
    var speed = parseFloat(speedSlider.value);
    sounds.forEach((sound, index) => {
      sound.rate(speed);
    });
  });



  // //Update the timeline slider as the file plays
  // Tone.Transport.scheduleRepeat(() => {
  //   timeline.value = Tone.Transport.seconds * 100 / max_duration;
  // }, "16n");

  // // Add an event listener to the timeline slider to seek to a specific time in the file
  // timeline.addEventListener('input', () => {
  //   Tone.Transport.seconds = max_duration * (timeline.value / 100);
  // });










  // // Loop through the players array and create a volume slider for each player
  // players.forEach((player, index) => {
  //   const volumeSlider = document.createElement('input');
  //   volumeSlider.type = 'range';
  //   volumeSlider.min = -60;
  //   volumeSlider.max = 0;
  //   volumeSlider.step = 12;
  //   volumeSlider.value = 0;
  //   volumeSlider.id = 'volume-slider'

  //   // Add the slider to the DOM
  //   const label = document.createElement('label');
  //   label.textContent = `File ${index + 1} Volume: `;
  //   label.appendChild(volumeSlider);
  //   document.body.appendChild(label);

  //   // Add the slider to the volumeSliders array
  //   volumeSliders.push(volumeSlider);

  //   // Add an event listener to the slider to update the player's volume
  //   volumeSlider.addEventListener('input', () => {
  //     volumes[index].volume.value = volumeSlider.valueAsNumber
  //   });
  //   player.sync().start(0);
  // });





}



  //   // // Add an event listener to the play button to start or pause the sound
  //   // playBtn.addEventListener('click', () => {

  //   //   if (Howler.ctx.state === 'suspended') {
  //   //     Howler.ctx.resume();
  //   //   }
  //   //   if (Howler._muted) {
  //   //     Howler.unmute();
  //   //   }
  //   //   if (Howler._muted) {
  //   //     alert("Please unmute your browser to use this app.");
  //   //     return;
  //   //   }
  //   //   if (Howler._autoSuspend) {
  //   //     Howler._autoSuspend = false;
  //   //   }

  //   //   if (Howler._suspendTimer) {
  //   //     clearTimeout(Howler._suspendTimer);
  //   //     Howler._suspendTimer = null;
  //   //   }
  //   //   if (Howler.ctx && Howler.ctx.state === 'suspended') {
  //   //     Howler.ctx.resume();
  //   //   }

  //   // });


//   if (sounds[0].playing()) {

//     sounds.forEach(sound => {
//       sound.pause();
//     });

//   }
//         document.getElementById("play").addEventListener("click", () => {
//           if (sounds[0].playing()) {

//             sounds.forEach(sound => {
//               sound.pause();
//             });

//           } else {

//             let elapsedTime = 0;
//             // Play all sounds at once
//             sounds.forEach(sound => {
//               sound.play();
//             });

//             elapsedTime = sounds[0].seek();
//             sounds.forEach(sound => {
//               sound.seek(elapsedTime);
//             });
//             // setTimeout(() => {
//             //   elapsedTime = sounds[0].seek();
//             //   sounds.forEach(sound => {
//             //     sound.seek(elapsedTime);
//             //   });
//             // }, 50); // delay in milliseconds
//           }

//         });

//         document.getElementById("stop").addEventListener("click", () => {

//           // Play all sounds at once
//           sounds.forEach(sound => {
//             sound.stop();
//           });

//         });

//       }

// }


// const buffers = [];
// let loadedBuffers = 0;

// // Load all buffers
// urls.forEach((url, index) => {
//   const buffer = new Tone.Buffer(url, function () {
//     loadedBuffers++;
//     console.log(`Buffer ${index} loaded`);
//     if (loadedBuffers === urls.length) {
//       // All buffers have been loaded, start the program
//       startProgram();
//     }
//   });
//   buffers.push(buffer);
// });



// function startProgram() { // APP

//   var max_duration = 1e-5

//   urls.forEach((url, index) => {
//     var buffer = new Tone.Buffer(url, function () {
//       //the buffer is now available.
//       const duration = buffer.get().duration;
//       if (duration > max_duration) {
//         max_duration = duration
//       }
//     });
//   });

//   const players = urls.map(url => {
//     const player = new Tone.Player(url);
//     player.playbackRate = 1;
//     return player;
//   });

//   const pitchShifts = players.map(() => new Tone.PitchShift({ pitch: 0 }));
//   const volumes = players.map(() => new Tone.Volume({ volume: 0 }));

//   players.forEach((player, index) => {
//     player.chain(pitchShifts[index], volumes[index], Tone.Destination);
//   });

//   const playBtn = document.querySelector('#play');
//   const stopBtn = document.querySelector('#stop');
//   const activateBtn = document.querySelector('#activate');


//   // Add an event listener to the play button to set the initial volume of each player
//   playBtn.addEventListener('click', () => {
//     if (Tone.Transport.state == 'paused' || Tone.Transport.state === 'stopped') {
//       Tone.Transport.start();
//       playBtn.textContent = 'Pause';
//     } else {
//       Tone.Transport.pause();
//       playBtn.textContent = 'Play';
//     }
//   });


//   stopBtn.addEventListener('click', () => {
//     if (Tone.Transport.state != "stopped") {
//       Tone.Transport.stop()
//       playBtn.textContent = 'Play';
//       timeline.value = 0;
//     }
//   });


//   activateBtn.addEventListener('click', async () => {
//     await Tone.start()
//     console.log('audio is ready')
//   })


//   // Create a slider for adjusting the playback rate
//   const speedSlider = document.querySelector('#speed');
//   speedSlider.addEventListener('input', () => {
//     const speed = parseFloat(speedSlider.value);
//     // Set the playback rate and pitch shift to maintain the same pitch

//     players.forEach((player, index) => {
//       player.playbackRate = speed;
//       pitchShifts[index].pitch = -12 * Math.log2(speed);
//     });

//   });

//   // Create an array to hold the volume sliders
//   const volumeSliders = [];

//   // Loop through the players array and create a volume slider for each player
//   players.forEach((player, index) => {
//     const volumeSlider = document.createElement('input');
//     volumeSlider.type = 'range';
//     volumeSlider.min = -60;
//     volumeSlider.max = 0;
//     volumeSlider.step = 12;
//     volumeSlider.value = 0;
//     volumeSlider.id = 'volume-slider'

//     // Add the slider to the DOM
//     const label = document.createElement('label');
//     label.textContent = `File ${index + 1} Volume: `;
//     label.appendChild(volumeSlider);
//     document.body.appendChild(label);

//     // Add the slider to the volumeSliders array
//     volumeSliders.push(volumeSlider);

//     // Add an event listener to the slider to update the player's volume
//     volumeSlider.addEventListener('input', () => {
//       volumes[index].volume.value = volumeSlider.valueAsNumber
//     });
//     player.sync().start(0);
//   });

//   // Update the timeline slider as the file plays
//   Tone.Transport.scheduleRepeat(() => {
//     timeline.value = Tone.Transport.seconds * 100 / max_duration;
//   }, "16n");

//   // Add an event listener to the timeline slider to seek to a specific time in the file
//   timeline.addEventListener('input', () => {
//     Tone.Transport.seconds = max_duration * (timeline.value / 100);
//   });

//   Tone.setContext(new Tone.Context({ latencyHint: "playback" }))
//   Tone.setContext(new Tone.Context({ lookAhead: 2 }))



// } // APP

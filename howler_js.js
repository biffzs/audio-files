
const playBtn = document.querySelector('#play');
const stopBtn = document.querySelector('#stop');
const activateBtn = document.querySelector('#activate');
const syncBtn = document.querySelector('#sync');
const deSyncBtn = document.querySelector('#de-sync');
const loopToggleBtn = document.querySelector('#loopToggle');

// get the URL parameters
const urlParams = new URLSearchParams(window.location.search);

// get the value of the "song" parameter
const song = urlParams.get("song");

// use the value of the song variable as needed
console.log(song);

let loadedSounds = 0;
var current_song
let allPaused = false;
let pausePositions = []
let ids = []

let rangeMin = 5;
const range = document.querySelector(".range-selected");
const rangeInput = document.querySelectorAll(".range-input input");
const range_style = document.querySelector('.range');
range.style.left = "0%";
range.style.right = "0%";

let init_done = false;

var loop_left_perc = 0
var loop_right_perc = 100
var loop_enabled = true
var isDragging = false; // variable to track if the user is dragging the timeline


function syncTracks2() {
  // Calculate the maximum seek position among all the sprites
  let maxSeekPos = Math.max(...ids.map(id => Math.abs(current_song.seek(id))));

  // Set the seek position of all sprites to the maximum seek position
  ids.forEach((id, index) => {
    current_song.seek(maxSeekPos, id);
  });

  // Play all the sprites from the maximum seek position
  for (var spriteName in current_song._sprite) {
    let spriteData = current_song._sprite[spriteName];
    let spriteOffset = spriteData[0];
    let spriteDuration = spriteData[1];

    // Calculate the remaining duration of the sprite from the current seek position
    let remainingDuration = (spriteOffset + spriteDuration) / 1000 - maxSeekPos;

    if (remainingDuration > 0) {
      current_song.play(spriteName);
    }
  }
}

function deSyncTracks() {
  if (ids.length > 0) {
    var sprite_offset_ref = current_song._sprite[Object.entries(current_song._sprite)[0][0]][0];
    const seek_pos_ref = current_song.seek(ids[0]);
    const abs_pos_ref = seek_pos_ref - sprite_offset_ref;


    current_song.seek(abs_pos_ref + 1.5, ids[0]);

    printTrackSyncStatus()
  }
}


function printTrackSyncStatus() {
  console.log("-------------------------------------");

  Object.entries(current_song._sprite).forEach(([spriteName, spriteOffset], index) => {

    let sprite_offset = spriteOffset[0] / 1000;
    let seek_pos = current_song.seek(ids[index]);
    let abs_pos = seek_pos - sprite_offset;

    console.log(spriteName + ": abs pos " + abs_pos);
    // console.log(spriteName + ": seek pos " + seek_pos);
    // console.log(spriteName + ": sprite_offset pos " + sprite_offset);
  });

  console.log("-------------------------------------");

}

function syncTracks() {
  var sprite_offset_ref = current_song._sprite[Object.entries(current_song._sprite)[0][0]][0];
  const seek_pos_ref = current_song.seek(ids[0]);
  const abs_pos_ref = seek_pos_ref - sprite_offset_ref;
  console.log("-------------------------------------");

  Object.entries(current_song._sprite).forEach(([spriteName, spriteOffset], index) => {

    let sprite_offset = spriteOffset[0] / 1000;
    let seek_pos = current_song.seek(ids[index]);
    let abs_pos = seek_pos - sprite_offset;

    if (Math.abs(abs_pos_ref - abs_pos) > 0.03) {
      // console.log("Out of syc by: " + Math.abs(abs_pos_ref - abs_pos));
      current_song.seek(abs_pos_ref + sprite_offset, ids[index]);
      console.log("Sync " + spriteName + " by " + abs_pos_ref - abs_pos);
    }
    console.log("abs pos " + abs_pos);

  });

  console.log("-------------------------------------");

}

syncBtn.addEventListener('click', () => {
  syncTracks()
});

deSyncBtn.addEventListener('click', () => {
  deSyncTracks()
});

// Loop toggle button
loopToggleBtn.addEventListener("click", () => {
  const btnTxt = loopToggleBtn.textContent
  const rangeSelected = document.querySelector('.range-selected');

  if (loop_enabled) {
    loop_enabled = false
    loopToggleBtn.textContent = "Loop Off"
    rangeSelected.style.backgroundColor = '#407ceb69';
  } else {
    loop_enabled = true
    loopToggleBtn.textContent = "Loop On"
    rangeSelected.style.backgroundColor = '#1b13c0';
  }

});

rangeInput.forEach((input) => {
  input.addEventListener("input", (e) => {
    let minRange = parseInt(rangeInput[0].value);
    let maxRange = parseInt(rangeInput[1].value);
    if (maxRange - minRange < rangeMin) {
      if (e.target.className === "min") {
        rangeInput[0].value = maxRange - rangeMin;
      } else {
        rangeInput[1].value = minRange + rangeMin;
      }
    } else {
      range.style.left = (minRange / rangeInput[0].max) * 100 + "%";
      range.style.right = 100 - (maxRange / rangeInput[1].max) * 100 + "%";
    }
    loop_left_perc = rangeInput[0].value
    loop_right_perc = rangeInput[1].value
  });
});


function seekTo(howl, seekTime) {
  Object.entries(howl._sprite).forEach(([spriteName, spriteOffset], index) => {
    let spriteOffsetSeconds = spriteOffset[0] / 1000;
    howl.seek(seekTime + spriteOffsetSeconds, ids[index]);
  });
  return true; // Return true to indicate success
}

function loadTrack(track_id) {
  if (track_id == "song1") {
    return new Howl({
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
  } else if (track_id == "song2") {
    return new Howl({
      preload: true,
      html5: true,
      buffer: 8192,
      "src": [
        "jar_let_her_go_mashup.webm",
        "jar_let_her_go_mashup.mp3"
      ],
      "sprite": {
        "VC_JarLetHerGo_Alt1": [
          0,
          195240
        ],
        "VC_JarLetHerGo_Alt2": [
          197000,
          195240
        ],
        "VC_JarLetHerGo_Bass1": [
          394000,
          195240
        ],
        "VC_JarLetHerGo_Bass2": [
          591000,
          195240
        ],
        "VC_JarLetHerGo_Click": [
          788000,
          195240
        ],
        "VC_JarLetHerGo_Sopran1": [
          985000,
          195240
        ],
        "VC_JarLetHerGo_Sopran2": [
          1182000,
          195240
        ],
        "VC_JarLetHerGo_Tenor1": [
          1379000,
          195240
        ],
        "VC_JarLetHerGo_Tenor2": [
          1576000,
          195240
        ]
      },
    });
  }
}

function activateSounds() {
  console.log("Activating sounds...");

  // Load all sounds
  current_song = loadTrack(song);

  Object.entries(current_song._sprite).forEach(([spriteName, spriteOffset], index) => {
    ids.push(current_song.play(spriteName));
  });

  activateBtn.disabled = true; // disable the button
  activateBtn.removeEventListener("click", activateSounds);

  const spriteNames = Object.keys(current_song._sprite);

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
      current_song.volume(newVolume, ids[index]);
    });


    current_song.on('play', function (soundId) {
      if (!init_done) {
        current_song.stop(soundId);
        current_song.stop();
        allPaused = false;
      } else {
        console.log(soundId);
        // current_song.play(soundId)
      }
    });


  });


  var max_duration = 1e-6;
  var max_duration_idx = 0;

  Object.keys(current_song._sprite).forEach((spriteName, index) => {
    const spriteDuration = current_song._sprite[spriteName][1] / 1000;

    if (spriteDuration > max_duration) {
      max_duration = spriteDuration;
      max_duration_idx = index;
    }
  });

  // update timeline
  var loopId;
  current_song.on('play', function () {
    if (init_done) {
      loopId = setInterval(function () {

        const seek_time_ref = current_song.seek(ids[max_duration_idx]);
        if (!isDragging) { // only update the timeline if the user is not dragging it
          timeline.value = seek_time_ref * 100 / max_duration;
        }

        // TODO: Check if files are playing, even though they shouldn't, Check if all required files are playing correctly
        // // // sync sound files again
        // // sounds.forEach((sound, index) => {
        // //   // console.log("diff time: " + Math.abs(seek_time_ref - sound.seek()))
        // //   if (Math.abs(seek_time_ref - sound.seek()) > 0.03) {
        // //     sound.seek(seek_time_ref);
        // //   }
        // // });

        // check for looping
        if (!loop_enabled || isDragging) {
          return;
        }

        const loop_right_abs = loop_right_perc * max_duration / 100
        const loop_left_abs = loop_left_perc * max_duration / 100

        if (seek_time_ref >= loop_right_abs) {
          timeline.value = loop_left_abs

          Object.entries(current_song._sprite).forEach(([spriteName, spriteOffset], index) => {
            let sprite_offset = spriteOffset[0] / 1000;
            // let seek_pos = current_song.seek(ids[index]);
            // let abs_pos = seek_pos - sprite_offset;
            const timeline_abs_value = loop_left_abs
            current_song.seek(loop_left_abs, ids[index]);


          });
        }

        // Check if the sprite is playing
        // if (!allPaused) {
        //   return
        // }

        // for (id in ids) {
        //   if (!current_song.playing(id)) {
        //     console.log('The ' + id + ' sprite is not currently playing.');
        //   }
        // }                                               

      }, 1000);
    }
  });


  timeline.addEventListener('mousedown', () => {
    isDragging = true; // user started dragging the timeline
  });

  timeline.addEventListener('mouseup', () => {
    isDragging = false; // user stopped dragging the timeline
  });

  timeline.addEventListener('input', () => {
    const seekTime = (parseFloat(timeline.value) / 100) * max_duration; // between 0 and 100%
    //timeline.value = sounds[0].seek() / max_duration;
    // console.log("Seek time = " + seekTime);
    // console.log("Max duration = " + max_duration);
    // sounds.forEach((sound, index) => {
    //   sound.seek(seekTime);
    // });

    // TODO: Create generic "SeekTo()" function
    Object.entries(current_song._sprite).forEach(([spriteName, spriteOffset], index) => {

      let sprite_offset = spriteOffset[0] / 1000;
      // let seek_pos = current_song.seek(ids[index]);
      // let abs_pos = seek_pos - sprite_offset;
      // const timeline_abs_value = loop_left_abs
      current_song.seek(seekTime + sprite_offset, ids[index]);
    });

  });


}

activateBtn.addEventListener("click", activateSounds);


// Add an event listener to the play button to start or pause the sound
playBtn.addEventListener('click', () => {
  init_done = true;
  if (!allPaused) {
    allPaused = true;
    document.getElementById("play").textContent = "Pause";
    ids.forEach((id, index) => {
      current_song.play(id)
    });
    syncTracks();
  } else {
    document.getElementById("play").textContent = "Play";
    allPaused = false;
    ids.forEach((id, index) => {
      current_song.pause(id)
    });
    syncTracks();
  }
});

var speedSlider = document.getElementById('speed');
speedSlider.addEventListener('input', function () {
  var speed = parseFloat(speedSlider.value);
  current_song.rate(speed);
});

stopBtn.addEventListener('click', () => {
  document.getElementById("play").textContent = "Play";
  allPaused = false;
  ids.forEach((id, index) => {
    current_song.stop(id)
  });
  syncTracks();
});






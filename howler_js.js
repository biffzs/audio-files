const playBtn = document.querySelector('#play');
const stopBtn = document.querySelector('#stop');
const activateBtn = document.querySelector('#activate');
const syncBtn = document.querySelector('#sync');
const deSyncBtn = document.querySelector('#de-sync');

let loadedSounds = 0;
var goodbye_blue_sky
let allPaused = false;
let pausePositions = []
let ids = []

let rangeMin = 5;
const range = document.querySelector(".range-selected");
const rangeInput = document.querySelectorAll(".range-input input");
const range_style = document.querySelector('.range');
range.style.left = "0%";
range.style.right = "0%";


var loop_left_perc = 0
var loop_right_perc = 100
var loop_enabled = true
var isDragging = false; // variable to track if the user is dragging the timeline


function syncTracks2() {
  // Calculate the maximum seek position among all the sprites
  let maxSeekPos = Math.max(...ids.map(id => Math.abs(goodbye_blue_sky.seek(id))));

  // Set the seek position of all sprites to the maximum seek position
  ids.forEach((id, index) => {
    goodbye_blue_sky.seek(maxSeekPos, id);
  });

  // Play all the sprites from the maximum seek position
  for (var spriteName in goodbye_blue_sky._sprite) {
    let spriteData = goodbye_blue_sky._sprite[spriteName];
    let spriteOffset = spriteData[0];
    let spriteDuration = spriteData[1];

    // Calculate the remaining duration of the sprite from the current seek position
    let remainingDuration = (spriteOffset + spriteDuration) / 1000 - maxSeekPos;

    if (remainingDuration > 0) {
      goodbye_blue_sky.play(spriteName);
    }
  }
}

function deSyncTracks() {
  if (ids.length > 0) {
    var sprite_offset_ref = goodbye_blue_sky._sprite[Object.entries(goodbye_blue_sky._sprite)[0][0]][0];
    const seek_pos_ref = goodbye_blue_sky.seek(ids[0]);
    const abs_pos_ref = seek_pos_ref - sprite_offset_ref;


    goodbye_blue_sky.seek(abs_pos_ref + 200, ids[0]);

    printTrackSyncStatus() 
  }
}


function printTrackSyncStatus() {
  console.log("-------------------------------------");

  Object.entries(goodbye_blue_sky._sprite).forEach(([spriteName, spriteOffset], index) => {

    let sprite_offset = spriteOffset[0] / 1000;
    let seek_pos = goodbye_blue_sky.seek(ids[index]);
    let abs_pos = seek_pos - sprite_offset;

    console.log(spriteName + ": abs pos " + abs_pos);
    // console.log(spriteName + ": seek pos " + seek_pos);
    // console.log(spriteName + ": sprite_offset pos " + sprite_offset);
  });

  console.log("-------------------------------------");

}

function syncTracks() {
  var sprite_offset_ref = goodbye_blue_sky._sprite[Object.entries(goodbye_blue_sky._sprite)[0][0]][0];
  const seek_pos_ref = goodbye_blue_sky.seek(ids[0]);
  const abs_pos_ref = seek_pos_ref - sprite_offset_ref;
  console.log("-------------------------------------");

  Object.entries(goodbye_blue_sky._sprite).forEach(([spriteName, spriteOffset], index) => {

    let sprite_offset = spriteOffset[0] / 1000;
    let seek_pos = goodbye_blue_sky.seek(ids[index]);
    let abs_pos = seek_pos - sprite_offset;

    if (Math.abs(abs_pos_ref - abs_pos) > 0.03) {
      // console.log("Out of syc by: " + Math.abs(abs_pos_ref - abs_pos));
      goodbye_blue_sky.seek(abs_pos_ref + sprite_offset, ids[index]);
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


  var max_duration = 1e-6;
  var max_duration_idx = 0;

  Object.keys(goodbye_blue_sky._sprite).forEach((spriteName, index) => {
    const spriteDuration = goodbye_blue_sky._sprite[spriteName][1] / 1000;

    if (spriteDuration > max_duration) {
      max_duration = spriteDuration;
      max_duration_idx = index;
    }
  });

// update timeline
var loopId;
goodbye_blue_sky.on('play', function () {
  loopId = setInterval(function () {

    const seek_time_ref = goodbye_blue_sky.seek(ids[max_duration_idx]);
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

      Object.entries(goodbye_blue_sky._sprite).forEach(([spriteName, spriteOffset], index) => {

        let sprite_offset = spriteOffset[0] / 1000;
        // let seek_pos = goodbye_blue_sky.seek(ids[index]);
        // let abs_pos = seek_pos - sprite_offset;

        const timeline_abs_value = loop_left_abs
        goodbye_blue_sky.seek(loop_left_abs, ids[index]);
      });


    }

  }, 10);
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
  Object.entries(goodbye_blue_sky._sprite).forEach(([spriteName, spriteOffset], index) => {

    let sprite_offset = spriteOffset[0] / 1000;
    // let seek_pos = goodbye_blue_sky.seek(ids[index]);
    // let abs_pos = seek_pos - sprite_offset;
    // const timeline_abs_value = loop_left_abs
    goodbye_blue_sky.seek(seekTime+sprite_offset, ids[index]);
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
    syncTracks();
  } else {
    document.getElementById("play").textContent = "Play";
    allPaused = false;
    ids.forEach((id, index) => {
      goodbye_blue_sky.pause(id)
    });
    syncTracks();
  }
});

var speedSlider = document.getElementById('speed');
speedSlider.addEventListener('input', function () {
  var speed = parseFloat(speedSlider.value);
  goodbye_blue_sky.rate(speed);
});

stopBtn.addEventListener('click', () => {
  document.getElementById("play").textContent = "Play";
  allPaused = false;
  ids.forEach((id, index) => {
    goodbye_blue_sky.stop(id)
  });
  syncTracks();
});



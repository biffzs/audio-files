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








  /*
   *   This content is licensed according to the W3C Software License at
   *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
   *
   *   File:   slider-multithumb.js
   *
   *   Desc:   A dual slider widget that implements ARIA Authoring Practices
   */

  'use strict';
  class SliderMultithumb {
    constructor(domNode) {
      this.isMoving = false;
      this.movingSliderNode = false;

      this.domNode = domNode;

      this.svgNode = domNode.querySelector('svg');
      this.svgPoint = this.svgNode.createSVGPoint();

      this.railNode = domNode.querySelector('.rail rect');
      this.rangeNode = domNode.querySelector('.range rect');

      this.minSliderNode = domNode.querySelector('[role=slider].minimum');
      this.maxSliderNode = domNode.querySelector('[role=slider].maximum');

      this.minSliderValueNode = this.minSliderNode.querySelector('.value');
      this.maxSliderValueNode = this.maxSliderNode.querySelector('.value');

      this.minSliderFocusNode = this.minSliderNode.querySelector('.focus-ring');
      this.maxSliderFocusNode = this.maxSliderNode.querySelector('.focus-ring');

      this.minSliderThumbNode = this.minSliderNode.querySelector('.thumb');
      this.maxSliderThumbNode = this.maxSliderNode.querySelector('.thumb');

      // Dimensions of the slider focus ring, thumb and rail

      this.svgWidth = 360;
      this.svgHeight = 80;

      this.valueTop = 24;
      this.valueHeight = this.minSliderValueNode.getBoundingClientRect().height;

      this.railHeight = 6;
      this.railWidth = 300;
      this.railY = 42;
      this.railX = 10;

      this.thumbTop = 31;
      this.thumbHeight = 28;
      this.thumbWidth = 28;
      this.thumb2Width = 2 * this.thumbWidth;
      this.thumbMiddle = this.thumbTop + this.thumbHeight / 2;
      this.thumbBottom = this.thumbTop + this.thumbHeight;

      this.focusOffset = 8;
      this.focusY = this.valueTop - this.valueHeight - this.focusOffset + 2;
      this.focusWidth = this.thumbWidth + 2 * this.focusOffset;
      this.focusHeight = this.thumbBottom - this.focusY + this.focusOffset + 2;
      this.focusRadius = this.focusWidth / 8;

      this.svgNode.setAttribute('width', this.svgWidth);
      this.svgNode.setAttribute('height', this.svgHeight);

      this.minSliderFocusNode.setAttribute('y', this.focusY);
      this.maxSliderFocusNode.setAttribute('y', this.focusY);
      this.minSliderFocusNode.setAttribute('width', this.focusWidth);
      this.maxSliderFocusNode.setAttribute('width', this.focusWidth);
      this.minSliderFocusNode.setAttribute('height', this.focusHeight);
      this.maxSliderFocusNode.setAttribute('height', this.focusHeight);
      this.minSliderFocusNode.setAttribute('rx', this.focusRadius);
      this.maxSliderFocusNode.setAttribute('rx', this.focusRadius);

      this.minSliderValueNode.setAttribute('y', this.valueTop);
      this.maxSliderValueNode.setAttribute('y', this.valueTop);

      this.railNode.setAttribute('y', this.railY);
      this.railNode.setAttribute('x', this.railX);
      this.railNode.setAttribute('height', this.railHeight);
      this.railNode.setAttribute('width', this.railWidth + this.thumbWidth);
      this.railNode.setAttribute('rx', this.railHeight / 2);

      this.rangeNode.setAttribute('y', this.railY);
      this.rangeNode.setAttribute('x', this.railX / 2);
      this.rangeNode.setAttribute('height', this.railHeight);
      this.rangeNode.setAttribute('width', 0);

      this.sliderMinValue = this.getValueMin(this.minSliderNode);
      this.sliderMaxValue = this.getValueMax(this.maxSliderNode);
      this.sliderDiffValue = this.sliderMaxValue - this.sliderMinValue;

      this.minSliderRight = 0;
      this.maxSliderLeft = this.railWidth;

      this.minSliderNode.addEventListener(
        'keydown',
        this.onSliderKeydown.bind(this)
      );
      this.minSliderNode.addEventListener(
        'pointerdown',
        this.onSliderPointerdown.bind(this)
      );

      this.minSliderNode.addEventListener('focus', this.onSliderFocus.bind(this));
      this.minSliderNode.addEventListener('blur', this.onSliderBlur.bind(this));

      this.maxSliderNode.addEventListener(
        'keydown',
        this.onSliderKeydown.bind(this)
      );
      this.maxSliderNode.addEventListener(
        'pointerdown',
        this.onSliderPointerdown.bind(this)
      );

      // bind a pointermove event handler to move pointer
      document.addEventListener('pointermove', this.onPointermove.bind(this));

      // bind a pointerup event handler to stop tracking pointer movements
      document.addEventListener('pointerup', this.onPointerup.bind(this));

      this.maxSliderNode.addEventListener('focus', this.onSliderFocus.bind(this));
      this.maxSliderNode.addEventListener('blur', this.onSliderBlur.bind(this));

      this.moveSliderTo(this.minSliderNode, this.getValue(this.minSliderNode));
      this.moveSliderTo(this.maxSliderNode, this.getValue(this.maxSliderNode));
    }

    getSVGPoint(event) {
      this.svgPoint.x = event.clientX;
      this.svgPoint.y = event.clientY;
      return this.svgPoint.matrixTransform(this.svgNode.getScreenCTM().inverse());
    }

    getValue(sliderNode) {
      return parseInt(sliderNode.getAttribute('aria-valuenow'));
    }

    getValueMin(sliderNode) {
      return parseInt(sliderNode.getAttribute('aria-valuemin'));
    }

    getValueMax(sliderNode) {
      return parseInt(sliderNode.getAttribute('aria-valuemax'));
    }

    isMinSlider(sliderNode) {
      return this.minSliderNode === sliderNode;
    }

    isInRange(sliderNode, value) {
      let valueMin = this.getValueMin(sliderNode);
      let valueMax = this.getValueMax(sliderNode);
      return value <= valueMax && value >= valueMin;
    }

    isOutOfRange(value) {
      let valueMin = this.getValueMin(this.minSliderNode);
      let valueMax = this.getValueMax(this.maxSliderNode);
      return value > valueMax || value < valueMin;
    }

    getXFromThumb(node) {
      var points = node.getAttribute('points').split(',');
      return parseInt(points[0]);
    }

    moveSliderTo(sliderNode, value) {
      var valueMax,
        valueMin,
        pos,
        x,
        points = '',
        width,
        dollarValue;

      if (this.isMinSlider(sliderNode)) {
        valueMin = this.getValueMin(this.minSliderNode);
        valueMax = this.getValueMax(this.minSliderNode);
      } else {
        valueMin = this.getValueMin(this.maxSliderNode);
        valueMax = this.getValueMax(this.maxSliderNode);
      }

      value = Math.min(Math.max(value, valueMin), valueMax);

      sliderNode.setAttribute('aria-valuenow', value);
      dollarValue = '$' + value;

      pos = this.railX;
      pos += Math.round(
        (value * (this.railWidth - this.thumbWidth)) /
        (this.sliderMaxValue - this.sliderMinValue)
      );

      if (this.isMinSlider(sliderNode)) {
        // update ARIA attributes
        this.minSliderValueNode.textContent = dollarValue;
        this.maxSliderNode.setAttribute('aria-valuemin', value);

        // move the SVG focus ring and thumb elements
        x = pos - this.focusOffset - 1;
        this.minSliderFocusNode.setAttribute('x', x);

        points = `${pos},${this.thumbTop}`;
        points += ` ${pos + this.thumbWidth},${this.thumbMiddle}`;
        points += ` ${pos},${this.thumbBottom}`;
        this.minSliderThumbNode.setAttribute('points', points);

        // Position value
        width = this.minSliderValueNode.getBoundingClientRect().width;
        pos = pos + (this.thumbWidth - width) / 2;
        if (pos + width > this.maxSliderLeft - 2) {
          pos = this.maxSliderLeft - width - 2;
        }
        this.minSliderValueNode.setAttribute('x', pos);
        this.minSliderRight = pos;
      } else {
        // update label and ARIA attributes
        this.maxSliderValueNode.textContent = dollarValue;
        this.minSliderNode.setAttribute('aria-valuemax', value);

        // move the SVG focus ring and thumb elements
        x = pos + this.thumbWidth - this.focusOffset + 1;
        this.maxSliderFocusNode.setAttribute('x', x);

        points = `${pos + this.thumbWidth},${this.thumbMiddle}`;
        points += ` ${pos + this.thumb2Width},${this.thumbTop}`;
        points += ` ${pos + this.thumb2Width},${this.thumbBottom}`;
        this.maxSliderThumbNode.setAttribute('points', points);

        width = this.maxSliderValueNode.getBoundingClientRect().width;
        pos = pos + this.thumbWidth + (this.thumbWidth - width) / 2;
        if (pos - width < this.minSliderRight + 2) {
          pos = this.minSliderRight + width + 2;
        }

        this.maxSliderValueNode.setAttribute('x', pos);
        this.maxSliderLeft = pos;
      }

      // Set range rect

      x = this.getXFromThumb(this.minSliderThumbNode) + this.thumbWidth / 2;
      width =
        this.getXFromThumb(this.maxSliderThumbNode) - x + this.thumbWidth / 2;
      this.rangeNode.setAttribute('x', x);
      this.rangeNode.setAttribute('width', width);
    }

    onSliderKeydown(event) {
      var flag = false;
      var sliderNode = event.currentTarget;
      var value = this.getValue(sliderNode);
      var valueMin = this.getValueMin(sliderNode);
      var valueMax = this.getValueMax(sliderNode);

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          this.moveSliderTo(sliderNode, value - 1);
          flag = true;
          break;

        case 'ArrowRight':
        case 'ArrowUp':
          this.moveSliderTo(sliderNode, value + 1);
          flag = true;
          break;

        case 'PageDown':
          this.moveSliderTo(sliderNode, value - 10);
          flag = true;
          break;

        case 'PageUp':
          this.moveSliderTo(sliderNode, value + 10);
          flag = true;
          break;

        case 'Home':
          this.moveSliderTo(sliderNode, valueMin);
          flag = true;
          break;

        case 'End':
          this.moveSliderTo(sliderNode, valueMax);
          flag = true;
          break;

        default:
          break;
      }

      if (flag) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    onSliderFocus(event) {
      event.currentTarget.classList.add('focus');
      this.svgNode.classList.add('active');
    }

    onSliderBlur(event) {
      event.currentTarget.classList.remove('focus');
      this.svgNode.classList.remove('active');
    }

    onSliderPointerdown(event) {
      this.isMoving = true;
      this.movingSliderNode = event.currentTarget;
      this.isMinSliderMoving = this.isMinSlider(event.currentTarget);

      event.preventDefault();
      event.stopPropagation();

      // Set focus to the clicked handle
      this.movingSliderNode.focus();
    }

    onPointermove(event) {
      if (
        this.isMoving &&
        this.movingSliderNode &&
        this.domNode.contains(event.target)
      ) {
        var x = this.getSVGPoint(event).x - this.railX;
        if (this.isMinSliderMoving) {
          x = Math.max(0, x - this.thumbWidth / 3);
        } else {
          x = Math.max(0, x - (5 * this.thumbWidth) / 3);
        }
        x = Math.min(x, this.railWidth - this.thumbWidth);
        var value = Math.round(
          (x * this.sliderDiffValue) / (this.railWidth - this.thumbWidth)
        );
        this.moveSliderTo(this.movingSliderNode, value);

        event.preventDefault();
        event.stopPropagation();
      }
    }

    onPointerup() {
      this.isMoving = false;
      this.movingSliderNode = false;
    }
  }

  // Initialize Multithumb Slider widgets on the page
  window.addEventListener('load', function () {
    var slidersMultithumb = document.querySelectorAll('.slider-multithumb');

    for (let i = 0; i < slidersMultithumb.length; i++) {
      new SliderMultithumb(slidersMultithumb[i]);
    }
  });




} // APP



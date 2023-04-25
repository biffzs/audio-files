import { seekTo } from '../howler_js.js';


// Unit test for seekTo function
function testSeekTo() {
  const fakeHowl = {
    _sprite: {
      sprite1: [0, 1000],
      sprite2: [2000, 3000],
      sprite3: [5000, 6000]
    },
    seek: jest.fn()
  };
  const fakeSeekTime = 3;
  const fakeIds = [1, 2, 3];

  // Call the function
  seekTo(fakeHowl, fakeSeekTime, fakeIds);

  // Check that the seek function was called with the correct parameters for each sprite
  expect(fakeHowl.seek.mock.calls).toEqual([
    [fakeSeekTime, 1],
    [fakeSeekTime + 2, 2],
    [fakeSeekTime + 5, 3]
  ]);

  // Check that the function returns true
  expect(seekTo(fakeHowl, fakeSeekTime, fakeIds)).toBe(true);
}

// Define some test data
const testData = [
  { howl: { _sprite: { sprite1: [0, 1000] } }, seekTime: 0, ids: [1] },
  { howl: { _sprite: { sprite1: [2000, 3000] } }, seekTime: 2, ids: [1] },
  { howl: { _sprite: { sprite1: [5000, 6000] } }, seekTime: 5, ids: [1] },
  { howl: { _sprite: { sprite1: [0, 1000], sprite2: [2000, 3000], sprite3: [5000, 6000] } }, seekTime: 3, ids: [1, 2, 3] },
  { howl: { _sprite: { sprite1: [0, 1000], sprite2: [2000, 3000], sprite3: [5000, 6000] } }, seekTime: 0, ids: [1, 2, 3] }
];

// Call seekTo function with test data and print the results
testData.forEach(data => {
  const { howl, seekTime, ids } = data;
  console.log(`Seeking to ${seekTime}s with IDs ${ids.join(', ')}:`);
  seekTo(howl, seekTime, ids);
});
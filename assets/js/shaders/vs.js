const vs = `
  attribute vec2 coords;
  attribute vec2 imageCoords;

  uniform vec2 resolution;
  varying vec2 fragImageCoords;

  void main() {

  gl_Position = vec4(coords, 0, 1);


   fragImageCoords = imageCoords;

  }`;

export default vs;

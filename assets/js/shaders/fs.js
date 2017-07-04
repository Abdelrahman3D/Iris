const convolution = `
vec3 convolution(sampler2D image, vec2 coords, vec2 pixelOffset) {
  vec3 result = texture2D(image, coords + pixelOffset * vec2(-1, -1)).rgb * kernel[0];
  result += texture2D(image, coords + pixelOffset * vec2( 0, -1)).rgb * kernel[1];
  result += texture2D(image, coords + pixelOffset * vec2( 1, -1)).rgb * kernel[2];
  result += texture2D(image, coords + pixelOffset * vec2(-1,  0)).rgb * kernel[3];
  result += texture2D(image, coords + pixelOffset * vec2( 0,  0)).rgb * kernel[4];
  result += texture2D(image, coords + pixelOffset * vec2( 1,  0)).rgb * kernel[5];
  result += texture2D(image, coords + pixelOffset * vec2(-1,  1)).rgb * kernel[6];
  result += texture2D(image, coords + pixelOffset * vec2( 0,  1)).rgb * kernel[7];
  result += texture2D(image, coords + pixelOffset * vec2( 1,  1)).rgb * kernel[8];

  return result;
}`;

const fs = `
  precision mediump float;

  uniform sampler2D image;
  uniform vec2 frameSize;
  uniform float kernel[9];

  varying vec2 fragImageCoords;

  ${convolution}

  void main(void) {
    vec2 pixelOffset = vec2(1.0) / frameSize;
    vec3 frame;

    frame = convolution(image, fragImageCoords, pixelOffset);


    gl_FragColor = vec4(frame, 1);
  }`;

export default fs;

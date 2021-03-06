export default {
  normal: [
    0, 0, 0,
    0, 1, 0,
    0, 0, 0,
  ],
  gaussianBlur: [
    0, 1, 0,
    1, 1, 1,
    0, 1, 0,
  ],
  unsharpen: [
    -1, -1, -1,
    -1,  9, -1,
    -1, -1, -1,
  ],
  sharpness: [
     0, -1,  0,
    -1,  5, -1,
     0, -1,  0,
  ],
  sharpen: [
     -1, -1, -1,
     -1, 16, -1,
     -1, -1, -1,
  ],
  edgeDetect: [
   -5, -5, -5,
   -5, 39, -5,
   -5, -5, -5,
  ],
  emboss: [
   -2, -1,  0,
   -1,  1,  1,
    0,  1,  2,
  ]
};

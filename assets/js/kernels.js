const kernels = [
  /*eslint-disable */
  {
    name: 'normal',
    matrix: [
      0, 0, 0,
      0, 1, 0,
      0, 0, 0
    ],
    icon: ''
  }, {
    name: 'gaussianBlur',
    matrix: [
      0.045, 0.122, 0.045,
      0.122, 0.332, 0.122,
      0.045, 0.122, 0.045
    ]
  }, {
    name: 'sharpen',
    matrix: [
       0, -1,  0,
      -1,  5, -1,
       0, -1,  0
    ]
  }, {
    name: 'Edge detection',
    matrix: [
      -1, -1, -1,
      -1,  8, -1,
      -1, -1, -1
    ]
  }, {
    name: 'emboss',
    matrix: [
      -2, -1,  0,
      -1,  1,  1,
       0,  1,  2
    ]
  }
  /*eslint-enable */
];

export default kernels;

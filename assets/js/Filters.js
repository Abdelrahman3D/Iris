import vs from './shaders/vs';
import fs from './shaders/fs';
import { select } from './utilities';

let gl;

class Filters {
  constructor(el) {
    this.canvas = select(el);
    this.init();
  }

  init() {
    gl = this.canvas.getContext('webgl');
    gl.clearColor(1, 1, 1, 1);

    this.program = null;
    this.filters = [];
    this.initShaders();
    this.initVertices();
    this.getAttribLocations();
  }

  loadImage(imageSrc) {
    this.image = new Image();
    this.image.src = imageSrc;

    this.canvas.width = this.image.width;
    this.canvas.height = this.image.height;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.image.onload = () => {
      this.createFrameBuffers();
      this.draw();
    };
  }


  addFilter(kernel) {
    this.filters.push(kernel);
    this.draw();
  }

  resetFilters() {
    this.filters = [[
      0, 0, 0,
      0, 1, 0,
      0, 0, 0
    ]];
    this.draw();
  }

  getAttribLocations() {
    this.frameSizeLocation = gl.getUniformLocation(this.program, 'frameSize');
    this.kernelLocation = gl.getUniformLocation(this.program, 'kernel[0]');
  }

  initShaders() {
    this.program = gl.createProgram();

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vs);
    gl.compileShader(vertexShader);
    gl.attachShader(this.program, vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fs);
    gl.compileShader(fragmentShader);
    gl.attachShader(this.program, fragmentShader);

    gl.linkProgram(this.program);
    gl.useProgram(this.program);
  }

  static createTexture() {
    const frameTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, frameTexture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return frameTexture;
  }

  createFrameBuffers() {
    this.originalTexture = Filters.createTexture();
    this.textures = [];
    this.frameBuffers = [];
    for (let ii = 0; ii < 2; ++ii) {
      const texture = Filters.createTexture(gl);
      this.textures.push(texture);

      // make the texture the same size as the image
      gl.texImage2D(
        gl.TEXTURE_2D,
        0, gl.RGBA,
        this.image.width,
        this.image.height,
        0, gl.RGBA,
        gl.UNSIGNED_BYTE,
        null);

      // Create a framebuffer
      const fbo = gl.createFramebuffer();
      this.frameBuffers.push(fbo);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

      // Attach a texture to it.
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture, 0);
    }
  }

  useFrameBuffer(frameBuffer) {
    // make this the framebuffer we are rendering to.
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

    // Tell the shader the resolution of the framebuffer.
    gl.uniform2f(this.frameSizeLocation, this.image.width, this.image.height);

    // Tell webgl the viewport setting needed for framebuffer.
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  initVertices() {
    // create vertices buffer
    const verticesBuffer = gl.createBuffer();
    // bind the buffer so it will be the target in future buffer operations.
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    // we target array buffer and send data (vertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      /*eslint-disable */
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,

       1.0,  1.0,
       1.0, -1.0,
      -1.0,  1.0
      /*eslint-enable */
    ]), gl.STATIC_DRAW);

    const coords = gl.getAttribLocation(this.program, 'coords');
    gl.vertexAttribPointer(coords, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coords);


    // create image buffer
    // buffer for image coordinations
    const coordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,

      1.0, 1.0,
      1.0, 0.0,
      0.0, 1.0
    ]), gl.STATIC_DRAW);

    const imageCoords = gl.getAttribLocation(this.program, 'imageCoords');
    gl.vertexAttribPointer(imageCoords, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(imageCoords);
  }

  draw() {
    // gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindTexture(gl.TEXTURE_2D, this.originalTexture);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);

    for (let ii = 0; ii < this.filters.length; ++ii) {
      // Setup to draw into one of the frame buffers.
      this.useFrameBuffer(this.frameBuffers[ii % 2]);

      this.drawWithKernel(this.filters[ii]);

      // for the next draw, use the texture we just rendered to.
      gl.bindTexture(gl.TEXTURE_2D, this.textures[ii % 2]);
    }
    this.useFrameBuffer(null);
    this.drawWithKernel([0, 0, 0, 0, 1, 0, 0, 0, 0]);
  }

  drawWithKernel(kernel) {
    gl.uniform1fv(this.kernelLocation, kernel);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

}

export default Filters;

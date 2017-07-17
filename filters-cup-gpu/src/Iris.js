import fgSource from './shaders/fg_convolute.js';
import vxSource from './shaders/vx_convolute.js';

export default class Iris
{
  constructor(el) {
    this._resolveContext(el);
  }

  _resolveContext(el) {
    let canvas = el;
    // passed a selector.
    if (typeof el === 'string') {
      canvas = document.querySelector(el);
    }
    this.canvas = canvas;
    if (! canvas) {
      throw TypeError('Cannot use a null canvas');
    }

    let gl = canvas.getContext('webgl2');
    // webgl2 is supported.
    if (gl) {
      this.gl = gl;
      this.version = 2;
      return;
    }

    gl = canvas.getContext('webgl');
    if (gl) {
      this.gl = gl;
      this.version = 1;
      return;
    }

    throw TypeError('Webgl is not supported.');
  }

  clearColor() {
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  render(src, filter = [0, 0, 0, 0, 1, 0, 0, 0]) {
    const image = new Image();
    image.src = src;
    image.onload = () => {
      this.gl.canvas.width = image.width;
      this.gl.canvas.height = image.height;
      this.convolute(filter, image);
    }
  }

  convolute(kernel, image) {
    //this.clearColor();
    const program = this.createProgram();
    // look up where the vertex data needs to go.
    const positionAttributeLocation = this.gl.getAttribLocation(program, "a_position");
    const texCoordAttributeLocation = this.gl.getAttribLocation(program, "a_texCoord");
      // lookup uniforms
    const resolutionLocation = this.gl.getUniformLocation(program, "u_resolution");
    const imageLocation = this.gl.getUniformLocation(program, "u_image");
    const kernelLocation = this.gl.getUniformLocation(program, "u_kernel[0]");
    const kernelWeightLocation = this.gl.getUniformLocation(program, "u_kernelWeight");

    // Create a vertex array object (attribute state)
    const vao = this.gl.createVertexArray();

    // and make it the one we're currently working with
    this.gl.bindVertexArray(vao);

    // Create a buffer and put a single pixel space rectangle in
    // it (2 triangles)
    const positionBuffer = this.gl.createBuffer();

    // Turn on the attribute
    this.gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

    // provide texture coordinates for the rectangle.
    const texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
        0.0,  0.0,
        1.0,  0.0,
        0.0,  1.0,
        0.0,  1.0,
        1.0,  0.0,
        1.0,  1.0,
    ]), this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(texCoordAttributeLocation);
    this.gl.vertexAttribPointer(texCoordAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

    // Create a texture.
    const texture = this.gl.createTexture();

    // make unit 0 the active texture uint
    // (ie, the unit all other texture commands will affect
    this.gl.activeTexture(this.gl.TEXTURE0 + 0);

    // Bind it to texture unit 0's 2D bind point
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    // Set the parameters so we don't need mips and so we're not filtering
    // and we don't repeat at the edges.
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

    // Upload the image into the texture.
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

    // Bind the position buffer so this.gl.bufferData that will be called
    // in setRectangle puts data in the position buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

    // Set a rectangle the same size as the image.
    this.setRectangle(0, 0, image.width, image.height);
    this.useKernel(kernel, program, vao, resolutionLocation, imageLocation, kernelWeightLocation, kernelLocation);
  }

  setRectangle(x, y, width, height) {
    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
       x1, y1,
       x2, y1,
       x1, y2,
       x1, y2,
       x2, y1,
       x2, y2,
    ]), this.gl.STATIC_DRAW);
  }

  useKernel(kernel, program, vao, resolutionLocation, imageLocation, kernelWeightLocation, kernelLocation) {
    // Tell WebGL how to convert from clip space to pixels
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    // Clear the canvas
    this.clearColor();

    // Tell it to use our program (pair of shaders)
    this.gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    this.gl.bindVertexArray(vao);

    // Pass in the canvas resolution so we can convert from
    // pixels to clipspace in the shader
    this.gl.uniform2f(resolutionLocation, this.gl.canvas.width, this.gl.canvas.height);

    // Tell the shader to get the texture from texture unit 0
    this.gl.uniform1i(imageLocation, 0);

    // set the kernel and it's weight
    this.gl.uniform1fv(kernelLocation, kernel);
    this.gl.uniform1f(kernelWeightLocation, this.getKernellWeight(kernel));

    // Draw the rectangle.
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  getKernellWeight(kernel) {
    const weight = kernel.reduce((prev, curr) => {
      return prev + curr;
    });

    return weight <= 0 ? 1 : weight;
  }

  createProgram() {
    // create shaders
    const vx = this.gl.createShader(this.gl.VERTEX_SHADER);
    const fg = this.gl.createShader(this.gl.FRAGMENT_SHADER);

    // attach sources to shaders.
    this.gl.shaderSource(vx, vxSource);
    this.gl.shaderSource(fg, fgSource);

    // compile them.
    this.gl.compileShader(vx);
    if(! this.gl.getShaderParameter(vx, this.gl.COMPILE_STATUS)) {
      console.error(`ERORR Vertex Shader ${this.gl.getShaderInfoLog(vx)}`);
      return;
    }
    this.gl.compileShader(fg);
    if(! this.gl.getShaderParameter(fg, this.gl.COMPILE_STATUS)) {
      console.error(`ERORR Vertex Shader ${this.gl.getShaderInfoLog(fg)}`);
      return;
    }

    const program = this.gl.createProgram();
    this.gl.attachShader(program, vx);
    this.gl.attachShader(program, fg);
    this.gl.linkProgram(program);

    // TODO: Check program link status.

    return program;
  }
}

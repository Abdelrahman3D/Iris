import * as utils from './utils';
import ColorPyramid from './ColorPyramid';

export default class EVM {
  constructor(ctx, xtc, width, height, depth) {
    // Setup Canvas contexts.
    this.update(ctx, xtc, width, height, depth);
    this.ctx.fillStyle = 'rgb(0,255,0)';
    this.ctx.strokeStyle = 'rgb(0,255,0)';
  }

  update(ctx, xtc, width, height, depth) {
    delete this.img_pyr;
    delete this.img_ryp;
    delete this.lowpass1;
    delete this.lowpass2;
    delete this.filtered;

    this.width = width;
    this.height = height;
    this.frames = 0;
    this.ctx = ctx;
    this.xtc = xtc;

    this.img_pyr = new ColorPyramid(width, height, depth);
    this.img_ryp = new ColorPyramid(width, height, depth);
    this.lowpass1 = new ColorPyramid(width, height, depth);
    this.lowpass2 = new ColorPyramid(width, height, depth);
    this.filtered = new ColorPyramid(width, height, depth);
  }

  run(params) {
    const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    this.img_pyr.fromRGBA(imageData);
    this.img_pyr.pyrDown();
    this.img_ryp.pyrUp(this.img_pyr);
    this.img_pyr.lpyrDown(this.img_ryp);

    this.lowpass1.iirFilter(this.img_pyr, params.r1);
    this.lowpass2.iirFilter(this.img_pyr, params.r2);
    this.filtered.setSubtract(this.lowpass1, this.lowpass2);

    const delta = params.lambda_c / 8 / (1 + params.alpha);
    let lambda = Math.sqrt(this.height * this.height + this.width * this.width) / 3;

    for (let n = 0; n < this.filtered.levels; n++) {
      let currAlpha = lambda / delta / 8 - 1;
      currAlpha *= params.exaggeration_factor;

      if (n <= 0 || n == this.filtered.levels - 1) {
        this.filtered.mulLevel(n, 0);
      } else if (currAlpha > params.alpha) {
        this.filtered.mulLevel(n, params.alpha);
      } else {
        this.filtered.mulLevel(n, currAlpha);
      }

      lambda /= 2;
    }

    this.img_ryp.lpyrUp(this.filtered);

    const data = this.ctx.createImageData(this.width, this.height);
    this.filtered.exportLayerRGB(1, data);
    this.xtc.putImageData(data, 0, 0);

    const merp = this.ctx.createImageData(this.width, this.height);
    this.img_pyr.fromRGBA(imageData);
    utils.imgMul(0, this.img_ryp.Y, this.img_pyr.Y, 1);
    utils.imgMul(0, this.img_ryp.U, this.img_pyr.U, params.chromAttenuation);
    utils.imgMul(0, this.img_ryp.V, this.img_pyr.V, params.chromAttenuation);

    this.img_ryp.exportLayer(0, merp);
    this.ctx.putImageData(merp, 0, 0);

    if (this.frames === 0) {
      this.lowpass1.iirFilter(this.img_pyr, 1);
      this.lowpass2.iirFilter(this.img_pyr, 1);
    }
    this.frames++;
  }
}

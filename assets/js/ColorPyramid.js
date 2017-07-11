import * as utils from './utils';
const jsfeat = require('jsfeat');

jsfeat.imgproc.pyrup = function(src, dst) {
  let w = src.cols, h = src.rows;
  let w2 = w << 1, h2 = h << 1;
  let x = 0, y = 0;
  dst.resize(w2, h2, src.channel)
  let src_d = src.data, dst_d = dst.data;

  for(y = 0; y < h; ++y) {
      for(x = 0; x < w; ++x){
          dst_d[(2 * y + 0) * w2 + (x * 2 + 0)] = 
          dst_d[(2 * y + 1) * w2 + (x * 2 + 0)] = 
          dst_d[(2 * y + 0) * w2 + (x * 2 + 1)] = 
          dst_d[(2 * y + 1) * w2 + (x * 2 + 1)] = src_d[y * w + x]
      }
  }

    this.gaussian_blur(dst, dst, 2)
};

export default class ColorPyramid {
  constructor (width, height, depth) {
    this.levels = depth;
    this.width = width;
    this.height = height;
    this.Y = this._getPyr(width, height, depth);
    this.U = this._getPyr(width, height, depth);
    this.V = this._getPyr(width, height, depth);
  }

  _getPyr (width, height, depth) {
    const pyr = new jsfeat.pyramid_t(depth);
    pyr.allocate(width, height, jsfeat.F32_t | jsfeat.C1_t);
    return pyr;
  }

  pyrDown () {
    const exec = (imgData) => {
      let i = 2;
      let a = imgData.data[0];
      let b = imgData.data[1];
      jsfeat.imgproc.pyrdown(a, b);
      for(; i < imgData.levels; i++){
        a = b;
        b = imgData.data[i];
        jsfeat.imgproc.pyrdown(a, b);
      }
    };
    exec(this.Y);
    exec(this.U);
    exec(this.V);
  }

  pyrUp (source) {
    const exec = (pyr, imageData) => {
      for(let i = 1; i < pyr.levels; i++){
        jsfeat.imgproc.pyrup(imageData.data[i], pyr.data[i - 1]);
      }
    };

    exec(this.Y, source.Y);
    exec(this.U, source.U);
    exec(this.V, source.V);
  }

  lpyrUp (source) {
    const exec = (pyr, data) => {
      let inner = pyr.data[pyr.levels - 2];
      for(let i = 0; i < inner.cols * inner.rows; i++){
        inner.data[i] = 0;
      }
      
      for(let i = pyr.levels - 1; i > 0; i--){
        jsfeat.imgproc.pyrup(pyr.data[i], pyr.data[i - 1]);
        utils.imgAdd(pyr.data[i - 1], data.data[i - 1]);
      }    
    };

    exec(this.Y, source.Y);
    exec(this.U, source.U);
    exec(this.V, source.V);
  }

  lpyrDown (source) {
    const exec = (pyr, imgData) => {
      for(let i = 0; i < pyr.levels - 1; i++) {
        utils.imgSub(imgData.data[i], pyr.data[i]);
      }
    };

    exec(this.Y, source.Y);
    exec(this.U, source.U);
    exec(this.V, source.V);
  }

  fromRGBA (src) {
    const w = src.width;
    const h = src.height;
    for(let y = 0; y < h; y++) {
      for(let x = 0; x < w; x++) {
        const r = src.data[(y * w + x) * 4];
        const g = src.data[(y * w + x) * 4 + 1];
        const b = src.data[(y * w + x) * 4 + 2];

        const Y = r *  .299000 + g *  .587000 + b *  .114000;
        const U = r * -.168736 + g * -.331264 + b *  .500000 + 128;
        const V = r *  .500000 + g * -.418688 + b * -.081312 + 128;

        this.Y.data[0].data[y * w + x] = Y;
        this.U.data[0].data[y * w + x] = U;
        this.V.data[0].data[y * w + x] = V;
      }
    }
  }

  setSubtract (a, b) {
    const exec = (chan, chana, chanb) => {
      for(let i = 0; i < b.levels; i++){
        const al = chana.data[i];
        const bl = chanb.data[i];
        const cl = chan.data[i];
        for(let j = 0; j < al.cols * al.rows; j++) {
          cl.data[j] = (al.data[j] - bl.data[j]);
        }
      }
    };

    exec(this.Y, a.Y, b.Y);
    exec(this.U, a.U, b.U);
    exec(this.V, a.V, b.V);
  }

  mulLevel(n, c) {
    const exec = (chan) => {
      let d = chan.data[n];
      for(let i = 0; i < d.cols * d.rows; i++){
        d.data[i] *= c;
      }
    };

    exec(this.Y);
    exec(this.U);
    exec(this.V);
  }

  exportLayer (layer, dest) {
    let Yp = this.Y.data[layer].data,
      Up = this.U.data[layer].data,
      Vp = this.V.data[layer].data,
      Dd = dest.data;

    let w = this.Y.data[layer].cols,
      h = this.Y.data[layer].rows;
    
    for(let y = 0; y < h; y++){
      for(let x = 0; x < w; x++){
        let i = y * w + x;
        let Y = Yp[i], U = Up[i], V = Vp[i];
        let r = Y + 1.4075 * (V - 128),
          g = Y - 0.3455 * (U - 128) - (0.7169 * (V - 128)),
          b = Y + 1.7790 * (U - 128);
            
        let n = 4 * (y * dest.width + x);
            
        Dd[n] = r;
        Dd[n + 1] = g;
        Dd[n + 2] = b;
        Dd[n + 3] = 255;          

      }
    }
  }

  exportLayerRGB (layer, dest) {
    let Yp = this.Y.data[layer].data,
      Up = this.U.data[layer].data,
      Vp = this.V.data[layer].data,
      Dd = dest.data;

    let w = this.Y.data[layer].cols,
      h = this.Y.data[layer].rows;
    
    for(let y = 0; y < h; y++){
      for(let x = 0; x < w; x++){
        let i = y * w + x;
        let Y = Yp[i], U = Up[i], V = Vp[i];
        let n = 4 * (y * dest.width + x);
        Dd[n] = 127 + 10 * Y;
        Dd[n + 1] = 127 + 10 * U;
        Dd[n + 2] = 127 + 10 * V;
        Dd[n + 3] = 255;          
      }
    }
  }


  toRGBA (dest) {
    for(let i = 0; i < this.levels; i++) this.exportLayerRGB(i, dest);
  }


  iirFilter (source, r) {
    const exec = (pyr, imageData) => {
      for(let i = 0; i < pyr.levels - 1; i++) {
        const lpl = pyr.data[i];
        const pyl = imageData.data[i];
        
        for(let j = 0; j < pyl.cols * pyl.rows; j++) {
          lpl.data[j] = (1 - r) * lpl.data[j] + r * pyl.data[j];
        }
      }
    };

    exec(this.Y, source.Y);
    exec(this.U, source.U);
    exec(this.V, source.V);
  }
}

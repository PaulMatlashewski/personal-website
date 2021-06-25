import { FluidValue } from './fluidValue'

export default class BoundaryCondition extends FluidValue {
  constructor(gl, params, size, values) {
    super(gl, params, size);
    this.setValues(gl, values)
  }

  setValues(gl, values) {
    const stride = 4; // r, g, b, a
    const w = this.width;
    const h = this.height;
    const data = new Float32Array(w * h * stride);
    for (let interval of values) {
      let delta, index;
      switch (interval.type) {
        case 'left':   delta = 1/h; index = v => this.index(0, v);           break;
        case 'right':  delta = 1/h; index = v => this.index(1 - 0.5 / w, v); break;
        case 'bottom': delta = 1/w; index = u => this.index(u, 0);           break;
        case 'top':    delta = 1/w; index = u => this.index(u, 1 - 0.5 / h); break;
        default: return;
      }
      for (let uv = interval.from; uv < interval.to - delta; uv += delta) {
        let k = index(uv + 0.5 * delta) * stride;
        data[k] = interval.value[0];
        data[k + 1] = interval.value[1];
        data[k + 2] = interval.value[2];
        data[k + 3] = 1; // Set alpha value to 1 to signal active BC
      }
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, this.internalFormat, this.width,
                    this.height, 0, this.format, this.type, data);
    }
  }
}

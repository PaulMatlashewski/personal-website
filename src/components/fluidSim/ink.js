import { DoubleFluidValue } from './fluidValue'

export default class Ink extends DoubleFluidValue {
  constructor(gl, params) {
    super(gl, params, { x: 0, y: 0 }, [0.5, 0.5], [0.0, 0.0]);
    this.splatRadius = params.splatRadius;
  }

  generateColor() {
    let time = new Date().getTime() / 1000;
    let c = this.HSVtoRGB(time % 1, 1.0, 1.0);
    c.r *= 0.25;
    c.g *= 0.25;
    c.b *= 0.25;
    return c;
  }

  HSVtoRGB(h, s, v) {
    let r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
      default: r = v; g = t; b = p;
    }

    return { r, g, b };
  }
}

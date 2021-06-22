import FluidValue from './fluidValue'

export default class Ink {
  constructor(gl, params) {
    this.splatRadius = params.splatRadius;
    this.src = new FluidValue(gl, params);
    this.dst = new FluidValue(gl, params);
  }

  flip() {
    let tmp = this.src;
    this.src = this.dst;
    this.dst = tmp;
  }
}

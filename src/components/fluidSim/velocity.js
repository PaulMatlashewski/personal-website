import FluidValue from './fluidValue'

export default class Velocity {
  constructor(gl, params) {
    this.src = new FluidValue(gl, params);
    this.dst = new FluidValue(gl, params);
  }

  flip() {
    let tmp = this.src;
    this.src = this.dst;
    this.dst = tmp;
  }
}

import { DoubleFluidValue } from './fluidValue'

export default class Velocity {
  constructor(gl, params) {
    this.resolution = params.resolution;
    this.splatRadius = params.splatRadius;
    this.splatForce = params.splatForce;
    this.size = this.getSize(gl);
    this.u = new DoubleFluidValue(gl, params, { x: 1, y: 0 }, [0.0, 0.5]);
    this.v = new DoubleFluidValue(gl, params, { x: 0, y: 1 }, [0.5, 0.0]);
  }

  getSize(gl) {
    const aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    let width;
    let height;
    if (gl.drawingBufferWidth > gl.drawingBufferHeight) {
      width = Math.round(this.resolution * aspectRatio);
      height = Math.round(this.resolution);
    } else {
      width = Math.round(this.resolution);
      height = Math.round(this.resolution / aspectRatio);
    }
    return [width, height];
  }

}

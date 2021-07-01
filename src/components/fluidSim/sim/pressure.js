import { DoubleFluidValue } from './fluidValue'

export default class Pressure extends DoubleFluidValue {
  constructor(gl, params) {
    super(gl, params, { x: 0, y: 0 }, [0.5, 0.5]);
    this.resolution = params.resolution;
  }
}

import { SingleFluidValue } from "./fluidValue"

export default class VelocityDivergence extends SingleFluidValue {
  constructor(gl, params) {
    super(gl, params, { x: 0, y: 0 }, [0.5, 0.5]);
  }
}

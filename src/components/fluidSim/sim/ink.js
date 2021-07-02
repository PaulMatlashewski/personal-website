import { DoubleFluidValue } from './fluidValue'
import BoundaryCondition from './boundaryCondition'
import ShaderProgram from './shaderProgram'
import { vertexSource, upwindSource } from './shaders'

export default class Ink extends DoubleFluidValue {
  constructor(gl, params) {
    super(gl, params, { x: 0, y: 0 }, [0.5, 0.5]);
    this.params = params;
    this.resolution = params.resolution;

    this.upwindProgram = new ShaderProgram(gl, vertexSource, upwindSource);

    this.bc = new BoundaryCondition(gl, params, this.size, params.bcs);
  }

  advect(gl, program, velocity, dt, positionBuffer) {
    gl.useProgram(program.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.dst.framebuffer);
    gl.viewport(0, 0, ...this.size);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Vertex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(program.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.attributes.aVertexPosition);

    // Uniforms
    gl.uniform2f(program.uniforms.scale, ...this.size);
    gl.uniform2f(program.uniforms.offset, ...this.offset);
    gl.uniform2f(program.uniforms.valueSize, ...this.size);
    gl.uniform2f(program.uniforms.velocitySize, ...velocity.size);
    gl.uniform1f(program.uniforms.dt, dt);

    // Textures
    gl.uniform1i(program.uniforms.uVelocity, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velocity.u.src.texture);
    gl.uniform1i(program.uniforms.vVelocity, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, velocity.v.src.texture);
    gl.uniform1i(program.uniforms.value, 2);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.src.texture);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  upwind(gl, velocity, dt, positionBuffer) {
    gl.useProgram(this.upwindProgram.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.dst.framebuffer);
    gl.viewport(0, 0, ...this.size);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Vertex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(this.upwindProgram.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.upwindProgram.attributes.aVertexPosition);

    // Uniforms
    gl.uniform2f(this.upwindProgram.uniforms.size, ...this.size);
    gl.uniform1f(this.upwindProgram.uniforms.dt, dt);

    // Textures
    gl.uniform1i(this.upwindProgram.uniforms.uVelocity, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velocity.u.src.texture);
    gl.uniform1i(this.upwindProgram.uniforms.vVelocity, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, velocity.v.src.texture);
    gl.uniform1i(this.upwindProgram.uniforms.value, 2);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.src.texture);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  generateColor() {
    let time = new Date().getTime() / 1000;
    let c = this.HSVtoRGB(time % 1, 1.0, 1.0);
    c[0] *= 0.25;
    c[1] *= 0.25;
    c[2] *= 0.25;
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

    return [r, g, b];
  }
}

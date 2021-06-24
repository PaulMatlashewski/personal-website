import { SingleFluidValue, DoubleFluidValue } from './fluidValue'
import ShaderProgram from './shaderProgram'
import { vertexSource, divergenceSource, uGradSource, vGradSource } from './shaders'

export default class Velocity {
  constructor(gl, params) {
    this.resolution = params.resolution;
    this.splatRadius = params.splatRadius;
    this.splatForce = params.splatForce;
    this.size = this.getSize(gl);

    this.divergenceProgram = new ShaderProgram(gl, vertexSource, divergenceSource);
    this.uGradientProgram = new ShaderProgram(gl, vertexSource, uGradSource);
    this.vGradientProgram = new ShaderProgram(gl, vertexSource, vGradSource);

    // Velocity texture values
    this.u = new DoubleFluidValue(gl, params, { x: 1, y: 0 }, [0.0, 0.5], [0.5, 0.0]);
    this.v = new DoubleFluidValue(gl, params, { x: 0, y: 1 }, [0.5, 0.0], [0.0, 0.5]);
    this.div = new SingleFluidValue(gl, params, { x: 0, y: 0 }, [0.5, 0.5], [0.0, 0.0]);
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

  applyPressureGradient(gl, positionBuffer, pressure, dt) {
    // Correct u velocity with pressure gradient
    gl.useProgram(this.uGradientProgram.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.u.dst.framebuffer);
    gl.viewport(0, 0, ...this.u.size);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Vertex attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(this.uGradientProgram.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.uGradientProgram.attributes.aVertexPosition);

    // Uniforms
    gl.uniform1f(this.uGradientProgram.uniforms.scale, dt * this.resolution);
    gl.uniform2f(this.uGradientProgram.uniforms.size, ...this.u.size);

    // Textures
    gl.uniform1i(this.uGradientProgram.uniforms.pressure, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, pressure.src.texture);
    gl.uniform1i(this.uGradientProgram.uniforms.uVelocity, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.u.src.texture);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Correct v velocity values with pressure gradient
    gl.useProgram(this.vGradientProgram.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.v.dst.framebuffer);
    gl.viewport(0, 0, ...this.v.size);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Vertex attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(this.vGradientProgram.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.vGradientProgram.attributes.aVertexPosition);

    // Uniforms
    gl.uniform1f(this.vGradientProgram.uniforms.scale, dt * this.resolution);
    gl.uniform2f(this.vGradientProgram.uniforms.size, ...this.v.size);

    // Textures
    gl.uniform1i(this.vGradientProgram.uniforms.pressure, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, pressure.src.texture);
    gl.uniform1i(this.vGradientProgram.uniforms.vVelocity, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.v.src.texture);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.u.flip();
    this.v.flip();
  }

  divergence(gl, positionBuffer, dt) {
    gl.useProgram(this.divergenceProgram.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.div.src.framebuffer);
    gl.viewport(0, 0, ...this.div.size);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Vertex attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(this.divergenceProgram.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.divergenceProgram.attributes.aVertexPosition);

    // Uniforms
    gl.uniform1f(this.divergenceProgram.uniforms.scale, 1 / (dt * this.resolution));
    gl.uniform2f(this.divergenceProgram.uniforms.size, ...this.div.size);

    // Textures
    gl.uniform1i(this.divergenceProgram.uniforms.uVelocity, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.u.src.texture);
    gl.uniform1i(this.divergenceProgram.uniforms.vVelocity, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.v.src.texture);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

import { SingleFluidValue, DoubleFluidValue } from './fluidValue'
import BoundaryCondition from './boundaryCondition'
import ShaderProgram from './shaderProgram'
import {
  vertexSource,
  divergenceSource,
  uGradSource,
  vGradSource
} from './shaders'

export default class Velocity {
  constructor(gl, params) {
    this.params = params;
    this.size = this.getSize(gl);

    this.divergenceProgram = new ShaderProgram(gl, vertexSource, divergenceSource);
    this.uGradientProgram = new ShaderProgram(gl, vertexSource, uGradSource);
    this.vGradientProgram = new ShaderProgram(gl, vertexSource, vGradSource);

    // Velocity texture values
    this.u = new DoubleFluidValue(gl, params, { x: 1, y: 0 }, [0.0, 0.5]);
    this.v = new DoubleFluidValue(gl, params, { x: 0, y: 1 }, [0.5, 0.0]);
    this.div = new SingleFluidValue(gl, params, { x: 0, y: 0 }, [0.5, 0.5]);

    // Boundary condition textures
    this.u.bc = new BoundaryCondition(gl, params, [this.size[0] + 1, this.size[1]], params.uBcs);
    this.v.bc = new BoundaryCondition(gl, params, [this.size[0], this.size[1] + 1], params.vBcs);
  }

  getSize(gl) {
    const aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    let width;
    let height;
    if (gl.drawingBufferWidth > gl.drawingBufferHeight) {
      width = Math.round(this.params.resolution * aspectRatio);
      height = Math.round(this.params.resolution);
    } else {
      width = Math.round(this.params.resolution);
      height = Math.round(this.params.resolution / aspectRatio);
    }
    return [width, height];
  }

  advect(gl, program, component, dt, positionBuffer) {
    gl.useProgram(program.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, component.dst.framebuffer);
    gl.viewport(0, 0, ...component.size);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Vertex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(program.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.attributes.aVertexPosition);

    // Uniforms
    gl.uniform2f(program.uniforms.scale, ...this.size);
    gl.uniform2f(program.uniforms.offset, ...component.offset);
    gl.uniform2f(program.uniforms.valueSize, ...component.size);
    gl.uniform2f(program.uniforms.velocitySize, ...this.size);
    gl.uniform1f(program.uniforms.dt, dt);

    // Textures
    gl.uniform1i(program.uniforms.uVelocity, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.u.src.texture);
    gl.uniform1i(program.uniforms.vVelocity, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.v.src.texture);
    gl.uniform1i(program.uniforms.value, 2);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, component.src.texture);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  applyPressureGradientComponent(gl, component, program, positionBuffer, pressure, dt) {
    gl.useProgram(program.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, component.dst.framebuffer);
    gl.viewport(0, 0, ...component.size);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Vertex attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(program.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.attributes.aVertexPosition);

    // Uniforms
    gl.uniform1f(program.uniforms.scale, dt * this.params.resolution);
    gl.uniform2f(program.uniforms.size, ...component.size);

    // Textures
    gl.uniform1i(program.uniforms.pressure, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, pressure.src.texture);
    gl.uniform1i(program.uniforms.velocity, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, component.src.texture);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  applyPressureGradient(gl, positionBuffer, pressure, dt) {
    this.applyPressureGradientComponent(gl, this.u, this.uGradientProgram, positionBuffer, pressure, dt);
    this.applyPressureGradientComponent(gl, this.v, this.vGradientProgram, positionBuffer, pressure, dt);
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
    gl.uniform1f(this.divergenceProgram.uniforms.scale, 1 / (dt * this.params.resolution));
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

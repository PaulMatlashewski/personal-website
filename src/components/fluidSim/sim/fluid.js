import Ink from './ink'
import Velocity from './velocity'
import Pressure from './pressure'
import ShaderProgram from './shaderProgram'
import {
  vertexSource,
  fragmentSource,
  linearAdvectSource,
  cubicAdvectSource,
  splatSource,
  jacobiSource,
  boundaryConditionSource,
} from './shaders'

export default class Fluid {
  initialize(gl, params) {
    this.inkParams = params.inkParams;
    this.simParams = params.simParams;
    this.splatPoint = {
      x: null,
      y: null,
      dx: null,
      dy: null,
      down: false,
      moved: false,
      radius: params.splatRadius
    }

    // Shader programs
    const advectSource = params.interpolation === 'linear' ? linearAdvectSource : cubicAdvectSource;
    this.advectProgram = new ShaderProgram(gl, vertexSource, advectSource);
    this.renderProgram = new ShaderProgram(gl, vertexSource, fragmentSource);
    this.boundaryConditionProgram = new ShaderProgram(gl, vertexSource, boundaryConditionSource);
    this.splatProgram = new ShaderProgram(gl, vertexSource, splatSource);
    this.jacobiProgram = new ShaderProgram(gl, vertexSource, jacobiSource);

    // Vertex shader position buffer
    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, 1, 1, -1, -1, 1, -1]), gl.STATIC_DRAW);

    // Fluid values
    this.ink = new Ink(gl, params.inkParams);
    this.velocity = new Velocity(gl, params.simParams);
    this.pressure = new Pressure(gl, params.simParams);
  }

  updateValue(gl, oldValue, newValue) {
    gl.useProgram(this.renderProgram.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, newValue.src.framebuffer);
    gl.viewport(0, 0, ...newValue.size);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.renderProgram.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.renderProgram.attributes.aVertexPosition);

    gl.uniform1i(this.renderProgram.uniforms.texture, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, oldValue.src.texture);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  updateInk(gl) {
    const newInk = new Ink(gl, this.inkParams);
    this.updateValue(gl, this.ink, newInk);
    this.ink = newInk;
  }

  updateSim(gl) {
    const newVelocity = new Velocity(gl, this.simParams);
    const newPressure = new Pressure(gl, this.simParams);
    this.updateValue(gl, this.velocity.u, newVelocity.u);
    this.updateValue(gl, this.velocity.v, newVelocity.v);
    this.velocity = newVelocity;
    this.pressure = newPressure;
  }

  applyBoundaryConditions(gl, value) {
    gl.useProgram(this.boundaryConditionProgram.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, value.dst.framebuffer);
    gl.viewport(0, 0, ...value.size);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Vertex attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.boundaryConditionProgram.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.boundaryConditionProgram.attributes.aVertexPosition);

    // Textures
    gl.uniform1i(this.boundaryConditionProgram.uniforms.bc, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, value.bc.texture);
    gl.uniform1i(this.boundaryConditionProgram.uniforms.texture, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, value.src.texture);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  jacobi(gl) {
    gl.useProgram(this.jacobiProgram.program);

    // Vertex attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.jacobiProgram.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.jacobiProgram.attributes.aVertexPosition);

    // Uniforms
    gl.uniform2f(this.jacobiProgram.uniforms.size, ...this.pressure.size)

    // Textures
    gl.uniform1i(this.jacobiProgram.uniforms.divergence, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.velocity.div.src.texture);

    for (let i = 0; i < this.simParams.jacobiIters; i++) {
      // Write to dst pressure texture
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.pressure.dst.framebuffer);
      gl.viewport(0, 0, ...this.pressure.size);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clearDepth(1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Read src pressure texture
      gl.uniform1i(this.jacobiProgram.uniforms.pressure, 1);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.pressure.src.texture);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      this.pressure.flip();
    }
  }

  splat(gl, value, splatValue) {
    gl.useProgram(this.splatProgram.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, value.dst.framebuffer);
    gl.viewport(0, 0, ...value.size);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.splatProgram.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.splatProgram.attributes.aVertexPosition);

    gl.uniform2f(this.splatProgram.uniforms.point, this.splatPoint.x, this.splatPoint.y);
    gl.uniform3f(this.splatProgram.uniforms.value, ...splatValue);
    gl.uniform1f(this.splatProgram.uniforms.radius, this.splatPoint.radius);
    gl.uniform1f(this.splatProgram.uniforms.aspect, gl.canvas.clientWidth / gl.canvas.clientHeight);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, value.src.texture);
    gl.uniform1i(this.splatProgram.uniforms.texture, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  step(gl) {
    const dt = this.simParams.dt;
    if (Math.abs(dt) < 1e-6) {
      return;
    }
    // // Advection step
    this.ink.advect(gl, this.advectProgram, this.velocity, dt, this.positionBuffer);
    this.velocity.advect(gl, this.advectProgram, this.velocity.u, dt, this.positionBuffer);
    this.velocity.advect(gl, this.advectProgram, this.velocity.v, dt, this.positionBuffer);
    this.ink.flip();
    this.velocity.u.flip();
    this.velocity.v.flip();

    // Apply forces
    if (this.splatPoint.down && this.splatPoint.moved) {
      let inkValue = this.ink.generateColor();
      let uValue = [this.splatPoint.dx * this.velocity.params.splatForce, 0, 0];
      let vValue = [this.splatPoint.dy * this.velocity.params.splatForce, 0, 0];
      this.splat(gl, this.ink, inkValue);
      this.splat(gl, this.velocity.u, uValue);
      this.splat(gl, this.velocity.v, vValue);
      this.ink.flip();
      this.velocity.u.flip();
      this.velocity.v.flip();
    }

    // Projection step
    this.velocity.divergence(gl, this.positionBuffer, dt);
    this.jacobi(gl);
    this.velocity.applyPressureGradient(gl, this.positionBuffer, this.pressure, dt);

    // Boundary conditions
    this.applyBoundaryConditions(gl, this.ink);
    this.applyBoundaryConditions(gl, this.velocity.u);
    this.applyBoundaryConditions(gl, this.velocity.v);
    this.ink.flip();
    this.velocity.u.flip();
    this.velocity.v.flip();
  }

  drawScene(gl) {
    gl.useProgram(this.renderProgram.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    // Vertex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.renderProgram.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.renderProgram.attributes.aVertexPosition);

    // Texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.ink.src.texture);
    gl.uniform1i(this.renderProgram.uniforms.texture, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
}

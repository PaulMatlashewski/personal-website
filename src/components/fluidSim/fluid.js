import Ink from './ink'
import Velocity from './velocity'
import Pressure from './pressure'
import ShaderProgram from './shaderProgram'
import {
  vertexSource,
  fragmentSource,
  splatSource,
  linearAdvectSource,
  cubicAdvectSource,
  jacobiSource,
  boundaryConditionSource
} from './shaders'

export default class Fluid {
  constructor(gl, simParams) {
    this.jacobiIters = simParams.jacobiIters;

    // Shader programs
    this.renderProgram = new ShaderProgram(gl, vertexSource, fragmentSource);
    this.boundaryConditionProgram = new ShaderProgram(gl, vertexSource, boundaryConditionSource);
    this.splatProgram = new ShaderProgram(gl, vertexSource, splatSource);
    this.jacobiProgram = new ShaderProgram(gl, vertexSource, jacobiSource);
    if (simParams.interpolation === 'linear') {
      this.advectProgram = new ShaderProgram(gl, vertexSource, linearAdvectSource);
    } else {
      this.advectProgram = new ShaderProgram(gl, vertexSource, cubicAdvectSource);
    }
    // Vertex shader position buffer
    this.positionBuffer = this.initPositionBuffer(gl);

    // Fluid values
    this.ink = new Ink(gl, simParams.inkParams);
    this.velocity = new Velocity(gl, simParams.velocityParams);
    this.pressure = new Pressure(gl, simParams.pressureParams);
  }

  initPositionBuffer(gl) {
    const positions = new Float32Array([
      -1.0,  1.0,
      1.0,  1.0,
      -1.0, -1.0,
      1.0, -1.0,
    ]);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    return positionBuffer;
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

  step(gl, dt, splatPoint) {
    // Advection step
    this.advect(gl, this.ink, dt);
    this.advect(gl, this.velocity.u, dt);
    this.advect(gl, this.velocity.v, dt);
    this.ink.flip();
    this.velocity.u.flip();
    this.velocity.v.flip();

    // Apply forces
    if (splatPoint.down && splatPoint.moved) {
      this.splat(gl, splatPoint);
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

    for (let i = 0; i < this.jacobiIters; i++) {
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

  advect(gl, value, dt) {
    gl.useProgram(this.advectProgram.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, value.dst.framebuffer);
    gl.viewport(0, 0, ...value.size);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Vertex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.advectProgram.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.advectProgram.attributes.aVertexPosition);

    // Uniforms
    gl.uniform2f(this.advectProgram.uniforms.velocitySize, ...this.velocity.size);
    gl.uniform2f(this.advectProgram.uniforms.valueSize, ...value.size);
    gl.uniform2f(this.advectProgram.uniforms.valueOffset, ...value.offset);
    gl.uniform2f(this.advectProgram.uniforms.valueCorrection, ...value.correction)
    gl.uniform1f(this.advectProgram.uniforms.dt, dt);

    // Textures
    gl.uniform1i(this.advectProgram.uniforms.uVelocity, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.velocity.u.src.texture);
    gl.uniform1i(this.advectProgram.uniforms.vVelocity, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.velocity.v.src.texture);
    gl.uniform1i(this.advectProgram.uniforms.value, 2);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, value.src.texture);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  splat(gl, splatPoint) {
    gl.useProgram(this.splatProgram.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.ink.dst.framebuffer);
    gl.viewport(0, 0, ...this.ink.size);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Vertex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.splatProgram.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.splatProgram.attributes.aVertexPosition);

    // Uniforms
    let c = this.ink.generateColor();
    gl.uniform2f(this.splatProgram.uniforms.point, splatPoint.x, splatPoint.y);
    gl.uniform3f(this.splatProgram.uniforms.value, c.r, c.g, c.b);
    gl.uniform1f(this.splatProgram.uniforms.radius, this.ink.params.splatRadius);
    gl.uniform1f(this.splatProgram.uniforms.aspect, gl.canvas.clientWidth / gl.canvas.clientHeight);

    // Textures
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.ink.src.texture);
    gl.uniform1i(this.splatProgram.uniforms.texture, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Splat u velocity
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.velocity.u.dst.framebuffer);
    gl.viewport(0, 0, ...this.velocity.u.size);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform3f(this.splatProgram.uniforms.value, splatPoint.dx * this.velocity.params.splatForce, 0, 0);
    gl.uniform1f(this.splatProgram.uniforms.radius, this.velocity.params.splatRadius);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.velocity.u.src.texture);
    gl.uniform1i(this.splatProgram.uniforms.texture, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Splat v velocity
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.velocity.v.dst.framebuffer);
    gl.viewport(0, 0, ...this.velocity.v.size);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform3f(this.splatProgram.uniforms.value, splatPoint.dy * this.velocity.params.splatForce, 0, 0);
    gl.uniform1f(this.splatProgram.uniforms.radius, this.velocity.params.splatRadius);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.velocity.v.src.texture);
    gl.uniform1i(this.splatProgram.uniforms.texture, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  drawScene(gl) {
    gl.useProgram(this.renderProgram.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);
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

import Ink from './ink'
import Velocity from './velocity'
import ShaderProgram from './shaderProgram'
import {
  vertexSource,
  fragmentSource,
  splatSource,
  setValueSource,
  advectSource,
} from './shaders'

export default class Fluid {
  constructor(gl, simParams) {
    this.positionBuffer = this.initPositionBuffer(gl);

    this.renderProgram = new ShaderProgram(gl, vertexSource, fragmentSource);
    this.splatProgram = new ShaderProgram(gl, vertexSource, splatSource);
    this.setValueProgram = new ShaderProgram(gl, vertexSource, setValueSource);
    this.advectProgram = new ShaderProgram(gl, vertexSource, advectSource);

    // Fluid values
    this.ink = new Ink(gl, simParams.inkParams);
    this.velocity = new Velocity(gl, simParams.velocityParams);

    // Initialize ink with zero values
    this.setTextureValue(gl, this.ink.src.framebuffer, this.ink.src.width, this.ink.src.height, [0, 0, 0, 1]);
    this.setTextureValue(gl, this.ink.dst.framebuffer, this.ink.dst.width, this.ink.dst.height, [0, 0, 0, 1]);

    // Initialize velocity
    this.setTextureValue(gl, this.velocity.src.framebuffer, this.velocity.src.width, this.velocity.src.height, [5.0, 0, 0, 1]);
    this.setTextureValue(gl, this.velocity.dst.framebuffer, this.velocity.dst.width, this.velocity.dst.height, [5.0, 0, 0, 1]);
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

  setTextureValue(gl, fbo, width, height, value) {
    gl.useProgram(this.setValueProgram.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, width, height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Vertex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.splatProgram.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.splatProgram.attributes.aVertexPosition);

    // Texture value
    gl.uniform4f(this.setValueProgram.uniforms.value, ...value)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  advectInk(gl, dt) {
    gl.useProgram(this.advectProgram.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.ink.dst.framebuffer);
    gl.viewport(0, 0, this.ink.dst.width, this.ink.dst.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Vertex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.advectProgram.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.advectProgram.attributes.aVertexPosition);

    // Advect uniform values
    gl.uniform2f(
      this.advectProgram.uniforms.velocityTexelSize,
      1 / this.velocity.src.width,
      1 / this.velocity.src.height
    );
    gl.uniform2f(
      this.advectProgram.uniforms.inkTexelSize,
      1 / this.ink.src.width,
      1 / this.ink.src.height);
    gl.uniform1f(this.advectProgram.uniforms.dt, dt);

    // Attach velocity texture
    gl.uniform1i(this.advectProgram.uniforms.velocity, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.velocity.src.texture);

    // Attach ink texture
    gl.uniform1i(this.advectProgram.uniforms.ink, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.ink.src.texture);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.ink.flip();
  }

  splat(gl, point) {
    gl.useProgram(this.splatProgram.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.ink.dst.framebuffer);
    gl.viewport(0, 0, this.ink.dst.width, this.ink.dst.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Vertex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.splatProgram.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.splatProgram.attributes.aVertexPosition);

    // Splat uniform values
    gl.uniform2f(this.splatProgram.uniforms.point, ...point);
    gl.uniform1f(this.splatProgram.uniforms.radius, this.ink.splatRadius);
    gl.uniform1f(this.splatProgram.uniforms.aspect, gl.canvas.clientWidth / gl.canvas.clientHeight);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.ink.flip();
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

    // Ink texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.ink.src.texture);
    gl.uniform1i(this.renderProgram.uniforms.inkTexture, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
}

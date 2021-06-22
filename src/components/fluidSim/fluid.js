import Ink from './ink'
import ShaderProgram from './shaderProgram'
import { vertexSource, fragmentSource, splatSource, initSource } from './shaders'

export default class Fluid {
  constructor(gl, simParams) {
    this.positionBuffer = this.initPositionBuffer(gl);

    this.renderProgram = new ShaderProgram(gl, vertexSource, fragmentSource);
    this.splatProgram = new ShaderProgram(gl, vertexSource, splatSource);
    this.initProgram = new ShaderProgram(gl, vertexSource, initSource);

    // Fluid values
    this.ink = new Ink(gl, simParams.inkParams);

    // Initialize ink with zero values
    this.initInkTexture(gl);
    this.ink.flip();
    this.initInkTexture(gl);
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

  initInkTexture(gl) {
    gl.useProgram(this.initProgram.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.ink.dst.framebuffer);
    gl.viewport(0, 0, this.ink.dst.width, this.ink.dst.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Vertex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.splatProgram.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.splatProgram.attributes.aVertexPosition);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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
    gl.uniform2f(this.splatProgram.uniforms.point, point[0], point[1]);
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

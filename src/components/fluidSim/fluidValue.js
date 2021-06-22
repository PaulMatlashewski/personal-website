export default class FluidValue {
  constructor(gl, params) {
    this.resolution = params.resolution;
    const { width, height } = this.getResolution(gl, params.resolution);
    this.width = width
    this.height = height
    this.texture = this.initTexture(gl, params);
    this.framebuffer = this.initFramebuffer(gl)
  }

  // Get the texture dimensions. Use the configured resolution for the minimum
  // drawing dimension (height in landscape mode and width in portrait mode)
  // and scale the maximum dimension by the aspect ratio of the drawing area.
  getResolution(gl, resolution) {
    const aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    let width;
    let height;
    if (gl.drawingBufferWidth > gl.drawingBufferHeight) {
      width = Math.round(resolution * aspectRatio);
      height = Math.round(resolution);
    } else {
      width = Math.round(resolution);
      height = Math.round(resolution / aspectRatio);
    }
    return { width, height }
  }

  initTexture(gl, params) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, params.internalFormat, this.width, this.height, 0, params.format, params.type, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, params.filterType);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, params.filterType);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  }

  initFramebuffer(gl) {
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    return framebuffer;
  }
}

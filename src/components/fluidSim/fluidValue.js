export class FluidValue {
  constructor(gl, params, size) {
    this.width = size[0]
    this.height = size[1]
    this.internalFormat = params.internalFormat;
    this.format = params.format;
    this.type = params.type;
    this.filterType = params.filterType;
    this.texture = this.initTexture(gl);
    this.framebuffer = this.initFramebuffer(gl);
  }

  initTexture(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, this.internalFormat, this.width, this.height, 0, this.format, this.type, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.filterType);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.filterType);
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

  // Row major index of (u, v) texture coordinate
  index(u, v) {
    let i = Math.floor(u * this.width);
    let j = Math.floor(v * this.height);
    return (i % this.width) + (j * this.width);
  }
}

export class SingleFluidValue {
  constructor(gl, params, sizeOffset, texelOffset) {
    this.resolution = params.resolution;
    this.size = this.getSize(gl, sizeOffset);
    this.offset = texelOffset;
    this.src = new FluidValue(gl, params, this.size);
  }

  getSize(gl, offset) {
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
    return [width + offset.x, height + offset.y];
  }
}

export class DoubleFluidValue extends SingleFluidValue {
  constructor(gl, params, sizeOffset, texelOffset, texelCorrection) {
    super(gl, params, sizeOffset, texelOffset, texelCorrection);
    this.dst = new FluidValue(gl, params, this.size);
  }

  flip() {
    let tmp = this.src;
    this.src = this.dst;
    this.dst = tmp;
  }
}

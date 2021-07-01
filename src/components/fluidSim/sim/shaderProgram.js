export default class ShaderProgram {
  constructor(gl, vsSource, fsSource) {
    this.program = this.initProgram(gl, vsSource, fsSource);
    this.uniforms = this.initUniforms(gl);
    this.attributes = this.initAttributes(gl);
  }

  initShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  initProgram(gl, vsSource, fsSource) {
    const vertexShader = this.initShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.initShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }

    return shaderProgram;
  }

  initUniforms(gl) {
    const uniforms = {};
    const numUniforms = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
    let uniformName;
    for (let i = 0; i < numUniforms; ++i) {
      uniformName = gl.getActiveUniform(this.program, i).name;
      uniforms[uniformName] = gl.getUniformLocation(this.program, uniformName);
    }
    return uniforms;
  }

  initAttributes(gl) {
    const attributes = {};
    const numAttributes = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
    let attrName;
    for (let i = 0; i < numAttributes; ++i) {
      attrName = gl.getActiveAttrib(this.program, i).name;
      attributes[attrName] = gl.getAttribLocation(this.program, attrName);
    }
    return attributes;
  }

  execute(gl) {
    gl.useProgram(this.program);
    gl.enableVertexAttribArray(0);
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }
}

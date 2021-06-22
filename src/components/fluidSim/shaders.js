export const vertexSource = `
  precision highp float;

  attribute vec2 aVertexPosition;
  varying vec2 vUv;

  void main() {
    gl_Position = vec4(aVertexPosition, 0.0, 1.0);
    vUv = aVertexPosition * 0.5 + 0.5;
  }
`;

export const fragmentSource = `
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;
  uniform sampler2D inkTexture;

  void main() {
    gl_FragColor = texture2D(inkTexture, vUv);
  }
`;

export const splatSource =  `
  precision highp float;

  varying vec2 vUv;
  uniform vec2 point;
  uniform float radius;
  uniform float aspect;

  void main() {
    vec3 color = vec3(0, 1, 1);
    vec2 p = vUv - point.xy;
    p.x *= aspect;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    gl_FragColor = vec4(splat, 1.0);
  }
`;

export const initSource = `
  void main() {
    gl_FragColor = vec4(0, 0, 0, 1);
  }
`;

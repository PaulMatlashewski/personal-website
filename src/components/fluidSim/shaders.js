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
  precision highp sampler2D;

  varying vec2 vUv;
  uniform vec2 point;
  uniform float radius;
  uniform float aspect;
  uniform sampler2D inkTexture;

  void main() {
    vec3 color = vec3(0, 1, 1);
    vec2 p = vUv - point.xy;
    p.x *= aspect;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    vec3 inkValue = texture2D(inkTexture, vUv).xyz;
    gl_FragColor = vec4(splat + inkValue, 1.0);
  }
`;

export const setValueSource = `
  precision highp float;

  uniform vec4 value;

  void main() {
    gl_FragColor = value;
  }
`;

export const advectSource = `
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;
  uniform vec2 velocityTexelSize;
  uniform vec2 inkTexelSize;
  uniform float dt;
  uniform sampler2D velocity;
  uniform sampler2D ink;

  vec4 bilinearInterp(sampler2D values, vec2 uv, vec2 texelSize) {
    vec2 p = uv / texelSize - 0.5;
    vec2 fp = fract(p);
    vec2 ip = floor(p);
    vec4 a = texture2D(values, (ip + vec2(0.5, 0.5)) * texelSize);
    vec4 b = texture2D(values, (ip + vec2(1.5, 0.5)) * texelSize);
    vec4 c = texture2D(values, (ip + vec2(0.5, 1.5)) * texelSize);
    vec4 d = texture2D(values, (ip + vec2(1.5, 1.5)) * texelSize);
    return mix(mix(a, b, fp.x), mix(c, d, fp.x), fp.y);
  }

  void main() {
    vec2 uv = vUv - dt * bilinearInterp(velocity, vUv, velocityTexelSize).xy * velocityTexelSize;
    gl_FragColor = bilinearInterp(ink, uv, inkTexelSize);
  }
`;

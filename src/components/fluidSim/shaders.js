export const vertexSource = /*glsl*/`
  precision highp float;

  attribute vec2 aVertexPosition;
  varying vec2 vUv;

  void main() {
    gl_Position = vec4(aVertexPosition, 0.0, 1.0);
    vUv = aVertexPosition * 0.5 + 0.5;
  }
`;

export const fragmentSource = /*glsl*/`
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;
  uniform sampler2D inkTexture;

  void main() {
    gl_FragColor = texture2D(inkTexture, vUv);
  }
`;

export const splatSource =  /*glsl*/`
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;
  uniform vec2 point;
  uniform vec3 value;
  uniform float radius;
  uniform float aspect;
  uniform sampler2D texture;

  void main() {
    vec2 p = vUv - point.xy;
    p.x *= aspect;
    vec3 splatValue = exp(-dot(p, p) / radius) * value;
    vec3 baseValue = texture2D(texture, vUv).xyz;
    gl_FragColor = vec4(splatValue + baseValue, 1.0);
  }
`;

export const setValueSource = /*glsl*/`
  precision highp float;

  uniform vec4 value;

  void main() {
    gl_FragColor = value;
  }
`;

export const advectSource = /*glsl*/`
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;

  uniform vec2 velocitySize;
  uniform vec2 valueSize;
  uniform vec2 valueOffset;
  uniform float dt;
  uniform sampler2D uVelocity;
  uniform sampler2D vVelocity;
  uniform sampler2D value;

  vec4 bilinear_interp(sampler2D texture, vec2 p, vec2 offset, vec2 size) {
    // Convert point in uv coordinates to texel coordinates
    vec2 p0 = p * size - offset;

    // Interpolation grid values
    vec2 p1 = floor(p0) + vec2(0.5, 0.5);
    vec2 p2 = vec2(1.0, 0.0) + p1;
    vec2 p3 = vec2(0.0, 1.0) + p1;
    vec2 p4 = vec2(1.0, 1.0) + p1;

    // Clamp interpolation points to grid
    float x_min = 0.0;
    float y_min = 0.0;
    float x_max = size.x - 1.0;
    float y_max = size.y - 1.0;
    p1 = vec2(max(min(p1.x, x_max), x_min), max(min(p1.y, y_max), y_min));
    p2 = vec2(max(min(p2.x, x_max), x_min), max(min(p2.y, y_max), y_min));
    p3 = vec2(max(min(p3.x, x_max), x_min), max(min(p3.y, y_max), y_min));
    p4 = vec2(max(min(p4.x, x_max), x_min), max(min(p4.y, y_max), y_min));

    // Sample texture at grid values
    vec4 a = texture2D(texture, p1 / size);
    vec4 b = texture2D(texture, p2 / size);
    vec4 c = texture2D(texture, p3 / size);
    vec4 d = texture2D(texture, p4 / size);

    // Bilinear interpolation
    vec2 s = fract(p0);
    return mix(mix(a, b, s.x), mix(c, d, s.x), s.y);
  }

  vec2 euler(sampler2D uVelocity, sampler2D vVelocity, vec2 p, vec2 velocitySize, vec2 valueSize, float dt) {
    vec4 u = bilinear_interp(uVelocity, p, vec2(0.0, 0.5), velocitySize);
    vec4 v = bilinear_interp(vVelocity, p, vec2(0.5, 0.0), velocitySize);
    return p + vec2(u.x, v.x) * dt;
  }

  void main() {
    // Semi-Lagrangian advection
    vec2 p = euler(uVelocity, vVelocity, vUv, velocitySize, valueSize, -dt);
    gl_FragColor = bilinear_interp(value, p, valueOffset, valueSize);
  }
`;

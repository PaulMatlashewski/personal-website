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
  uniform sampler2D texture;

  void main() {
    gl_FragColor = texture2D(texture, vUv);
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
  uniform vec2 valueCorrection;
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

  vec2 euler(sampler2D uVelocity, sampler2D vVelocity, vec2 p, vec2 velocitySize, float dt) {
    vec4 u = bilinear_interp(uVelocity, p, vec2(0.0, 0.5), velocitySize);
    vec4 v = bilinear_interp(vVelocity, p, vec2(0.5, 0.0), velocitySize);
    return p + vec2(u.x, v.x) * dt;
  }

  void main() {
    // Semi-Lagrangian advection
    vec2 q = vUv - valueCorrection / valueSize;
    vec2 p = euler(uVelocity, vVelocity, q, velocitySize, -dt);
    gl_FragColor = bilinear_interp(value, p, valueOffset, valueSize);
  }
`;

export const divergenceSource = /*glsl*/`
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;

  uniform float scale;
  uniform vec2 size;
  uniform sampler2D uVelocity;
  uniform sampler2D vVelocity;

  void main() {
    vec2 dx = vec2(1.0, 0.0);
    vec2 dy = vec2(0.0, 1.0);
    vec2 p = floor(vUv * size) + vec2(0.5, 0.5);
    vec2 uSize = size + dx;
    vec2 vSize = size + dy;
    float du = texture2D(uVelocity, (p + dx) / uSize).x - texture2D(uVelocity, p / uSize).x;
    float dv = texture2D(vVelocity, (p + dy) / vSize).x - texture2D(vVelocity, p / vSize).x;
    gl_FragColor = vec4(scale * (du + dv), 0, 0 ,1);
  }
`;

export const jacobiSource = /*glsl*/`
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;

  uniform vec2 size;
  uniform sampler2D divergence;
  uniform sampler2D pressure;

  void main() {
    vec2 gid = floor(vUv * size);
    vec2 dx = vec2(1.0 / size.x, 0.0);
    vec2 dy = vec2(0.0, 1.0 / size.y);
    float w = 0.0;
    float p = 0.0;
    if (gid.x > 0.0) {
      w += 1.0;
      p += texture2D(pressure, vUv - dx).x;
    }
    if (gid.x < size.x - 1.0) {
      w += 1.0;
      p += texture2D(pressure, vUv + dx).x;
    }
    if (vUv.y > 0.0) {
      w += 1.0;
      p += texture2D(pressure, vUv - dy).x;
    }
    if (vUv.y < size.y - 1.0) {
      w += 1.0;
      p += texture2D(pressure, vUv + dy).x;
    }
    float div = texture2D(divergence, vUv).x;
    gl_FragColor = vec4((p - div) / w, 0, 0, 1);
  }
`;

export const uGradSource = /*glsl*/`
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;

  uniform float scale;
  uniform vec2 size;
  uniform sampler2D pressure;
  uniform sampler2D uVelocity;

  void main() {
    vec2 gid = floor(vUv * size);
    if ((gid.x > 0.0) && (gid.x < size.x - 1.0)) {
      // Correct the interior velocity values
      vec2 p = floor(vUv * size) + vec2(0.5, 0.5);
      vec2 dx = vec2(1.0, 0.0);
      vec2 pSize = size - dx; // Staggered grid correction
      float u = texture2D(uVelocity, vUv).x;
      float P1 = texture2D(pressure, (p - dx) / pSize).x;
      float P2 = texture2D(pressure, p / pSize).x;
      gl_FragColor = vec4(u - scale * (P2 - P1), 0, 0, 1);
    } else {
      // Apply boundary conditions to edge velocity values
      gl_FragColor = vec4(0, 0, 0, 1); // Dirichlet BC
    }
  }
`;

export const vGradSource = /*glsl*/`
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;

  uniform float scale;
  uniform vec2 size;
  uniform sampler2D pressure;
  uniform sampler2D vVelocity;

  void main() {
    vec2 gid = floor(vUv * size);
    if ((gid.y > 0.0) && (gid.y < size.y - 1.0)) {
      // Correct the interior velocity values
      vec2 p = floor(vUv * size) + vec2(0.5, 0.5);
      vec2 dy = vec2(0.0, 1.0);
      vec2 pSize = size - dy; // Staggered grid correction
      float v = texture2D(vVelocity, vUv).x;
      float P1 = texture2D(pressure, (p - dy) / pSize).x;
      float P2 = texture2D(pressure, p / pSize).x;
      gl_FragColor = vec4(v - scale * (P2 - P1), 0, 0, 1);
    } else {
      // Apply boundary conditions to edge velocity values
      gl_FragColor = vec4(0, 0, 0, 1); // Dirichlet BC
    }
  }
`;

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
    vec4 baseValue = texture2D(texture, vUv);
    if (dot(p, p) < radius) {
      gl_FragColor = vec4(splatValue + baseValue.xyz, 1.0);
    } else {
      gl_FragColor = baseValue;
    }
  }
`;

export const linearAdvectSource = /*glsl*/`
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;

  uniform vec2 scale;
  uniform vec2 offset;
  uniform vec2 valueSize;
  uniform vec2 velocitySize;
  uniform float dt;
  uniform sampler2D uVelocity;
  uniform sampler2D vVelocity;
  uniform sampler2D value;

  vec4 bilinear_interp(vec2 p, sampler2D texture, vec2 scale, vec2 size, vec2 offset) {
    // Convert point in uv coordinates to texel coordinates, and
    // apply offset for staggered grid
    vec2 p0 = p * scale - offset;

    // Interpolation grid values
    vec2 p1 = floor(p0) + vec2(0.5, 0.5);
    vec2 p2 = vec2(1.0, 0.0) + p1;
    vec2 p3 = vec2(0.0, 1.0) + p1;
    vec2 p4 = vec2(1.0, 1.0) + p1;

    // Sample texture at grid values
    vec4 a = texture2D(texture, p1 / size);
    vec4 b = texture2D(texture, p2 / size);
    vec4 c = texture2D(texture, p3 / size);
    vec4 d = texture2D(texture, p4 / size);

    // Bilinear interpolation
    vec2 s = fract(p0);
    return mix(mix(a, b, s.x), mix(c, d, s.x), s.y);
  }

  vec2 euler(vec2 p, sampler2D u, sampler2D v, vec2 size, vec2 scale, float dt) {
    float aspectRatio = scale.x / scale.y;
    vec4 dx = bilinear_interp(p, u, size, size + vec2(1, 0), vec2(0.0, 0.5));
    vec4 dy = bilinear_interp(p, v, size, size + vec2(0, 1), vec2(0.5, 0.0));
    if (aspectRatio > 1.0) {
      dx.x /= aspectRatio;
    } else {
      dy.x *= aspectRatio;
    }
    return p + vec2(dx.x, dy.x) * dt;
  }

  void main() {
    // Semi-Lagrangian advection
    vec2 shift = vec2(0.5, 0.5) - offset;
    vec2 p = (vUv * valueSize - shift) / scale;
    vec2 q = euler(p, uVelocity, vVelocity, velocitySize, scale, -dt);
    gl_FragColor = bilinear_interp(q, value, scale, valueSize, offset);
  }
`;

export const cubicAdvectSource = /*glsl*/`
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;

  uniform vec2 scale;
  uniform vec2 offset;
  uniform vec2 valueSize;
  uniform vec2 velocitySize;
  uniform float dt;
  uniform sampler2D uVelocity;
  uniform sampler2D vVelocity;
  uniform sampler2D value;

  vec4 bilinear_interp(vec2 p, sampler2D texture, vec2 scale, vec2 size, vec2 offset) {
    // Convert point in uv coordinates to texel coordinates, and
    // apply offset for staggered grid
    vec2 p0 = p * scale - offset;

    // Interpolation grid values
    vec2 p1 = floor(p0) + vec2(0.5, 0.5);
    vec2 p2 = vec2(1.0, 0.0) + p1;
    vec2 p3 = vec2(0.0, 1.0) + p1;
    vec2 p4 = vec2(1.0, 1.0) + p1;

    // Sample texture at grid values
    vec4 a = texture2D(texture, p1 / size);
    vec4 b = texture2D(texture, p2 / size);
    vec4 c = texture2D(texture, p3 / size);
    vec4 d = texture2D(texture, p4 / size);

    // Bilinear interpolation
    vec2 s = fract(p0);
    return mix(mix(a, b, s.x), mix(c, d, s.x), s.y);
  }

  vec4 cubic_interp(sampler2D texture, vec2 p0, vec2 delta, vec4 ws, vec2 size) {
    vec2 p1 = p0 + delta;
    vec2 p2 = p1 + delta;
    vec2 p3 = p2 + delta;

    vec4 u0 = texture2D(texture, p0 / size);
    vec4 u1 = texture2D(texture, p1 / size);
    vec4 u2 = texture2D(texture, p2 / size);
    vec4 u3 = texture2D(texture, p3 / size);

    vec4 v = ws[0] * u0 + ws[1] * u1 + ws[2] * u2 + ws[3] * u3;
    return clamp(v, min(min(u0, u1), min(u2, u3)), max(max(u0, u1), max(u2, u3)));
  }

  vec4 bicubic_interp(vec2 p, sampler2D texture, vec2 scale, vec2 size, vec2 offset) {
    // Convert point in uv coordinates to texel coordinates
    vec2 p0 = p * scale - offset;
    vec2 p1 = floor(p0) + vec2(0.5, 0.5);

    float x_min = 1.0;
    float y_min = 1.0;
    float x_max = size.x - 2.0;
    float y_max = size.y - 2.0;
    if ((p1.x < x_min) || (p1.y < y_min) || (p0.x > x_max) || (p0.y > y_max)) {
      // Too close to the edge to get cubic interpolation points.
      // Default to bilinear interpolation.
      return bilinear_interp(p, texture, scale, size, offset);
    }

    vec2 dx = vec2(1.0, 0.0);
    vec2 dy = vec2(0.0, 1.0);

    // Offset
    vec2 s = fract(p0);
    vec2 s_sq = s * s;
    vec2 s_cu = s_sq * s;

    // Catmull-Rom spline weights in y direction
    vec4 ws = vec4(
      0.0 - 0.5 * s.y + 1.0 * s_sq.y - 0.5 * s_cu.y,
      1.0 + 0.0 * s.y - 2.5 * s_sq.y + 1.5 * s_cu.y,
      0.0 + 0.5 * s.y + 2.0 * s_sq.y - 1.5 * s_cu.y,
      0.0 + 0.0 * s.y - 0.5 * s_sq.y + 0.5 * s_cu.y
    );

    // Interpolate in y direction
    vec4 u0 = cubic_interp(texture, p1 - 1.0 * dx - dy, dy, ws, size);
    vec4 u1 = cubic_interp(texture, p1 + 0.0 * dx - dy, dy, ws, size);
    vec4 u2 = cubic_interp(texture, p1 + 1.0 * dx - dy, dy, ws, size);
    vec4 u3 = cubic_interp(texture, p1 + 2.0 * dx - dy, dy, ws, size);

    // Catmull-Rom spline weights in x direction
    ws = vec4(
      0.0 - 0.5 * s.x + 1.0 * s_sq.x - 0.5 * s_cu.x,
      1.0 + 0.0 * s.x - 2.5 * s_sq.x + 1.5 * s_cu.x,
      0.0 + 0.5 * s.x + 2.0 * s_sq.x - 1.5 * s_cu.x,
      0.0 + 0.0 * s.x - 0.5 * s_sq.x + 0.5 * s_cu.x
    );

    // Interpolate in x direction
    vec4 v = ws[0] * u0 + ws[1] * u1 + ws[2] * u2 + ws[3] * u3;
    return clamp(v, min(min(u0, u1), min(u2, u3)), max(max(u0, u1), max(u2, u3)));
  }

  vec2 euler(vec2 p, sampler2D u, sampler2D v, vec2 size, vec2 scale, float dt) {
    float aspectRatio = scale.x / scale.y;
    vec4 dx = bilinear_interp(p, u, size, size + vec2(1, 0), vec2(0.0, 0.5));
    vec4 dy = bilinear_interp(p, v, size, size + vec2(0, 1), vec2(0.5, 0.0));
    if (aspectRatio > 1.0) {
      dx.x /= aspectRatio;
    } else {
      dy.x *= aspectRatio;
    }
    return p + vec2(dx.x, dy.x) * dt;
  }

  void main() {
    // Semi-Lagrangian advection
    vec2 shift = vec2(0.5, 0.5) - offset;
    vec2 p = (vUv * valueSize - shift) / scale;
    vec2 q = euler(p, uVelocity, vVelocity, velocitySize, scale, -dt);
    gl_FragColor = bicubic_interp(q, value, scale, valueSize, offset);
  }
`;

// This currently requires the advected quantity grid to have the
// same resolution as the velocity grid
export const upwindSource = /*glsl*/`
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;

  uniform vec2 size;
  uniform float dt;
  uniform sampler2D uVelocity;
  uniform sampler2D vVelocity;
  uniform sampler2D value;

  vec2 uv_to_texel(vec2 vUv, vec2 size) {
    return floor(vUv * size);
  }

  vec2 texel_to_uv(vec2 gid, vec2 size) {
    return (gid + vec2(0.5, 0.5)) / size;
  }

  vec3 smoothness(float u, vec3 q0, vec3 q1, vec3 q2, vec3 q3) {
    vec3 dq = q2 - q1;
    return u > 0.0 ? (q1 - q0) / dq : (q3 - q2) / dq;
  }

  // Superbee flux limiter
  vec3 superbee(float u, vec3 q0, vec3 q1, vec3 q2, vec3 q3) {
    vec3 theta = smoothness(u, q0, q1, q2, q3);
    vec3 a = max(min(vec3(1, 1, 1), 2.0 * theta), min(vec3(2, 2, 2), theta));
    return max(vec3(0, 0, 0), a);
  }

  void main() {
    vec2 gid = uv_to_texel(vUv, size);
    float h = 1.0 / min(size.x, size.y);
    vec3 q = texture2D(value, vUv).xyz;
    vec3 q0, q1, q2, q3, limited_jump, limited_flux, upwind_flux;
    vec2 u_size;
    float alpha, u;

    // Flux in x direction
    vec2 dx = vec2(1.0, 0.0);
    u_size = size + vec2(1.0, 0.0);
    q0 = texture2D(value, texel_to_uv(gid - 2.0 * dx, size)).xyz;
    q1 = texture2D(value, texel_to_uv(gid - dx, size)).xyz;
    q2 = texture2D(value, texel_to_uv(gid + dx, size)).xyz;
    q3 = texture2D(value, texel_to_uv(gid + 2.0 * dx, size)).xyz;
    // Left interface
    u = texture2D(uVelocity, texel_to_uv(gid, u_size)).x;
    alpha = abs(u * dt / h); // Courant number
    limited_jump = (q - q1) * superbee(u, q0, q1, q, q2);
    limited_flux = 0.5 * abs(u) * (1.0 - alpha) * limited_jump;
    upwind_flux = u > 0.0 ? q1 * u : q * u;
    vec3 Fx0 = upwind_flux + limited_flux;
    // Right interface
    u = texture2D(uVelocity, texel_to_uv(gid + dx, u_size)).x;
    alpha = abs(u * dt / h); // Courant number
    limited_jump = (q2 - q) * superbee(u, q1, q, q2, q3);
    limited_flux = 0.5 * abs(u) * (1.0 - alpha) * limited_jump;
    upwind_flux = u > 0.0 ? q * u : q2 * u;
    vec3 Fx1 = upwind_flux + limited_flux;

    // Flux in y direction
    vec2 dy = vec2(0.0, 1.0);
    u_size = size + vec2(0.0, 1.0);
    q0 = texture2D(value, texel_to_uv(gid - 2.0 * dy, size)).xyz;
    q1 = texture2D(value, texel_to_uv(gid - dy, size)).xyz;
    q2 = texture2D(value, texel_to_uv(gid + dy, size)).xyz;
    q3 = texture2D(value, texel_to_uv(gid + 2.0 * dy, size)).xyz;
    // Bottom interface
    u = texture2D(vVelocity, texel_to_uv(gid, u_size)).x;
    alpha = abs(u * dt / h); // Courant number
    limited_jump = (q - q1) * superbee(u, q0, q1, q, q2);
    limited_flux = 0.5 * abs(u) * (1.0 - alpha) * limited_jump;
    upwind_flux = u > 0.0 ? q1 * u : q * u;
    vec3 Fy0 = upwind_flux + limited_flux;
    // Right interface
    u = texture2D(vVelocity, texel_to_uv(gid + dy, u_size)).x;
    alpha = abs(u * dt / h); // Courant number
    limited_jump = (q2 - q) * superbee(u, q1, q, q2, q3);
    limited_flux = 0.5 * abs(u) * (1.0 - alpha) * limited_jump;
    upwind_flux = u > 0.0 ? q * u : q2 * u;
    vec3 Fy1 = upwind_flux + limited_flux;

    // Average flux in cell (requires CFL condition dt < dx / u)
    gl_FragColor = vec4(q + (Fx0 - Fx1 + Fy0 - Fy1) * dt / h, 1.0);
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
    vec2 p = vUv * size;
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
  uniform sampler2D velocity;

  vec2 uv_to_texel(vec2 vUv, vec2 size) {
    return floor(vUv * size);
  }

  vec2 texel_to_uv(vec2 gid, vec2 size) {
    return (gid + vec2(0.5, 0.5)) / size;
  }

  void main() {
    vec2 gid = uv_to_texel(vUv, size);

    if ((gid.x > 0.0) && (gid.x < size.x - 1.0)) {
      // Correct the interior velocity values
      vec2 dx = vec2(1.0, 0.0);
      vec2 p_size = size - dx; // Staggered grid correction
      float u = texture2D(velocity, vUv).x;
      float P1 = texture2D(pressure, texel_to_uv(gid - dx, p_size)).x;
      float P2 = texture2D(pressure, texel_to_uv(gid, p_size)).x;
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
  uniform sampler2D velocity;

  vec2 uv_to_texel(vec2 vUv, vec2 size) {
    return floor(vUv * size);
  }

  vec2 texel_to_uv(vec2 gid, vec2 size) {
    return (gid + vec2(0.5, 0.5)) / size;
  }

  void main() {
    vec2 gid = uv_to_texel(vUv, size);

    if ((gid.y > 0.0) && (gid.y < size.y - 1.0)) {
      // Correct the interior velocity values
      vec2 dy = vec2(0.0, 1.0);
      vec2 p_size = size - dy; // Staggered grid correction
      float v = texture2D(velocity, vUv).x;
      float P1 = texture2D(pressure, texel_to_uv(gid - dy, p_size)).x;
      float P2 = texture2D(pressure, texel_to_uv(gid, p_size)).x;
      gl_FragColor = vec4(v - scale * (P2 - P1), 0, 0, 1);
    } else {
      // Apply boundary conditions to edge velocity values
      gl_FragColor = vec4(0, 0, 0, 1); // Dirichlet BC
    }
  }
`;

export const boundaryConditionSource = /*glsl*/`
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;

  uniform sampler2D bc;
  uniform sampler2D texture;
  
  void main() {
    vec4 bc_value = texture2D(bc, vUv);
    vec4 tex_value = texture2D(texture, vUv);
    // The alpha value of the bc indicates
    // whether or not it is active
    if (bc_value.a > 0.5) {
      gl_FragColor = bc_value;
    } else {
      gl_FragColor = tex_value;
    }
  }
`;

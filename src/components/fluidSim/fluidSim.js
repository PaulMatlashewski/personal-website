import * as React from 'react'
import Fluid from './fluid'

function getWebGLContext(canvas) {
  const webGLParams = {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
  }
  const gl = canvas.getContext('webgl', webGLParams);
  // Only continue if WebGL is available.
  if (gl === null) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }
  // Enable floating point textures
  gl.getExtension('OES_texture_float');
  gl.getExtension('OES_texture_float_linear');
  return gl;
}

const FluidSim = () => {
  const canvasRef = React.useRef();

  const resizeCanvas = (canvas) => {
    const pixelRatio = window.devicePixelRatio || 1;
    const width = Math.floor(window.innerWidth * pixelRatio)
    const height = Math.floor(window.innerHeight * pixelRatio)
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
    }
    return false;
  }

  React.useEffect(() => {
    let splatPoint = {
      x: null,
      y: null,
      dx: null,
      dy: null,
      t: null,
      down: false,
      moved: false,
    };

    const canvas = canvasRef.current
    resizeCanvas(canvas);

    canvas.addEventListener('mousedown', e => {
      splatPoint.x = e.offsetX / canvas.width;
      splatPoint.y = 1 - e.offsetY / canvas.height;
      splatPoint.down = true;
    });

    canvas.addEventListener('mousemove', e => {
      const x = e.offsetX / canvas.width;
      const y = 1 - e.offsetY / canvas.height;
      splatPoint.dx = deltaX(splatPoint.x, x);
      splatPoint.dy = deltaY(splatPoint.y, y);
      splatPoint.x = x;
      splatPoint.y = y;
      splatPoint.moved = (Math.abs(splatPoint.dx) > 0) || (Math.abs(splatPoint.dy) > 0)
    });

    canvas.addEventListener('mouseup', e => {
      splatPoint.down = false;
    });

    function deltaX(x0, x1) {
      let delta = x1 - x0;
      let aspectRatio = canvas.width / canvas.height;
      if (aspectRatio < 1) delta *= aspectRatio;
      return delta;
  }
  
    function deltaY(y0, y1) {
      let delta = y1 - y0;
      let aspectRatio = canvas.width / canvas.height;
      if (aspectRatio > 1) delta /= aspectRatio;
      return delta;
    }

    const gl = getWebGLContext(canvas);
    const simParams = {
      jacobiIters: 20,
      interpolation: 'cubic',
      inkParams: {
        resolution: 1024,
        splatRadius: 0.002,
        internalFormat: gl.RGBA,
        format: gl.RGBA,
        type: gl.FLOAT,
        filterType: gl.LINEAR,
        bcs: [],
      },
      velocityParams: {
        resolution: 128,
        splatRadius: 0.002,
        splatForce: 20,
        internalFormat: gl.RGBA,
        format: gl.RGBA,
        type: gl.FLOAT,
        filterType: gl.NEAREST,
        uBcs: [
            { type: 'left', from: 0, to: 1, value: [0, 0, 0] },
            { type: 'right', from: 0, to: 1, value: [0, 0, 0] },
        ],
        vBcs: [
          { type: 'bottom', from: 0, to: 1, value: [0, 0, 0] },
          { type: 'top', from: 0, to: 1, value: [0, 0, 0] },
        ],
      },
      pressureParams: {
        resolution: 128,
        internalFormat: gl.RGBA,
        format: gl.RGBA,
        type: gl.FLOAT,
        filterType: gl.NEAREST,
      }
    };
    const fluid = new Fluid(gl, simParams);

    const render = () => {
      fluid.step(gl, 0.01, splatPoint);
      fluid.drawScene(gl);
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  })

  return (
    <canvas ref={canvasRef} />
  )
}

export default FluidSim;

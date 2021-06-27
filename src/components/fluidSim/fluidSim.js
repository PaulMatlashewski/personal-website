import * as React from 'react'
import Fluid from './fluid'
import { fluidCanvas } from './fluidSim.module.css'

const resizeCanvas = gl => {
  const width = gl.canvas.clientWidth;
  const height = gl.canvas.clientHeight;
  if (gl.canvas.width !== width || gl.canvas.height !== height) {
     gl.canvas.width = width;
     gl.canvas.height = height;
     return true;
  }
  return false;
}

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
  
  resizeCanvas(gl);
  return gl;
}

const FluidSim = () => {
  const canvasRef = React.useRef();

  React.useEffect(() => {
    const canvas = canvasRef.current
    const gl = getWebGLContext(canvas);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    let splatPoint = {
      x: null,
      y: null,
      dx: null,
      dy: null,
      t: null,
      down: false,
      moved: false,
    };

    canvas.addEventListener('mousedown', e => {
      splatPoint.x = e.offsetX / canvas.width;
      splatPoint.y = 1 - e.offsetY / canvas.height;
      splatPoint.down = true;
    });

    canvas.addEventListener('mousemove', e => {
      const x = e.offsetX / canvas.width;
      const y = 1 - e.offsetY / canvas.height;
      splatPoint.dx = x - splatPoint.x;
      splatPoint.dy = y - splatPoint.y;
      splatPoint.x = x;
      splatPoint.y = y;
      splatPoint.moved = (Math.abs(splatPoint.dx) > 0) || (Math.abs(splatPoint.dy) > 0)
    });

    canvas.addEventListener('mouseup', e => {
      splatPoint.down = false;
    });
    
    const simParams = {
      jacobiIters: 20,
      interpolation: 'linear',
      inkParams: {
        resolution: 256,
        splatRadius: 0.002,
        internalFormat: gl.RGBA,
        format: gl.RGBA,
        type: gl.FLOAT,
        filterType: gl.LINEAR,
        bcs: [],
      },
      velocityParams: {
        resolution: 256,
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
        resolution: 256,
        internalFormat: gl.RGBA,
        format: gl.RGBA,
        type: gl.FLOAT,
        filterType: gl.NEAREST,
      }
    };
    const fluid = new Fluid(gl, simParams);

    const render = () => {
      resizeCanvas(gl);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      fluid.step(gl, 0.01, splatPoint);
      fluid.drawScene(gl);
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }, [])

  return (
    <canvas ref={canvasRef} className={fluidCanvas}/>
  )
}

export default FluidSim;

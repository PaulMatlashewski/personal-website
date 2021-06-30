import * as React from 'react'
import Fluid from './fluid'
import { fluidCanvas } from './fluidSim.module.css'

const resizeCanvas = gl => {
  const dpr = window.devicePixelRatio || 1;
  const width = Math.floor(gl.canvas.clientWidth * dpr);
  const height = Math.floor(gl.canvas.clientHeight * dpr);
  if (gl.canvas.width !== width || gl.canvas.height !== height) {
     gl.canvas.width = width;
     gl.canvas.height = height;
     gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
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

    const splatPoint = {
      x: null,
      y: null,
      dx: null,
      dy: null,
      down: false,
      moved: false,
    };

    const getPoint = e => ({
      x: e.offsetX / gl.canvas.clientWidth,
      y: 1 - e.offsetY / gl.canvas.clientHeight
    });

    const onMouseDown = e => {
      const point = getPoint(e);
      splatPoint.x = point.x;
      splatPoint.y = point.y;
      splatPoint.down = true;
    }

    const onMouseMove = e => {
      const point = getPoint(e);
      let dx = point.x - splatPoint.x;
      let dy = point.y - splatPoint.y;
      const aspectRatio = gl.canvas.width / gl.canvas.height;
      aspectRatio > 1 ? (dy /= aspectRatio) : (dx *= aspectRatio);
      splatPoint.dx = dx;
      splatPoint.dy = dy;
      splatPoint.x = point.x;
      splatPoint.y = point.y;
      splatPoint.moved = (Math.abs(splatPoint.dx) > 0) || (Math.abs(splatPoint.dy) > 0);
    }

    const onMouseUp = e => {
      splatPoint.down = false;
      splatPoint.moved = false;
    }

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    
    const simParams = {
      jacobiIters: 20,
      interpolation: 'cubic',
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
        splatForce: 15000,
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
      fluid.step(gl, 0.01, splatPoint);
      fluid.drawScene(gl);
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
    }
  }, [])

  return (
    <canvas ref={canvasRef} className={fluidCanvas}/>
  )
}

export default FluidSim;

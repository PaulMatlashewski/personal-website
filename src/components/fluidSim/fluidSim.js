import React, { useState, useEffect, useRef } from 'react'
import Fluid from './sim/fluid'
import Toolbar from './toolbar/toolbar'
import { fluidSim, fluidCanvas } from './fluidSim.module.css'

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
  const canvasRef = useRef();
  const fluidRef = useRef(new Fluid());

  const defaultResolution = 256;
  const [simResolution, setSimResolution] = useState(defaultResolution);
  const [inkResolution, setInkResolution] = useState(defaultResolution);

  // Set up fluid simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    const fluid = fluidRef.current;
    const gl = getWebGLContext(canvas);

    const fluidParams = {
      jacobiIters: 20,
      interpolation: 'cubic',
      inkParams: {
        resolution: defaultResolution,
        splatRadius: 0.002,
        internalFormat: gl.RGBA,
        format: gl.RGBA,
        type: gl.FLOAT,
        filterType: gl.LINEAR,
        bcs: [],
      },
      velocityParams: {
        resolution: defaultResolution,
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
        resolution: defaultResolution,
        internalFormat: gl.RGBA,
        format: gl.RGBA,
        type: gl.FLOAT,
        filterType: gl.NEAREST,
      }
    };

    fluid.initialize(gl, fluidParams)

    const getPoint = e => ({
      x: e.offsetX / gl.canvas.clientWidth,
      y: 1 - e.offsetY / gl.canvas.clientHeight
    });

    const onMouseDown = e => {
      const point = getPoint(e);
      fluid.splatX = point.x;
      fluid.splatY = point.y;
      fluid.splatDown = true;
    }

    const onMouseMove = e => {
      const point = getPoint(e);
      let dx = point.x - fluid.splatX;
      let dy = point.y - fluid.splatY;
      const aspectRatio = gl.canvas.width / gl.canvas.height;
      aspectRatio > 1 ? (dy /= aspectRatio) : (dx *= aspectRatio);
      fluid.splatDx = dx;
      fluid.splatDy = dy;
      fluid.splatX = point.x;
      fluid.splatY = point.y;
      fluid.splatMoved = (Math.abs(dx) > 0) || (Math.abs(dy) > 0);
    }

    const onMouseUp = e => {
      fluid.splatDown = false;
      fluid.splatMoved = false;
    }

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);

    const render = () => {
      if (resizeCanvas(gl)) {
        fluid.updateInk(gl);
        fluid.updateVelocity(gl);
        fluid.updatePressure(gl);
      };

      // Update fluid if simulation parameters have changed
      fluid.inkParams.resolution !== fluid.ink.resolution && fluid.updateInk(gl);
      fluid.velocityParams.resolution !== fluid.velocity.resolution && fluid.updateVelocity(gl);
      fluid.pressureParams.resolution !== fluid.pressure.resolution && fluid.updatePressure(gl);

      // Simulation
      fluid.step(gl, 0.01);
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

  useEffect(() => {
    const fluid = fluidRef.current;
    fluid.velocityParams.resolution = simResolution;
    fluid.pressureParams.resolution = simResolution;
    fluid.inkParams.resolution = inkResolution;
  }, [simResolution, inkResolution])

  return (
    <div className={fluidSim}>
      <canvas className={fluidCanvas} ref={canvasRef}/>
      <Toolbar simParams={{
        simResolution: simResolution,
        setSimResolution: setSimResolution,
        inkResolution: inkResolution,
        setInkResolution: setInkResolution,
      }}/>
    </div>
  )
}

export default FluidSim;

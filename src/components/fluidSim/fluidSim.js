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

const getWebGLContext = canvas => {
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

const FluidCanvas = React.memo(props => {
    // Set up fluid simulation
    useEffect(() => {
      const canvas = props.canvasRef.current;
      const fluid = props.fluidRef.current;
      const gl = getWebGLContext(canvas);
  
      const fluidParams = {
        interpolation: 'cubic',
        splatRadius: 0.002,
        splatForce: 100,
        inkParams: {
          resolution: 256,
          internalFormat: gl.RGBA,
          format: gl.RGBA,
          type: gl.FLOAT,
          filterType: gl.LINEAR,
          bcs: [],
        },
        simParams: {
          resolution: 256,
          dt: 0.01,
          jacobiIters: 20,
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
        }
      };
  
      fluid.initialize(gl, fluidParams);

      const render = () => {
        if (resizeCanvas(gl)) {
          fluid.updateInk(gl);
          fluid.updateSim(gl);
        };
  
        // Update fluid if simulation parameters have changed
        fluid.inkParams.resolution !== fluid.ink.resolution && fluid.updateInk(gl);
        fluid.simParams.resolution !== fluid.velocity.resolution && fluid.updateSim(gl);
  
        // Simulation
        fluid.step(gl);
        fluid.drawScene(gl);
        requestAnimationFrame(render);
      }
  
      requestAnimationFrame(render);
  }, [props.canvasRef, props.fluidRef]);

  return <canvas className={fluidCanvas} ref={props.canvasRef}/>;
});

const FluidSim = () => {
  const canvasRef = useRef();
  const fluidRef = useRef(new Fluid());

  const [simResolution, setSimResolution] = useState(256);
  const [inkResolution, setInkResolution] = useState(256);
  const [dt, setDt] = useState(0.01);
  const [jacobiIters, setJacobiIters] = useState(20);
  const [splatForce, setSplatForce] = useState(100);
  const [splatRadius, setSplatRadius] = useState(0.002);
  const [interpolation, setInterpolation] = useState('cubic');

  // Set up fluid simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    const fluid = fluidRef.current;
    const gl = getWebGLContext(canvas);

    const getPoint = e => ({
      x: e.offsetX / gl.canvas.clientWidth,
      y: 1 - e.offsetY / gl.canvas.clientHeight
    });

    const onMouseDown = e => {
      const point = getPoint(e);
      fluid.splatPoint.x = point.x;
      fluid.splatPoint.y = point.y;
      fluid.splatPoint.down = true;
    }

    const onMouseMove = e => {
      const point = getPoint(e);
      let dx = point.x - fluid.splatPoint.x;
      let dy = point.y - fluid.splatPoint.y;
      const aspectRatio = gl.canvas.width / gl.canvas.height;
      aspectRatio > 1 ? (dy /= aspectRatio) : (dx *= aspectRatio);
      fluid.splatPoint.dx = dx;
      fluid.splatPoint.dy = dy;
      fluid.splatPoint.x = point.x;
      fluid.splatPoint.y = point.y;
      fluid.splatPoint.moved = (Math.abs(dx) > 0) || (Math.abs(dy) > 0);
    }

    const onMouseUp = e => {
      fluid.splatPoint.down = false;
      fluid.splatPoint.moved = false;
    }

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
    }
  }, [])

  // Update fluid simulation
  useEffect(() => {
    const fluid = fluidRef.current;
    fluid.simParams.resolution = simResolution;
    fluid.inkParams.resolution = inkResolution;
    fluid.simParams.dt = dt;
    fluid.simParams.jacobiIters = jacobiIters;
    fluid.splatPoint.force = splatForce;
    fluid.splatPoint.radius = splatRadius;
  }, [simResolution, inkResolution, dt, jacobiIters, splatForce, splatRadius])

  useEffect(() => {
    const fluid = fluidRef.current;
    fluid.updateInterpolation(interpolation);
  }, [interpolation])

  return (
    <div className={fluidSim}>
      <FluidCanvas canvasRef={canvasRef} fluidRef={fluidRef} />
      <Toolbar simParams={{
        simResolution: simResolution,
        setSimResolution: setSimResolution,
        inkResolution: inkResolution,
        setInkResolution: setInkResolution,
        dt: dt,
        setDt: setDt,
        jacobiIters: jacobiIters,
        setJacobiIters: setJacobiIters,
        splatForce: splatForce,
        setSplatForce: setSplatForce,
        splatRadius: splatRadius,
        setSplatRadius: setSplatRadius,
        interpolation: interpolation,
        setInterpolation: setInterpolation
      }}/>
    </div>
  )
}

export default FluidSim;

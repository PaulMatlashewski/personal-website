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
    let splatPoint = null;

    const canvas = canvasRef.current
    resizeCanvas(canvas);

    canvas.addEventListener('click', e => {
      const x = e.offsetX / canvas.width
      const y = 1 - e.offsetY / canvas.height
      splatPoint = [x, y];
    });

    const gl = getWebGLContext(canvas);
    const simParams = {
      inkParams: {
        resolution: 128,
        splatRadius: 0.02,
        internalFormat: gl.RGBA,
        format: gl.RGBA,
        type: gl.FLOAT,
        filterType: gl.NEAREST,
      },
      velocityParams: {
        resolution: 128,
        internalFormat: gl.RGBA,
        format: gl.RGBA,
        type: gl.FLOAT,
        filterType: gl.LINEAR,
      }
    };
    const fluid = new Fluid(gl, simParams);

    const render = () => {
      if (splatPoint) {
        fluid.splat(gl, splatPoint);
        splatPoint = null;
      }
      fluid.advectInk(gl, 0.01);
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

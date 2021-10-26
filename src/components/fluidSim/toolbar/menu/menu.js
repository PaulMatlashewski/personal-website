import * as React from 'react';
import Slider from '../ui/slider/slider';
import { menu, container } from './menu.module.css'

const Menu = props => {
  const resolutionLabels = [32, 64, 128, 256, 512, 1028];

  const updateSimulationResolutionSlider = level => props.simParams.setSimResolution(level);
  const updateInkResolutionSlider = level => props.simParams.setInkResolution(level);
  const updateTimeSlider = event => props.simParams.setDt(event.target.value);
  const updateJacobiIters = event => props.simParams.setJacobiIters(event.target.value);
  const updateSplatForce = event => props.simParams.setSplatForce(event.target.value);
  const updateSplatRadius = event => props.simParams.setSplatRadius(event.target.value);
  // const setInterpolation = (e, interp) => props.simParams.setInterpolation(interp.props.value);

  return (
    <div className={menu}>
      <div className={container}>
        <Slider
          name={'Flow Resolution'}
          discrete={true}
          value={props.simParams.simResolution}
          values={resolutionLabels}
          onChange={updateSimulationResolutionSlider}
        />
        <Slider
          name={'Ink Resolution'}
          discrete={true}
          value={props.simParams.inkResolution}
          values={resolutionLabels}
          onChange={updateInkResolutionSlider}
        />
        <Slider
          name={'Simulation Speed'}
          value={props.simParams.dt}
          valueLabel={(props.simParams.dt * 1).toFixed(3)}
          min={0.0}
          max={0.05}
          step={0.001}
          onChange={updateTimeSlider}
        />
        <Slider
          name={'Jacobi Iterations'}
          value={props.simParams.jacobiIters}
          valueLabel={props.simParams.jacobiIters}
          min={10}
          max={100}
          step={2}
          onChange={updateJacobiIters}
        />
        <Slider
          name={'Splat Force'}
          value={props.simParams.splatForce}
          valueLabel={props.simParams.splatForce}
          min={10}
          max={300}
          step={10}
          onChange={updateSplatForce}
        />
        <Slider
          name={'Splat Size'}
          value={props.simParams.splatRadius}
          valueLabel={(props.simParams.splatRadius * 10000).toFixed(0)}
          min={0.0001}
          max={0.01}
          step={0.0001}
          onChange={updateSplatRadius}
        />
          {/*
          <div className={sliderContainer}>
            <Typography className={sliderName} variant='subtitle1'>Interpolation</Typography>
              <Select
                input={<Input className={selectItem}/>}
                value={props.simParams.interpolation}
                onChange={setInterpolation}
                label="Interpolation"
              >
                <MenuItem value={'linear'}>linear</MenuItem>
                <MenuItem value={'cubic'}>cubic</MenuItem>
              </Select>
          </div> */}
      </div>
    </div>
  )
}

export default Menu;

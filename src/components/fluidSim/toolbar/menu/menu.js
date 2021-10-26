import * as React from 'react';
import CustomSlider from '../ui/slider/slider';
import DiscreteSlider from '../ui/discreteSlider/discreteSlider';
import {
  menu,
  container,
  sliderContainer,
  sliderName,
  sliderElement,
  sliderLabel
} from './menu.module.css'

const Menu = props => {
  const resolutionLabels = [32, 64, 128, 256, 512, 1028];

  const updateSimulationResolutionSlider = level => props.simParams.setSimResolution(level);
  const updateInkResolutionSlider = level => props.simParams.setInkResolution(level);
  const updateTimeSlider = event => props.simParams.setDt(event.target.value);
  const updateJacobiIters = event => props.simParams.setJacobiIters(event.target.value);
  const updateSplatForce = event => props.simParams.setSplatForce(event.target.value);
  const updateSplatRadius = event => props.simParams.setSplatRadius(event.target.value);
  const setInterpolation = (e, interp) => props.simParams.setInterpolation(interp.props.value);

  return (
    <div className={menu}>
      <div className={container}>
        <div className={sliderContainer}>
          <div className={sliderName}>Flow Resolution</div>
          <DiscreteSlider
            className={sliderElement}
            value={props.simParams.simResolution}
            values={resolutionLabels}
            onChange={updateSimulationResolutionSlider}
          />
        </div>
        <div className={sliderContainer}>
          <div className={sliderName}>Ink Resolution</div>
          <DiscreteSlider
            className={sliderElement}
            value={props.simParams.inkResolution}
            values={resolutionLabels}
            onChange={updateInkResolutionSlider}
          />
        </div>
        <div className={sliderContainer}>
          <div className={sliderName}>Simulation Speed</div>
          <CustomSlider
            className={sliderElement}
            value={props.simParams.dt}
            min={0.0}
            max={0.05}
            step={0.001}
            onChange={updateTimeSlider}
          />
          <div className={sliderLabel}>{(props.simParams.dt * 1).toFixed(3)}</div>
        </div>
        <div className={sliderContainer}>
          <div className={sliderName}>Jacobi Iterations</div>
          <CustomSlider
            className={sliderElement}
            value={props.simParams.jacobiIters}
            min={10}
            max={100}
            step={2}
            onChange={updateJacobiIters}
          />
          <div className={sliderLabel}>{props.simParams.jacobiIters}</div>
        </div>
        <div className={sliderContainer}>
          <div className={sliderName}>Splat Force</div>
          <CustomSlider
            className={sliderElement}
            value={props.simParams.splatForce}
            min={10}
            max={300}
            step={10}
            onChange={updateSplatForce}
          />
          <div className={sliderLabel}>{props.simParams.splatForce}</div>
        </div>
        <div className={sliderContainer}>
          <div className={sliderName}>Splat Size</div>
          <CustomSlider
            className={sliderElement}
            value={props.simParams.splatRadius}
            min={0.0001}
            max={0.01}
            step={0.0001}
            onChange={updateSplatRadius}
          />
          <div className={sliderLabel}>{(props.simParams.splatRadius * 10000).toFixed(0)}</div>
        </div>
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

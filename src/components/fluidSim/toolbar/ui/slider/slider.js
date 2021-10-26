import * as React from 'react';
import {
  sliderContainer,
  sliderName,
  sliderValue,
  slider,
  sliderLabels,
  sliderLabel,
} from './slider.module.css';

const thumbPosition = (value, min, max) => {
  const position = (value - min) / (max - min) * 100;
  return position.toString() + '%';
}

const thumbCorrection = (value, min, max) => {
  const position = (value - min) / (max - min) * 100 - 50;
  return position.toString() + '%';
}

const Slider = props => {
  return (
    <div className={sliderContainer}>
      <div className={sliderName}>{props.name}</div>
      {props.discrete ? <DiscreteSlider {...props}/> : <ContinuousSlider {...props}/>}
      {props.valueLabel ? <div className={sliderValue}>{props.valueLabel}</div> : null}
    </div>
  )
}

const ContinuousSlider = props => (
  <input
    className={slider}
    type='range'
    value={props.value}
    min={props.min}
    max={props.max}
    step={props.step}
    onChange={props.onChange}
    style={
      {
        '--thumb-position': thumbPosition(props.value, props.min, props.max),
        '--thumb-correction': thumbCorrection(props.value, props.min, props.max),
      }
    }
  />
)

const DiscreteSlider = props => {
  const labels = props.values.map((value, idx) => (
    <span
      key={idx}
      className={sliderLabel}
      style = {{'--left-val': (idx / (props.values.length - 1) * 100).toString() + '%'}}
    >
      {value}
    </span>)
  );
  return (
    <div>
      <ContinuousSlider
        value={props.values.indexOf(props.value)}
        min={0}
        max={props.values.length - 1}
        step={1}
        onChange={event => props.onChange(props.values[event.target.value])}
      />
      <div className={sliderLabels}>
        {labels}
      </div>
    </div>
  )
}

export default Slider;

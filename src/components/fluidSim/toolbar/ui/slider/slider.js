import * as React from 'react';
import { slider } from './slider.module.css';

const thumbPosition = (value, min, max) => {
  const position = (value - min) / (max - min) * 100;
  return position.toString() + '%';
}

const CustomSlider = props => (
  <input
    className={slider}
    type='range'
    value={props.value}
    min={props.min}
    max={props.max}
    step={props.step}
    onChange={props.onChange}
    style={{'--thumb-position': thumbPosition(props.value, props.min, props.max)}}
  />
)

export default CustomSlider;

import * as React from 'react';
import CustomSlider from '../slider/slider';
import { sliderLabels, sliderValue } from './discreteSlider.module.css';

const DiscreteSlider = props => {

  const labels = props.values.map((value, idx) => (
    <span
      className={sliderValue}
      style = {{'--left-val': (idx / (props.values.length - 1) * 100).toString() + '%'}}
    >
      {value}
    </span>)
  );

  return (
    <div>
      <CustomSlider
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

export default DiscreteSlider;

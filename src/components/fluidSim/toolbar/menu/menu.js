import * as React from 'react';
import { createMuiTheme, ThemeProvider, makeStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import CustomSlider from '../ui/slider/slider';
import DiscreteSlider from '../ui/discreteSlider/discreteSlider';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import {
  menu,
  container,
  sliderContainer,
  sliderName,
  sliderElement,
  sliderLabel,
  selectItem
} from './menu.module.css'

const useStyles = makeStyles({
  markLabel: {
    fontSize: '12px'
  }
})

const Menu = props => {
  const classes = useStyles();
  const theme = createMuiTheme({
    palette: {
      primary: {
        main: '#81d4fa',
        contrastText: "#ffffff"
      },
      type: 'dark',
    },
    typography: {
      subtitle1: {
        fontSize: 12,
      }
    }
  });
  

  const resolutionLabels = [
    { value: 0, label: '32'}, { value: 1, label: '64'}, { value: 2, label: '128' },
    { value: 3, label: '256'}, { value: 4, label: '512'}, { value: 5, label: '1028' }
  ]

  const customLabels = [32, 64, 128, 256, 512, 1028];

  const resolutionLevelToValue = { 0: 32, 1: 64, 2: 128, 3: 256, 4: 512, 5: 1028 };
  const resolutionValueToLevel = { 32: 0, 64: 1, 128: 2, 256: 3, 512: 4, 1028: 5 };

  const updateSimulationResolutionSlider = (e, level) => props.simParams.setSimResolution(resolutionLevelToValue[level]);
  const updateInkResolutionSlider = (e, level) => props.simParams.setInkResolution(resolutionLevelToValue[level]);
  const updateInkResolutionSliderCustom = (level) => props.simParams.setInkResolution(level);
  const updateTimeSlider = (e, level) => props.simParams.setDt(level);
  const updateJacobiIters = (e, level) => props.simParams.setJacobiIters(level);
  const updateSplatForce = (event) => props.simParams.setSplatForce(event.target.value);
  const updateSplatRadius = (e, level) => props.simParams.setSplatRadius(level);
  const setInterpolation = (e, interp) => props.simParams.setInterpolation(interp.props.value);

  return (
    <div className={menu}>
      <div className={container}>
        <ThemeProvider theme={theme}>
          <div className={sliderContainer}>
            <Typography className={sliderName} variant='subtitle1'>Flow Resolution</Typography>
            <Slider
              className={sliderElement}
              classes={{markLabel: classes.markLabel}}
              value={resolutionValueToLevel[props.simParams.simResolution]}
              marks={resolutionLabels}
              step={null}
              min={0}
              max={5}
              onChange={updateSimulationResolutionSlider}
            />
          </div>
          <div className={sliderContainer}>
            <Typography className={sliderName} variant='subtitle1'>Ink Resolution</Typography>
            <Slider
              className={sliderElement}
              classes={{markLabel: classes.markLabel}}
              value={resolutionValueToLevel[props.simParams.inkResolution]}
              marks={resolutionLabels}
              step={null}
              min={0}
              max={5}
              onChange={updateInkResolutionSlider}
            />
          </div>
          <div className={sliderContainer}>
            <Typography className={sliderName} variant='subtitle1'>Discrete</Typography>
            <DiscreteSlider
              value={props.simParams.inkResolution}
              values={customLabels}
              onChange={updateInkResolutionSliderCustom}/>
          </div>
          {/* <div className={sliderContainer}>
            <Typography className={sliderName} variant='subtitle1'>Simulation Speed</Typography>
            <Slider
              className={sliderElement}
              classes={{markLabel: classes.markLabel}}
              value={props.simParams.dt}
              step={0.001}
              min={0.0}
              max={0.05}
              onChange={updateTimeSlider}
            />
            <TextField
              className={sliderLabel}
              value={props.simParams.dt.toFixed(3)}
              inputProps={{ style: {textAlign: 'right', fontSize: 12}}}
              InputProps={{ disableUnderline: true}}
            />
          </div>
          <div className={sliderContainer}>
            <Typography className={sliderName} variant='subtitle1'>Jacobi Iterations</Typography>
            <Slider
              className={sliderElement}
              classes={{markLabel: classes.markLabel}}
              value={props.simParams.jacobiIters}
              step={2}
              min={10}
              max={100}
              onChange={updateJacobiIters}
            />
            <TextField
              className={sliderLabel}
              value={props.simParams.jacobiIters}
              inputProps={{ style: {textAlign: 'right', fontSize: 12}}}
              InputProps={{ disableUnderline: true}}
            />
          </div>
          <div className={sliderContainer}>
            <Typography className={sliderName} variant='subtitle1'>Splat Force</Typography>
            <CustomSlider
              value={props.simParams.splatForce}
              min={10}
              max={300}
              step={10}
              onChange={updateSplatForce}
            />
            <TextField
              className={sliderLabel}
              value={props.simParams.splatForce}
              inputProps={{ style: {textAlign: 'right', fontSize: 12}}}
              InputProps={{ disableUnderline: true}}
            />
          </div>
          <div className={sliderContainer}>
            <Typography className={sliderName} variant='subtitle1'>Splat Radius</Typography>
            <Slider
              className={sliderElement}
              classes={{markLabel: classes.markLabel}}
              value={props.simParams.splatRadius}
              step={0.0001}
              min={0.0001}
              max={0.01}
              onChange={updateSplatRadius}
            />
            <TextField
              className={sliderLabel}
              value={(props.simParams.splatRadius * 10000).toFixed(0)}
              inputProps={{ style: {textAlign: 'right', fontSize: 12}}}
              InputProps={{ disableUnderline: true}}
            />
          </div>
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
        </ThemeProvider>
      </div>
    </div>
  )
}

export default Menu;

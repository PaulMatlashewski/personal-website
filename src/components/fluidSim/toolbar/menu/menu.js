import * as React from 'react'
import { createMuiTheme, ThemeProvider, makeStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider'
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import {
  menu,
  container,
  sliderContainer,
  sliderName,
  sliderElement,
  sliderLabel,
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

  const resolutionLevelToValue = { 0: 32, 1: 64, 2: 128, 3: 256, 4: 512, 5: 1028 };
  const resolutionValueToLevel = { 32: 0, 64: 1, 128: 2, 256: 3, 512: 4, 1028: 5 };

  const updateSimulationResolutionSlider = (e, level) => props.simParams.setSimResolution(resolutionLevelToValue[level]);
  const updateInkResolutionSlider = (e, level) => props.simParams.setInkResolution(resolutionLevelToValue[level]);
  const updateTimeSlider = (e, level) => props.simParams.setDt(level);
  const updateJacobiIters = (e, level) => props.simParams.setJacobiIters(level);
  const updateSplatForce = (e, level) => props.simParams.setSplatForce(level);
  const updateSplatRadius = (e, level) => props.simParams.setSplatRadius(level);

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
            <Slider
              className={sliderElement}
              classes={{markLabel: classes.markLabel}}
              value={props.simParams.splatForce}
              step={10}
              min={10}
              max={300}
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
        </ThemeProvider>
      </div>
    </div>
  )
}

export default Menu;

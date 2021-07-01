import * as React from 'react'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider'
import Typography from '@material-ui/core/Typography';
import { menu, container, slider, text } from './menu.module.css'

const Menu = props => {
  const theme = createMuiTheme({
    palette: {
      primary: {
        main: '#81d4fa',
        contrastText: "#ffffff"
      },
      type: 'dark',
    },
  });

  const resolutionLabels = [
    { value: 0, label: '32'}, { value: 1, label: '64'}, { value: 2, label: '128' },
    { value: 3, label: '256'}, { value: 4, label: '512'}, { value: 5, label: '1028' }
  ]

  const resolutionLevelToValue = { 0: 32, 1: 64, 2: 128, 3: 256, 4: 512, 5: 1028 };
  const resolutionValueToLevel = { 32: 0, 64: 1, 128: 2, 256: 3, 512: 4, 1028: 5 };

  const updateSimulationResolutionSlider = (e, level) => props.simParams.setSimResolution(resolutionLevelToValue[level]);
  const updateInkResolutionSlider = (e, level) => props.simParams.setInkResolution(resolutionLevelToValue[level]);

  return (
    <div className={menu}>
      <div className={container}>
        <ThemeProvider theme={theme}>
          <div className={slider}>
            <Typography className={text}>Simulation Resolution</Typography>
            <Slider
              value={resolutionValueToLevel[props.simParams.simResolution]}
              marks={resolutionLabels}
              step={null}
              min={0}
              max={5}
              onChange={updateSimulationResolutionSlider}
            />
          </div>
          <div className={slider}>
            <Typography className={text}>Ink Resolution</Typography>
            <Slider
              value={resolutionValueToLevel[props.simParams.inkResolution]}
              marks={resolutionLabels}
              step={null}
              min={0}
              max={5}
              onChange={updateInkResolutionSlider}
            />
          </div>
        </ThemeProvider>
      </div>
    </div>
  )
}

export default Menu;

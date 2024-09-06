import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box } from '@mui/material';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { legendClasses } from '@mui/x-charts';
import {
    blueberryTwilightPalette
  } from '@mui/x-charts/colorPalettes';

// TODO: for testing only - delete
const data = [
    {income: 100, outgoing: 210, month: 'Jan'},
    {income: 200, outgoing: 200, month: 'Feb'},
    {income: 450, outgoing: 60, month: 'Mar'},
    {income: 80, outgoing: 480, month: 'Apr'},
    {income: 170, outgoing: 240, month: 'Jun'},
    {income: 190, outgoing: 180, month: 'Jul'},
]

/**
 * Bar chart to compare income and expenses by month
 * Adapted from https://mui.com/x/react-charts/bars/#using-a-dataset
 * 
 * @param {*} data Data must be in the form [{ income: 100, outgoing: 200, month: 'Jan'}] 
 * @returns BarChart instance
 */
// const IncomeOutgoingChart = ({ data, ...props }) => {
const IncomeOutgoingChart = ({ ...props}) => {
    
    const chartSetting = {
      yAxis: [
        {
          label: 'Amount (£)',
        },
      ],
      width: 350,
      height: 200,
      sx: {
        [`.${axisClasses.left} .${axisClasses.label}`]: {
          transform: 'translate(-10px, 0)',
        },
        // [`.${legendClasses.root}`]: {
        //     transform: 'translate(70px, 0)'
        // },
        // border: 1,
        // borderColor: 'blue'
      },
    };
    
    const valueFormatter = (value) => `£${value}`;
    
    return (
        <Box sx={{display: 'flex', flexDirection: 'row', alignSelf: 'center', ...props?.sx}} {...props}>
            <BarChart
              dataset={data}
              xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
              series={[
                { dataKey: 'income', label: 'Income', valueFormatter, 
                    // color: '#8884d8' 
                },
                { dataKey: 'outgoing', label: 'Outgoing', valueFormatter, 
                    // color: '#82ca9d' 
                },
              ]}
            //   margin={{right: 20 }}
            //   margin={{bottom: 0}}
              slotProps={{
                legend: {
                    // direction: 'column',
                    // position: {
                    //     horizontal: 'right',
                    //     vertical: 'middle'
                    // },
                    // padding: {
                    //     left: 100
                    // }
                    hidden: true
                }
            }}
              {...chartSetting}
            />
            <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1}}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 1
                }}>
                    <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100%" height="100%" x="0" y="0" fill={blueberryTwilightPalette('light')[0]} />
                    </svg>
                    <span>Income</span>
                </Box>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 1
                }}>
                    <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100%" height="100%" x="0" y="0" fill={blueberryTwilightPalette('light')[1]} />
                    </svg>
                    <span>Outgoings</span>
                </Box>
            </Box>
        </Box>
      );
}

export default IncomeOutgoingChart;
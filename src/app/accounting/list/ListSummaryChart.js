import React from 'react'
import { Box, Typography } from '@mui/material'
import MonthlyExpenseChart from '../expenses/list/MonthlyExpenseChart'

function ListSummaryChart({ chartData }) {
  if (!chartData) return;
  
  console.log('Chard data passed here: ', chartData);
  const { chartTitle, data, keys, indexBy } = chartData;
  const valueFormat = chartData?.valueFormat;

  return (
    <Box sx={{
        mb: 6,
        height: 180,
        width: '100%',
        // margin: 'auto',
        alignSelf: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        // alignItems: 'center',
        // backgroundColor: 'blue',
        // border: 1,
        // borderColor: 'green',
    }}>
        <Box sx={{
            width: '58.5%', 
            height: '100%', 
            position: 'relative',
            // border: 1,
            // borderColor: 'grey',
            mt: 3,
            ml: 2,
            backgroundColor: 'white',
            borderRadius: 4,
            padding: 1,
            border: 1,
            borderColor: '#dee0e5',
            // boxShadow: '0px 10px 15px -3px rgb(236, 239, 248)',
        }}>
            <Typography 
                variant="subtitle1" 
                fontWeight="bold"
                sx={{
                  position: 'absolute',
                  top: 15,
                  left: 15  
                }}
            >
                {/* Monthly breakdown */}
                {chartTitle}
            </Typography>
            {/* data API: [{ month: String, expense: Number }] */}
            <MonthlyExpenseChart 
              data={data} 
              keys={keys} 
              indexBy={indexBy} 
              valueFormat={valueFormat}
            />
        </Box>
    </Box>
  )
}

export default ListSummaryChart
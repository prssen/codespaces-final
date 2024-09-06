import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { LineChart, MarkPlot, AreaPlot } from '@mui/x-charts/LineChart';
import { LinePlot, ResponsiveChartContainer } from '@mui/x-charts';
import { ArrowDownwardOutlined, ArrowUpwardOutlined, SubwayOutlined } from '@mui/icons-material';
import { Paper, Box, Grid, ButtonGroup, Button, CircularProgress, Typography } from '@mui/material';
import { useDrawingArea } from '@mui/x-charts';
import { green, red } from '@mui/material/colors';
import { maxArray } from '@/lib/utils/utils';
import { max } from 'lodash';
// import StyledCircularProgress from '../../Components/StyledCircularProgress';

// Adding gradient to area below sparkline graph - adapted from 
// https://stackoverflow.com/a/78215432
const Colorswitch = ({ title, positiveChange, positiveColor, negativeColor }) => {
    const { top, height, bottom } = useDrawingArea();
    const svgHeight = top + bottom + height;

    return (
        <>
            <defs>
                {/* <linearGradient id="paint0_linear_45_2" x1="300.25" y1="46.9999" x2="300.25" y2={`${svgHeight}px`} gradientUnits="userSpaceOnUse"> */}
                {/* <linearGradient id="paint0_linear_45_2" x1="50%" y1="0%" x2="50%" y2={`${svgHeight}px`} gradientUnits="userSpaceOnUse"> */}
                
                <linearGradient id="paint0_linear_45_2" x1="0%" y1="0%" x2="0%" y2={`100%`} gradientUnits="userSpaceOnUse">
                {/* <linearGradient id={`paint_linear_${title}`} x1="0%" y1="0%" x2="0%" y2={`100%`} gradientUnits="userSpaceOnUse"> */}
                    <stop stop-color="#2F4CDD" stop-opacity="0.4" />
                    {/* <stop stop-color={positiveChange ? positiveColor : negativeColor} stop-opacity="0.4" /> */}
                    <stop offset="1" stop-color="#2F4CDD" stop-opacity="0" />
                    {/* <stop offset="1" stop-color={positiveChange ? positiveColor : negativeColor} stop-opacity="0" /> */}
                </linearGradient>
            </defs>

            <defs>
                <linearGradient id="paint0_linear_45_3" x1="299.498" y1="-4.28272" x2="299.498" y2={`${svgHeight}px`} gradientUnits="userSpaceOnUse">
                    <stop stop-color="#B519EC" stop-opacity="0.4" />
                    <stop offset="1" stop-color="#B519EC" stop-opacity="0" />
                </linearGradient>
            </defs>
        </>
    )
}

// TODO: finish - see https://github.com/ed-roh/react-admin-dashboard/blob/master/src/components/StatBox.jsx 
const DataCard = ({ title, subtitle, period, xAxis, yAxis, showMark, goodIndicator=true, ...props }) => {
    const progressProps = {
        size: 120,
        thickness: 9,
        trackColor: '#d1d1d1'
    }

    const data = [1, 4, 2, 5, 7, 2, 4, 6];

    // Choose end value of x-axis
    const axisMaximum = period === 'year' ? 12 
                        : period === 'month' ? 30 
                        : max(xAxis);

    // % change in the indicator from the start of 
    // the period, to 1 decimal place
    const indicatorChange = yAxis[yAxis.length - 1] - yAxis[0];
    const percentChange = Math.round(indicatorChange / yAxis[0] * 100, 1);

    const positiveChange = (percentChange > 0 && goodIndicator) || (percentChange < 0 && !goodIndicator);

    console.log('DataCard data: ', xAxis, yAxis);

    // const getMinMax = (data) => {
    //     let min = data[0];
    //     let max = data[0];
    //     for (const item of data) {
    //         if (item < min) min = item;
    //         if (item > max) max = item;
    //     }
    //     return [min, max];
    // }

    return (
        <Paper 
            // width="100%" 
            mr={3} 
            {...props?.paper}
            sx={{
                // border: 2, 
                // borderColor: 'red',
                width: '100%',
                padding: 2,
                borderRadius: 3,
                backgroundColor: 'white',
                ...props?.paper?.sx
                // backgroundColor: 'background.paper',
                // backgroundImage: `linear-gradient(to right, ${blue[300]}, ${blue[100]})`
                // backgroundImage: `linear-gradient(to right, red, blue)`
            }}>
            {/* <Grid container alignItems='center'> */}
            <Grid container height='100%' alignItems='flex-start'>
                {/* <Grid item xs={6} sx={{height: '100%', justifyContent: "center"}}> */}
                <Grid item xs={6}>
                    <Box 
                        sx={{
                            display: 'flex', 
                            flexDirection: 'column', 
                            marginBottom: 1
                            // bosder: 2, 
                            // borderColor: 'purple'
                        }}>
                        <Typography 
                            variant="h4" 
                            fontWeight="bold" 
                            sx={{ 
                                // color: 'grey.100'
                            }}>
                                {/* 270 <br/> */}
                                {title} <br/>
                        </Typography>
                        <Typography 
                            variant="subtitle1" 
                            // color="primary.main"
                            color="text.secondary"
                        // >Books delivered</Typography>
                        >{subtitle}</Typography>
                    </Box>
                </Grid>
                <Grid 
                    item 
                    xs={6} 
                    sx={{
                        // border: 2, 
                        // borderColor: 'pink'
                        alignSelf: 'center'
                    }}>
                    <Box 
                        sx={{
                            display: 'flex', 
                            width: '100%', 
                            // border: 2, 
                            // borderColor: 'green', 
                            // justifyContent: 'flex-end'
                            flexDirection: 'column',
                            justifyContent: 'center',
                        }}>
                        {/* <SparkLineChart 
                            data={data} 
                            height={75}
                            width={150} 
                            curve="natural"
                            area
                        /> */}
                        {/* <LineChart */}
                            {/* <Button size="small" sx={{borderRadius: 3, alignSelf: 'flex-end', width: '60%', marginBottom: 2}}>
                                <Typography variant="caption">This week</Typography>
                            </Button> */}
                        <div
                            style={{
                                // border: '4px solid blue'
                            }}>
                            {/* <ResponsiveChartContainer */}
                            <LineChart
                                // xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                                xAxis={[{ data: xAxis, max: axisMaximum }]}
                                // series={[
                                //     {
                                //     data: [2, 5.5, 2, 8.5, 1.5, 5],
                                //     },
                                // ]}

                                // TODO: re-enable 
                                leftAxis={null}
                                bottomAxis={null}
                                series={[
                                    {
                                        // id: title,
                                        id: 'Testing',
                                        type: 'line', 
                                        // data: [2, 5.5, 2, 8.5, 1.5, 5],
                                        data: yAxis,
                                        // data: sparklineData,
                                        // label: 'Testing',
                                        color: 'blue',
                                        // color: positiveChange ? green[500] : red[500],
                                        curve: props?.curve || 'natural',
                                        area: 'true',
                                        connectNulls: true,
                                        showMark: false
                                        // If showMark flag is selected, show mark at start and end of line
                                        // showMark: ({ index }) => showMark && (index === 0 || index === yAxis.length - 1),
                                    } 
                                ]}
                                // yAxis={[
                                //     {disableLine: true, disableTicks: true}
                                // ]}
                                // width={150}
                                // width={150}
                                // height={100}
                                height={40}
                                margin={{top: 0, bottom: 0, left: 0, right: 0}}
                                // margin={{top: 30, bottom: 30, left: 30, right: 30}}
                                sx={{
                                //     '.css-wn5hww-MuiLineElement-root': {
                                //         fill: 'url(#paint0_linear_45_2)'
                                //     }
                                // [`& .MuiAreaElement-series-${title}`]: {
                                [`& .MuiAreaElement-series-Testing`]: {
                                    fill: "url('#paint0_linear_45_2')",
                                    // fill: `url('#paint_linear_${title}')`,
                                  },
                                  width: {
                                    xs: 75,
                                    // xs: 250,
                                    sm: 150
                                  }
                                }}
                            >
                                <Colorswitch 
                                    // title={title}
                                    // positiveChange={positiveChange} 
                                    // positiveColor={green[400]}
                                    // negativeColor={red[400]}
                                />
                            </LineChart>
                                {/* <LinePlot sx={{
                                    // '.css-1la267r-MuiAreaElement-root': {
                                    //     // fill: "url('#paint0_linear_45_2')",
                                    //     fill: 'purple'
                                    // }
                                }}>
                                    <Colorswitch />
                                </LinePlot> */}
                                {/* <MarkPlot /> */}
                                {/* <AreaPlot slotProps={{
                                    area: { 
                                        fill: 'purple'
                                    }
                                }}/> */}
                            {/* </ResponsiveChartContainer> */}
                        </div>
                    </Box>
                </Grid>
                <Grid 
                    item 
                    xs={12} 
                    sx={{
                        // border: 1, 
                        // borderColor: 'blue', 
                        display: 'flex',
                        flexDirection: 'row',
                        alignSelf: 'flex-end',
                        // marginTop: 1,
                    }}>                    
                    {percentChange > 0 ?
                        <ArrowUpwardOutlined sx={{ color: positiveChange ? green[500] : red[500] }}/> : 
                        <ArrowDownwardOutlined sx={{ color: positiveChange ? green[500] : red[500] }}/>}
                    <Typography 
                        variant="body1" 
                        color={positiveChange ? green[300] : red[300]}
                        // fontStyle="italic" 
                        // color="text.secondary" 
                        // sx={{textAlign: 'center'}}
                    // >2.4%</Typography>
                    >{percentChange}%</Typography>
                    <Typography
                        color="text.secondary"
                        sx={{marginLeft: 1}}
                    >
                        {/* Since last week */}
                        since last{" "}{period}
                    </Typography>
                </Grid>
                {/* <Grid item xs={6}>
                </Grid> */}
            </Grid>
        </Paper>
    );
}

export default DataCard;
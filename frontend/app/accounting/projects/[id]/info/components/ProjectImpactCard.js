import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { LineChart, MarkPlot, AreaPlot } from '@mui/x-charts/LineChart';
import { LinePlot, ResponsiveChartContainer } from '@mui/x-charts';
import { ArrowUpwardOutlined, SubwayOutlined } from '@mui/icons-material';
import { Paper, Box, Grid, ButtonGroup, Button, CircularProgress, Typography } from '@mui/material';
import { useDrawingArea } from '@mui/x-charts';
import { blue } from '@mui/material/colors';
// import StyledCircularProgress from '../../Components/StyledCircularProgress';
import StyledCircularProgress from "@/components/CircularProgress";

// Adding gradient to area below sparkline graph - adapted from 
// https://stackoverflow.com/a/78215432
const Colorswitch = () => {
    const { top, height, bottom } = useDrawingArea();
    const svgHeight = top + bottom + height;

    return (
        <>
            <defs>
                {/* <linearGradient id="paint0_linear_45_2" x1="300.25" y1="46.9999" x2="300.25" y2={`${svgHeight}px`} gradientUnits="userSpaceOnUse"> */}
                {/* <linearGradient id="paint0_linear_45_2" x1="50%" y1="0%" x2="50%" y2={`${svgHeight}px`} gradientUnits="userSpaceOnUse"> */}
                <linearGradient id="paint0_linear_45_2" x1="0%" y1="0%" x2="0%" y2={`100%`} gradientUnits="userSpaceOnUse">
                    <stop stop-color="#2F4CDD" stop-opacity="0.4" />
                    <stop offset="1" stop-color="#2F4CDD" stop-opacity="0" />
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
const ProjectImpactCard = () => {
    const progressProps = {
        size: 120,
        thickness: 9,
        trackColor: '#d1d1d1'
    }

    const data = [1, 4, 2, 5, 7, 2, 4, 6];

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
        <Paper width="100%" mr={3} sx={{
            // border: 2, 
            // borderColor: 'red',
            padding: 2,
            borderRadius: 3,
            backgroundColor: 'white'
            // backgroundColor: 'background.paper',
            // backgroundImage: `linear-gradient(to right, ${blue[300]}, ${blue[100]})`
            // backgroundImage: `linear-gradient(to right, red, blue)`
        }}>
            <Grid container alignItems='center'>
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
                                270 <br/>
                        </Typography>
                        <Typography 
                            variant="subtitle1" 
                            // color="primary.main"
                            color="text.secondary"
                        >Books delivered</Typography>
                    </Box>
                </Grid>
                <Grid 
                    item 
                    xs={6} 
                    sx={{
                        // border: 2, 
                        // borderColor: 'pink'
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
                                // border: '4px solid green'
                            }}>
                            {/* <ResponsiveChartContainer */}
                            <LineChart
                                xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                                // series={[
                                //     {
                                //     data: [2, 5.5, 2, 8.5, 1.5, 5],
                                //     },
                                // ]}
                                leftAxis={null}
                                bottomAxis={null}
                                series={[
                                    {
                                        id: 'Testing',
                                        type: 'line', 
                                        data: [2, 5.5, 2, 8.5, 1.5, 5],
                                        // label: 'Testing',
                                        color: 'blue',
                                        curve: 'natural',
                                        area: 'true',
                                        showMark: false
                                    } 
                                ]}
                                // yAxis={[
                                //     {disableLine: true, disableTicks: true}
                                // ]}
                                // width={150}
                                // width={150}
                                height={40}
                                margin={{top: 0, bottom: 0, left: 0, right: 0}}
                                sx={{
                                //     '.css-wn5hww-MuiLineElement-root': {
                                //         fill: 'url(#paint0_linear_45_2)'
                                //     }
                                '& .MuiAreaElement-series-Testing': {
                                    fill: "url('#paint0_linear_45_2')",
                                  },
                                  width: {
                                    xs: 75,
                                    sm: 150
                                  }
                                }}
                            >
                                <Colorswitch />
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
                        // marginTop: 1,
                    }}>                    
                    <ArrowUpwardOutlined />
                    <Typography 
                        variant="body1" 
                        // fontStyle="italic" 
                        // color="text.secondary" 
                        // sx={{textAlign: 'center'}}
                    >2.4%</Typography>
                    <Typography
                        color="text.secondary"
                        sx={{marginLeft: 1}}
                    >
                        Since last week
                    </Typography>
                </Grid>
                {/* <Grid item xs={6}>
                </Grid> */}
            </Grid>
        </Paper>
    );
}

export default ProjectImpactCard;
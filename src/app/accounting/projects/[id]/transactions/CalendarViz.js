import React from "react";
import { Box, Typography } from "@mui/material";
import { ResponsiveCalendar } from "@nivo/calendar";
import { grey } from "@mui/material/colors";
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(LocalizedFormat);

// Code adapted from https://nivo.rocks/calendar/

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const TransactionTooltip = (tooltipProps) => {
    console.log('Tooltip props:', tooltipProps);
    const { day, dr_account, cr_account, description, x, y} = tooltipProps.data;
    const { value } = tooltipProps;
    
    return (
        <Box 
            sx={{
                display: 'flex', 
                flexDirection: 'column', 
                // width: 150, 
                background: grey[500],
                borderRadius: 2,
                padding: 1
            }}>
            <Box 
                sx={{
                    display: 'flex', 
                    flexDirection: 'row', 
                }}
            >
                <Typography color="white" sx={{fontSize: 14, lineHeight: 1.2}}>
                    <strong>Date: </strong>{dayjs(day).format('LL')} <br/>
                    <strong>Amount: </strong>{value} <br/>
                    <strong>Type: </strong>{dr_account || cr_account} <br/>
                    <strong>Description: </strong>{description} <br/>
                </Typography>
                {/* <Typography color="white" sx={{fontSize: 14, lineHeight: 1.2}}>{dr_account || cr_account}: {value}</Typography> */}
            </Box>
            {/* <Typography noWrap color="white" sx={{fontSize: 14}}>{description}</Typography> */}
        </Box>
    );
}

const CalendarViz = ({ data }) => {
    const calendarData = data.map(datum => ({
        ...datum,
        value: datum.amount,
        day: datum.date
    }));
    console.log('Calendar transaction data:', calendarData);

    return <ResponsiveCalendar
        // data={data}
        data={calendarData}
        from="2023-01-01"
        to="2024-12-12"
        emptyColor="#eeeeee"
        colors={["#61cdbb", "#97e3d5", "#e8c1a0", "#f47560"]}
        margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
        yearSpacing={40}
        monthBorderColor="#ffffff"
        dayBorderWidth={2}
        dayBorderColor="#ffffff"
        tooltip={TransactionTooltip}
        legends={[
            {
                anchor: "bottom-right",
                direction: "row",
                translateY: 36,
                itemCount: 4,
                itemWidth: 42,
                itemHeight: 36,
                itemsSpacing: 14,
                itemDirection: "right-to-left",
            },
        ]}
    />
};

export default CalendarViz;

const exampleData = [
    {
        value: 371,
        day: "2015-06-16",
    },
    {
        value: 49,
        day: "2017-10-17",
    },
    {
        value: 63,
        day: "2018-07-22",
    },
    {
        value: 276,
        day: "2016-10-14",
    },
    {
        value: 40,
        day: "2018-02-02",
    },
    {
        value: 200,
        day: "2016-03-30",
    },
    {
        value: 311,
        day: "2018-03-06",
    },
    {
        value: 218,
        day: "2017-03-20",
    },
    {
        value: 157,
        day: "2016-07-20",
    },
    {
        value: 367,
        day: "2015-06-25",
    },
    {
        value: 312,
        day: "2016-07-15",
    },
    {
        value: 365,
        day: "2018-07-26",
    },
    {
        value: 254,
        day: "2015-09-16",
    },
    {
        value: 302,
        day: "2015-10-21",
    },
    {
        value: 304,
        day: "2018-01-07",
    },
    {
        value: 203,
        day: "2018-04-01",
    },
    {
        value: 69,
        day: "2018-02-08",
    },
    {
        value: 151,
        day: "2016-07-13",
    },
    {
        value: 149,
        day: "2016-08-29",
    },
    {
        value: 0,
        day: "2017-08-07",
    },
];
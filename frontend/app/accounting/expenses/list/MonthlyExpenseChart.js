import React from "react";

// CREDIT: code from mhttps://nivo.rocks/bar/

// install (please try to align the version of installed @nivo packages)
// yarn add @nivo/bar
import { ResponsiveBar } from "@nivo/bar";

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.

/*
    Calculates positions of N evenly spaced y-axis gridlines 
    (where N = the 'number' parameter) 
    that will contain all the values in the 'data' array
// */
// const calculateGridYValues2 = (data, number=3) => {
//     // Get the largest expense in the data array
//     const maxExpense = Math.max(...data.map(e => e.expense));
//     // Credit: https://stackoverflow.com/a/61639610
//     const digits = maxExpense.toString().length;
//     Math.ceil(Math.)

//     const orderOfMagnitude = +parseFloat(maxExpense).toPrecision(1);
//     const maxValue = Math.ceil(maxExpense / orderOfMagnitude);
//     // For each value in (1,2,3), multiply max value by value x (maxValue / 3)
//     const values = [];
//     for (let i = 0; i < number; i++) {
//         values.push(Math.ceil(maxValue / number * i) * orderOfMagnitude);
//     }
//     return values;
// }

const Title = () => <span>Testing title</span>

const truncateLabelValue = ({ formattedValue }) => {
    const maxChars = 8;
    // Truncate text if too long
    if (formattedValue.length > maxChars) {
        // return value.slice(0, maxChars) + ('.'.repeat(value.length - maxChars))
        return formattedValue.slice(0, maxChars - 1) + '…';
    } else {
        return formattedValue;
    }
}

const MonthlyExpenseChart = ({ data, keys, indexBy, valueFormat=">-$0,~" }) => {
    console.log(`Key and indexBy passed: ${keys} ${indexBy}`);

    return <ResponsiveBar
        // data={exampleData}
        // keys={["hot dog", "burger", "sandwich", "kebab", "fries", "donut"]}
        // indexBy="country"
        // data={exampleExpenseData}
        data={data}
        // keys={["expense"]}
        keys={keys}
        indexBy={indexBy}
        // indexBy="month"
        margin={{ top: 50, right: 20, bottom: 50, left: 20 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        valueFormat={valueFormat}
        colors={{ scheme: "paired" }}
        enableGridY={false}
        // gridYValues={[0, 1000, 3000, 4400]}
        // tickCount={3}
        label={truncateLabelValue}
        defs={[
            {
                id: "dots",
                type: "patternDots",
                background: "inherit",
                color: "#38bcb2",
                size: 4,
                padding: 1,
                stagger: true,
            },
            {
                id: "lines",
                type: "patternLines",
                background: "inherit",
                color: "#eed312",
                rotation: -45,
                lineWidth: 6,
                spacing: 10,
            },
        ]}
        fill={[
            {
                match: {
                    id: "fries",
                },
                id: "dots",
            },
            {
                match: {
                    id: "sandwich",
                },
                id: "lines",
            },
        ]}
        borderColor={{
            from: "color",
            modifiers: [["darker", 1.6]],
        }}
        axisTop={null}
        axisRight={null}
        tickValues={[0, 500, 1000]}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Month",
            legendPosition: "middle",
            legendOffset: 32,
            truncateTickAt: 0,
        }}
        axisLeft={null}
        // axisLeft={{
        //     tickSize: 5,
        //     tickPadding: 5,
        //     tickRotationa: 0,
        //     legend: "Total expenses",
        //     legendPosition: "middle",
        //     legendOffset: -40,
        //     truncateTickAt: 0,
        //     format: () => ""
        // }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
            from: "color",
            modifiers: [["darker", 1.6]],
        }}
        // legends={[
        //     {
        //         dataFrom: "keys",
        //         anchor: "bottom-right",
        //         direction: "column",
        //         justify: false,
        //         translateX: 120,
        //         translateY: 0,
        //         itemsSpacing: 2,
        //         itemWidth: 100,
        //         itemHeight: 20,
        //         itemDirection: "left-to-right",
        //         itemOpacity: 0.85,
        //         symbolSize: 20,
        //         effects: [
        //             {
        //                 on: "hover",
        //                 style: {
        //                     itemOpacity: 1,
        //                 },
        //             },
        //         ],
        //     },
        // ]}
        role="application"
        ariaLabel="Nivo bar chart demo"
        barAriaLabel={(e) =>
            e.id + ": " + e.formattedValue + " in country: " + e.indexValue
        }
    />
};

const exampleData = [
    {
        country: "AD",
        "hot dog": 183,
        "hot dogColor": "hsl(11, 70%, 50%)",
        burger: 199,
        burgerColor: "hsl(232, 70%, 50%)",
        sandwich: 83,
        sandwichColor: "hsl(99, 70%, 50%)",
        kebab: 128,
        kebabColor: "hsl(182, 70%, 50%)",
        fries: 164,
        friesColor: "hsl(308, 70%, 50%)",
        donut: 93,
        donutColor: "hsl(47, 70%, 50%)",
    },
    {
        country: "AE",
        "hot dog": 75,
        "hot dogColor": "hsl(319, 70%, 50%)",
        burger: 59,
        burgerColor: "hsl(144, 70%, 50%)",
        sandwich: 7,
        sandwichColor: "hsl(283, 70%, 50%)",
        kebab: 170,
        kebabColor: "hsl(88, 70%, 50%)",
        fries: 121,
        friesColor: "hsl(309, 70%, 50%)",
        donut: 151,
        donutColor: "hsl(297, 70%, 50%)",
    },
    {
        country: "AF",
        "hot dog": 122,
        "hot dogColor": "hsl(59, 70%, 50%)",
        burger: 7,
        burgerColor: "hsl(303, 70%, 50%)",
        sandwich: 77,
        sandwichColor: "hsl(104, 70%, 50%)",
        kebab: 84,
        kebabColor: "hsl(354, 70%, 50%)",
        fries: 200,
        friesColor: "hsl(224, 70%, 50%)",
        donut: 42,
        donutColor: "hsl(44, 70%, 50%)",
    },
];

// const exampleExpenseData = [
//     {category: "January", value: 2000},
//     {category: "February", value: 1550},
// ];

const exampleExpenseData = [
    {month: 'January', expense: 2000},
    {month: 'February', expense: 1550},
    {month: 'March', expense:4400}
]

export default MonthlyExpenseChart;

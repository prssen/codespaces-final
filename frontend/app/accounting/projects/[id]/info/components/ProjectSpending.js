import * as React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";

const ProjectSpending = ({ ...props }) => {
    // TODO: find out why this isn't working
    // Spaces pie chart labels away from the pie chart - Material UI doesn't seem to provide
    // an API to change the position of pie chart labels directly
    // React.useEffect(() => {
    //     window.onload = function () {
    //         // Get pie chart legend
    //         const pieChartLegend = document.getElementsByClassName(
    //             "MuiChartsLegend-root"
    //         )[0];
    //         const svg = pieChartLegend.parentNode;

    //         // // Insert <svg> element as the legend's parent
    //         // const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    //         // pieChartLegend.parentNode.replaceChild(svg, pieChartLegend);

    //         // Move the legend element to the left hand side of the pie chart container
    //         pieChartLegend.setAttribute(
    //             "transform",
    //             `translate(${svg.clientWidth - pieChartLegend.clientWidth}, 0)`
    //         );
    //     };

    //     return () => {
    //         window.onload = null;
    //     };
    // }, []);
    console.log("ProjectSpending component data: ", props.data);
    const spendingData = props.data.expense_breakdown.map((e, idx) => {
        return {
            id: idx,
            value: e.total,
            label: e.source_doc__expense__expense_type,
        };
    });
    console.log("Pie chart data: ", spendingData);

    const spendingBreakdown = [
        {
            // data: [
            //     { id: 0, value: 20, label: "wages" },
            //     { id: 0, value: 40, label: "overheads" },
            //     { id: 0, value: 40, label: "food and drink" },
            // ],
            data: spendingData,
            innerRadius: 50,
            outerRadius: 70,
            highlightScope: { faded: "global", highlighted: "item" },
            faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
        },
    ];

    return (
        // <Paper 
        //     sx={{ 
        //         p: 2,
        //         display: 'flex',
        //         justifyContent: 'center',
        //     }} {...props}>
        //     <Typography variant="h5">Project spending</Typography>
            <Box {...props}>
                <PieChart
                    series={spendingBreakdown}
                    // innerRadius={70}
                    // outerRadius={100}
                    paddingAngle={2}
                    cornerRadius={3}
                    width={370}
                    // width="80%"
                    height={175}

                />
            </Box>
        // </Paper>
    );
};

export default ProjectSpending;
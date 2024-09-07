import React from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
// import BasicBreadcrumbs from '../../Breadcrumb';
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import SpeedDial from "@mui/material/SpeedDial";
import Paper from "@mui/material/Paper";
import { PieChart } from "@mui/x-charts/PieChart";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";

import BasicTable from "@/components/basicTable";

const ProjectImpactTab = ({ value, index, ...props }) => {
    const impactData = [
        {
            id: 1,
            service: "Education",
            indicator: "attendance rate",
            unit: "%",
            baseline: "50",
            target: "80",
            actual: "60",
        },
        {
            id: 2,
            service: "Education",
            indicator: "literacy rate",
            unit: "%",
            baseline: "60",
            target: "90",
            actual: "70",
        },
        {
            id: 3,
            service: "Health",
            indicator: "vaccination rate",
            unit: "%",
            baseline: "70",
            target: "90",
            actual: "80",
        },
        {
            id: 4,
            service: "Health",
            indicator: "mortality rate",
            unit: "%",
            baseline: "5",
            target: "3",
            actual: "4",
        },
    ];

    const impactHeaders = [
        { id: 1, name: "service" },
        { id: 2, name: "indicator" },
        { id: 3, name: "unit" },
        { id: 4, name: "baseline" },
        { id: 5, name: "target" },
        { id: 6, name: "actual" },
    ];

    // Create empty rows to indicate row grouping
    const transformData = (data) =>
        // {
        // Go through each row - if service value is same as previous row, set service value to null;
        // if service and indicator are both the same, set indicator to null as well

        // const transformedData =
        data.map((item, i) => {
            const previousService = i > 0 ? data[i - 1].service : null;
            const previousIndicator = i > 0 ? data[i - 1].indicator : null;

            if (item.service === previousService) item.service = null;
            if (
                item.service === previousService &&
                item.indicator === previousIndicator
            )
                item.indicator = null;

            return item;
        });

    // return transformedData;
    // }
    return (
        <>
            {value === index && (
                <Box sx={{ width: "100%" }}>
                    <Container>
                        <Grid container spacing={2}>
                            <Grid item xs={9}>
                                <Paper sx={{ p: 2, elevation: 2 }}>
                                    <BasicTable
                                        data={transformData(impactData)}
                                        headers={impactHeaders}
                                        notJournals
                                    />
                                </Paper>
                            </Grid>
                            <Grid item xs={3}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 3,
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                    >
                                        New Service
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                    >
                                        New Indicator
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                    >
                                        New Activity
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>
            )}
        </>
    );
};

export default ProjectImpactTab;

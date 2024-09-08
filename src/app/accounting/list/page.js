"use client"

import React, { useState, useEffect, Suspense } from 'react';
import { Container, Box, Typography, Button, Tabs, Tab, Popover } from '@mui/material';
// import BasicBreadcrumbs from '../../Breadcrumb';
import BasicBreadcrumbs from '@/components/Breadcrumb';
import { grey } from '@mui/material/colors';
import ListViewTable from './ListViewTable';
import SearchBar from '@/components/SearchBar';
import StyledPopover from '@/components/StyledPopover';
import MonthlyExpenseChart from '../expenses/list/MonthlyExpenseChart';
import Fuse from 'fuse.js'

import { BiChevronDown, BiPlus } from 'react-icons/bi';
import { BsSortAlphaDown, BsSortAlphaUpAlt, BsSortDown, BsSortUpAlt, BsSortNumericDown, BsSortNumericUpAlt } from "react-icons/bs";

import { dateDiff, objectMean, objectSum } from '@/lib/utils/utils';

import variables from "@/styles/themeVariables"
import DataCard from '@/components/accounting/projects/DataCard';
import Loading from '@/components/Loading';
import ListHeader from './ListHeader';
import ListSummaryCards from './ListSummaryCards';
import ListSummaryChart from './ListSummaryChart';
import ListSummaryControls from './ListSummaryControls';
// import "./pageStyles.module.css";


// Accessibility props for <Tab> components. Credit: https://mui.com/material-ui/react-tabs/#introduction 
function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }


// const SortPopoverList = () => {
//     return ()
// }

// Credit: UI design inspired by: https://dribbble.com/shots/23721903-Arto-Plus-Manage-All-Products-in-SaaS-Financial-Management

const ListViewPage = ({
    rows,
    columns,
    headerData,
    summaryChartData,
    summaryCardData,
    ...props
}) => {
    /*

    Component plan:
    - Top bar => title, options
    - Main area (shaded background)
        => Summary viz (no calcs, hook in parent to calculate figures)
        => Table (as above)
            => Tabs (above/within main area)
            => Buttongroup for filters + sort by dropdown
            => Search bar
            => Main table

    */

    // use hooks to process data for table
    
    // Create sorting criteria from column names + 'asc' or 'desc'
    // const createSortCriteria = (cols) => {
    //     // cols are [{ field: 'colName'}] - sort criteria are colName;asc

    //     // Also need the sort labels - 'headerName - [Ascending]'
    //     // Popover will render the headerName - [Ascending] + icon'
    //     return cols.slice(0, 3).map(e => )
    // }
    // const styles = {
    //     buttonGroup: {
    //         display: 'inline-flex', 
    //         flexDirection: 'row', 
    //         justifyContent: 'center',
    //         alignItems: 'center',
    //         backgroundColor: 'rgb(243, 243, 243)',
    //         borderRadius: 8,
    //         padding: "4px 4px",
    //     },
    //     button: {
    //         borderRadius: 2, 
    //         backgroundColor: 'white',
    //         // fontWeight: 'bold',
    //         textTransform: 'none',
    //         backgroundColor: 'transparent',
    //         // color: '#071018',
    //         color: grey[600]
    //     },
    //     active: {
    //         backgroundColor: 'white',
    //         fontWeight: 'bold',
    //         color: grey[800],
    //         transition: 'background-color 0.3s ease-in-out'
    //     }
    // }

    const _rows = [
        { id: 1, col1: 'Hello', col2: 'World' },
        { id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
        { id: 3, col1: 'MUI', col2: 'is Amazing' },
    ];

    // const columns = [
    //     // { field: 'col1', headerName: 'Column 1', width: 150 },
    //     { field: 'col1', headerName: 'Column 1', flex: 1, headerClassName: 'column-header' },
    //     // { field: 'col2', headerName: 'Column 2', width: 150 },
    //     { field: 'col2', headerName: 'Column 2', flex: 1 },
    // ];

    // const [rows, setRows] = useState(_rows);
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortModel, setSortModel] = useState([]);

    // const headerData = {
    //     title: 'Expenses',
    //     // TODO: move this to layout page
    //     breadcrumbs: ['Home', 'Expenses'],
    //     buttonText: 'New expense'
    // };

    // // TODO: get these from API
    // const summaryChartData = {
    //     chartTitle: 'Expense breakdown',
    //     data: [
    //         {month: 10, expenses: 371.20 },
    //         {month: 4, expenses: 356.4300},
    //         {month: 11, expenses: 1737.7600 }
    //     ]
    // };

    // const ratioData = [
    //     {month: 10, ratio: 1.43},
    //     {month: 11, ratio: 0.83},
    //     {month: 3, ratio: 0.45}
    // ];

    // const chartSorted = summaryChartData.data.sort((a, b) => a.month - b.month);
    // const ratioSorted = ratioData.sort((a, b) => a.month - b.month);

    // const summaryCardData = [
    //     // { title: '£12,423', subtitle: 'Expenses this year', period: 'year', sparklineData: [3, 5, 1, 1.3, 8] },
    //     { 
    //         // title: `£${summaryChartData.data.reduce((acc, curr) => acc += curr.expenses, 0)}`, 
    //         title: `£${Math.round(objectSum(chartSorted, 'expenses'), 0)}`,
    //         subtitle: 'Expenses this year', 
    //         period: 'year', 
    //         xAxis: chartSorted.map(e => e.month),
    //         yAxis: chartSorted.map(e => e.expenses),
    //         // Increases are a good thing for good indicators, and v. versa
    //         goodIndicator: false,
    //     },
    //     // { title: '52%', subtitle: 'Expenses as % of donations', period: 'year', sparklineData: [3, 5, 1, 1.3, 8] },
    //     { 
    //         title: `${Math.round(objectMean(ratioSorted, 'ratio') * 100, 0)}%`,
    //         subtitle: 'Expenses as % of donations',
    //         period: 'year', 
    //         xAxis: ratioSorted.map(e => e.month),
    //         yAxis: ratioSorted.map(e => e.ratio),
    //         goodIndicator: false,
    //     },
    // ];


    // const handleClose = () => {
    //   setAnchorEl(null);
    // };

    // const open = Boolean(anchorEl);
    // const id = open ? 'simple-popover' : undefined;

    return (
        <Suspense fallback={<Loading open={true} />}>
            <Box 
                sx={{
                    display: 'flex', 
                    flexDirection: 'column', 
                    // height: '100vh',
                    height: '100%',
                    // backgroundImage: url(/public/images/final_wave.svg)',
                }}
            >    
                {/* {header} */}    
                <ListHeader {...headerData} />
                <Box sx={{
                    // backgroundColor: 'rgb(247, 250, 255)',

                    // backgroundColor: 'rgb(246, 247, 249)',
                    flexGrow: 1,
                    py: 6,
                    // ml: -2,
                }}>
                    <ListSummaryCards cardData={summaryCardData} />
                    <ListSummaryChart 
                        chartData={summaryChartData}
                    />
                    <ListSummaryControls 
                        rows={rows}
                        setSelectedRows={setSelectedRows}
                        sortModel={sortModel}
                        setSortModel={setSortModel}
                    />
                    <Box 
                        sx={{
                            ml: 2, 
                            // border: 2, 
                            // borderColor: 'blue',
                            padding: 3, 
                            }}>
                        {/* <Typography>{JSON.stringify(sortModel)}</Typography> */}
                        {selectedRows && columns && sortModel && setSortModel && <ListViewTable
                            rows={selectedRows}
                            columns={columns}
                            sortModel={sortModel}
                            setSortModel={setSortModel}
                        />}
                    </Box>
                </Box>
            </Box>
        </Suspense>
    );
};

export default ListViewPage;
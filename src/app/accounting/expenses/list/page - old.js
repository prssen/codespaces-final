"use client";

import TableRow from "@mui/material/TableRow";
import TableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import Table from "@mui/material/Table";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import BasicTable from "@/components/basicTable";
import { useState, useEffect } from "react";
import axios from "axios";
import {
    Avatar,
    Experimental_CssVarsProvider,
    Paper,
    TextField,
} from "@mui/material";
import dayjs from "dayjs";

import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import * as React from "react";
import Toolbar from "@mui/material/Toolbar";
import { styled } from "@mui/material/styles";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";
import AssignmentIcon from "@mui/icons-material/Assignment";

import {
    useQuery,
    useQueryClient,
    QueryClient,
    QueryClientProvider,
} from "react-query";

import SearchBar from "@/components/searchBar - DELETE";

function useExpenses() {
    return useQuery("expenses", async () => {
        const { data } = await axios.get(
            // "https://jsonplaceholder.typicode.com/posts"
            "http://localhost:8000/api/v1/expenses/"
        );
        return data;
    });
}

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
    "& .MuiDrawer-paper": {
        position: "relative",
        // whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
}));

const ListExpenses = () => {
    // const [data, setData] = useState();

    // useEffect(() => {
    //     axios
    //       .get("https://jsonplaceholder.typicode.com/users")
    //       .then((res) => {
    //         setData(res.data);
    //         console.log("Result:", data);
    //       })
    //       .catch((error) => {
    //         console.log(error);
    //       });
    //   }, []);

    const { status, data, error, isFetching } = useExpenses();

    if (isFetching) return "Loading...";
    if (error) return "An error has occurred: " + error.message;
    if (status !== "success") return "Still not working";

    const expenses = data.map((e) => {
        let newExp = {};
        newExp.date = dayjs(e.transaction[0].source_doc.date).format(
            "DD/MM/YYYY"
        );
        newExp.supplier = e.supplier;
        newExp.expenseAccount = e.transaction[0].entries.filter(
            (i) => i.direction === 1
        )[0].account;
        newExp.amount = parseFloat(
            e.transaction[0].entries.filter((i) => i.direction === 1)[0].amount
        ).toFixed(2);
        return newExp;
    });

    const headers = [
        { id: 1, name: "date" },
        { id: 1, name: "expenseAccount" },
        { id: 1, name: "supplier", alignRight: true },
        { id: 1, name: "amount", alignRight: true },
    ];
    const testData = [
        {
            id: 1,
            date: "01/24/2004",
            expenseAccount: "Heating - Gas",
            supplier: "British Gas",
            amount: 1700.0,
        },
        {
            id: 1,
            date: "02/04/2023",
            expenseAccount: "Stationery",
            supplier: "Rymans",
            amount: 25.5,
        },
    ];

    return (
        <>
            <Container>
                {/* <AppBar position="absolute" open={open}> */}
                <AppBar>
                    <Toolbar
                        sx={{
                            pr: "24px", // keep right padding when drawer closed
                        }}
                    >
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            sx={{
                                marginRight: "36px",
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{ flexGrow: 1 }}
                        >
                            DonateTrack
                        </Typography>
                        <IconButton color="inherit">
                            <Badge badgeContent={4} color="secondary">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "stretch",
                        flexDirection: "row",
                    }}
                >
                    <Drawer variant="permanent">
                        <Toolbar>
                            <IconButton>
                                <ChevronLeftIcon />
                            </IconButton>
                        </Toolbar>
                        <Divider />
                        <List component="nav">
                            <ListItemButton>
                                <ListItemIcon>
                                    <ShoppingCartIcon />
                                </ListItemIcon>
                                <ListItemText primary="Donate" />
                            </ListItemButton>

                            <ListItemButton>
                                <ListItemIcon>
                                    <BarChartIcon />
                                </ListItemIcon>
                                <ListItemText primary="Track" />
                            </ListItemButton>
                            <Divider sx={{ my: 1 }} />
                            <ListSubheader component="div" inset>
                                Saved reports
                            </ListSubheader>
                            <ListItemButton>
                                <ListItemIcon>
                                    <AssignmentIcon />
                                </ListItemIcon>
                                <ListItemText primary="Current month" />
                            </ListItemButton>
                        </List>
                    </Drawer>
                    <Box>
                        <Box
                            sx={{
                                marginTop: 10,
                                marginLeft: 2,
                                marginBottom: 4,
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <Typography variant="h5">Expenses</Typography>
                            <Box>
                                <Button variant="outlined">
                                    <AddIcon />
                                    New Expense
                                </Button>
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-around",
                                marginBottom: 4,
                            }}
                        >
                            <Paper
                                sx={{
                                    p: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Typography variant="h4" component="h6">
                                    {`£${parseFloat(
                                        expenses
                                            .map((i) => i.amount)
                                            .reduce((a, b) => a + b)
                                    ).toFixed(2)}`}
                                </Typography>
                                <Typography>Expenses this month</Typography>
                            </Paper>
                            <Paper
                                sx={{
                                    p: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Typography variant="h4" component="body1">
                                    {`£${parseFloat(
                                        expenses
                                            .map((i) => i.amount)
                                            .reduce((a, b) => a + b)
                                    ).toFixed(2)}`}
                                </Typography>
                                <Typography>Expenses this year</Typography>
                            </Paper>
                        </Box>
                        <BasicTable data={expenses} headers={headers} />
                    </Box>
                </Box>
                {/* <Paper>
                <Typography variant='subtitle2' component='body2'>All donors (72)</Typography>
                <Box sx={{display: 'flex', flexDirection: 'row'}}>
                    <Typography>Search for donor</Typography>
                    <SearchBar 
                        placeholder='Search here...'
                    />
                </Box>
                <Paper variant='outlined' padding={2}>
                <Avatar
                    alt="Remy Sharp"
                    src="/static/images/avatar/1.jpg"
                    sx={{ width: 24, height: 24 }}
                />
                <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Box>
                        <Typography>John Smith</Typography>
                        <Typography>42 years old</Typography>
                    </Box>
                    <Box  sx={{display: 'flex', flexDirection: 'row'}}>
                        <Typography>Unqualified</Typography>
                        <Typography>£52.00</Typography>
                    </Box>
                </Box>
                </Paper>
            </Paper> */}
            </Container>

            {/* <Table>
            <TableHead>
                <TableRow>
                    <TableCell>
                        TODO: add checkbox, which selects expenses
                    </TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Expense account</TableCell>
                    <TableCell align='right'>Supplier</TableCell>
                    <TableCell align='right'>Amount</TableCell>
                </TableRow>
            </TableHead>
        </Table> */}
        </>
    );
};

export default ListExpenses;

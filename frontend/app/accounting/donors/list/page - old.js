import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import BasicTable from "@/components/basicTable";
import axios from "axios";
import Avatar from "@mui/material/Avatar";
import { Stack, AppBar, Drawer } from "@mui/material";

import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
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

// TODO: make these separate components
import { DonorList, DonorSummary, DonorTitle } from "./fetchDonorList";

// TODO: re-enable if not working
/*
import {
    useQuery,
    useQueryClient,
    QueryClient,
    QueryClientProvider,
} from "react-query";

function useDonors() {
    return useQuery("donors", async () => {
        const { data } = await axios.get(
            // "https://jsonplaceholder.typicode.com/posts"
            "http://localhost:8000/api/v1/donors/"
        );
        return data;
    });
}

// Credit: https://stackoverflow.com/a/50827764
const getAge = (birthDate) =>
    Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e10);

const drawerWidth = 240;
*/

// const AppBar = styled(MuiAppBar, {
//     shouldForwardProp: (prop) => prop !== "open",
// })(({ theme, open }) => ({
//     zIndex: theme.zIndex.drawer + 1,
//     transition: theme.transitions.create(["width", "margin"], {
//         easing: theme.transitions.easing.sharp,
//         duration: theme.transitions.duration.leavingScreen,
//     }),
//     ...(open && {
//         marginLeft: drawerWidth,
//         width: `calc(100% - ${drawerWidth}px)`,
//         transition: theme.transitions.create(["width", "margin"], {
//             easing: theme.transitions.easing.sharp,
//             duration: theme.transitions.duration.enteringScreen,
//         }),
//     }),
// }));

// const Drawer = styled(MuiDrawer, {
//     shouldForwardProp: (prop) => prop !== "open",
// })(({ theme, open }) => ({
//     "& .MuiDrawer-paper": {
//         position: "relative",
//         // whiteSpace: 'nowrap',
//         width: drawerWidth,
//         transition: theme.transitions.create("width", {
//             easing: theme.transitions.easing.sharp,
//             duration: theme.transitions.duration.enteringScreen,
//         }),
//     },
// }));

const ListDonors = () => {
    // const donors = [
    //     {id: 1, name: 'John Smith', age: '42 years old', givingStatus: 'unqualified', amountDonated: '£42.00'}
    // ];

    // TODO: re-enable if not working
    /*
    const givingStages = {
        U: "Unqualified",
        Q: "Qualified",
        C: "Cultivated",
        S: "Solicited",
        SS: "Stewarded",
    };

    const { status, data, error, isFetching } = useDonors();

    if (isFetching) return "Loading...";

    if (error) return "An error has occurred: " + error.message;

    if (status !== "success") return "Still not working";

    // Convert birthdate string into age
    const donors = data.map((e) => {
        e.age = `${getAge(e.birthdate)} years old`;
        e.givingStage = givingStages[e.giving_stage];
        // e.amount = `£${parseFloat(e.amount).toFixed(2)}`
        return e;
    });
    */

    return (
        <>
            <Container>
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
                            AccountTrack
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
                                <ListItemText primary="Donations" />
                            </ListItemButton>
                            <ListItemButton>
                                <ListItemIcon>
                                    <AssignmentIcon />
                                </ListItemIcon>
                                <ListItemText primary="Donors" />
                            </ListItemButton>

                            <ListItemButton>
                                <ListItemIcon>
                                    <BarChartIcon />
                                </ListItemIcon>
                                <ListItemText primary="Expenses" />
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
                        <Typography
                            variant="h3"
                            component="h5"
                            gutterBottom
                            mt={12}
                            ml={4}
                        >
                            Donors
                        </Typography>

                        {/* <Box sx={{
                    marginTop: 4, 
                    marginBottom:4,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}>
                    <Typography variant='h5'>Expenses</Typography>
                    <Box>
                        <Button variant='outlined'><AddIcon />New Expense</Button>
                    </Box>
                </Box>
                <Paper sx={{marginBottom: 2}}>
                    <Typography variant='subtitle2' component='body2'>All donors (72)</Typography>
                    <Box sx={{display: 'flex', flexDirection: 'row'}}>
                        <Typography>Search for donor</Typography>
                        <SearchBar 
                            placeholder='Search here...'
                        />
                    </Box>
                </Paper> */}

                        <Grid container spacing={4} mt={8} ml={2}>
                            <Grid item xs={10}>
                                <DonorSummary />
                            </Grid>
                            <Grid item xs={9}>
                                <DonorTitle />
                                {/* <Paper variant='outlined' padding={2}>
                                    <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between'}}>
                                        <Typography>Search for donor</Typography>
                                        <SearchBar
                                            placeholder='Search here...'
                                        />
                                    </Box>
                                </Paper> */}
                                <DonorList />
                            </Grid>
                            <Grid item xs={3}>
                                <Stack direction="row" spacing={2}></Stack>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </>
    );
};

export default ListDonors;

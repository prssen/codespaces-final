"use client"
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import * as React from "react";
import TableRow from "@mui/material/TableRow";
import TableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import Table from "@mui/material/Table";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
// import BasicTable from "./BasicTable";
import { useState, useEffect } from "react";
// import axios from "axios";
// import SearchBar from "./SearchBar";
import Avatar from "@mui/material/Avatar";
import { Stack, Snackbar } from "@mui/material";
import { grey } from "@mui/material/colors";
import { Divider, ButtonBase } from "@mui/material";
// import Loading from "./dev_code/Components/Loading";
import Loading from "@/components/Loading";
// import { useGetDonation } from "./dev_code/Hooks/useApi";
import { useGetDonation } from "@/lib/hooks/useApi";
// import { formatCurrency } from "./utils";
import { formatCurrency } from "@/lib/utils/utils";
import dayjs from 'dayjs';
import {
    BarChart,
    BarChartOutlined,
    PieChart,
    ShowChartOutlined,
} from "@mui/icons-material";
import Link from "@/components/NextLink"
// import { useNavigate, Link, useSearchParams } from "react-router-dom";

// import BlockchainContext from "./App";
// import readAssets from "./blockchain";

const ListPaper = React.forwardRef((ref, { children, ...props }) => 
    <Paper variant="outlined" ref={ref} sx={{backgroundColor: 'grey'}} padding={2} {...props}>{children}</Paper>);

const DonationHistory = () => {
    // let { gateway, network, contract } = React.useContext(BlockchainContext);
    // let [blockchainData, setBlockchainData] = React.useState(null);

    // React.useEffect(() => {
    //     setBlockchainData(readAssets(contract));
    // }, []);

    // debugger;
    // const [searchParams, useSearchParams] = useSearchParams();

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    // const navigate = useNavigate();

    const { data: donations, isLoading, isError, error } = useGetDonation();
    
    // const donations = [
    //     {
    //         id: 1,
    //         date: "01/01/24",
    //         appeal: "Nepal Emergency Relief",
    //         charity: "Oxfam",
    //         amount: "£20.00",
    //     },
    // ];

    if (isLoading) {
        return <Loading />
    }

    if (isError) {
        return "Error loading page: please try later"
    }
    console.log('Donation history data:', donations);
    const total = donations.reduce((sum, e) => parseFloat(e.amount) + sum, 0);
    console.log('Donation history total: ', total);

    return (
        <>
            <Container>
                {/* {searchParams && searchParams.get('status') === 'success' && 
                    <Snackbar 
                        vertical='bottom' 
                        horizontal='left' 
                        open={snackbarOpen} 
                        message='Donation made successfully'
                        onClose={() => setSnackbarOpen(false)}
                    />} */}
                {/* <Typography variant='h3' component='h5' gutterBottom>Track Donations</Typography> */}
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Track your donations
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

                <Grid container spacing={4}>
                    <Grid item xs={10}>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-around",
                                my: 2,
                            }}
                        >
                            <Paper
                                sx={{
                                    p: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    minWidth: 150,
                                }}
                            >
                                <BarChart
                                    sx={{
                                        width: 45,
                                        height: 45,
                                        // color: grey[500],
                                    }}
                                />
                                {/* <Typography variant="h4" component="body1"> */}
                                {/* <Typography variant="h6">£150.00</Typography> */}
                                <Typography variant="h6">£{formatCurrency(total)}</Typography>
                                {/* <Typography>Total Donations</Typography> */}
                                <Typography
                                    variant="subtitle1"
                                    color={grey[500]}
                                >
                                    Total Donations
                                </Typography>
                            </Paper>
                            <Paper
                                sx={{
                                    p: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    minWidth: 150,
                                }}
                            >
                                <PieChart
                                    sx={{
                                        width: 45,
                                        height: 45,
                                    }}
                                />
                                {/* <Typography variant="h6">£120.00</Typography> */}
                                <Typography variant="h6">£{formatCurrency(total * 0.4)}</Typography>
                                <Typography
                                    variant="subtitle1"
                                    color={grey[500]}
                                >
                                    Spent so far
                                </Typography>
                                {/* <Typography variant="h4" component="body1">
                                    £120.00
                                </Typography>
                                <Typography>Spent</Typography> */}
                            </Paper>
                        </Box>
                    </Grid>
                    <Grid item xs={9}>
                        {/* <Typography variant="h4" mb={3}> */}

                        <Typography
                            variant="subtitle1"
                            color={grey[400]}
                            sx={{ textTransform: "uppercase", mb: 1 }}
                        >
                            Donation history
                        </Typography>
                        {/* <Divider
                            variant="middle"
                            sx={{
                                opacity: 0.6,
                                width: "95%",
                                mx: "auto",
                                mt: 1,
                                mb: 3,
                            }}
                        /> */}
                        {donations.map((donation) => (
                            // <ButtonBase component={ListPaper} sx={{display: 'flex', width: '90%', flex: 1}} onClick={() => navigate(`/tracker/tracking/${donation.uuid}`)}>
                            <Link 
                                href={`/tracker/donations/${donation.uuid}`}
                                style={{textDecoration:'none'}}
                            >
                            <Paper variant="outlined" padding={2}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            width: '100%',
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: 2,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "row",
                                                alignItems: "center",
                                            }}
                                        >
                                            {/* <Avatar
                                                        alt="Remy Sharp"
                                                        src="/static/images/avatar/1.jpg"
                                                        sx={{ width: 24, height: 24, marginX: 2 }}
                                                    /> */}
                                            <Typography mx={2}>
                                                {dayjs(donation.date).format('ll')}
                                            </Typography>
                                            <Box>
                                                <Typography
                                                    variant="h6"
                                                    component="body2"
                                                >
                                                    {donation.appeal}
                                                </Typography>
                                                <Typography variant="subtitle2">
                                                    {donation.charity_name}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 2,
                                            }}
                                        >
                                            <Typography variant="h5">
                                                £{formatCurrency(donation.amount)}
                                            </Typography>
                                            <Button variant="outlined">
                                                Receipt
                                            </Button>
                                        </Box>
                                    </Box>
                            </Paper>
                            {/* </ButtonBase> */}
                            </Link>
                        ))}
                    </Grid>
                    <Grid item xs={3}>
                        <Stack direction="row" spacing={2}>
                            {/* <Typography variant='h4' mb={3}>Blockchain data</Typography> */}
                            {/* {blockchainData &&
                                    <Typography>{JSON.stringify(blockchainData)}</Typography>
                                } */}
                        </Stack>
                    </Grid>
                </Grid>
                {/* <BasicTable data={data} /> */}
            </Container>
        </>
    );
};

export default DonationHistory;

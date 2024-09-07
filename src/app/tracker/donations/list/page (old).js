import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Stack } from "@mui/material";

// import BlockchainContext from "./App";
// import readAssets from "./blockchain";

const DonationHistory = () => {
    // let { gateway, network, contract } = React.useContext(BlockchainContext);
    // let [blockchainData, setBlockchainData] = React.useState(null);

    // React.useEffect(() => {
    //     setBlockchainData(readAssets(contract));
    // }, []);

    const donations = [
        {
            id: 1,
            date: "01/01/24",
            appeal: "Nepal Emergency Relief",
            charity: "Oxfam",
            amount: "£20.00",
        },
    ];

    return (
        <>
            <Container>
                <Typography variant="h3" component="h5" gutterBottom>
                    Track Donations
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
                                <Typography variant="h4" component="body1">
                                    £150.00
                                </Typography>
                                <Typography>Total Donations</Typography>
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
                                    £120.00
                                </Typography>
                                <Typography>Spent</Typography>
                            </Paper>
                        </Box>
                    </Grid>
                    <Grid item xs={9}>
                        <Typography variant="h4" mb={3}>
                            Donation history
                        </Typography>
                        {donations.map((donation) => (
                            <Paper variant="outlined" padding={2}>
                                <Box
                                    sx={{
                                        display: "flex",
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
                                            {donation.date}
                                        </Typography>
                                        <Box>
                                            <Typography
                                                variant="h6"
                                                component="body2"
                                            >
                                                {donation.appeal}
                                            </Typography>
                                            <Typography variant="subtitle2">
                                                {donation.charity}
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
                                            {donation.amount}
                                        </Typography>
                                        <Button variant="outlined">
                                            Receipt
                                        </Button>
                                    </Box>
                                </Box>
                            </Paper>
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

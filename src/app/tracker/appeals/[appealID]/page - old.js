"use client"

import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

import BasicBreadcrumbs from "@/components/Breadcrumb";

// import AppealPhoto from "@/public/charity-appeal.png";
import AppealPhoto from "public/images/charity-appeal.jpeg";
import AppealCard from "./AppealCard";
import LinearProgress, {
    linearProgressClasses,
} from "@mui/material/LinearProgress";

import axios from "axios";
import { useState } from "react";

// Charity appeal photo by <a href="https://unsplash.com/@kattyukawa?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Katt Yukawa</a> on <a href="https://unsplash.com/photos/person-showing-both-hands-with-make-a-change-note-and-coins-K0E6E0a0R3A?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

// Credit: https://stackoverflow.com/a/72139874
const Img = (props) => <Box component="img" {...props} />;

const AppealPage = () => {
    const breadcrumbs = ["Oxfam GB Ltd", "Emergency Christmas Appeal 2023"];
    const [error, setError] = useState();

    const onSubmit = (e) => {
        // Validate status used to accept 3XX status codes as correct responses (credit https://stackoverflow.com/a/76257051)
        axios
            .post("http://localhost:8000/api/v1/stripe/", {
                validateStatus: (status) => status >= 200 && status < 400,
            })
            .then(function (response) {
                if (response.data.redirect_url) {
                    window.location = response.data.redirect_url;
                }
            })
            .catch(function (error) {
                if (error.response?.status === 303) {
                    // Ignore 303s
                    window.location = error.response.data.redirect_url;
                }
                setError(error);
                // TODO: redirect to this page, with popover at the
                // top stating 'error in processing payment'
            });
    };

    if (error)
        return (
            <>
                <Typography>Error in handling payment.</Typography>
            </>
        );

    return (
        <>
            <Container>
                <BasicBreadcrumbs breadcrumbs={breadcrumbs} />
                <Box mt={2}>
                    <Typography variant="h5">
                        {breadcrumbs.slice(-1)}
                    </Typography>
                    <Typography variant="subtitle1">
                        A charity appeal by {breadcrumbs[0]}
                    </Typography>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={9}>
                        <Grid container spacing={2} my={2}>
                            <Grid item xs={4}>
                                {/* <img
                                    src={AppealPhoto}
                                    sx={{
                                        height: '100%',
                                        width: '100%'
                                    }}
                                    alt="charity appeal"
                                /> */}
                                <Img
                                    src={AppealPhoto}
                                    sx={{
                                        width: "100%",
                                        borderRadius: "5px",
                                    }}
                                    alt="charity appeal"
                                />
                            </Grid>
                            <Grid item xs={8}>
                                <Typography variant="h6">Story</Typography>
                                <Typography variant="body2">
                                    Lorem ipsum dolor sit amet, consectetur
                                    adipiscing elit, sed do eiusmod tempor
                                    incididunt ut labore et dolore magna aliqua.
                                    Ut enim ad minim veniam, quis nostrud
                                    exercitation ullamco laboris nisi ut aliquip
                                    ex ea commodo consequat. Duis aute irure
                                    dolor in reprehenderit in voluptate velit
                                    esse cillum dolore eu fugiat nulla pariatur.
                                    Excepteur sint occaecat cupidatat non
                                    proident, sunt in culpa qui officia deserunt
                                    mollit anim id est laborum.
                                </Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography>Start date: </Typography>
                                <Typography>End date: </Typography>
                            </Grid>
                            <Grid item xs={10}>
                                <Typography>31 Jan 2024</Typography>
                                <Typography>31 May 2024</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={3}>
                        <Paper
                            sx={{ height: "100%", width: "100%" }}
                            elevation={3}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    padding: 3,
                                    flexDirection: "column",
                                    height: "100%",
                                    justifyContent: "space-around",
                                }}
                            >
                                <Button variant="contained" onClick={onSubmit}>
                                    Donate
                                </Button>
                                <Button variant="outlined">Share</Button>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1,
                                    }}
                                >
                                    <Typography
                                        sx={{ alignSelf: "center" }}
                                        variant="subtitle2"
                                    >
                                        £20,000 target
                                    </Typography>
                                    <LinearProgress
                                        sx={{
                                            height: 8,
                                            borderRadius: 5,
                                            [`& .${linearProgressClasses.bar}`]:
                                                {
                                                    borderRadius: 5,
                                                },
                                        }}
                                        variant="determinate"
                                        value={70}
                                    />
                                    <Typography
                                        sx={{ alignSelf: "center" }}
                                        variant="subtitle2"
                                    >
                                        £13,000 raised!
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Divider variant="middle" />
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: "bold", marginTop: 4 }}
                        >
                            Related appeals
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                gap: 5,
                                marginTop: 2,
                                marginBottom: 4,
                            }}
                        >
                            <AppealCard />
                            <AppealCard />
                            <AppealCard />
                            <AppealCard />
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};

export default AppealPage;

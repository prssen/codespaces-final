'use client'

import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import * as React from "react";
import Image from 'next/image';

import { styled } from "@mui/material/styles";
import LinearProgress, {
    linearProgressClasses,
} from "@mui/material/LinearProgress";
import { PieChart } from "@mui/x-charts/PieChart";
// import BasicBreadcrumbs from "../../../components/breadcrumb";
import BasicBreadcrumbs from "@/components/Breadcrumb";

// import mapPhoto from "../../../../public/impact-map.png";
import mapPhoto from "public/impact-map.png";

// Credit: https://mui.com/material-ui/react-progress/#customization
const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor:
            theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5,
        backgroundColor: theme.palette.mode === "light" ? "#1a90ff" : "#308fe8",
    },
}));

const TrackingPage = () => {
    const [progress, setProgress] = React.useState(78);

    const spendingBreakdown = [
        {
            data: [
                { id: 0, value: 20, label: "wages" },
                { id: 0, value: 40, label: "overheads" },
                { id: 0, value: 40, label: "food and drink" },
            ],
        },
    ];

    return (
        <>
            <Container>
                <Grid container spacing={2}>
                    <Grid item xs={9}>
                        <BasicBreadcrumbs breadcrumbs={["Donations", "193B"]} />
                        <Box sx={{ display: "flex", flexDirection: "row" }}>
                            <Typography variant="h3">Donation</Typography>
                            <Typography>&nbsp;</Typography>
                            <Typography color="text.secondary" variant="h3">
                                #193B
                            </Typography>
                        </Box>
                        <Paper sx={{ marginBottom: 2 }}>
                            <Box padding={2}>
                                <Typography variant="h5" paddingY={1}>
                                    Donation info
                                </Typography>
                                <Box>
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: "bold" }}
                                    >
                                        £20.00
                                    </Typography>
                                    <Typography
                                        variant="subtitle1"
                                        display="inline"
                                    >
                                        To:{" "}
                                    </Typography>
                                    <Typography
                                        variant="subtitle1"
                                        color="text.secondary"
                                        display="inline"
                                    >
                                        Oxfam UK
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        display="inline"
                                    >
                                        Date given:{" "}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        display="inline"
                                    >
                                        {new Date().toString()}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                        <Paper>
                            <Box padding={2}>
                                <Typography variant="h5" paddingY={1}>
                                    How your money has been spent
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid
                                        item
                                        xs={6}
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "start",
                                        }}
                                    >
                                        <Typography variant="h6">
                                            Amount spent
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                flex: 1,
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Box sx={{ width: "100%" }}>
                                                <BorderLinearProgress
                                                    variant="determinate"
                                                    value={progress}
                                                />
                                            </Box>
                                            <Box
                                                mt={2}
                                                sx={{
                                                    display: "flex",
                                                    flexDirection: "row",
                                                    justifyContent: "center",
                                                    alignItems: "baseline",
                                                }}
                                            >
                                                <Typography variant="body1">
                                                    £17.00
                                                </Typography>
                                                <Typography>&nbsp;</Typography>
                                                <Typography variant="body2">
                                                    {" "}
                                                    of your
                                                </Typography>
                                                <Typography>&nbsp;</Typography>
                                                <Typography variant="body1">
                                                    £20.00
                                                </Typography>
                                                <Typography>&nbsp;</Typography>
                                                <Typography
                                                    variant="body2"
                                                    style={{
                                                        wordWrap: "break-word",
                                                    }}
                                                >
                                                    {" "}
                                                    donation spent so far
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="h6">
                                            Breakdown of spending
                                        </Typography>
                                        <PieChart
                                            series={spendingBreakdown}
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            cornerRadius={3}
                                            width={375}
                                            height={175}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                        <Grid item xs={6}>
                            <Paper>
                                <Box
                                    padding={2}
                                    sx={{
                                        display: "flex",
                                        width: "100%",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        marginTop: 5,
                                        marginBottom: 5,
                                        width: "100%",
                                        height: "100%",
                                    }}
                                >
                                    <Typography
                                        sx={{ alignSelf: "start" }}
                                        variant="h5"
                                        paddingY={1}
                                    >
                                        Places reached
                                    </Typography>
                                    {/* <img
                                        src={mapPhoto}
                                        style={{
                                            width: "98%",
                                            borderRadius: 5,
                                        }}
                                        alt="impact map"
                                    /> */}
                                    <Image
                                        src={mapPhoto.src}
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        style={{
                                            width: "98%",
                                            borderRadius: 5,
                                            height: 'auto'
                                        }}
                                        alt="impact map"
                                    />
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                    <Grid item xs={3}></Grid>
                </Grid>
            </Container>
        </>
    );
};

export default TrackingPage;

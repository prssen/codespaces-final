"use client";

import {
    useQuery,
    useQueryClient,
    QueryClient,
    QueryClientProvider,
} from "react-query";
import axios from "axios";
import { Box, Paper, Typography, Avatar } from "@mui/material";

/*
    TODO:
        - Refctor: useDonors in a lib/ or services/ folder, each component in separate file
        - Implement server-side rendering, as shown here https://www.youtube.com/watch?v=9kjc6SWxBIA
        - Put the axios call in a Server Action
*/

function useDonors() {
    return useQuery(
        "donors",
        async () => {
            const { data } = await axios.get(
                // "https://jsonplaceholder.typicode.com/posts"
                "http://localhost:8000/api/v1/donors/"
            );
            return data;
        },
        {
            staleTime: 60000,
            // retry: 3,
            // TODO: add 'placehodlerData' for loading
        }
    );
}

// Credit: https://stackoverflow.com/a/50827764
const getAge = (birthDate) =>
    Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e10);

const drawerWidth = 240;

const DonorTitle = () => {
    const { status, data, error, isFetching } = useDonors();

    if (isFetching) return "Loading...";
    if (error) return "An error has occurred: " + error.message;
    if (status !== "success") return "Still not working";

    // Convert birthdate string into age
    const donors = data.map((e) => {
        e.age = `${getAge(e.birthdate)} years old`;
        return e;
    });

    return (
        <>
            <Typography variant="h6" mb={3}>
                All donors ({donors.length})
            </Typography>
        </>
    );
};

const DonorSummary = () => {
    const { status, data, error, isFetching } = useDonors();

    if (isFetching) return "Loading...";
    if (error) return "An error has occurred: " + error.message;
    if (status !== "success") return "Still not working";

    // Convert birthdate string into age
    const donors = data.map((e) => {
        e.age = `${getAge(e.birthdate)} years old`;
        return e;
    });

    return (
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
                    {donors.length}
                </Typography>
                <Typography>Donors</Typography>
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
                        donors.map((i) => i.donated).reduce((a, b) => a + b)
                    ).toFixed(2)}`}
                </Typography>
                <Typography>Donations made</Typography>
            </Paper>
        </Box>
    );
};

const DonorList = () => {
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

    return (
        <>
            {donors.map((donor) => (
                <Paper variant="outlined" padding={2} sx={{ marginBottom: 2 }}>
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
                            <Avatar
                                alt="Remy Sharp"
                                src="/static/images/avatar/1.jpg"
                                sx={{
                                    width: 24,
                                    height: 24,
                                    marginX: 2,
                                }}
                            />
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "baseline",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <Typography
                                    mx={2}
                                >{`${donor.first_name} ${donor.last_name}`}</Typography>
                                <Typography variant="subtitle2">
                                    {donor.age}
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
                            <Typography variant="subtitle1">
                                {String(donor.givingStage)}
                            </Typography>
                            <Typography variant="h5">
                                {`£${parseFloat(donor.donated).toFixed(2)}`}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            ))}
        </>
    );
};

export { DonorList, DonorSummary, DonorTitle };

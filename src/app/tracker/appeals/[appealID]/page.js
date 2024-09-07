"use client"

import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

// import BasicBreadcrumbs from "./Breadcrumb";
import BasicBreadcrumbs from "@/components/Breadcrumb";

// import AppealPhoto from "./assets/charity-appeal.webp";
// import AppealPhoto from "public/images/charity-appeal.webp";
import AppealCard from "./AppealCard";
import LinearProgress, {
    linearProgressClasses,
} from "@mui/material/LinearProgress";

import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { grey } from "@mui/material/colors";
import Image from 'next/image';

// import { useParams } from 'react-router-dom';
import { useParams } from "next/navigation";
// import { useGetAppeals } from "./dev_code/Hooks/useApi";
import { useGetAppeals } from "@/lib/hooks/useApi";
// import Loading from "./dev_code/Components/Loading";
import Loading from "@/components/Loading";
// import { formatCurrency } from "./utils";
import { formatCurrency } from "@/lib/utils/utils";
// import { Context } from "./dev_code/services/context/ContextProvider";
import { Context } from "@/lib/context/ContextProvider";
import dayjs from 'dayjs';

// Charity appeal photo by <a href="https://unsplash.com/@kattyukawa?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Katt Yukawa</a> on <a href="https://unsplash.com/photos/person-showing-both-hands-with-make-a-change-note-and-coins-K0E6E0a0R3A?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

// // Credit: https://stackoverflow.com/a/72139874
const Img = (props) => <Box component="img" {...props} />;
// const Img = (props) => <Box sx={props?.sx}><Image {...props} /></Box>

const AppealPage = () => {
    const { appealID } = useParams();
    // const searchParams = useSearchParams();
    // const uuid = searchParams.get('uuid');

    console.log('UUID: ', appealID);

    const { state, dispatch } = useContext(Context);

    const { data: appeal, isError, isLoading } = useGetAppeals(appealID);
    const [appealData, setAppealData] = useState();
    
    console.log('Appeal data: ', appeal);

    // useEffect(() => {
    //     setAppealData(appeal);
    //     breadcrumbs.length < 3 && breadcrumbs.push(appeal?.title);
    // }, [appeal])

    // const breadcrumbs = ["Appeals", `Appeal ${uuid}`];
    // const breadcrumbs = ["Oxfam GB Ltd", "Emergency Christmas Appeal 2023"];
    const [error, setError] = useState();
    // const userData = JSON.parse(localStorage.getItem("user"));


    // const userData = {
    //     profile_id: "fbcaa322-d255-4435-97e2-771c782bded9",
    //     charity_id: "db8193db-59c5-4e72-b926-13ff065ceddd",
    //     appeal_id: "c0c3cf73-5728-4d50-ba9f-dbf9f7b36439",
    // };
    // console.log("userData: ", userData);


    // TODO: replace hard-coded value with <id> route param extracted
    // from Next.js router
    // userData.appeal_id = window.location.pathname.split(1);
    // userData.profile_id = "f840dbea-6bd7-43a3-b7de-333394bb57b1";
    // userData.charity_id =
    // userData.appeal_id = "c0c3cf73-5728-4d50-ba9f-dbf9f7b36439";

    const onSubmit = (e) => {
        // Require user to log in if not already logged in
        if (!state.loggedIn) {
            return dispatch({ type: "OPEN_LOGIN" });
        }
        
        // Validate status used to accept 3XX status codes as correct responses (credit https://stackoverflow.com/a/76257051)
        axios
            // .post("http://localhost:8000/api/v1/stripe/", userData, {
            .post("http://localhost:8000/api/v1/stripe/", { appeal_id: appeal.uuid, charity_id: appeal.charity_uuid }, {
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
                {JSON.stringify(error)}
            </>
        );

    if (isLoading) {
        return <Loading open={isLoading} />;
    }

    if (isError) {
        return 'Error loading page';
    }

    // const breadcrumbs = ["Appeals", appeal.title];
    const breadcrumbs = [{ label: 'Appeals', url: '/tracker/appeals/list'}, { label: appeal.title, url: `/tracker/appeals/${appeal.uuid}` }];

    const userData = {
        // profile_id: "fbcaa322-d255-4435-97e2-771c782bded9",
        // charity_id: "db8193db-59c5-4e72-b926-13ff065ceddd",
        // appeal_id: "c0c3cf73-5728-4d50-ba9f-dbf9f7b36439",
        appeal_id: appeal.uuid
    }
    
    debugger;
    const progress = Math.max(appeal.actual_donations / appeal.target_donations * 100, 3);

    return (
        <>
            <Container p={2} sx={{ backgroundColor: grey[100] }}>
                <BasicBreadcrumbs breadcrumbs={breadcrumbs} sx={{ marginTop: 2, marginBottom: 2 }}/>
                {/* <Typography variant="h5">{JSON.stringify(appeal)}</Typography> */}
                <Box mt={2}>
                    <Typography variant="h5">
                        {/* {breadcrumbs.slice(-1)} */}
                        {appeal.title}
                    </Typography>
                    {/* <Typography variant="subtitle1">
                        A charity appeal by {breadcrumbs[0]}
                    </Typography> */}
                    <Typography variant="subtitle1">
                        A charity appeal by {appeal.charity_name}
                    </Typography>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={9}>
                        <Grid container spacing={2} my={2}>
                            <Grid item xs={4} sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                {/* <img
                                    src={AppealPhoto}
                                    sx={{
                                        height: '100%',
                                        width: '100%'
                                    }}
                                    alt="charity appeal"
                                /> */}
                                <Img
                                    // src={AppealPhoto}
                                    src={appeal.photos?.[0]?.photo}
                                    sx={{
                                        height: { xs: '70%', sm: '80%', md: '100%' },
                                        objectFit: 'cover',
                                        width: "100%",
                                        borderRadius: "5px",
                                    }}
                                    alt="charity appeal"
                                />
                            </Grid>
                            <Grid item xs={8}>
                                <Typography variant="h6">Story</Typography>
                                <Typography variant="body2">
                                    {appeal.story}
                                </Typography>
                                {/* <Typography variant="body2">
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
                                </Typography> */}
                            </Grid>
                            <Grid item xs={2}>
                                <Typography>Start date: </Typography>
                                <Typography>End date: </Typography>
                            </Grid>
                            <Grid item xs={10}>
                                {/* <Typography>31 Jan 2024</Typography> */}
                                <Typography>{dayjs(appeal?.date_started).format('LL')}</Typography>
                                {/* <Typography>31 May 2024</Typography> */}
                                <Typography>{appeal?.date_ended ? dayjs(appeal.date_ended).format('LL') : 'Ongoing'}</Typography>
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
                                <Button variant="contained" onClick={onSubmit} sx={{ borderRadius: 5}}>
                                    Donate
                                </Button>
                                <Button variant="outlined" sx={{borderRadius: 5}}>Share</Button>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1,
                                    }}
                                >
                                    {/* <Typography
                                        sx={{ alignSelf: "center" }}
                                        variant="subtitle2"
                                    >
                                        £20,000 target
                                    </Typography> */}
                                    <Typography
                                        sx={{ alignSelf: "center" }}
                                        variant="subtitle2"
                                    >
                                        £{formatCurrency(appeal.target_donations)} target
                                    </Typography>
                                    <LinearProgress
                                        sx={{
                                            height: 8,
                                            borderRadius: 5,
                                            [`& .${linearProgressClasses.bar}`]:
                                                {
                                                    borderRadius: 5,
                                                },
                                            // background: 'linear-gradient(to right, #6fcbb6, #9c64f4)',
                                            // background: 'linear-gradient(to right bottom, #430089, #82ffa1)',

                                            // TODO: implement this gold gradient: https://codepen.io/chilliconcode/pen/OWxqYR?editors=0110
                                            // using this code - https://mui.com/material-ui/react-progress/#customization 
                                        }}
                                        // color = {progress && progress > 100 ? 'green' : 'black'}
                                        variant="determinate"
                                        // value={70}
                                        value={Math.min(progress, 100)}
                                    />
                                    {/* <Typography
                                        sx={{ alignSelf: "center" }}
                                        variant="subtitle2"
                                    >
                                        £13,000 raised!
                                    </Typography> */}
                                    <Typography
                                        sx={{ alignSelf: "center" }}
                                        variant="subtitle2"
                                    >
                                        £{formatCurrency(appeal.actual_donations)} raised!
                                    </Typography>

                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Divider variant="middle" sx={{ mt: 2 }} />
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: "bold", marginTop: 2 }}
                        >
                            Related appeals
                        </Typography>
                        <Box
                            sx={{
                                marginTop: 3,
                                marginBottom: 4,
                            }}
                        >
                            <Grid item xs={12} container spacing={3}>
                                {new Array(4).fill(0).map((item, index) => (
                                    <Grid item xs={6} sm={4} md={3}>
                                        <AppealCard key={index}/>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};

export default AppealPage;

// {/* <Box
//     sx={{
//         display: "flex",
//         flexDirection: "row",
//         gap: 5,
//         marginTop: 2,
//         marginBottom: 4,
//     }}
// >
//     <AppealCard />
//     <AppealCard />
//     <AppealCard />
//     <AppealCard />
// </Box> */}

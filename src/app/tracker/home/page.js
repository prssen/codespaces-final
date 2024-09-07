"use client"

import React, { useCallback, Suspense } from "react";
import {
    Box,
    Paper,
    Button,
    Typography,
    Grid,
    Container,
    Autocomplete,
    CircularProgress,
    Alert
} from "@mui/material";
import SearchBar from "@/components/SearchBar";
// import CharityCard from "./CharityCard";
import AppealCard from "@/components/tracker/AppealCard";
// import Update from "../Components/Update";
import Update from "@/components/Update";

import { useGetAppeals } from "@/lib/hooks/useApi";

import { useRouter, useSearchParams } from "next/navigation";
// import { useCreateQueryString } from "@/lib/hooks/navigation";

// import { useNavigate, createSearchParams } from "react-router-dom";
// import { connect } from "react-redux";
// Photo by <a href="https://unsplash.com/@_zachreiner_?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Zach Reiner</a> on <a href="https://unsplash.com/photos/tree-roots-on-rock-formation-hW11fwjzVfA?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

const HomePageSearch = () => {

    const router = useRouter();
    const searchParams = useSearchParams();

    // Get a new searchParams string by merging the current
    // searchParams with a provided key/value pair
    // Credit: https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams 
    const createQueryString = useCallback(
        (name, value) => {
          const params = new URLSearchParams(searchParams.toString())
          params.set(name, value)
     
          return params.toString()
        },
        [searchParams]
    );
    const [searchResults, setSearchResults] = React.useState([]);

    // Pass search string as a query param to search results page to get
    // the results
    const handleSubmit = () => {
        const path = `/tracker/search/?${createQueryString('search', searchResults)}`;
        console.log('Redirect path is: ', path);
        router.push(path);
    }

    return (
        <SearchBar value={searchResults} onChange={setSearchResults} onSubmit={handleSubmit}/>
    );
}

// TODO: replace home page image with non-premium one
const CharityHomePage = (props) => {
    const styles = {
        root: {
            flexGrow: 1,
        },
        banner: {
            padding: 2,
            // background: `url${process.env.PUBLIC_URL}/images/charity.jpg`, // Copilot sugestion
            background: `url(https://plus.unsplash.com/premium_photo-1682097168134-aeb1d79cfa43?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
            borderRadius: 3,
            textAlign: "center",
            height: "30vh",
            backgroundSize: "cover",
            position: "relative",
            // color: "white",
            // backgroundColor: "blue",
        },
        overlay: {
            position: "absolute",
            margin: "auto",
            // top: "15%",
            // left: "15%",
            top: "50%",
            bottom: "0%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            height: "50%",
        },
    };

    // const navigate = useNavigate();
    
    // TODO: DELETE - replaced with HomePageSearch component
    /*
    const router = useRouter();
    const searchParams = useSearchParams();


    // Get a new searchParams string by merging the current
    // searchParams with a provided key/value pair
    // Credit: https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams 
    const createQueryString = useCallback(
        (name, value) => {
          const params = new URLSearchParams(searchParams.toString())
          params.set(name, value)
     
          return params.toString()
        },
        [searchParams]
    );

    const [searchResults, setSearchResults] = React.useState([]);
    */

    const [showAlert, setShowAlert] = React.useState(false);
    
    // const handleSubmit = useCallback(() => {
    //     setShowAlert(true);
    // }, [])

    // const handleSubmit = ({ keyPressValue }) => {
        // This is to deal with a strange bug in react MUI, where the onKeyDown
        // event listener resets the <TextField>'s value to 'undefined'
        // if (keyPressValue) setSearchResults(keyPressValue);
        // return setShowAlert(true);
    // }

    // Pass search string as a query param to search results page to get
    // the results
    const handleSubmit = () => {
        const path = `/tracker/search/?${createQueryString('search', searchResults)}`;
        console.log('Redirect path is: ', path);
        router.push(path);
        // navigate({
        //     pathname: '/tracker/search', 
        //     search: `?${createSearchParams({search: searchResults})}`
        //     // search: createSearchParams({
        //     //     search: searchResults
        //     // })
        // });
    }

    const { data: appeals, error, isLoading, isError } = useGetAppeals();

    // Take the first photo to put on appeal card
    // const appealCardData = appeals.map(e => {
    //     ...e,
    //     image: e.photos[0]?.photo || ,
    //     altText: `${e.title} photo`,
    //     avatar: e.photos[1]?.photo,
    //     primaryButton: <Button>Donate</Button>,
    //     secondaryButton: ""
    // });

    // const appealCardData = appeals.map(e => ({
    //     ...e
    // }));
    // const [appealCardData, setAppealCardData] = useState(null);
    let appealCardData;

    const charities = [
        {
            id: 1,
            title: "World Vision",
            subtitle: "Ending blindness, one operation at a time",
            // image: "https://source.unsplash.com/random",
            image: `https://picsum.photos/seed/1/200/300`,
            altText: "Random photo",
            // avatar: "https://source.unsplash.com/random",
            avatar: `https://picsum.photos/seed/1/200/300`,
            primaryButton: <Button>Donate</Button>,
            secondaryButton: "",
        },
        {
            id: 2,
            title: "Oxfam",
            subtitle: "Ending poverty, one meal at a time",
            // image: "https://source.unsplash.com/random",
            image: `https://picsum.photos/seed/2/200/300`,
            altText: "Random photo",
            // avatar: "https://source.unsplash.com/random",
            avatar: `https://picsum.photos/seed/2/200/300`,
            primaryButton: <Button>Donate</Button>,
            secondaryButton: "",
        },
        {
            id: 3,
            title: "UNICEF",
            subtitle: "Ending child poverty, one child at a time",
            // image: "https://source.unsplash.com/random",
            image: `https://picsum.photos/seed/3/200/300`,
            altText: "Random photo",
            // avatar: "https://source.unsplash.com/random",
            avatar: `https://picsum.photos/seed/3/200/300`,
            // primaryButton: <Button>Donate</Button>,
            // secondaryButton: "",
        },
    ];

    if (isLoading) {
        return <CircularProgress />;
    }

    // if (error) {
    //     return (
    //         <Update
    //             open={true}
    //             setOpen={(status) => {}}
    //             // handleClose={setAlertOpen}
    //             severity="error"
    //             message={error.message}
    //         />
    // );
    // }
    
    if (!isError) {
        appealCardData = Array.isArray(appeals) && appeals.map(e => ({
            ...e,
            // image: e.photos?.[0]?.photo || 'appeals',
            image: e.photo,
            altText: `${e.title} photo`,
            // avatar: e.photos?.[1]?.photo,
            // primaryButton: <Button>Donate</Button>,
            // secondaryButton: "",
            url: `http://localhost:3000/tracker/appeals/${e.uuid}`
        }));
        console.log('Appeal card data: ', appealCardData)
        // setAppealCardData(data);
    }

    return (
        <Container>
            {/* <Alert severity="info" sx={{ display: showAlert ? "block" : "none" }} onClick={() => setShowAlert(false)}>{searchResults}</Alert> */}
            <Box component={Paper} sx={styles.banner}>
                <Box component="div" sx={styles.overlay}>
                    <Typography variant="h3" color="white">
                        GiveTrack
                    </Typography>
                    <Typography variant="h6" color="white">
                        Find a cause. See the results.
                    </Typography>
                    {/* <SearchBar value={searchResults} onChange={setSearchResults} onSubmit={handleSubmit}/> */}
                    <Suspense>
                        <HomePageSearch />
                    </Suspense>
                </Box>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    my: 8,
                }}
            >
                <Typography variant="h5" sx={{ mb: 1 }}>
                    Popular appeals
                </Typography>
                {isLoading ? 
                    <CircularProgress />
                : 
                (
                    <Grid container spacing={2}>
                        {appealCardData && appealCardData.slice(0,4).map(({ id, ...appeal }, index) => (
                            <Grid item xs={3}>
                                <AppealCard
                                    {...appeal}
                                    cardStyles={{ height: "100%" }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    my: 6,
                }}
            >
                <Typography variant="h5" sx={{ mb: 1 }}>
                    Appeals near me
                </Typography>
                { isLoading ? 
                    <CircularProgress /> :
                (
                    <Grid container spacing={2}>
                        {charities.map(({ id, ...charity }, index) => (
                            <Grid item xs={3}>
                                <AppealCard
                                    {...charity}
                                    cardStyles={{ height: "100%" }}
                                />
                            </Grid>
                        ))}
                        {charities.map(({ id, ...charity }, index) => (
                            <Grid item xs={3}>
                                <AppealCard
                                    {...charity}
                                    cardStyles={{ height: "100%" }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )
                }
            </Box>
        </Container>
    );
};

// const mapStateToProps = (state) => ({});

// const mapDispatchToProps = {};

// export default connect(mapStateToProps, mapDispatchToProps)(CharityHomePage);

export default CharityHomePage;

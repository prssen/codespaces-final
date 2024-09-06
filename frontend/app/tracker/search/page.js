"use client"

import React, { useState, useEffect, useRef } from "react";
import { Container, Grid, Divider, Box, Paper, Typography, Button, CircularProgress } from "@mui/material";
// import FixedAppBar from "../Components/FixedAppBar"
// import SearchBar from "../../SearchBar";
// import ListCard from "./ListCard";

import SidePanel from "./SidePanel";
// import ListView from "./ListView";
// import { useGetAppeals, useSearchAppeals } from "../Hooks/useApi";
// import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import  "./SearchResultsPage.css"
// import Raleway from "../../fonts/Raleway-VariableFont_wght.ttf";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
// import { useSearchParams, useNavigate, createSearchParams } from "react-router-dom";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";
import SearchResultsSection from "./SearchResultsSection";
dayjs.extend(relativeTime);

function SearchResultsPage() {

    // const [searchParams, setSearchParams] = useSearchParams({ q: ''});

    // const navigate = useNavigate();
    const router = useRouter();
    // const [searchParams, setSearchParams] = useSearchParams();
    // const searchParams = useSearchParams();

    // Define state object to control the URL search params
    const [searchParams, setSearchParams] = useQueryStates({
        search: parseAsString,
        targetDonations: parseAsInteger,
        duration: parseAsString
    }, {
        history: 'push',
        // Rate-limit the number of times the URL is updated, to prevent
        // excessive API requests
        throttleMs: 500
    });

    // console.log('Current search params:', Object.fromEntries(searchParams));
    // console.log('Current search params:', searchParams.getAll());
    console.log('Current search params:', searchParams);

    // // State variables for loading search results
    // const [searchString, setSearchString] = useState('');
    // const [searchQuery, setSearchQuery] = useState('');

    // useEffect(() => {
    //     setSearchQuery(searchParams.get('search'));
    //     setSearchString(searchParams.get('search'));
    //     // setSearchQuery(searchParams.get('q'));
    //     // setSearchString(searchParams.get('q'));
    // }, []);

    // const [searchResults, setSearchResults] = useState([]);

    // const [isLoading, setIsLoading] = useState(false);
    // const [isError, setIsError] = useState(false);

    // console.log('Reloaded search string:', searchString);

    // const { data: results, error, isLoading, isError } = useGetAppeals();
    // const { data: results, error, isLoading, isError } = useSearchAppeals(searchQuery);

    // const { data: results, error, isLoading, isError } = useSearchAppeals(searchParams);

    // // TODO: Get search results from route params instead of this
    // React.useEffect(() => {
    //     // setSearchResults([
    //     //     {
    //     //         id: 1,
    //     //         title: "Fox Concern UK",
    //     //         location: "London, England",
    //     //         subtitle:
    //     //             "Fox Concern is the only charity in the UK dedicated to the preservation of wild foxes in their natural habitat. We work with local communities to ensure that foxes are protected and respected.",
    //     //         image: "https://source.unsplash.com/random",
    //     //         rating: "3.4",
    //     //     },
    //     //     {
    //     //         id: 2,
    //     //         title: "Oxfam",
    //     //         location: "Oxford, England",
    //     //         subtitle:
    //     //             "Oxfam is a global organization working to end the injustice of poverty. We help people build better futures for themselves, hold the powerful accountable, and save lives in disasters.",
    //     //         image: "https://source.unsplash.com/random",
    //     //         rating: "4.2",
    //     //     },
    //     //     {
    //     //         id: 3,
    //     //         title: "UNICEF",
    //     //         location: "New York, USA",
    //     //         subtitle:
    //     //             "UNICEF works in over 190 countries and territories to save children’s lives, to defend their rights, and to help them fulfill their potential, from early childhood through adolescence.",
    //     //         image: "https://source.unsplash.com/random",
    //     //         rating: "4.8",
    //     //     },
    //     //     {
    //     //         id: 4,
    //     //         title: "World Vision",
    //     //         location: "London, England",
    //     //         subtitle:
    //     //             "World Vision is a Christian humanitarian organization dedicated to working with children, families, and their communities worldwide to reach their full potential by tackling the causes of poverty and injustice.",
    //     //         image: "https://source.unsplash.com/random",
    //     //         rating: "4.5",
    //     //     },
    //     //     {
    //     //         id: 5,
    //     //         title: "Save the Children",
    //     //         location: "London, England",
    //     //         subtitle:
    //     //             "Save the Children believes every child deserves a future. In the UK and around the world, we give children a healthy start in life, the opportunity to learn and protection from harm.",
    //     //         image: "https://source.unsplash.com/random",
    //     //         rating: "4.1",
    //     //     },
    //     //     {
    //     //         id: 6,
    //     //         title: "The British Red Cross",
    //     //         location: "London, England",
    //     //         subtitle:
    //     //             "The British Red Cross helps people in crisis, whoever and wherever they are. We are part of a global voluntary network, responding to conflicts, natural disasters and individual emergencies.",
    //     //         image: "https://source.unsplash.com/random",
    //     //         rating: "4.2",
    //     //     },
    //     //     {
    //     //         id: 7,
    //     //         title: "The Salvation Army",
    //     //         location: "London, England",
    //     //         subtitle:
    //     //             "The Salvation Army is a Christian church and registered charity in England (214779), Wales (214779), Scotland (SC009359) and the Republic of Ireland (CHY6399).",
    //     //         image: "https://source.unsplash.com/random",
    //     //         rating: "4.0",
    //     //     },
    //     //     {
    //     //         id: 8,
    //     //         title: "Cancer Research UK",
    //     //         location: "London, England",
    //     //         subtitle:
    //     //             "Cancer Research UK is the world’s leading independent charity dedicated to cancer research. We carry out scientific research to help prevent, diagnose and treat cancer.",
    //     //         image: "https://source.unsplash.com/random",
    //     //         rating: "4.7",
    //     //     },
    //     //     {
    //     //         id: 9,
    //     //         title: "The Royal British Legion",
    //     //         location: "London, England",
    //     //         subtitle:
    //     //             "The Royal British Legion is the UKs leading Service charity providing care and support to serving members of the Armed Forces, veterans of all ages and their families.",
    //     //         image: "https://source.unsplash.com/random",
    //     //         rating: "4.3",
    //     //     },
    //     //     {
    //     //         id: 10,
    //     //         title: "The National Trust",
    //     //         location: "London, England",
    //     //         subtitle:
    //     //             "The National Trust is a charity founded in 1895 by three people who saw the importance of our nation’s heritage and open spaces and wanted to preserve them for everyone to enjoy.",
    //     //         image: "https://source.unsplash.com/random",
    //     //         rating: "4.9",
    //     //     },
    //     // ]);

    //     return () => {
    //         setSearchResults([]);
    //     };
    // }, []);

    const [stateValues, setStateValues] = useState({
        searchType: '',
        duration: '',
        targetDonations: ''
    });

    const oneYearAgo = dayjs().subtract(1, 'year').format('YYYY-MM-DD');
    const threeYearsAgo = dayjs().subtract(3, 'year').format('YYYY-MM-DD');

    // Convert checkbox selection to a valid start date
    const startDateMap = {
        '<1 year': [{query: 'date_started__gt', value: oneYearAgo}],
        '1-3 years': [
            {query: 'date_started__gt', value: threeYearsAgo}, 
            {query: 'date_started__lt', value: oneYearAgo}],
        '>3 years': [{query: 'date_started__lt', value: threeYearsAgo}]
    }

    const addStartDates = (duration, urlParams) => {
        // const duration = stateArray.find(e => e[0] === 'duration')[1];
        const startDates = startDateMap[duration];

        // Add start date query params to URLSearchParams object
        // if (Array.isArray(startDates)) {
            // urlParams.delete('date_started');
            urlParams.delete('duration');
            // startDates.map(e => urlParams.append('date_started', e));
            startDates.map(e => urlParams.append(e.query, e.value))
        // }
        // else {
            // urlParams.set('date_started', startDates);
        // }

        // Create an array containing a 2-element array for each value in startDates[duration]
        // const startDates = [startDateMap[duration]].flat().map(e => ['date_started', e]);
    }

    useEffect(() => {
        /*
            - Convert searchType etc. to appropriate query paramms
            - Convert duration to query params
                - 
            - reload page
        */
        if (stateValues && !Object.entries(stateValues).every(e => e[1] === '')) {
            // let urlParams = new URLSearchParams({
            //     'search': searchQuery,
            //     'project__target_donations__lt': stateValues.targetDonations
            // });
            let urlParams = new URLSearchParams();
            // searchQuery && urlParams.append('search', searchQuery);
            // Reload current search URL param, rather than what the user has currently entered in the search bar
            // (which is stored in the <SearchResultsSection> component)

            // searchParams.get('search') && urlParams.append('search', searchParams.get('search'));
            searchParams.search && urlParams.append('search', searchParams.search);
            stateValues.targetDonations && urlParams.append('project__target_donations__lt', stateValues.targetDonations);
            stateValues.duration && addStartDates(stateValues.duration, urlParams);
            // addStartDates(stateValues.duration, urlParams);
            console.log('New search params:', Object.fromEntries(urlParams));
            // Reload page with new URL params
            // navigate(`/tracker/search?search=${searchParams.get('search')}&${createSearchParams(urlParams)}`);
            setSearchParams(Object.fromEntries(urlParams));
            // navigate(0);
            // router.reload();
      
        }
        
    }, [stateValues])

    // TODO: if stateValues.duration, call addStartDates() on URLSearchParams object

    // TODO: unpack stateValues dict into searchString every time it changes:
    // (e.g. useEffect(() => searchString += URLSearchParams(stateValues), [stateValues])


    // if (isLoading) {
    //     return <CircularProgress />
    // }

    // let formatted;
    // if (!isError) {        
    //     formatted = results.map(e => ({
    //         // title, subtitle unchanged
    //         ...e,
    //         // image: e.photos[0]?.photo || 'appeals',
    //         // avatar: e.photos[1]?.photo,
    //         image: e.photo,
    //         altText: `${e.title} photo`,
    //         // charityName: e.charity_name,
    //         // dateStarted: e.date_started,
    //         primaryButton: <Button>Donate</Button>,
    //         secondaryButton: ""
    //     }));
    //     // formatted.push(formatted[0])
    //     console.log(formatted);
    //     // setSearchResults(formatted);
    // }

    // This updates the 'searchQuery' variable, which triggers a search request
    // to the API, with the latest value of 'searchString', which is what the user
// has typed in the search bar
    // const onSubmit = (event, newValue) => {
    //     setSearchQuery(searchString);
    //     setSearchParams({ search: searchString});
    //     console.log('Updated search query: ', searchString);
    // }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mx: "auto"
            }}
        >
            {/* <FixedAppBar /> */}
            {/* 
                - Flex: 1 on list view, flex-basis: 200px? on side panel
            */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    flex: 1,
                    // border: 2
                }}
            >
                <Box sx={{height: '100%', padding: 2, width: '28%'}}>
                    <SidePanel stateValues={stateValues} setStateValues={setStateValues} />
                </Box>
                <Box sx={{flex: 1, overflow: 'auto' }}>
                    <Grid container spacing={2} p={2}>
                        {/* <Grid item xs={7}> */}
                        <Grid item xs={12}>
                            <Typography 
                                variant='h4' 
                                // sx={{mb: 2}}
                                // sx={{fontFamily: 'Raleway'}}
                            >
                                    Search
                            </Typography>
                        </Grid>
                        <SearchResultsSection />
                        {/* <Grid item xs={7}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "flex-start",
                                    gap: 3,
                                }}
                            >
                                <SearchBar value={searchString} onChange={setSearchString}/>
                                <Button size="small" variant="outlined" sx={{whiteSpace: 'nowrap', px: 3, borderRadius: 3 }} onClick={onSubmit}>Search</Button>
                            </Box>
                        </Grid>
                        <Grid 
                            item xs={12} 
                            // mt={-1}
                        >
                            <Typography variant="subtitle2" color="text.secondary">Showing results for <em>{searchQuery}</em></Typography>
                        </Grid>
                        <Grid item xs={6} mt={3}>
                            <Typography variant="subtitle1">Back to Top</Typography>
                        </Grid>
                        <Grid item xs={7}>
                            <ListView data={formatted} />
                        </Grid> */}
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
}

export default SearchResultsPage;
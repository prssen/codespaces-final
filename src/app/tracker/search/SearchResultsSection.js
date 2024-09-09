import { useState, useEffect } from "react";
// import { Grid, Box, Alert, AlertTitle, Button, Typography, CircularProgress } from "@mui/material";
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import ListView from "./ListView";
// import SearchBar from "../../SearchBar";
import SearchBar from "@/components/SearchBar";

import { useSearchParams } from 'next/navigation';
import { useQueryState } from "nuqs";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { useSearchAppeals } from "../Hooks/useApi";
import { useSearchAppeals } from "@/lib/hooks/useApi";
import Update from "@/components/Update";

const SearchResultsSection = () => {

    // const navigate = useNavigate();
    // const router = useRouter();
    // const [searchParams, setSearchParams] = useSearchParams();
    
    // Getting read-only copy of all query params from Next.js
    const allSearchParams = useSearchParams();
    // Create a setter for the specific search param, 'search', using 'nuqs'
    const [searchStringParam, setSearchStringParam] = useQueryState('search');

    // const searchParams = useSearchParams();
    
    // Store search string in local state - need to synchronise with URL params
    const [searchString, setSearchString] = useState('');

    useEffect(() => {
        // console.log('URL params updated with: ', searchParams.get('search'));
        console.log('URL params updated with: ', searchStringParam);
        // setSearchString(searchParams.get('search'));
        setSearchString(searchStringParam);
        // setSearchString(searchParams.search);

        // setSearchQuery(searchParams.get('q'));
        // setSearchString(searchParams.get('q'));
    }, []);

    // const { data: results, error, isLoading, isError } = useSearchAppeals(Object.fromEntries(searchParams));
    const { data: results, error, isLoading, isError } = useSearchAppeals(Object.fromEntries(allSearchParams));

    if (isLoading) {
        return <CircularProgress />
    }

    if (isError) {
        return <Alert severity='error' sx={{marginTop: 2, marginLeft: 2 }}>
                    <AlertTitle>Network error</AlertTitle>
                    Could not fetch search results. Please try again.
                </Alert>
    }

    let formatted;
    // if (!isError) {
        console.log('Unformatted results: ', results);        
        formatted = results.map(e => ({
            // title, subtitle unchanged
            ...e,
            // image: e.photos[0]?.photo || 'appeals',
            // avatar: e.photos[1]?.photo,
            image: e.photo,
            altText: `${e.title} photo`,
            // charityName: e.charity_name,
            // dateStarted: e.date_started,
            primaryButton: <Button>Donate</Button>,
            secondaryButton: ""
        }));
        // formatted.push(formatted[0])
        console.log('Formatted results: ', formatted);
        // setSearchResults(formatted);
    // }

    // This updates the 'searchQuery' variable, which triggers a search request
    // to the API, with the latest value of 'searchString', which is what the user
// has typed in the search bar
    const onSubmit = (event, newValue) => {
        // setSearchParams({ search: searchString});
        setSearchStringParam(searchString);
        console.log('Updated search query: ', searchString);
    }

    return (
        <>
            <Grid item xs={9}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        gap: 3,
                    }}
                >
                    <SearchBar value={searchString} onChange={setSearchString}/>
                    {/* <Button sx={{ whitSpace: "nowrap" }}> */}
                    <Button size="small" variant="outlined" sx={{whiteSpace: 'nowrap', px: 3, borderRadius: 3 }} onClick={onSubmit}>Search</Button>
                </Box>
                    {/* <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        Search results
                    </Typography>
                    <Typography variant="subtitle1">
                        Showing 1-10 of 100 results
                    </Typography> */}
            </Grid>
            {/* <Grid item xs={6}></Grid> */}
            <Grid 
                item xs={12} 
                // mt={-1}
                
            >
                {/* <Typography variant="subtitle2" color="text.secondary">Showing results for <em>{searchQuery}</em></Typography> */}
                
                {/* <Typography variant="subtitle2" color="text.secondary">Showing results for <em>{searchParams.get('search')}</em></Typography> */}
                <Typography variant="subtitle2" color="text.secondary">Showing results for <em>{searchStringParam}</em></Typography>
            </Grid>
            <Grid item xs={6} mt={3}>
                <Typography variant="subtitle1">Back to Top</Typography>
            </Grid>
            <Grid item xs={9}>
                <ListView data={formatted} />
            </Grid>
        </>
    );
}

export default SearchResultsSection;
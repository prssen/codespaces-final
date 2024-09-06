import * as React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import DirectionsIcon from "@mui/icons-material/Directions";
import { TextField, Autocomplete, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { grey } from "@mui/material/colors";

// Code adapted from https://mui.com/material-ui/react-text-field/#using-the-theme-style-overrides-api
export default function SearchBar({ value, onChange, isLoading, onSubmit, options: _options, ...props }) {
    // To display loading indicator while options are loading - from
    // https://mui.com/material-ui/react-autocomplete/#load-on-open

    console.log('Options are: ', _options);

    console.log('Search string in search bar:', value);

    const [open, setOpen] = React.useState(false);
    const [options, setOptions] = React.useState(_options || []);
    // TODO: add the condition 'api is in loading state' to these 2
    const loading = open && options.length === 0 && isLoading;
    
    const [searchQuery, setSearchQuery] = React.useState("");

    // TODO:
    /*
      - Finish API call to get all search results (charity/project list view) in a single API call
      - Filter search results: see https://www.youtube.com/watch?v=E1cklb4aeXA&pp=ygUgcmVhY3QgbWF0ZXJpYWwgdWkgc2VhcmNoIHJlc3VsdHM%3D for how
      (and oher videos: 'search filter React' or similar)
      - Redirect to search results page on key down == 'Enter'
    */
    const searchResults = [
        { id: 1, name: "Result 1", value: "result-1" },
        { id: 2, name: "Result 2", value: "result-2" },
        { id: 3, name: "Result 3", value: "result-3" },
    ];

    // Clear the search bar suggestions when search bar is closed
    // From https://mui.com/material-ui/react-autocomplete/#load-on-open
    useEffect(() => {
        if (!open) {
            setOptions([]);
        }
    }, [open]);

    const handleChange = (e, newValue) => {
        // setSearchQuery(newValue);

        console.log('New changed value is', newValue);
        onChange(newValue);

        // // TODO: API call
        // getSearchResults(newValue);
    };

    const onInputChange = (e, newValue) => {
        // setInputValue(newValue);
        console.log('New input value is', newValue);
        onChange(newValue);
    }

    // // TODO: move this to the 'api' section, and make a hook out of the useQuery
    // // From https://www.youtube.com/watch?v=sWVgMcz8Q44 and Copilot (map())
    // const getSearchResults = (value) => {
    //   const results =  fetch('https://jsonplaceholder.typicode.com/posts')
    //       .then(response => response.json())
    //       .then(json => {
    //         const results = json
    //         .filter((result) => newValue && result && result.title && result.title.includes(newValue))
    //         .map((result) => {
    //           return { id: result.id, name: result.title, value: result.body }
    //         })
    //       })
    //   setSearchResults(results)''
    // }

    return (
        // <Paper
        // variant='outlined'
        //   component="form"
        //   sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 350 }}
        // >
        //   <InputBase
        //     sx={{ ml: 1, flex: 1 }}
        //     placeholder="Search here..."
        //   />
        //   <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
        //     <SearchIcon />
        //   </IconButton>
        // </Paper>

        <Autocomplete
            freeSolo
            id="charity-search-bar"
            selectOnFocus
            // clearOnBlur
            fullWidth
            getOptionLabel={(option) => option.label}
            options={options}
            // options={searchResults.map((option) => option)}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            // Need to override MUI's filtering to allow us to stream requests
            // to the API as the user types
            
            filterOptions={(x) => x}
            {...props}
            /*
            renderOption={(props, option) => (
                <>
                    <li {...props}>{option.name}</li>
                    {option.inputValue && <Divider variant="middle" />}
                </>
            )}
            */


            // onChange={(event, newValue) => {}}
            // onChange={onChange}
            // onChange={handleChange}
            disableClearable
            onInputChange={onInputChange}
            renderInput={(params) => (
                <TextField
                    {...params}
                    id="charity-search-input"
                    variant="outlined"
                    name="search"
                    sx={{
                        borderRadius: 3,
                        backgroundColor: "background.paper",
                        "& fieldset": { border: "none" },
                        boxShadow: 1,
                        ...props?.textInputStyles
                    }}
                    // onKeyPress={e => (e.key === 'Enter') ? onSubmit({ keyPressValue: e.target.value }) : null}
                    onKeyPress={e => (e.key === 'Enter') ? onChange(e.target.value) : null}
                    
                    // onKeyDown={e => (e.charCode === 13) ? onSubmit() : null}
                    // onKeyDown={evt => {
                    //     const evtobj = window.event ? evt : e;
                    //     if (evtobj.ctrlKey && evtobj.key === 'Enter') {
                    //         onSubmit()
                    //     }
                    // }}
                    placeholder="Search for a charity or project here"
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                            <IconButton type="submit" aria-label="search-icon" onClick={onSubmit}>
                                <SearchIcon color={grey[300]} />
                            </IconButton>
                        ),
                        // From https://mui.com/material-ui/react-autocomplete/#load-on-open
                        endAdornment: (
                            <React.Fragment>
                                {loading ? (
                                    <CircularProgress
                                        color="inherit"
                                        size={20}
                                    />
                                ) : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                        // onKeyDown: e => (e.key === 'Enter') ? onSubmit() : null,
                        disableUnderline: true,
                    }}
                    // InputLabelProps={{
                    //     shrink: false,
                    // }}
                    value={value}
                    defaultValue={value}
                    inputValue={value}
                    {...props.textFieldProps}
                />
            )}
        />
    );
}
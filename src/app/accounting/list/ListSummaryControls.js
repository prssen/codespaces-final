import React, { useState, useEffect } from 'react'
import { Box, Button, Typography } from '@mui/material'
import { grey } from '@mui/material/colors';
// import Fuse from 'fuse.js';
import { dateDiff } from '@/lib/utils/utils';
import SearchBar from '@/components/SearchBar';
import StyledPopover from '@/components/StyledPopover';

import { BiChevronDown } from 'react-icons/bi';
import { BsSortAlphaDown, BsSortAlphaUpAlt, BsSortDown, BsSortUpAlt, BsSortNumericDown, BsSortNumericUpAlt } from "react-icons/bs";


function ListSummaryControls({ rows, setSelectedRows, sortModel, setSortModel }) {

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState(null);
    // const [sortModel, setSortModel] = useState([]);

    // on button clicks, change selectedFilter or sortModel

    const search = async (searchQuery, rows) => {
        // Get all values from each object property except ID
        // rows.filter(e => Object.values(e.pop('id')).includes(query));

        if (searchQuery) {
            // Remove the 'id' property, and get the remaining keys
            // (these are the column names)
            const { id, ...rest } = rows[0];
            // Dynamically import library when user types in input, to minimise
            // loading times 
            const Fuse = (await import('fuse.js')).default;
            const fuse = new Fuse(rows, {keys: Object.keys(rest)})
            // Remove the 'refIndex' and 'score' properties from the search results
            //, yielding the original row objects
            const rowData = fuse.search(searchQuery).map(row => row.item);
                            //    .map(({ refIndex, score, ...rows}) => rows)
            // console.log('Searched rowData: ', rowData);
            return rowData;
        } else {
            // Empty search string, return all results unmodified
            return rows;
        }
    }

   /**
     * sortCriteria: must be in the form 'colName;asc' (column name, ';', then sorting strategy)
     */
   const sort = (sortCriteria) => {
        // // Valid sorting criteria
        // const validCriteria = {
        //     'alph': 'Alphabetical',
        //     'rAlph': 'Reverse alphabetical',
        //     'tAsc': ''
        // }

        // // Sort by 
        // Get the field + sort strategy selected by user from button value (colName)
        const [colName, strategy] = sortCriteria.split(';');

        // Create a sorting model that sorts by that field
        const sortModel = [{ field: colName, sort: strategy}];

        // Set as the sorting model
        setSortModel(sortModel);
    }

    const filter = (filterType, rows) => {
        if (filterType === 'thisWeek') {
            return rows.filter(e => dateDiff(e.date)  < 7);
        } else if (filterType === 'thisMonth') {
            return rows.filter(e => dateDiff(e.date) < 30);
        } else {
            return rows
        }
    }

    useEffect(() => {
        (async () => {
            let rowData = await search(searchQuery, rows);
            // TODO: Pass total number of rowData to first filter label
            rowData = filter(selectedFilter, rowData);
            // TODO: Pass filtered number to second filter label
            setSelectedRows(rowData)
        })()
    }, [sortModel, searchQuery, selectedFilter]);

    // Sort popover data
    /*  
    [
        [{name: 'Alphabetical', value: 'date;asc', avatar: <AtoZUpIcon />},
        {name: 'Alphabetical traditions', value: 'date;desc', avatar: <AtoZDownIcon />},
        ]
    ]
    */

    let sortFilters = [
        {name: 'Alphabetical', value: 'col1;asc', icon: <BsSortAlphaDown />},
        {name: 'Reverse alphabetical', value: 'col1;desc', icon: <BsSortAlphaUpAlt />},
    ];

    // We have to add the callback after the object is created, as one object
    // prop can't refer to another in an object literal
    sortFilters = sortFilters.map(e => ({
            ...e, 
            callback: () => sort(e.value)
        }));

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleSortClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const styles = {
        buttonGroup: {
            display: 'inline-flex', 
            flexDirection: 'row', 
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgb(243, 243, 243)',
            borderRadius: 8,
            padding: "4px 4px",
        },
        button: {
            borderRadius: 2, 
            backgroundColor: 'white',
            // fontWeight: 'bold',
            textTransform: 'none',
            backgroundColor: 'transparent',
            // color: '#071018',
            color: grey[600]
        },
        active: {
            backgroundColor: 'white',
            fontWeight: 'bold',
            color: grey[800],
            transition: 'background-color 0.3s ease-in-out'
        }
    };
    

    return (
        <Box 
            sx={{
                // mb: 2,
                
                // To align with text of 1st column header
                ml: 2, 
                // padding: 3
            }}>
            <Box 
                sx={{
                    // border: 1, 
                    // borderColor: 'blue',
                    // backgroundColor: 'white', 
                    borderRadius: 8,
                    px: '20px', 
                    py: 1,
                    gap: 2,
                    display: 'flex',
                    // flexDirection: 'column',
                    alignItems: 'center',
                }}>
                <div
                    style={styles.buttonGroup}
                    // style={{
                    //     display: 'inline-flex', 
                    //     flexDirection: 'row', 
                    //     justifyContent: 'center',
                    //     alignItems: 'center',
                    //     backgroundColor: 'rgb(243, 243, 243)',
                    //     // border: '1px solid green',
                    //     borderRadius: 8,
                    //     // padding: 3,
                    //     padding: "4px 4px",
                    //     // marginBottom: 16
                    // }}
                >
                    <Button 
                        sx={{ 
                            ...styles.button, 
                            ...(selectedFilter === 'all' && styles.active) 
                        }}
                        // sx={{
                        //     borderRadius: 2, 
                        //     backgroundColor: 'white',
                        //     fontWeight: 'bold',
                        //     textTransform: 'none',
                        //     // color: '#071018',
                        //     color: grey[800]
                        // }}
                        data-filter='all'
                        onClick={(e) => setSelectedFilter(e.target.dataset.filter)}
                    >All</Button>
                    <Button
                        sx={{ 
                            ...styles.button, 
                            ...(selectedFilter === 'thisWeek' && styles.active) 
                        }}
                        data-filter='thisWeek'
                        onClick={(e) => setSelectedFilter(e.target.dataset.filter)}
                    >This week</Button>
                    <Button
                        sx={{ 
                            ...styles.button, 
                            ...(selectedFilter === 'thisMonth' && styles.active) 
                        }}
                        data-filter='thisMonth'
                        onClick={(e) => setSelectedFilter(e.target.dataset.filter)}
                    >This month</Button>
                </div>
                <SearchBar 
                    value={searchQuery}
                    onChange={setSearchQuery}
                    isLoading={false}
                    onSubmit={() => {}}
                    sx={{
                        width: 400,
                        backgroundColor: 'transparent',
                        "& .MuiAutocomplete-inputRoot": {
                            maxHeight: '44px',
                            overflowY: 'auto'
                        }
                    }}
                    textInputStyles={{
                        backgroundColor: 'white',
                        // boxShadow: variables['--elevation-1-shadow']
                        // borderColor: '#dee0e5',
                        border: 1,
                        borderColor: grey[300],
                        // boxShadow: `0px 5px 5px -3px ${grey[100]}`
                        // boxShadow: '0px 10px 15px -3px rgb(236, 239, 248)',
                    }}
                    // ListboxProps={{ style: { maxHeight: 50 } }}
                />
                <Button 
                    variant="outlined"
                    sx={{
                        backgroundColor: 'white',
                        // boxShadow: '0.9px 1.8px 2.7px -0.3px hsl(0deg 0% 77% / 0.14)',
                        flex: 1,
                        marginLeft: 'auto',
                        minWidth: 'fit-content',
                        maxWidth: 'fit-content',
                        borderRadius: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        // padding: 1,
                        height: '44px',
                        // width: 'max-content',
                        // padding: 1,
                        // maxHeight: '44px'
                    }}
                >
                    <Typography 
                        variant="subtitle1" 
                        color="text.secondary"
                        textAlign="center"
                        onClick={handleSortClick}
                        sx={{textTransform: 'none'}} 
                    >
                        Sort by
                        <BiChevronDown />
                    </Typography>
                </Button>
                <StyledPopover 
                    options={sortFilters}
                    anchorEl={anchorEl}
                    setAnchorEl={setAnchorEl}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    sx={{
                        marginTop: 2,
                        // boxShadow: variables['--elevation-1-shadow']
                        boxShadow: "10px 10px 5px 0px rgba(0,0,0,0.75)"
                    }}
                    PaperProps={{
                        sx: {
                            backgroundColor: 'white',
                            borderRadius: 3,
                            boxShadow: 10,
                        }
                    }}
                />
            </Box>
        </Box>
    )
}

export default ListSummaryControls
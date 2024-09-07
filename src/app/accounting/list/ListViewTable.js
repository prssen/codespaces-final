"use client"

import { Typography } from '@mui/material';
import { useState } from "react";
import { DataGrid } from '@mui/x-data-grid';
import "./ListViewTable.css";
import Fuse from 'fuse.js'
import { Check, Circle } from '@mui/icons-material';
import { COMPILER_NAMES } from 'next/dist/shared/lib/constants';

/*
    Filters:

    // Filter by attr in {}

    // All rows
    const [rows, setRows] = useState([]);

    // Store ids of filtered/selected rows
    const [selectedRows, setSelectedRows] = useState([]);

    const selectRows = (field, value) => {
        setSelectedRows(prevSelectedRows => 
                rows
                    .filter(rowValue => rowValue[field] === value)
                    .map(row => row.id)
            );
    }

    // Sort by
        - Choose field names

    <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
        disableSelectionOnClick
        experimentalFeatures={{ newEditingApi: true }}
        autoHeight={true}
        autoPageSize={true}
        onSelectionModelChange={(ids) => {
          setSelectedRows(ids);
        }}
        selectionModel={selectedRows}    
    />

*/


const ListViewTable = ({ rows, columns, sortModel, setSortModel }) => {

    // const search = (searchQuery, rows) => {
    //     // Get all values from each object property except ID
    //     // rows.filter(e => Object.values(e.pop('id')).includes(query));
        
    //     // Remove the 'id' property, and get the remaining keys
    //     // (these are the column names)
    //     const { id, ...rest } = rows[0];
    //     const fuse = new Fuse(rows, {keys: Object.keys(rest)})
    //     // Remove the 'refIndex' and 'score' properties from the search results
    //     //, yielding the original row objects
    //     const result = fuse.search(searchQuery)
    //                        .map(({ refIndex, score, ...rows}) => rows)
    //     return result;
    // }

    // // const [sortModel, setSortModel] = useState([]);
    // /**
    //  * sortCriteria: must be in the form 'colName;asc' (column name, ';', then sorting strategy)
    //  */
    // const sort = (sortCriteria) => {
    //     // // Valid sorting criteria
    //     // const validCriteria = {
    //     //     'alph': 'Alphabetical',
    //     //     'rAlph': 'Reverse alphabetical',
    //     //     'tAsc': ''
    //     // }

    //     // // Sort by 
    //     // Get the field + sort strategy selected by user from button value (colName)
    //     const [colName, strategy] = sortCriteria.split(';')

    //     // Create a sorting model that sorts by that field
    //     const sortModel = [{ field: colName, sort: strategy}];
        
    //     // Set as the sorting model
    //     setSortModel(sortModel);
    // }


    // const rows = [
    //     { id: 1, col1: 'Hello', col2: 'World' },
    //     { id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
    //     { id: 3, col1: 'MUI', col2: 'is Amazing' },
    //   ];

    // const iconColumnType = {
    //     resizable: false,
    //     filterable: false,
    //     sortable: false,
    //     editable: false,
    //     groupable: false,
    //     display: 'flex',
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     renderCell: (params) => <Circle color="disabled" sx={{fontSize: 8}}/>
    // }
    // const columns = [
    //     // { field: 'col1', headerName: 'Column 1', width: 150 },
    //     // { field: 'icon', headerName: '', minWidth: 25, width: 25, ...iconColumnType},
    //     { field: 'col1', headerName: 'Column 1', flex: 1, headerClassName: 'column-header' },
    //     // { field: 'col2', headerName: 'Column 2', width: 150 },
    //     { field: 'col2', headerName: 'Column 2', flex: 1 },
    // ];

    console.log('sortModel in table: ', sortModel);

    return (
        <div 
            style={{ 
                height: 300, 
                width: '100%', 
                // border: '2px solid green' 
            }}>
            <DataGrid 
                rows={rows} 
                columns={columns} 
                columnHeaderHeight={40}
                sortModel={sortModel}
                onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
                // autoHeight
                // autoPageSize
                // pagination
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 5 }
                    }
                }}
                sx={{
                    borderRadius: 3,
                    // backgroundColor: 'rgb(253, 253, 255)'
                    backgroundColor: 'rgb(254,254,254)',
                    '& .MuiDataGrid-columnHeader': {
                        backgroundColor: 'rgb(245, 246, 248)',
                        color: 'rgb(130, 136, 151)',
                        border: 'none',
                        // borderRadius: 3
                        // height: '40px'
                    },
                    // Applying border radius to whole table header by targeting
                    // first and last cell in header
                    '& .MuiDataGrid-columnHeaders': {
                        '& :nth-child(1 of .MuiDataGrid-columnHeader)': {
                            borderBottomLeftRadius: 10,
                            borderTopLeftRadius: 10
                        },
                        [`& :nth-child(${columns.length} of .MuiDataGrid-columnHeader)`]: {
                            borderTopRightRadius: 10,
                            borderBottomRightRadius: 10
                        },
                    },
                    // }
                    // '& .MuiDataGrid-columnHeader[aria-colindex=1]': {
                    //     backgroundColor: 'blue',
                    //     border:2,
                    //     borderColor: 'green'
                    // },
                    '& .MuiDataGrid-columnHeaderTitle': {
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        // lineHeight: '40px'
                    },
                    // TODO: make table (and its child elements) transparent,
                    // then apply glassmorphic effect
                    '& .MuiDataGrid-virtualScrollerContent *': {
                        background: 'transparent',
                    },
                    '& .MuiDataGrid-filler *': {
                        background: 'transparent',
                    },
                    '& .MuiDataGrid-bottomContainer *': {
                        background: 'transparent',
                    },
                    '& .MuiDataGrid-footerContainer *': {
                        background: 'transparent',
                    },
                    '& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell': {
                        backgroundColor: 'transparent'
                    }
                }}
            />
        </div>
    );
}

export default ListViewTable;
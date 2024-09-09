"use client"
import React, { useMemo, useState, useEffect } from "react";
import { Box, Button, Typography, Tooltip, IconButton } from "@mui/material";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import StretchyDataGrid from "./StretchyTable(test)";
import {
    AccountBoxSharp,
    LensTwoTone,
    PanoramaFishEyeSharp,
} from "@mui/icons-material";
import { grey } from "@mui/material/colors";
import { Delete } from "@mui/icons-material";

const DeleteCell = ({ onClick, ...props }) => {
    return (
        <Tooltip title="Delete row">
            <IconButton onClick={onClick}>
                <Delete />
            </IconButton>
        </Tooltip>
    );
};

const InsertRowButton = ({ onClick, ...props }) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "start",
                ml: 2,
            }}
        >
            <Button onClick={onClick}>Add new row</Button>;
        </Box>
    );
};

function CreateExpenseTable({ values, setValues, ...props }) {
    // TODO: get data from Redux store/API
    // TODO: move this logic outside this component

    // Transform API data into format required by DataGrid
    // const apiData = expenseData.line_items.map((el, index) => ({
    //     ...el,
    //     id: index + 1,
    // }));

    console.log("values passed in to CreateExpenseTable: ", values);
    console.log("Value setter passed to CreateExpenseTable: ", setValues);

    const expenseData = [
        {
            id: 1,
            expenseAccount: "Materials",
            description: "Bought materials",
            fund: "General",
            amount: "250",
        },
        {
            id: 2,
            expenseAccount: "Stationery",
            description: "Rymans supplies",
            fund: "Administration",
            amount: "54.20",
        },
    ];
    const funds = ["General", "Administration", "Charitable"];
    const accounts = ["Materials", "Jobs", "Finance"];

    // Function wrapping the state variable setter 'setValues' and
    // restricting modifications to the nested key 'line_items'
    // Credit: Adapted from GitHub Copilot response
    const setRows = (callback) => {
        const lineItems = values.line_items;
        setValues((prevValues) => {
            const newValues = callback(lineItems);
            return {
                ...prevValues,
                line_items: newValues,
            };
        });
    };

    // const setRows = (newValue) => {
    //     const lineItems = values.line_items;
    //     setValues({
    //         ...values,
    //         line_items: newValue,
    //     });
    //     return
    // };

    // const [rows, setRows] = useState(expenseData);
    const [fundOptions, setFundOptions] = useState(funds);
    const [accountOptions, setAccountOptions] = useState(accounts);

    const rowHeaders = ["id", "dr_account", "description", "fund", "amount"];
    const generateRow = () => {
        const row = Object.fromEntries(rowHeaders.map((key) => [key, ""]));
        row.id = values.line_items.length + 1;
        console.log("generated row: ", row);
        return row;
    };

    const handleInsert = () => {
        // TODO: get this data from elsewhere
        // const rowHeaders = Object.keys(rows[0]);

        console.log("Old row values: ", values);

        setRows(
            (prevRows) => [
                // setValues((prevRows) => ({
                //     ...prevRows,
                // line_items: [
                ...prevRows,
                // ...prevRows.line_items,
                // Add an object with the row headers and empty string values,
                // which represents an empty row
                // Object.fromEntries(rowHeaders.map((key) => [key, ""])),
                // Object.fromEntries(rowHeaders.map((key) => [key, ""])),
                generateRow(),
            ]
            // }
            // )
        );

        console.log("New row values: ", values);
    };

    const handleUpdate = (e, rowIndex, colIndex) => {
        setRows((prevRows) => {
            prevRows[rowIndex][colIndex] = e.target.value;
            return prevRows;
        });
    };

    // Credit: solution from https://stackoverflow.com/a/73141133
    const handleDelete = (e, selectedRow) => {
        // e.stopPropagation() ?
        setRows((prevRows) => {
            // if (prevRows.length > 1) {
            //     console.log("Length: ", prevRows.length);
            return prevRows.filter((row, index) => row.id !== selectedRow.id);
            // }
        });
    };

    let poundFormatter = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
    });

    // TODO: validate that max. dp is 2, and max. sig figs are 19, per the
    // database model
    const columns = useMemo(
        () => [
            {
                id: 1,
                field: "dr_account",
                headerName: "Expense Account",
                editable: true,
                type: "singleSelect",
                valueOptions: accountOptions,
                flex: 1.5,
            },
            {
                id: 2,
                field: "description",
                headerName: "Description",
                flex: 1.5,
                editable: true,
            },
            {
                id: 3,
                field: "fund",
                headerName: "Fund",
                type: "singleSelect",
                valueOptions: fundOptions,
                editable: true,
                flex: 1,
            },
            {
                id: 4,
                field: "amount",
                type: "number",
                valueFormatter: (params) => poundFormatter.format(params.value),
                headerName: "Amount",
                editable: true,
                flex: 1,
                // // TODO: currency formatting
                // renderCell:(params) => '£' + params.row.amount,
            },
            {
                id: 5,
                field: "actions",
                // headerName: "actions",
                headerName: "",
                flex: 0.5,
                renderCell: (params) => (
                    <DeleteCell
                        onClick={(e) => handleDelete(e, params.row)}
                        {...{ params }}
                    />
                ),
            },
            // TODO: use this to hide any extraneous fields in API response
            // {
            //     field: '_id',
            //     hide: true
            // }
        ],
        // [fundOptions, accountOptions]
        []
    );

    if (!setValues) return <Typography>Loading...</Typography>;

    // // From https://mui.com/x/react-data-grid/row-height/#row-spacing
    // const getRowSpacing = React.useCallback((params) => {
    //     return {
    //         top: params.isFirstVisible ? 0 : 5,
    //         bottom: params.isLastVisible ? 0 : 5,
    //     };
    // }, []);

    return (
        <Box
            sx={{
                // height: 400,
                width: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* <Typography
                variant="h3"
                component="h3"
                sx={{
                    textAlign: "center",
                    mt: 3,
                    mb: 3,
                }}
            >
                Expense table
            </Typography> */}
            <DataGrid
                editMode="row"
                // rows={rows}
                rows={values.line_items}
                columns={columns}
                disableColumnMenu
                // hideFooter
                autoHeight
                pageSize={5}
                // getRowSpacing={getRowSpacing}
                // getRowId={(row) => row.description}
                // TODO: checkboxSelection on list Expenses page
                // and 'paginationMode' server

                // sx={{
                //     "& .MuiDataGrid-row": {
                //         borderTopColor: "yellow",
                //         borderTopStyle: "solid",
                //     },
                // }}

                // TODO: add a border (maybe white if dark theme)
                sx={{
                    [`& .${gridClasses.row}`]: {
                        // bgcolor: (theme) =>
                        //     theme.palette.mode === "light"
                        //         ? grey[200]
                        //         : grey[900],
                        // borderColor: grey[200],
                    },
                }}
                slots={{
                    footer: InsertRowButton,
                }}
                slotProps={{
                    footer: {
                        onClick: handleInsert,
                    },
                }}
                processRowUpdate={(updatedRow, originalRow) => {
                    console.log("Updated row: ", updatedRow);
                    console.log("Original row: ", originalRow);

                    setRows((prevRows) => {
                        return prevRows.map((item) => {
                            if (item.id === updatedRow.id) {
                                return updatedRow;
                            }
                            return item;
                        });
                    });

                    return updatedRow;
                }}
                {...props}
                // TODO: delete this - doesn't work
                // onEditCellChangeCommitted={(params) => {
                //     const { id, field, props } = params;
                //     const newValue = props.value;

                //     setRows((prevRows) => {
                //         return prevRows.map((item) => {
                //             if (item.id === id) {
                //                 return { ...item, [field]: newValue };
                //             }
                //             return item;
                //         });
                //     });

                //     console.log("Edited values: ", values);
                // }}
            />
        </Box>
    );
}
export default CreateExpenseTable;

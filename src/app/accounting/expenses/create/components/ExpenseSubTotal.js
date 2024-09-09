"use client"
import React, { useState, useMemo } from "react";
import { Box, Typography, TextField, MenuItem } from "@mui/material";
import { DataGrid, gridClasses } from "@mui/x-data-grid";

function ExpenseSubtotal({ values, setValues }) {
    let _values = { line_items: [{ amount: 10 }, { amount: 20 }] };

    const taxRates = [
        { id: 1, name: "Standard", rate: 0.2 },
        { id: 2, name: "Reduced", rate: 0.05 },
        { id: 3, name: "Zero-rated", rate: 0 },
        { id: 4, name: "Exempt", rate: 0 },
    ];

    console.log("Line items used in table: ", values);

    const [selectedTaxRate, setSelectedTaxRate] = useState(1);
    const getSubtotal = () =>
        values.line_items.reduce((acc, item) => (acc += item.amount), 0);
    // const getTax = () => getSubtotal() * taxRates[selectedTaxRate];
    const getTax = () =>
        getSubtotal() * taxRates.find((e) => e.id === selectedTaxRate).rate;
    const getTotal = () => getSubtotal() + getTax();

    // TODO: for autocomplete, ensure getOptionLabel is => e.name, and value is id
    const changeTaxRate = (e) => setSelectedTaxRate(e.target.value);

    console.log("If values are: ", JSON.stringify(_values));
    console.log("Then totals are: ", getSubtotal(), getTax(), getTotal());

    const totals = [
        // { id: 1, name: "Subtotal", amount: "7.50" },
        { id: 1, name: "Subtotal", amount: getSubtotal() },
        // { id: 2, name: "Tax", tax: "Standard", amount: "5.00" },
        { id: 2, name: "Tax", tax: "Standard", amount: getTax() },
        // { id: 3, name: "Total", amount: "12.50" },
        { id: 3, name: "Total", amount: getTotal() },
    ];

    const taxes = ["Standard", "Reduced", "Zero-rated", "Exempt"];

    // TODO: code duplicated from ExpenseTableFINAL.js - refactor
    let poundFormatter = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
    });

    const columns = useMemo(
        () => [
            { id: 1, field: "blank", flex: 2 },
            {
                id: 1,
                field: "name",
                flex: 1,
                renderCell: (params) => <strong>{params.value}</strong>,
            },
            {
                id: 2,
                type: "singleSelect",
                field: "tax",
                valueOptions: taxRates,
                getOptionValue: (value) => value.id,
                getOptionLabel: (value) => value.name,
                editable: true,
                flex: 1,
                // renderCell: (params) =>
                //     params.row.name === "Tax" && (
                //         <TextField
                //             select
                //             value={selectedTaxRate}
                //             onChange={(e) => changeTaxRate(e, params.value)}
                //         >
                //             {taxes.map((tax, i) => (
                //                 <MenuItem key={tax.id} value={tax.id}>
                //                     {tax.name}
                //                 </MenuItem>
                //             ))}
                //         </TextField>
                //     ),
            },
            {
                id: 3,
                field: "amount",
                type: "number",
                valueFormatter: (params) => poundFormatter.format(params.value),
                flex: 1,
                align: "right",
                // renderCell: (params) => (
                //     {params.row === "<Box sx={{ borderTop: 2 }}>
                //         <Typography>{params.value}</Typography>
                //     </Box>
                // ),
            },
            { id: 2, field: "blank2", flex: 0.5 },
        ],
        []
    );

    return (
        <DataGrid
            editMode="row"
            rows={totals}
            columns={columns}
            autoHeight
            pageSize={3}
            hideFooter
            columnHeaderHeight={0}
            sx={{
                border: 0,
                // fontWeight: "bold",
                "& .MuiDataGrid-cell": {
                    border: 0,
                },
                "& .MuiDataGrid-columnHeaders": {
                    border: 0,
                },
                "& .MuiDataGrid-root": {
                    border: 0,
                },
            }}
            processRowUpdate={(updatedRow, originalRow) => {
                // TODO: update tax and subtotal here, IF row is tax
                if (updatedRow.name === "Tax") {
                    // setSelectedTaxRate(
                    //     taxRates.find((e) => e.id === updatedRow.tax)
                    // );
                    setSelectedTaxRate(updatedRow.tax);

                    // console.log("Updated tax row: ", updatedRow);
                    // console.log("Original tax row: ", originalRow);
                    // console.log("Tax rate selected: ", selectedTaxRate);
                    // console.log("Tax rate selected: ", taxRates[selectedTaxRate]);
                    // console.log("Tax rate selected: ", taxRates[selectedTaxRate].rate);
                    // console.log("Tax rate selected: ", taxRates[selectedTaxRate].name
                }
            }}
        />
    );
}

export default ExpenseSubtotal;

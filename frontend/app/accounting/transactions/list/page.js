import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import * as React from "react";

import BasicTable from "@/components/basicTable";
import BasicBreadcrumbs from "@/components/Breadcrumb";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

const ListTransactions = () => {
    const headers = [
        { id: 1, name: "date" },
        { id: 2, name: "description" },
        { id: 3, name: "account" },
        { id: 4, name: "debit" },
        { id: 5, name: "credit" },
        { id: 6, name: "fund" },
        { id: 7, name: "project" },
    ];
    const data = [
        {
            id: 1,
            date: "01/01/2002",
            description: "monthly payroll",
            account: "Wages",
            debit: 10000,
            fund: "General",
            project: "Education Fund",
        },
        {
            id: 2,
            date: "01/01/2012",
            description: "monthly payroll",
            account: "Wages",
            credit: 10000,
            fund: "General",
            project: "Education Fund",
        },
    ];
    const breadcrumbs = ["Accounting", "Journals"];

    return (
        <Container>
            <BasicBreadcrumbs my={4} breadcrumbs={breadcrumbs} />
            <Box
                sx={{
                    marginTop: 4,
                    marginBottom: 4,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
            >
                <Typography variant="h5">Journals</Typography>
                <Box>
                    <Button variant="outlined">Import Transactions</Button>
                    <Button>
                        <AddIcon />
                        Add Journal
                    </Button>
                </Box>
            </Box>
            <BasicTable data={data} headers={headers} />
        </Container>
    );
};

export default ListTransactions;

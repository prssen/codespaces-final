import { Typography, Paper } from "@mui/material";
import BasicTable from "@/components/basicTable";

const ProjectTransactions = ({ data, headers, ...props }) => {
    return (
        <>
            <Paper sx={{ p: 2, elevation: 2 }}>
                <Typography variant="h5">Transactions</Typography>
                <BasicTable data={data} headers={headers} notJournals />
            </Paper>
        </>
    );
};

export default ProjectTransactions;

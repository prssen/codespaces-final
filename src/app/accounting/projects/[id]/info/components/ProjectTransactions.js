import { Typography, Paper } from "@mui/material";
// import BasicTable from "../../BasicTable";
import BasicTable from "@/components/BasicTable";

const ProjectTransactions = ({ data, headers, ...props }) => {
    return (
        <>
            <Paper sx={{ p: 2, elevation: 2, ...props?.sx }} {...props}>
                {/* <Typography variant="h5">Recent Transactions</Typography> */}
                <BasicTable data={data} headers={headers} notJournals />
            </Paper>
        </>
    );
};

export default ProjectTransactions;
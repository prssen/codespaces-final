import { List, Paper, Typography } from "@mui/material";
import ProjectImpactItem from "./projectImpactItem";

// Adapted from https://mui.com/material-ui/react-list/
const ProjectImpact = ({ data, ...props }) => {
    return (
        <Paper sx={{ p: 2, elevation: 2 }}>
            <Typography variant="h5">Project impact</Typography>
            <List sx={{ width: "100%", bgcolor: "background.paper" }}>
                {data.map((item, index) => (
                    <ProjectImpactItem {...item} />
                ))}
            </List>
        </Paper>
    );
};

export default ProjectImpact;

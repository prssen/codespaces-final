import { Typography, Button, Box } from "@mui/material";

const ProjectTitle = (props) => {
    const { tabValue, index, ...other } = props;

    return (
        <>
            {tabValue === index && (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                    }}
                >
                    <Typography>Cambodia Project 2021-24</Typography>
                    <Button variant="text" sx={{ alignSelf: "flex-end" }}>
                        Edit
                    </Button>
                </Box>
            )}
        </>
    );
};

export default ProjectTitle;

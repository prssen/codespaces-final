import { Box, Typography, Button } from "@mui/material";

const ProjectSubtitle = (props) => {
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
                    <Typography>
                        Early years education Programme: Northern Cambodia
                    </Typography>
                    <Button variant="text" sx={{ alignSelf: "flex-end" }}>
                        Edit
                    </Button>
                </Box>
            )}
        </>
    );
};

export default ProjectSubtitle;

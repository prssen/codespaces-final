import { Box, Grid, Paper, TextField, Typography, Avatar } from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

const ProjectUpdates = (props) => {
    /*
        Soft dividers between title and description, with grayed 'Title/Description' promps
        Card for each update with Blockquote vertical divider inset on RHS,
            small but bold title just below top of blockquote divider, and description below (lots of padding)
        Side pane, running down entire editable text field, with grayed out + add icon
            And 'Add media' button at the bottom
        Inspired by https://global.discourse-cdn.com/turtlehead/original/2X/1/14cbe02bf33c86a1d8862866176079c60d3cab47.png,
            https://dribbble.com/tags/updates-ui
            https://cdn.dribbble.com/users/126876/screenshots/9697603/media/97ad7a5130e198ee1ab360599bdf92e2.jpg?resize=400x0
            https://i.pinimg.com/originals/5b/47/a7/5b47a70d40b97f541fbc91bcb1026159.png

    */
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
                    <Typography variant="h6">New Update</Typography>
                    <Paper sx={{ my: 1, p: 2, elevation: 2 }}>
                        <Grid container>
                            <Grid item xs={8}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    <TextField
                                        id="standard-basic"
                                        placeholder="Title"
                                        variant="standard"
                                    />
                                    <TextField
                                        id="standard-multiline-static"
                                        multiline
                                        rows={4}
                                        placeholder="Enter content here"
                                        variant="standard"
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Box sx={{ height: "100%", padding: 3 }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            p: 2,
                                            height: "100%",
                                            width: "100%",
                                            borderStyle: "dashed",
                                            borderColor: "lightgray",
                                            borderRadius: 3,
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            sx={{ color: "lightgray" }}
                                        >
                                            Media upload
                                        </Typography>
                                        <CloudUploadOutlinedIcon
                                            style={{ color: "lightgray" }}
                                        />
                                        <input type="file" hidden />
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                    <Typography variant="h6">Previous updates</Typography>
                    <Paper
                        sx={{
                            my: 1,
                            p: 2,
                            elevation: 2,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Box>
                            <Typography>First update</Typography>
                            {/* <Box
                                sx={{
                                    borderLeft: 2,
                                    height: "80%",
                                    mx: "auto",
                                    width: 1,
                                    alignSelf: "center",
                                    borderColor: "text.secondary",
                                }}
                            /> */}
                            {/* <Divider orientation="vertical" sx={{ pr: 1, height: '100%'}} flexItem/> */}
                            <Typography variant="body2">
                                Lorem ipsum ...
                            </Typography>
                        </Box>
                        <Avatar />
                    </Paper>
                </Box>
            )}
        </>
    );
};

export default ProjectUpdates;

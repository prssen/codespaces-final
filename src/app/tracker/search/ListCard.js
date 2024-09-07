import React from "react";
// import { Avatar, Typography, Box, Paper } from "@mui/material";
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// import { grey } from '@mui/material/colors';

function ListCard({
    title,
    subtitle,
    rightDetail,
    rightDetailTitle,
    rightDetailSubtitle,
    styles,
    text,
    photoURL,
    altText,
    ...props
}) {
    return (
        // <Paper padding={2} sx={{ marginBottom: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 2,
                    
                    // marginBottom: 2,
                    // borderTop: 1,
                    // borderBottom: 1,
                    // borderColor: grey[300]
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
                    <Avatar
                        alt={altText || "Random photo"}
                        src={photoURL || "/static/images/avatar/1.jpg"}
                        sx={{
                            height: 80,
                            width: 80,
                            // border: 1
                        }}
                        variant="rounded"
                    />
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "baseline",
                            // justifyContent: "flex-end",
                            justifyContent: "center",
                            mx: 2,
                        }}
                    >
                        <Typography
                            // mx={2}
                            sx={{
                                marginBottom: 0.5,
                                textAlign: 'left',
                            }}
                            {...styles?.title}
                        >
                            {title}
                        </Typography>
                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{
                                marginBottom: 0.3,
                            }}
                            {...styles?.subtitle}
                        >
                            {subtitle}
                        </Typography>
                        <Typography variant="body2" paragraph sx={{marginBottom: 0.3}}>
                            {text}
                        </Typography>
                    </Box>
                </Box>
                {rightDetail || (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <Typography variant="subtitle1">
                            {rightDetailSubtitle}
                        </Typography>
                        <Typography variant="h5">{rightDetailTitle}</Typography>
                    </Box>
                )}
            </Box>
        // </Paper>
    );
}

export default ListCard;

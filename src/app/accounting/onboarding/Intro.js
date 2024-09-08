import { Image } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import React from "react";
// import AccountingIllustration from "../../assets/accounting-illustration-3.png";
import AccountingIllustration from "public/images/accounting-illustration-3.png";

// Credit: Accounting illustration from https://pngtree.com/freepng/finance_5418202.html
const Intro = () => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                // width: "60%",
                margin: 2,
                gap: 1,
                padding: 2,
            }}
        >
            <Box
                component="img"
                sx={{ height: 200, width: 200 }}
                alt="Accounting illustration"
                src={AccountingIllustration.src}
            />
            <Typography variant="h5" fontWeight="bold">
                Welcome to AccountTrack!
            </Typography>
            <Typography>
                Let's get started by creating your charity's account
            </Typography>
        </Box>
    );
};

export default Intro;

import * as React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import DirectionsIcon from "@mui/icons-material/Directions";

// Code adapted from https://mui.com/material-ui/react-text-field/#using-the-theme-style-overrides-api
export default function SearchBar() {
    return (
        <Paper
            variant="outlined"
            component="form"
            sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: 350,
            }}
        >
            <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search here..." />
            <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
                <SearchIcon />
            </IconButton>
        </Paper>
    );
}

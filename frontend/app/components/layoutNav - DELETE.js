"use client";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

import Sidebar from "@/components/sidebar - DELETE/sidebar";
import {
    AppBar,
    Avatar,
    Toolbar,
    Typography,
    Box,
    useTheme,
} from "@mui/material";

const LayoutNav = ({ children }) => {
    const theme = useTheme();

    const drawerWidth = 150;

    return (
        <>
            <Box sx={{ display: "flex", border: 2, borderColor: "green" }}>
                <AppBar
                    position="fixed"
                    sx={{
                        width: `calc(100% - ${drawerWidth}px)`,
                        ml: `${drawerWidth}px`,
                        zIndex: theme.zIndex.drawer + 1,
                    }}
                >
                    <Toolbar>
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{ flexGrow: 1 }}
                        >
                            AccountTrack
                        </Typography>
                        <Avatar />
                    </Toolbar>
                </AppBar>
                <Box component="nav">
                    <Sidebar width={drawerWidth} />
                </Box>
                <Box
                    component="main"
                    className={inter.className}
                    sx={{ flex: 1, p: 3, border: 2, m: 15 }}
                >
                    {children}
                </Box>
            </Box>
        </>
    );
};

export default LayoutNav;

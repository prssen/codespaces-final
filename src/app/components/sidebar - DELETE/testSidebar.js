// import Sidebar from "./Sidebar";
// import {
//     AppBar,
//     Avatar,
//     Toolbar,
//     Typography,
//     Box,
//     useTheme,
// } from "@mui/material";
// import CreateTransaction from "../CreateTransactionModal/CreateTransactionModal";
// import CreateAccount from "../Modals/CreateAccount/CreateAccount";

// const TestSidebar = () => {
//     const theme = useTheme();

//     const drawerWidth = 150;

//     /*
//     TODO: change layout to <Sidebar /> then <Box className={styles.main}>
//                                                 <AppBar />, full width
//                                                 <Main />
//                                             <CssBaseline /> // from https://www.youtube.com/watch?v=-XKaSCU0ZLM
//     */

//     return (
//         <Box sx={{ display: "flex", border: 2, borderColor: "green" }}>
//             <AppBar
//                 position="fixed"
//                 sx={{
//                     width: `calc(100% - ${drawerWidth}px)`,
//                     ml: `${drawerWidth}px`,
//                     zIndex: theme.zIndex.drawer + 1,
//                 }}
//             >
//                 <Toolbar>
//                     <Typography
//                         variant="h6"
//                         component="div"
//                         sx={{ flexGrow: 1 }}
//                     >
//                         AccountTrack
//                     </Typography>
//                     <Avatar />
//                 </Toolbar>
//             </AppBar>
//             <Box component="nav">
//                 <Sidebar width={drawerWidth} />
//             </Box>
//             <Box component="main" sx={{ flex: 1, p: 3, border: 2, m: 15 }}>
//                 {/* <CreateTransaction /> */}
//                 <CreateAccount />
//             </Box>
//         </Box>
//     );
// };

// export default TestSidebar;

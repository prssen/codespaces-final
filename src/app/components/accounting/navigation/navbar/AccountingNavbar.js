"use client"

import { AppBar, Toolbar, Box, Badge, Typography, IconButton, Avatar, Divider } from "@mui/material";
// import ChangeCharityPopover from "../Components/ChangeCharityPopover";
import ChangeCharityPopover from "./ChangeCharityPopover";
import { Mail, Settings, Logout, MenuOutlined } from "@mui/icons-material";
// import { useNavigate } from "react-router-dom";
import { useRouter } from "next/navigation";
import { useContext, useEffect , useState, useCallback } from "react";
// import { Context } from "../services/context/ContextProvider";
import { Context } from "@/lib/context/ContextProvider";
// import { useLogout, useGetCharity, useChangeCharity } from "../Hooks/useApi";
import { useLogout, useGetCharity, useChangeCharity, useGetNotifications } from "@/lib/hooks/useApi";
import { StyledAvatar } from "@/components/StyledAvatar";
import StyledPopover from "@/components/StyledPopover";
import ThemeModeToggle from "@/components/ThemeModeToggle";
import { useTheme } from "@mui/material";
import Loading from "@/components/Loading";
import { blue, grey } from "@mui/material/colors";
import SearchBar from "@/components/SearchBar";
import NotificationContent from "@/components/accounting/navigation/navbar/NotificationContent";

import Person2OutlinedIcon from '@mui/icons-material/Person2Outlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';

const AccountingNavbar = ({ toggleDrawer, searchBarOptions }) => {

    console.log('Search bar options: ', searchBarOptions);

    const theme = useTheme();
    // let navigate = useNavigate();
    let router = useRouter();
    const { state, dispatch } = useContext(Context);

    const [selectedCharityUUID, setSelectedCharityUUID] = useState(null);

    // Temporary workaround - commponent seems not be updated when global state
    // in React Context changes; so storing it in a local state variable instead
    const [loggedIn, setLoggedIn] = useState(state.loggedIn);
    useEffect(() => {
        setLoggedIn(state.loggedIn);
    }, [state.loggedIn]);

    const { mutate: logout, isError, isLoading, error } = useLogout();
    const { data: charities, isError: isCharitiesError, isLoading: isCharitiesLoading, error: charitiesError } = useGetCharity();
    const { data: profileCharities, refetch } = useChangeCharity(selectedCharityUUID);

    const notifications = useGetNotifications();
    console.log('Notification data: ', notifications.data);

    // // Automatically get new charity when state variable changes
    // // Credit for approach: AI response
    // useEffect(() => refetch(selectedCharityUUID), [selectedCharityUUID])

    // const changeCharity = useCallback((params) => refetch(params), [params]);

    const onLogout = () => {
      logout();
      dispatch({ type: 'LOGOUT' });
      // TODO: remove this when routes are behind authentication guards, so
      // redirection happens automatically
        // navigate('/accounting/login');
        router.push('/accounting/auth');

      // console.log('New loggedIn state is: ', state.loggedIn)
      console.log('New loggedIn state is: ', loggedIn)
      console.log('Logged out!')
    }
  
    const onLogin = () => {
      dispatch({ type: 'OPEN_LOGIN'});
    }

    // const AvatarComponent = () => <StyledAvatar sx={{
    //     borderRadius: '50%',
    //     backgroundColor: '#e7f3fd',
    //     height: '40px',
    //     width: '40px',
    //     marginRight: 1,
    // }}/>

    /* TODO: find a way to memoise callback with useCallback */
    const charityData = !isCharitiesLoading && !isCharitiesError && charities.map((charity, i) => {
        return {
            ...charity,
            // callback : () => refetch(charity.uuid)
            callback: () => {
                setSelectedCharityUUID(charity.uuid);
                console.log('New charity selected: uuid - ', charity.uuid);
            }
            // callback: () => console.log('Testing charity selector callback!')
        }
    });
    console.log('Charity data for navbar with callbacks: ', charityData);

    const [anchorEl, setAnchorEl] = useState(null);
    const handleNotificationClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
    const handleSettingsClick = (event) => {
        setSettingsAnchorEl(event.currentTarget);
    }

    const settingsThemeModeOption = <ThemeModeToggle 
        sx={{ 
            '& .MuiSwitch-thumb' : { 
                border: 1,
                borderColor: 'green',
                boxShadow: "0px 2px 1px -1px rgba(0,0,0,0.2)" 
            }
        }}/>
    const settingsOptions = [
        {name: theme.palette.mode === 'light' ? 'Dark mode' : 'Light mode', icon: settingsThemeModeOption },
        {name: 'User settings', icon: <Person2OutlinedIcon />, callback: () => router.push('/accounting/settings/user') },
        {name: 'Charity settings', icon: <BusinessOutlinedIcon />, callback: () => router.push('/accounting/settings/charity') },
    ];

    // const NotificationContent = () => <Typography>Testing menu</Typography>

    return (
        <AppBar
                color="inherit"
                position="fixed"
                elevation={0}
                sx={{
                    top: 0,
                    width: `calc(100% - 105}px)`,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(5px)',
                    // ml: `${150}px`,
                    zIndex: theme.zIndex.drawer + 1,
                    border: 1,
                    borderColor: grey[200]
                    // TODO: find out why height is too big w/o this value, and
                    // set dynamically/responsively
                    // height: '60px',
                    // zIndex: 1000,
                    // border: 0,
                    // elevation: 0,
                }}
            >
                <Toolbar>
                {/* <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        width: "80px",
                        my: 2,
                    }}
                >
                    <IconButton onClick={toggleDrawer}>
                        <MenuOutlined />
                    </IconButton>
                </Box> */}
                    {/* <Typography 
                        variant="h6"
                        sx={{
                            fontWeight: 'bold',
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            // background: #4339CF;
                            // background: linear-gradient(to right, #4339CF 0%, #00FF00 50%, #CACF39 100%)
                            backgroundImage: '-webkit-linear-gradient(rgba(222, 53, 76, 0.8), rgba(226, 123, 27, 0.8))'
                        }}
                    >
                        AA
                    </Typography> */}
                    <Typography
                        variant="h6"
                        component="div"
                        // sx={{ flexGrow: 1 }}
                    >
                        AccountTrack
                    </Typography>
                    <IconButton sx={{
                        marginRight: -0.5,
                        marginLeft: 5,
                    }}
                        onClick={toggleDrawer}
                    >
                        <MenuOutlined />
                    </IconButton> 
                    <SearchBar 
                        sx={{width: '25%', height: '75%', ml: 3, p: 1}}
                        // textInputStyles={{backgroundColor: 'blue.100'}}
                        textInputStyles={{backgroundColor: 'transparent', border: 1, borderColor: 'grey.200'}}
                        ListboxProps={{ style: { maxHeight: '30px' }}}
                        // options={searchBarOptions}
                        textFieldProps={{
                            placeholder: 'Search website here...'
                        }}
                    />
                    <Box sx={{ flexGrow: 1 }} />
                    <Box>
                        {/* Code adapted from https://mui.com/material-ui/react-app-bar/#app-bar-with-a-primary-search-fiel */}
                        <IconButton
                            size="large"
                            sx={{
                            //     borderRadius: '50%',
                            //     backgroundColor: '#e7f3fd',
                            //     height: '40px',
                            //     width: '40px',
                                marginRight: 2,
                            }}
                            // color="inherit"
                            onClick={handleNotificationClick}
                        >
                            <Badge badgeContent={notifications?.data?.length || 0} color="error" sx={{transform: 'translate(-5px -5px)'}}>
                                <Mail />
                            </Badge>
                        </IconButton>
                        <StyledPopover 
                            optionsComponent={() => <NotificationContent queryResponse={notifications}/>}
                            anchorEl={anchorEl}
                            setAnchorEl={setAnchorEl}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            PaperProps={{
                                sx: {
                                    // backgroundColor: 'white',
                                    marginTop: -0.25,
                                    borderRadius: 1,
                                    border: 1,
                                    // paddingBottom: 1,
                                    // maxWidth: '256px',
                                    borderColor: 'rgba(222, 224, 229, 0.4)',
                                    boxShadow: '0px 10px 15px -3px rgb(236, 239, 248)',
                                    ...(theme.palette.mode === 'light' && { backgroundColor: 'white'})
                                }
                            }}
                        />

                        {/* <IconButton
                            size="large"
                            // color="inherit"
                            // onClick={openCompanyContextualMenu}
                        >
                            <AccountCircle />{" "}
                        </IconButton> */}
                        {
                            isCharitiesLoading ? <Loading /> : 
                            isCharitiesError ? "Error loading charities " : 
                            <ChangeCharityPopover
                                iconSize="small"
                                icon={loggedIn && StyledAvatar}
                                // TODO: delete 'Select charity' option completely
                                isAvatar
                                slotProps={{
                                    paper: {
                                        sx: {
                                            border: 1,
                                            // borderColor: '#dee0e5',
                                            borderColor: 'rgba(222, 224, 229, 0.4)',
                                            boxShadow: '0px 10px 15px -3px rgb(236, 239, 248)',
                                            ...(theme.palette.mode === 'light' && { backgroundColor: 'white'})
                                        }
                                    }
                                }}
                                // TODO: change API to array of objects if timmem
                                options={
                                    [
                                        // ["Select charity", ...charities],
                                        ["Select charity", ...charityData],
                                        // ["Select charity", "charity A", "charity B", "charity C"], 
                                        <Box sx={{display: 'flex', flexDirection: 'column', marginTop: -2}} key={1}>
                                            <Divider
                                                variant="middle"
                                                sx={{
                                                    opacity: 0.6,
                                                    width: "95%",
                                                    mx: "auto",
                                                    my: 1,
                                                }}
                                            />
                                            <Box sx={{display: 'flex', flexDirection: 'row', gap: 2, marginTop: 1 }} onClick={onLogout}>
                                                <Logout/>
                                                Log out{" "}
                                            </Box>
                                        </Box>
                                    ]
                                }
                            />
                        }
                        <IconButton
                            size="large"
                            // color="inherit"
                            onClick={handleSettingsClick}
                        >
                            {/* {loggedIn ? <Settings /> : <LogoutOutlined />} */}
                            <Settings />
                        </IconButton>
                        <StyledPopover 
                            options={settingsOptions}
                            // options={[]}
                            anchorEl={settingsAnchorEl}
                            setAnchorEl={setSettingsAnchorEl}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            PaperProps={{
                                sx: {
                                    // backgroundColor: 'white',
                                    marginTop: -0.25,
                                    borderRadius: 1,
                                    border: 1,
                                    borderColor: 'rgba(222, 224, 229, 0.4)',
                                    boxShadow: '0px 10px 15px -3px rgb(236, 239, 248)',
                                    ...(theme.palette.mode === 'light' && { backgroundColor: 'white'})
                                }
                            }}
                        />
                    </Box>
                    {/* 
                    TODO: replace profile pic with login button if not logged in,
                    {!loggedIn ? 
                        <IconButton
                            onClick=dispatch{{type: OPEN_LOGINN}}
                        >
                            <Icon
                        </IconButton>
                    :
                        <Avatar 
                            onClick=// Redirect to user-settings/ page
                        />

                    }
                    */}
                </Toolbar>
            </AppBar>
    );
}

export default AccountingNavbar;
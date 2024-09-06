"use client"
import React, { useContext, useState, useEffect, useCallback } from 'react'
import { Box, AppBar, Toolbar, Button, IconButton, Typography, Avatar } from '@mui/material'
// import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useRouter} from 'next/navigation';
import Link from '@/components/NextLink';
import { DeviceHubOutlined, Logout, Settings } from '@mui/icons-material'
import { alpha, createStyles, withStyles } from '@mui/material/styles';
// import ChangeCharityPopover from '../Components/ChangeCharityPopover';
import ChangeCharityPopover from '@/components/accounting/navigation/navbar/ChangeCharityPopover';
import { StyledAvatar } from '@/components/StyledAvatar';

import { useTheme } from '@mui/material/styles';
import { useLogout } from '@/lib/hooks/useApi';

// import { Context } from '../services/context/ContextProvider';
import { Context } from '@/lib/context/ContextProvider';

// const StyledAvatar = styled(Avatar)(({ theme }) => ({
// const styles = () => createStyles({
const styles = {
  // width: 100, // Adjust the size as needed
  // height: 100, // Adjust the size as needed
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -5, // Adjust the distance from the edge
    left: -5, // Adjust the distance from the edge
    width: 'calc(100% + 10px)', // Adjust the size to match the distance
    height: 'calc(100% + 10px)', // Adjust the size to match the distance
    borderRadius: '50%',
    // border: '2px solid #3f51b5', // Adjust the color and thickness of the ring
    // border: '2px solid black',
    border: 'black',
    borderWidth: 2,
    boxSizing: 'border-box',
  },
};

function Navbar() {
  // let navigate = useNavigate();
  const theme = useTheme();
  const router = useRouter();
  const { state, dispatch } = useContext(Context);

  // Temporary workaround - commponent seems not be updated when global state
  // in React Context changes; so storing it in a local state variable instead
  const [loggedIn, setLoggedIn] = useState(state.loggedIn);
  useEffect(() => setLoggedIn(state.loggedIn), [state.loggedIn]);
  
  const { mutate: logout, isError, isLoading, error } = useLogout();

  const onLogout = () => {
    logout();
    dispatch({ type: 'LOGOUT' });
    // console.log('New loggedIn state is: ', state.loggedIn)
    console.log('New loggedIn state is: ', loggedIn)
    console.log('Logged out!')
  }

  const onLogin = () => {
    dispatch({ type: 'OPEN_LOGIN'});
  }

  const onTrackDonationClick = () => {
    // Open auth dialog and redirect to donation history page
    // after successful login
    dispatch({ type: 'OPEN_LOGIN' });
    dispatch({ type: 'ADD_AUTH_CALLBACK', payload: () => router.push('/tracker/donations/list') });
  }

  // const popoverIcon = (props) => state.loggedIn ? 
  const popoverIcon = useCallback((props) => loggedIn ? 
    <StyledAvatar {...props}/> : 
    // <Button onClick={onLogin}>Login</Button>, [loggedIn]);
    <Typography sx={{borderRadius: 5, color: 'primary.main', fontSize: "0.875rem", lineHeight: 1.75, textTransform: 'uppercase', px: '8px' }} onClick={onLogin}>Login</Typography>, [loggedIn]);

  // const avatarGroup = 
  //   <Box sx={{display: 'flex', spacing: 1}}>
  //     <Avatar
  //             sx={{
  //               border: '2px solid green',
  //               height: 35,
  //               width: 35
  //             }} 
  //             src="https://avatar.iran.liara.run/public/5"
  //           />
  //     <BiChevronDown />
  //   <Box />

  return (
    <AppBar
        color="inherit"
        position="static"
        elevation={0}
        sx={{
          background: alpha(theme.palette.background.default, 0.9),
          backdropFilter: 'blur(5px)',
          // marginBottom: 0.5,
        }}
    >
       <Toolbar>
          <IconButton 
            size="large" 
            edge="start"
            aria-label="Home logo button"
            sx={{mr: 3}}
            // onClick={() => navigate('/tracker/home')}
            onClick={() => router.push('/tracker/home')}
          >
              {/* <img src="https://placehold.co/20" alt="Home logo" /> */}
              <DeviceHubOutlined />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            GiveTrack
          </Typography>
          {/* <NavLink to="/"> */}
          <Link href="/">
            {({ isActive }) => {
              <Button 
                // onClick={() => navigate('/')}
                color="inherit" 
                sx={{
                  mx: 1, 
                  '&.Mui-active': isActive ? {backgroundColor: 'lightblue', color: 'white' } :  {}
                  // '&:hover': {color: 'lightgray'}
              }}>
                Find a charity
              </Button>
            }}
          {/* </NavLink> */}
          </Link>
          {/* <Link to={`/history`}> */}
            <Button 
              // onClick={() => navigate('/history')}
              color="inherit" 
              sx={{
                ml: 1, 
                mr: 2,
                background: 'rgb(127,135,252)',
                background: 'linear-gradient(90deg, rgba(127,135,252,1) 0%, rgba(194,152,249,1) 100%) padding-box, conic-gradient(#a869f7, #7f87fc, #a869f7) border-box',
                color: '#fff',
                borderRadius: 10,
                paddingLeft: 1.5,
                paddingRight: 1.5,
                border: 2, 
                borderColor: 'transparent',
              }}
              // onClick={() => navigate('/tracker/history')}
              // onClick={() => router.push('/tracker/history')}
              onClick={onTrackDonationClick}
              >
              Track Donation
            </Button>
          {/* </Link> */}
          <ChangeCharityPopover 
            // icon={<Avatar
            //   sx={{
            //     border: '2px solid green',
            //     height: 35,
            //     width: 35
            //   }} 
            //   src="https://avatar.iran.liara.run/public/5"
            // />}
            isTracker
            // icon={(props) => <StyledAvatar {...props}/>}
            icon={popoverIcon}
            iconStyles={{ borderRadius: 5 }}
            // options={!state.loggedIn ? [] : [
              // options={loggedIn && [
            options={!loggedIn ? [] : [
              <Box sx={{display: 'flex', flexDirection: 'row', gap: 2}} onClick={onLogout}>
                <Logout/>
                Log out{" "}
              </Box>,
              <Box sx={{display: 'flex', flexDirection: 'row', gap: 2}}>
                <Settings />
                Settings{" "}
            </Box>,
            ]}
          />
        </Toolbar> 
    </AppBar>
  )
}

export default Navbar;
"use client"

import React, { useContext, useState } from 'react';
import { Box, Typography } from '@mui/material';
// import AccountingNavbar from './AccountingNavbar';
import AccountingNavbar from '@/components/accounting/navigation/navbar/AccountingNavbar';
import { Context } from '@/lib/context/ContextProvider';
// import { Context } from '../services/context/ContextProvider';
// import TrackerAuthDialog from '../Auth/TestingDialog';

import waveBackground from 'public/images/final_wave.svg';

// import Sidebar from './Sidebar';
import Sidebar from '@/components/accounting/navigation/sidebar/Sidebar';

// import { Outlet, Routes, Route, useLocation } from 'react-router-dom';
import { usePathname } from 'next/navigation';
// import ConfirmDialog from '../Notifications/ConfirmDialog';
import ConfirmDialog from '@/components/accounting/notifications/ConfirmDialog';
// import useReactQuerySubscription from '../Notifications/NotificationConsumer';
import useReactQueryNotifications from '@/lib/hooks/useNotifications';

import { useQueryClient } from 'react-query';
import BasicBreadcrumbs from '@/components/Breadcrumb';
// import useReactQueryNotifications from '@/lib/hooks/useNotifications';
import { getBreadcrumbs } from '@/lib/utils/utils';


export default function AccountingLayout({ children, params }) {
    console.log('Params are: ', params);

    // const location = useLocation();
    const pathname = usePathname();
    // const notLoginPage = location.pathname !== "/accounting/login";
    const notLoginPage = pathname !== "/accounting/auth";
    const { state, dispatch } = useContext(Context);

    const queryClient = useQueryClient();
    const authResponse = queryClient.getQueryData('user');
    // useReactQuerySubscription(authResponse);
    useReactQueryNotifications(authResponse);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const toggleDrawer = () => setDrawerOpen(isDrawerOpen => !isDrawerOpen);
    const handleLoginOpen = () => dispatch({ type: "OPEN_LOGIN", payload: null });
    const handleLoginClose = () => dispatch({ type: "CLOSE_LOGIN", payload: null });

    const handleConfirmClose = () => dispatch({ type: "CONFIRM_CLOSE", payload: null });
    // const handleLoginClose = () => setLoginOpen(false);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                // flexDirection: "row",
                flex: 1,
                height: '130vh',
                width: '100vw',
                backgroundImage: `url(${waveBackground.src})`,
                backgroundSize: 'cover',
                // border: 2,
                // borderColor: "green",
            }}
        >
            {notLoginPage && <AccountingNavbar toggleDrawer={toggleDrawer}/>}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    flex: 1,
                    // border: 1,
                    // borderColor: 'pink'
                }}>

                {notLoginPage && <Box component="nav">
                    <Sidebar
                        // 80 -> 256 (Material UI recommendations)
                        width={drawerOpen ? 256 : 80}
                        handleLogin={handleLoginOpen}
                        // container={document.body} 
                        open={drawerOpen}
                        setOpen={setDrawerOpen}
                    />
                </Box>}
                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        height: '100%',
                        width: '100%',
                        maxWidth: 'none',
                        // backgroundColor: 'green',
                        // p: 1.5,

                        // TODO: fix drawer (should be part of document flow, not overlapping w/ 
                        // this box) and remove this padding
                        py: 3,
                        my: 8,
                        // marginLeft: drawerOpen ? `48px`: '0px',
                        // transition: 'margin-left 0.3s ease-in-out'

                        // border: 2,
                    }}
                >
                    {/* <BasicBreadcrumbs sx={{ mt: 2, ml: 5 }} breadcrumbs={['Testing', 'crumbs']} /> */}
                    {notLoginPage && <BasicBreadcrumbs sx={{ mt: 2, ml: 5 }} breadcrumbs={getBreadcrumbs(pathname)} />}
                    {children}
                </Box>
            </Box>
            {/* <TrackerAuthDialog open={state.openLogin} onClose={handleLoginClose} /> */}
            {/* {console.log('While rendering, state.confirmOpen is:', state.confirmOpen)} */}

            <ConfirmDialog open={state.confirmOpen} transaction={state.confirmNotification} onClose={handleConfirmClose} />
        </Box>
    )
}

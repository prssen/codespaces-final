import React, { useContext } from "react";
// import { Context } from './services/context/ContextProvider';
import { Context } from '@/lib/context/ContextProvider';
import { List, ListItem, ListItemText, ListItemAvatar } from "@mui/material";
import { Avatar, Box, Button, Divider, Typography } from "@mui/material";
import { Check, Image } from "@mui/icons-material";
import { grey } from "@mui/material/colors";
// import { useGetNotifications, notificationSeen } from "./Hooks/useApi";
import { useGetNotifications, notificationSeen } from "@/lib/hooks/useApi";
// import { splitCamelCase } from "../utils";
import { splitCamelCase } from "@/lib/utils/utils";
import dayjs from 'dayjs';
import relativeTime from "dayjs/plugin/relativeTime";
// import Loading from "./Components/Loading";
import Loading from "@/components/Loading";
import { useQueryClient } from "react-query";

dayjs.extend(relativeTime);

/**
 *
 * Content of side panel displaying notificationns
 */
const NotificationContent = ({ queryResponse }) => {

    const { data: notifications, isLoading, isError, error } = queryResponse;

    const queryClient = useQueryClient();

    // const { data: notifications, isLoading, isError, error } = useGetNotifications();
    console.log('Front end notifications:', notifications);

    const { state, dispatch } = useContext(Context);

    console.log('Notification left in context:', state.confirmNotification);

    const onConfirm = (notification) => {
        // Mark the notification as 'seen' - returns a promise
        notificationSeen(queryClient, notification.uuid);
        // Set global context variable to open confirmation dialog
        dispatch({ type: 'CONFIRM_OPEN', payload: notification });
    }

    const onReject = (notification) => {
        notificationSeen(queryClient, notification.uuid);
        dispatch({ type: 'CONFIRM_CLOSE', payload: null });
    }

    const test_notifications = [
        {
            id: 1,
            sender: "John Smith",
            notificationType: "New Invoice",
            datetime: "2024-01-10 10:00:00",
            // message: "New invoice for £1000",
            message: {
                type: "New invoice"
            },
        },
        {
            id: 2,
            sender: "John Smith",
            notificationType: "New Invoice",
            datetime: "2024-01-10 10:00:00",
            // message: "New invoice for £1000",
            message: {
                type: "New expense"
            }
        },

        // {
        //     id: 3,
        //     sender: "John Smith",
        //     notificationType: "New Invoice",
        //     datetime: "2024-01-10 10:00:00",
        //     message: "New invoice for £1000",
        // },
    ];

    if (isLoading) { 
        return <Loading />;
    }

    if (isError) {
        return 'Error displaying Notifications';
    }

    return (
        <List 
            // sx={{
            //     padding: 4, 
            //     marginBottom: 2, 
            //     maxWidth: '50px',
            //     '& .MuiList-root': {
            //         maxWidth: '256px',
            //         paddingBottom: 2,
            //     }
            // }}
        >
            {notifications?.map((notification, index) => (
                <>
                    {console.log('Notification ' + index + ': ', notification)}
                    <ListItem key={index} alignItems="flex-start">
                        <ListItemAvatar>
                            <Avatar>
                                <Image />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography variant="body2">
                                    {/* <strong>John</strong> has sent you a{" "} */}
                                    {/* <strong>New Invoice</strong> */}
                                    <strong>{notification.sender}</strong> has sent you a{" "}
                                    <strong>{splitCamelCase(notification.message.type).join(' ')}</strong>
                                </Typography>
                            }
                            secondary={
                                <Typography
                                    variant="subtitle2"
                                    color="grey.500"
                                >
                                    {dayjs(notification.timestamp).fromNow()}
                                    {/* 2024-01-10 10:00:00 */}
                                </Typography>
                            }
                        />
                        {/* <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                gap: 2,
                            }}
                        >
                            <Button variant="outlined">Reject</Button>
                            <Button variant="primary" endIcon={<Check />}>
                                Confirm
                            </Button>
                        </Box> */}
                    </ListItem>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 1,
                            ml: 2,
                        }}
                    >
                        <Button variant="outlined" color="success" onClick={() => onConfirm(notification)}>
                            Confirm
                        </Button>
                        <Button variant="outlined" color="error" onClick={() => onReject(notification)}>
                            Reject
                        </Button>
                    </Box>
                    {notifications.length > 1 && index !== notifications.length - 1 && <Divider
                        variant="middle"
                        sx={{
                            opacity: 0.6,
                            width: "95%",
                            mx: "auto",
                            mb: 1,
                            mt: 2,
                        }}
                    />}
                </>
            ))}
        </List>
    );
};

export default NotificationContent;
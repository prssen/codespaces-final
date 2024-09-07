// Custom hook to establish WebSockets connection and store data
// received in React Query cache
// Credit: code from https://tkdodo.eu/blog/using-web-sockets-with-react-query
import React, { useContext, useRef } from 'react';
import { useQueryClient } from 'react-query';
import { Context } from '../context/ContextProvider';
// import { Context } from '../services/context/ContextProvider';

const useReactQueryNotifications = (authData) => {
    const { state, dispatch } = useContext(Context);
    const queryClient = useQueryClient();

    const websocket = useRef(null);

    React.useEffect(() => {
        // const authData = queryClient.getQueryData('user');
        // const websocket = new WebSocket('wss://echo.websocket.org/')
        if (!authData?.key) {
            return;
        }

        console.log('In WebSockets hook with auth token:', authData.key);

        websocket.current = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${authData.key}`);
        console.log('Websocket object created: ', websocket);

        websocket.current.onopen = () => {
            console.log('connected')
        }

        websocket.current.onmessage = (event) => {
            if (state.firstLogin) {
                console.log('First login - cannot accept WebSocket notifications yet');
                return;
            }
            const data = JSON.parse(event.data);
            console.log('WebSockets data received: ', data);
            
            // const queryKey = [...data.entity, data.id].filter(Boolean)
            queryClient.invalidateQueries({
                queryKey: "notifications"
            });
            // queryClient.setQueryData(
            //     ['notifications'], 
            //     (cacheData) => [...cacheData, data]
            // );
            /* 
                TODO: use invalidation vs updating cache for changes to vs new 
                notifications - credit perplexity.ai:
                 // Update the query cache based on the received data
                if (data.type === 'NEW_POST') {
                        queryClient.invalidateQueries(['posts', 'list'])
                } else if (data.type === 'UPDATE_POST') {
                        que
                        ryClient.setQueryData(['posts', 'detail', data.id], data.post)
                    }
                }
            */
        }

        // Close connection whenever user logs out, or component unmounts (i.e. window is closed)
      return () => {
        console.log('Cleaning up: websocket object - ', websocket);
        websocket.current.close()
        
      }
    // Run useEffect when authData changes, i.e. when user logs in/out, or
    // when component unmounts (window is closed) - credit: AI response
    }, [authData])
  }

export default useReactQueryNotifications;
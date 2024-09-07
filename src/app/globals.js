// TODO - delete

import { useEffect, useState } from 'react';

// Code to be run application-wide

const GlobalCode = ({ children }) => {
    const [isReady, setIsReady] = useState(null);

    useEffect(async () => {
        if (process.env.NODE_ENV !== 'development') {
            return
        }

        const { worker } = await import('../__tests__/mocks/browser');

        setIsReady(true);
        // `worker.start()` returns a Promise that resolves
        // once the Service Worker is up and ready to intercept requests.
        return worker.start()

    }, [])

    if (!isReady) {
        return
    }
    
    return (
        <>
            {children}
        </>
    );
}

export default GlobalCode;
"use client"
import Navbar from "@/components/tracker/navigation/TrackerNavbar";
import { useContext } from 'react'
import { Context } from "@/lib/context/ContextProvider";
import TrackerAuthDialog from "@/components/tracker/auth/TrackerAuthDialog";

export default function TrackerLayout({children}) {
    const { state, dispatch } = useContext(Context);
    const handleLoginClose = () => dispatch({ type: "CLOSE_LOGIN", payload: null });

    return (
        <section style={{display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* <nav>Tracker layout (replace with nav bar)</nav> */}
            <Navbar/>
            <TrackerAuthDialog open={state.openLogin} onClose={handleLoginClose} />
            {children}
        </section>
    );
}
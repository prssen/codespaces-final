import { Inter } from "next/font/google";
import Providers from "@/lib/contextProviders";
import React from 'react';
// import "./globals.css";
// import GlobalCode from "./globals";
import Sidebar from "@/components/sidebar - DELETE/sidebar";
import { AppBar, Avatar, Toolbar, Typography, Box } from "@mui/material";

import { folderPaths } from 'next-path';
import { getBreadcrumbs } from '@/lib/utils/utils';

// console.log(folderPaths);
const searchBarOptions = folderPaths.map(e => getBreadcrumbs(e));
// console.log(searchBarOptions);

// import LayoutNav from "@/components/layoutNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Track",
    description: "Accounting system and donation tracker for non-profits",
};

export default function RootLayout({ children, params}) {
    // const childrenWithProps = React.Children.map(children, (child) => {
    //     // Checking isValidElement is the safe way and avoids a typescript error too
    //     if (React.isValidElement(child)) {
    //         return React.cloneElement(child, { searchBarOptions });
    //     }
    //     return child;
    // });

    // console.log('Search bar options: ', searchBarOptions);
    params.searchBarOptions = JSON.stringify(searchBarOptions);

    // const childrenWithProps = React.cloneElement(children, { searchBarOptions });

    return (
        <html lang="en">
            <body>
                <Providers>
                    {/* <GlobalCode> */}
                        {children}
                        {/* {childrenWithProps} */}
                        {/* <LayoutNav>{children}</LayoutNav> */}
                        {/* <body className={inter.className}>{children}</body> */}
                    {/* </GlobalCode> */}
                </Providers>
            </body>
        </html>
    );
}

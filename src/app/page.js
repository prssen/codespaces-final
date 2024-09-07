"use client"

import Image from "next/image";
import styles from "./page.module.css";
import dynamic from 'next/dynamic';
// import dynamic from "next/link";
// const Link = dynamic(() => import("next/link"), { ssr: false });
import Link from "next/link";
import { useEffect, useState } from "react";
import { createVerifiedFetch } from '@helia/verified-fetch'

const verifiedFetch = createVerifiedFetch({
    gateways: ['https://ipfs.io/ipfs', 'https://trustless-gateway.link', 'https://cloudflare-ipfs.com'],
})

// Workaround to enable Leaflet maps in Next.js
export const LeafletMap = dynamic(() => import('./tracker/donations/[id]/TrackingMap'), { 
    ssr: false
});

// import Charity_abi from "../../../final-blockchain/Ethereum/brownie/build/contracts/Charity.json";
// console.log('Charity_abi is: ', Charity_abi);

// import "@/lib/api/blockchain";
// import Testing from "@/components/testing";
// import { useLogin } from "./lib/hooks/useAuth";
// import { useLogin } from "@/lib/hooks/useAuth";
// import useLogin from "@/lib/hooks/useAuth";

// Using dynamic imports allows us to use client-side components in a
// server-side rendered page in Next.js (when server-side rendered, the import
// is replaced with an empty object)
// const useLogin = dynamic(
//     () => import("@/lib/hooks/useAuth").then((module) => module.Login),
//     { ssr: false }
// );

export default function Home() {
    const [src, setSrc] = useState(null);
    useEffect(() => {
        (async () => {
            const response = await verifiedFetch('ipfs://QmPaCVV5B7mF2gqQQfWvt1ftz3Nbca9ekHrnAdygs4xegQ')
            console.log('IPFS response: ', response)
            const blob = await response.blob()
            console.log('Response blob: ', blob)
            setSrc(blob);
            // const image = document.createElement('img')
            // console.log('Image element: ', image);
            // image.src = URL.createObjectURL(blob)
            // const container = document.getElementById('id');
            // container.appendChild(image);
            
        })()
    }, [])
    // const userCredentials = {
    //     username: "senaypetros",
    //     password: "football89",
    // };
    // const { data, status, error, isFetching } = useLogin(userCredentials);

    return (
        // <main className={styles.main}>
        //   <div className={styles.description}>
        //     <p>
        //       Get started by editing&nbsp;
        //       <code className={styles.code}>app/page.js</code>
        //     </p>
        //     <div>
        //       <a
        //         href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
        //         target="_blank"
        //         rel="noopener noreferrer"
        //       >
        //         By{" "}
        //         <Image
        //           src="/vercel.svg"
        //           alt="Vercel Logo"
        //           className={styles.vercelLogo}
        //           width={100}
        //           height={24}
        //           priority
        //         />
        //       </a>
        //     </div>
        //   </div>

        //   <div className={styles.center}>
        //     <Image
        //       className={styles.logo}
        //       src="/next.svg"
        //       alt="Next.js Logo"
        //       width={180}
        //       height={37}
        //       priority
        //     />
        //   </div>

        //   <div className={styles.grid}>
        //     <a
        //       href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
        //       className={styles.card}
        //       target="_blank"
        //       rel="noopener noreferrer"
        //     >
        //       <h2>
        //         Docs <span>-&gt;</span>
        //       </h2>
        //       <p>Find in-depth information about Next.js features and API.</p>
        //     </a>

        //     <a
        //       href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
        //       className={styles.card}
        //       target="_blank"
        //       rel="noopener noreferrer"
        //     >
        //       <h2>
        //         Learn <span>-&gt;</span>
        //       </h2>
        //       <p>Learn about Next.js in an interactive course with&nbsp;quizzes!</p>
        //     </a>

        //     <a
        //       href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
        //       className={styles.card}
        //       target="_blank"
        //       rel="noopener noreferrer"
        //     >
        //       <h2>
        //         Templates <span>-&gt;</span>
        //       </h2>
        //       <p>Explore starter templates for Next.js.</p>
        //     </a>

        //     <a
        //       href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
        //       className={styles.card}
        //       target="_blank"
        //       rel="noopener noreferrer"
        //     >
        //       <h2>
        //         Deploy <span>-&gt;</span>
        //       </h2>
        //       <p>
        //         Instantly deploy your Next.js site to a shareable URL with Vercel.
        //       </p>
        //     </a>
        //   </div>
        // </main>
        <div id="container">
            {/* Try to login - if successful, display here */}
            <h1>Testing headings!</h1>
            {/* <Testing /> */}
            <Link href="accounting/expenses/list">Go to expenses</Link>
            <Link href="accounting/test">Go to test page</Link>
            <img src={src} />
        </div>
    );
}

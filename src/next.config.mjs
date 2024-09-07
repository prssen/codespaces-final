/** @type {import('next').NextConfig} */

// // import { withBundleAnalyzer } from "@next/bundle-analyzer";
import pkg from "@next/bundle-analyzer";
// const { withBundleAnalyzer } = pkg;

const withBundleAnalyzer = pkg({
    enabled: process.env.ANALYZE === "true",
});

// console.log('NEXT JS CONFIG: NODE_ENV VALUE: ', process.env.NODE_ENV);

// withBundleAnalyzer({
//     enabled: process.env.ANALYZE === "true",
// });

const nextConfig = {
    // Security measure - cookies sent by HTTP only,
    // and not accessible in browser to malicious code
    // cookies: {
    //     secure: true,
    //     httpOnly: true,
    // },
    // Add support for importing .txt files
    webpack: (config) => {
        config.module.rules = [
            ...config.module.rules,
            {
                test: /\.txt$/i,
                type: 'asset/source',
            },
        ];
        // Do not include 'vite' in final bundle (only needed
        // to import tranformWithEsBuild for tests)
        config.externals.push('vite');
        return config
    },
    experimental: {
        optimizePackageImports: [
            "@mui/material", 
            "react-icons",
            "react-icons/md", 
            "react-icons/fa", 
            "react-icons/bi",
            "ethers"
        ],
        webpackMemoryOptimizations: true,
    },
    images: {
        minimumCacheTTL: 60,
    },
    productionBrowserSourceMaps: true,
    // Disable double-rendering of React components when unit tests are
    // running
    // reactStrictMode: process.env.NODE_ENV === 'test' ? false : true,
    
    // Config to import files from outside the project root
    // (adapted from https://github.com/vercel/next.js/issues/5666#issuecomment-782922703)
    // webpack: (config) => {
    //     config.module.rules.forEach((rule) => {
    //       if (
    //         rule.test && rule.test.toString().includes('txt|json')
    //       ) {
    //         rule.include = [
    //           ...rule.include,
    //           require('path').join(__dirname, '../../backend/accounting/blockchain_service/'),
    //           require('path').join(__dirname, '../../final-blockchain/Ethereum/brownie/build/contracts/'),
    //         ];
    //       }
    //     });
    //     return config
    //   },
    // From https://stackoverflow.com/a/69034490
    //     rewrites: async () => {
    //         // In order to support wildcard subdomains with different content, use a "rewrite" to include the host in the path
    //         return [
    //             {
    //                 source: '/:path*{/}?',
    //                 has: [
    //                     {
    //                         type: 'host',
    //                         value: '(?<siteHost>.*)',
    //                     },
    //                 ],
    //                 destination: '/site/:siteHost/:path*',
    //             },
    //         ];
    //     },
};

// export default withBundleAnalyzer({});

export default withBundleAnalyzer(nextConfig);

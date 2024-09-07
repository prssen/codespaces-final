import { NextResponse } from "next/server";

// TODO: see these links on multi-tenancy
// https://stackoverflow.com/questions/69299188/how-to-assign-subdomain-for-every-user-in-next-js?rq=3
// https://stackoverflow.com/questions/57469815/retrieving-sub-domain-in-next-js-page?rq=3

// RegExp for public files
const PUBLIC_FILE = /\.(.*)$/; // Files with no extension

// Code from https://medium.com/@jfbaraky/using-subdomains-as-paths-on-next-js-e5aab5c28c28
// export const getValidSubdomain = (host?: string | null) => {
//     let subdomain: string | null = null;
//     if (!host && typeof window !== 'undefined') {
//       // On client side, get the host from window
//       host = window.location.host;
//     }
//     if (host && host.includes('.')) {
//       const candidate = host.split('.')[0];
//       if (candidate && !candidate.includes('localhost')) {
//         // Valid candidate
//         subdomain = candidate;
//       }
//     }
//     return subdomain;
//   };


export function middleware(req, ev) {
    // Code from https://medium.com/@jfbaraky/using-subdomains-as-paths-on-next-js-e5aab5c28c28
    // // Clone the URL
    // const url = req.nextUrl.clone();

    // // Skip public files
    // if (PUBLIC_FILE.test(url.pathname) || url.pathname.includes('_next')) return;

    // const host = req.headers.get('host');
    // const subdomain = getValidSubdomain(host);
    // if (subdomain) {
    // // Subdomain available, rewriting
    // console.log(`>>> Rewriting: ${url.pathname} to /${subdomain}${url.pathname}`);
    // url.pathname = `/${subdomain}${url.pathname}`;
    // }

    // return NextResponse.rewrite(url);

    // From https://stackoverflow.com/questions/57469815/retrieving-sub-domain-in-next-js-page?rq=3
    const subdomain = req.headers.host.split('.')[0];

    console.log(req.url);
    return NextResponse.next();
}

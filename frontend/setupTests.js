import { beforeAll, afterEach, afterAll, vi } from 'vitest';
// import { server } from './__tests__/mocks/server'
import { useRouter } from 'next/navigation';
import mockRouter from 'next-router-mock';
import { axios } from "@/lib/api/axiosInstance";
import MockAdapter from "axios-mock-adapter";
import { applyRoutes } from "@/lib/api/mockAxiosRoutes";

const mockAxios = new MockAdapter(axios, { onNoMatch: "throwException", delayResponse: 0 });
// import { fetch } from 'cross-fetch';

// server.events.on('request:start', ({ request }) => {
//     console.log('Outgoing:', request.method, request.url);
// });
// global.fetch = fetch;

// Credit: from https://v1.mswjs.io/docs/getting-started/integrate/node#using-create-react-app 
// Establish API mocking before all tests.
beforeAll(() => {

    // server.listen({ onUnhandledRequest: 'error' });
    // vi.mock('next/navigation', () => require('next-router-mock'))

    // const useSearchParams = vi.fn();
    // useSearchParams.mockImplementation(() => new URLSearchParams());

    // vi.mock("next/navigation", async (importOriginal) => {
        // const actual = await importOriginal();
        // return {
            //     ...actual,
    vi.mock("next/navigation", async () => {
        return {
            ...require('next-router-mock'),
            // useSearchParams: vi.fn().mockImplementation(() => new URLSearchParams()),
            // Code from https://github.com/scottrippey/next-router-mock/issues/67#issuecomment-1564906960
            usePathname: () => {
                const router = useRouter();
                return router.asPath;
            },
            useSearchParams: () => {
                const router = useRouter();
                const path = router.query;
                return new URLSearchParams(path);
            },
            // useRouter: vi.fn(),
        }
    });

    applyRoutes(mockAxios);
    
    // // Mocking the useRouter hook to simulate navigation - 
    // // adapted from https://github.com/vercel/next.js/issues/7479#issuecomment-778586840
    // const push = vi.fn();
    // useRouter.mockImplementation(() => ({
    //     push,
    //     pathname: "/",
    //     route: "/",
    //     asPath: "/",
    //     query: "",
    // }));
})

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
// afterEach(() => server.resetHandlers())

// Clean up after the tests are finished.
afterAll(() => {
    // server.close();
    vi.clearAllMocks();
    vi.resetAllMocks();

    mockAxios.reset();
})

// Hide console output of components while testing them - 
// credit: AI response
// beforeEach(() => {
//     // mockRouter.default.setCurrentUrl('/');
//     vi.spyOn(console, 'error').mockImplementation(() => {});
//     vi.spyOn(console, 'log').mockImplementation(() => {});
// });

// afterEach(() => {
//     console.error.mockRestore();
//     console.log.mockRestore();
// });

// afterEach(() => {
//     vi.unstubAllEnvs()
// });
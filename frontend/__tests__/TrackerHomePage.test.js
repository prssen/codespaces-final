/**
 * Test cases:
 *  TODO: mock the home page data
 * 
 * - Renders w/o crashing
 * - Typing in search bar shows up on screen
 * - Pressing submit search redirects to search results page WITH query params
 * - Title + subtitle from each mock appeal appears in home page cards (Search text)
 * - Clicking on card redirects to that page's URL (use uuid from mock data)
 */

import { vi, expect, describe, test, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import "@testing-library/jest-dom/vitest";
import apiDataJSON from '../../mock_api/testApiData.json';
// import { server } from './mocks/server';
// import { apiUrl } from './mocks/handlers';
// import { rest } from 'msw';
// import { logRoles } from '@testing-library/dom';
import { useRouter } from 'next/navigation';
import { render, screen, waitFor, prettyDOM, fireEvent, within, logRoles } from '@/lib/utils/test_utils'
import userEvent from '@testing-library/user-event'

import CharityHomePage from '@/tracker/home/page';
import { WatchOffRounded } from '@mui/icons-material';

// import { useRouter } from 'next/navigation';

// import { useRouter } from 'next/router';

// // Mocking the useRouter hook to simulate navigation - 
// // adapted from https://github.com/vercel/next.js/issues/7479#issuecomment-778586840
// vi.mock("next/router", () => ({
//     useRouter: vi.fn(),
//   }));
describe('Home page tests', () => {
    // beforeAll(() => {
    //     // Add useSearchParams to next/navigation mock, with empty search params
    // })

    test.skip('renders successfully', async () => {
        
        // Check it renders without crashing
        render(<CharityHomePage />);

        await waitFor(() => {
            // Check hero section title is in the page
            const element = screen.getAllByText(/Find a cause\. See the results./i)[0];
            expect(element).toBeInTheDocument();
        });
    });
    
    test.skip('Typing into search bar appears on screen', async () => {
        render(<CharityHomePage />);

        await waitFor(() => {
            fireEvent.change(screen.getByPlaceholderText(/Search for a charity/i), {target: {value: 'Help the homeless London'}});
            // Check that typed text appears in search bar
            const searchText = screen.getByDisplayValue('Help the homeless London');
            expect(searchText).toBeInTheDocument();
        });
        
    });

    test.skip('Submitting a search navigates to search results page', async () => {
        const user = userEvent.setup();
        render(<CharityHomePage />);

        await waitFor(async () => {
            // Type into search bar and click on submit icon button
            fireEvent.change(await screen.findByPlaceholderText(/Search for a charity/i), {target: {value: 'animals'}});
            const submitIcon = screen.getByRole('button', { name: 'search-icon' });
            await user.click(submitIcon);
            expect(useRouter().push).toBeCalledWith('/tracker/search/?search=animals');
            // const searchText = screen.getByDisplayValue('Help the homeless London');
            // expect(searchText).toBeInTheDocument();
        }, { timeout: 8000})
         
    });

    test.skip('Appeal cards show the correct data', async() => {
        render(<CharityHomePage />);
        const appealCards = apiDataJSON.appeals
        await waitFor(async () => {
            // Check data of first 4 appeals are displayed correctly in
            // cards
            appealCards.slice(0, 4).forEach(async appeal => {
                const title = await screen.findByText(new RegExp(appeal.title, 'i'));
                const subtitle = await screen.findByText(new RegExp(appeal.subtitle, 'i'));
                expect(title).toBeInTheDocument();
                expect(subtitle).toBeInTheDocument();
            });
        })
    });


    // TODO: find out why the card links can't be found in this test
    test('Clicking on appeal card navigates to correct appeal page', async () => {
        const user = userEvent.setup();
        const { container } = render(<CharityHomePage />);
        // Get data of the first appeal card
        const appealData = apiDataJSON.appeals[0];
        console.log('Appeal data: ', appealData);
        
        // Click on appeal card
        await waitFor(async () => {
            const appealCardLink = await screen.findByRole('link', { name: new RegExp(appealData.title, 'i') });
            // logRoles(container);
            // const appealCardLink = await screen.findByRole('link', {
            //     name: /Harvest of Hope: Cultivating Food Security/i
            //   });  
            // const title = await screen.findByText(new RegExp(appealData.title, 'i')); 
            // const links = container.querySelector('.MuiLink-root');
            // links.forEach(link => console.log(prettyDOM(link)))
            // const appealCardLink = await screen.findByText(/Harvest of Hope: Cultivating Food Security/i)           
            // const appealCardLink = await screen.findByText( new RegExp(appealData.title, 'i'));
            // console.log(prettyDOM(appealCardLink));
            // const appealCardLinks = await screen.findAllByRole('link');
            // console.log('Number of links: ', appealCardLinks.length);
            // for (const link of appealCardLinks) {
            //     console.log(prettyDOM(link));
            // }

            await user.click(appealCardLink);
            // Check that the appeal page with the correct UUID is navigated to
            expect(useRouter().push).toBeCalledWith(`/tracker/appeals/${appealData.uuid}`);
        }, { timeout: 10000});
    });
});


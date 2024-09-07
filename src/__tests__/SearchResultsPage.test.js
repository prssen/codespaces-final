/**
 * Test cases:
 * - Test that, w/o query params, it renders + shows an empty search bar
 * - Test that, when opened with search param, appropriate search results are rendered
 * - Test that when a query param w/ no search results is loaded, no search results show
 * - Test that checkboxes and slider change the query param
 * - Test that clicking on one navigates to the specific appeal page
 */

import { vi, expect, describe, test, beforeEach } from 'vitest';
import "@testing-library/jest-dom/vitest";
import apiDataJSON from '../../mock_api/testApiData.json';
import { render, screen, waitFor, prettyDOM, fireEvent, within, logRoles } from '@/lib/utils/test_utils'
import userEvent from '@testing-library/user-event'
import SearchResultsPage from '@/tracker/search/page';
import { useRouter, useSearchParams } from 'next/navigation';
import mockRouter from 'next-router-mock';
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

test('renders successfully', async () => {
    const { container } = render(<SearchResultsPage />);
    const resultsContainer = container.querySelector('.mui-uqwprf-MuiGrid-root');
    // console.log(prettyDOM(resultsContainer));
    // screen.debug(resultsContainer);

    await waitFor(async () => {
        console.log('Current NODE_ENV value is: ', process.env.NODE_ENV);
        // Check that the search bar is present and empty
        const searchBar = await screen.findByPlaceholderText(/Search for a charity/i)
        expect(searchBar).toBeInTheDocument;
        expect(searchBar).toHaveDisplayValue('');
    }, { timeout: 8000 });
});

test.skip('When accessed with search params, correct search results are shown', async ({ expect }) => {
    const mockAxios = new MockAdapter(axios, { onNoMatch: "throwException", delayResponse: 0 });
    const mock = applyRoutes(mockAxios);

    // Set the search params
    // useRouter().query = { search: 'animals'}
    mockRouter.push('/tracker/search?search=animals');

    console.log('Current NODE_ENV value is: ', process.env.NODE_ENV);

    // Filter API data by search term to get expected search results
    const expectedSearchResults = apiDataJSON.appeals.filter(
        e => Object.values(e)
                   .some(word => 
                        String(word).includes('animals')
                    )
    );
    console.log('Expected search results: ', expectedSearchResults);

    render(<SearchResultsPage />);

    await waitFor(async () => {
        // Check correct search heading is displayed
        // const searchBar = await screen.findByPlaceholderText(/Search for a charity/i)

        // TODO: change to 'showing results for "queryString"
        console.log('Anything before await?');
        // screen.debug();
        // const searchHeading = await screen.findAllByRole('heading');
        const searchHeading = await screen.findAllByText(/Showing results for/i)[0];
        // console.log('Anything after await?');
        console.log('Text content: ', searchHeading.textContent);
        logRoles();
        // const searchHeading = await screen.findByRole('heading', { name: /Showing results for/i });
        // console.log(prettyDOM(screen.findByRole('heading', { name: /Showing results for/i })));
        expect(searchHeading).toBeInTheDocument;

        // Check correct search results are displayed
        // expectedSearchResults.forEach(async result => {
        //     const title = await screen.findByText(new RegExp(result.title, 'i'));
        //     const subtitle = await screen.findByText(new RegExp(result.subtitle, 'i'));
        //     expect(title).toBeInTheDocument();
        //     expect(subtitle).toBeInTheDocument();

        // })
        // expect(searchBar).toHaveDisplayValue('');

        // Reset search params at end of test
        useRouter().query = { search: '' };
    }, { timeout: 10000 });

});
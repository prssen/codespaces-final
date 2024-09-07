import apiData from "../../../../mock_api/testApiData.json";

/**
 * Add handlers for the the routes of mock API to the 
 * axios-mock-adapter instance. These will be overridden
 * by individual tests if error responses are required.
 * 
 * @param {Object} mockAxios instance of axios-mock-adapter
 */
export const applyRoutes = (mockAxios) => {
    mockAxios.onGet("/donations").reply(200, apiData.donations)
             .onGet("/tracker/home").reply(400, apiData.appeals.slice(0, 4))
             .onGet("/tracker/search").reply((config) => {
                const { search } = config.params;
                const searchResults = apiData.appeals.filter(e => 
                    e.title.includes(search) || e.subtitle.includes(search)
                );
                return [200, searchResults];
        // const searchParams = new URLSearchParams(config.url.split("?")[1]);
        // const searchQuery = searchParams.get("search");
        // const searchResults = apiData.appeals.filter(
        //     (appeal) =>
        //         Object.values(appeal).some((word) =>
        //             String(word).includes(searchQuery)
        //         )
        // );
        // return [200, searchResults];
            })
            .onPost("/accounting/auth").reply(200, apiData.accounting_login);

    // Error responses
    mockAxios.onGet("/donations").networkError();
    mockAxios.onGet("/appeals").timeout();

    return mockAxios;
}

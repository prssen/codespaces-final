import { rest } from 'msw'
// import apiData from "./test_api_data.json"
import apiData from './testApiData.json'

export const apiUrl = (endpoint) => {

    const customUrls = {
        login: 'http://localhost:8000/dj-rest-auth/login/',
        register: 'http://localhost:8000/dj-rest-auth/register/',
        logout: 'http://localhost:8000/dj-rest-auth/logout/',
    }

    // If in url map, use custom url; otherwise, add api/v1/
    if (endpoint in customUrls) {
        return customUrls[endpoint]
    }
    else {
        return 'http://localhost:8000/api/v1/' + endpoint + '/';
    }
}

export const handlers = [
    // http.get('*/react-query', (req, res, ctx) => {
    //         return res(
    //             ctx.status(200),
    //             ctx.json({
    //                 name: 'mocked-react-query'
    //             })
    //         )
    //     }
    // )

    rest.get(apiUrl('donations'), (req, res, ctx) => {
        const { key } = req.cookies;
        if (key) {
            return res.json(apiData.donations);
        } else {
            ctx.status(403);
            return ctx.json({ message: 'Cannot access authenticated route'});
        }
    }),
    rest.post(apiUrl('accounting_login'), (req, res, ctx) => {
        console.log('Is handler reached?');
        ctx.cookie(apiData.login.key);
        return res.json('token', apiData.login)
    }),
    rest.post(apiUrl('accounting_register'), (req, res, ctx) => {
        ctx.cookie(apiData.register.key);
        return res.json(apiData.register)
    }),

]
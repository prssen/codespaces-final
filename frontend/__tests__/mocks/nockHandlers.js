import nock from "nock"
import apiData from './testApiData.json'

// Parse COOKIES header to check if auth token is present
const authTokenPresent = (cookieHeader) => {
    const authTokenPresent = cookieHeader && cookieHeader.includes('token=');
    const tokens = cookieHeader.split('token=')[1]
    const authToken = tokens.substring(0, tokens.indexOf(';'));
    return authToken;
}
const server = nock('http://localhost:8000/api/v1').persist()

export const donationServer = () => server
    .get('/donations/')
    .reply(function(uri, requestBody) {
        const { Cookies } = this.req.headers;
        if (authTokenPresent(Cookies)) {
            return [200, apiData.donations]
        } else {
            return [403, {
                message: 'Cannot access authenticated resource'
            }]
        }
    })

export const loginServer = () => server
    .post('/accounting_login/')
    .reply(200, {
        'token': apiData.login
    })

export const loginErrorServer = () => server
    .post('/accounting_login/')
    .reply(500, {
        message: 'Internal server error'
    })

export const registerServer = () => server
    .post('/accounting_register')
    .reply(201, apiData.register)
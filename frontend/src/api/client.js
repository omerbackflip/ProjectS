import axios from 'axios';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.post['Accept'] = 'application/json';
import {getSession} from '../data/utils';
// client for sending REST based requested {post, get, put/patch, delete/destroy}
const client = axios;

export const baseUrl = 'http://185.28.152.24:3001';

export const setAuthToken = (token) => {
    axios.defaults.headers['authorization'] = `Bearer ${token}`;
    document.cookie = `authorization=${token}`;
};

// to parse error(s) caught by axios during any HTTP request
export function parseClientError(error) {
    let parsed = 'Seems like a cog stopped moving.';

    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        parsed = error.response.data;
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        parsed = error.request;
    } else {
        // Something happened in setting up the request that triggered an Error
        parsed = error.message;
    }

    return parsed;
}

async function request(method, url, data = {}, params = {},headers = {}) {
    try {
        return await client({
            method: method,
            url: `${baseUrl}${url}`,
            data: data,
            params: params,
            headers:{
                Authorization : `Bearer ${getSession()}`,
                ...headers
            }
        });
    } catch (e) {
        throw parseClientError(e);
    }
}

export async function post(url, data = {}) {
    return await request('post', url, data);
}

export async function get(url, data = {}, params = {},headers = {}) {
    return await request('get', url, data, params,headers);
}

export async function put(url, data = {}, params = {}) {
    return await request('put', url, data, params);
}

export async function deleteItem(url, data = {}) {
    return await request('delete', url, data);
}

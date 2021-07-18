import { post, get, put,deleteItem , baseUrl } from './client.js';


// ****** LOGIN ******** //
export async function authLogin(username,password) {
    return await post('/auth/login', {username,password});
}


// ****** PAYABLE ITEMS ******** //
export async function getAllPayableItems(params) {
    return await get('/payable-items/get',{}, params);
}

export async function updateItem(id, payload) {
    return await put(`/payable-item/${id}/update`, payload);
}

export async function deletePayableItem(id) {
    return await deleteItem(`/payable-item/${id}/delete`, {});
}

export async function importDataFile(file) {
    const formData = new FormData();
    if (file) {
        formData.append('file', file);
    }

    return await post(`/payable-items/upload`, formData);
}

export async function getCount() {
    return await get('/payable-items/get-count', {});
}

// ****** SHORTLISTED ITEMS ******** //


export async function getAllShortListedItems(params) {
    return await get('/short-list-items/get', {}, params);
}

export async function updateShortListItem(payload) {
    return await put(`/short-list-items/update-item`, payload);
}

export async function downloadAttachedFile(params) {
    // return await get('/short-list-items/get-file', {}, params);
    window.open(`${baseUrl}/short-list-items/get-file?destination=${params.destination}`)
}

export async function addFileToItem(file,userName,itemId) {
    const formData = new FormData();	
    if(file){
        formData.append('file', file);
        formData.append('userName',userName);
        formData.append('itemId',itemId);
    }
    return await put(`/short-list-items/add-file`, formData);
}

export async function deleteShortListItem(id,userName) {
    return await deleteItem(`/short-list-items/delete-item/${id}/${userName}`, {});
}

export async function addShortListItems(body) {
    return await put(`/short-list-items/add`, body);
}

export const exportData = `${baseUrl}/short-list-items/export-excel`;

export async function importShortListDataFile(file ,userName) {
    const formData = new FormData();	
    if(file){
        formData.append('file', file);
        formData.append('userName',userName);
    }
    
    return await post(`/short-list-items/upload`, formData);
}

export function logout() {
    document.cookie = "authorization=''";
    localStorage.removeItem("id_token");
    localStorage.removeItem("id_user");
    return true;
}

export async function getSummary(query) {
    return await get('/short-list-items/get-summary', query);
}


// ****** USERS ******** //

export async function getAllUsers() {
    return await get('/users/get', {});
}

export async function createUser(payload) {
    return await post('/auth/createUser', payload);
}
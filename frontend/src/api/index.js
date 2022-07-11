import { post, get, put,deleteItem , baseUrl } from './client.js';
import { getSession } from '../data/utils.js';

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

export async function deletePayableItems() {
    return await put('/payable-items/delete', {});
}





// ****** SHORTLISTED ITEMS ******** //
export async function getAllShortListedItems(params) {
    return await get('/short-list-items/get', {}, params);
}

export async function updateShortListItem(payload) {
    return await put(`/short-list-items/update-item`, payload);
}

export async function downloadAttachedFile(params) {
    fetch(`${baseUrl}/short-list-items/get-file?destination=${params.destination}`, {
        headers: {
        Authorization : `Bearer ${getSession()}`
        }
    }).then(res => res.blob()).then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = params.destination;
        link.click();
    });
}

export async function exportExcelFile(params) {
    fetch(`${baseUrl}/short-list-items/export-excel?userName=${params.userName}&discount=${params.userDiscount}`, {
    //fetch(`${baseUrl}/short-list-items/export-excel?userName=${params.userName}`, {
        headers: {
            Authorization : `Bearer ${getSession()}`
        }
    }).then(res => res.blob()).then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = params.destination;
        link.click();
    });
}

//this function add file/image to a short list item
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

export async function removeFile(id,userName) {
    return await put(`/short-list-items/remove-file/${id}/${userName}`, {});
}

export async function addShortListItems(body) {
    return await put(`/short-list-items/add`, body);
}

export async function importShortListDataFile(file ,userName, discount) {
    const formData = new FormData();	
    if(file){
        formData.append('file', file);
        formData.append('userName',userName);
        formData.append('discount',discount);
    }
    
    return await post(`/short-list-items/upload`, formData);
}

export function logout() {
    document.cookie = "authorization=''";
    localStorage.removeItem("id_token");
    localStorage.removeItem("id_user");
    return true;
}

export async function getSummary(userName,discount) {
    return await put('/short-list-items/get-summary', {userName,discount} );
}

export async function deleteShortListedItems(userName) {
    return await put('/short-list-items/delete', {userName});
}

export async function copyShortListUser(users,userName) {
    return await put('/short-list-items/copy', {users,userName});
}

export async function getImageById(query) {
    return await get('/short-list-items/get-image', {}, query);
}

export async function getItemsID(params) {
    return await get('/short-list-items/get-items-id', {}, params);
}



// ****** USERS ******** //
export async function getAllUsers() {
    return await get('/users/get', {});
}

export async function createUser(payload) {
    return await post('/auth/createUser', payload);
}

export async function updateUserById(payload) {
    return await put('/users/update', payload);
}

export async function deleteUserById(id) {
    return await put('/users/delete/'+id);
}
export function setSession(token) {
    localStorage.setItem('id_token', token);
}          

export function getSession(token) {
    return localStorage.getItem('id_token', token);
}          

export function setUser(user) {
    localStorage.setItem('id_user', user);
}          

export function getUser(){
    return localStorage.getItem('id_user');
}

export function logout() {
    localStorage.removeItem("id_token");
    localStorage.removeItem("id_user");
}

export function isLoggedIn() {
    return localStorage.getItem('id_token');
}

export function isLoggedOut() {
    return !this.isLoggedIn();
}
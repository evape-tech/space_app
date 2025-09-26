import local from "local-storage";

const userStatusKey = "userStatus";
const readPrivacyKey = "readPrivacy";

// userStatus
export function getUserStatus() {
    return local.get(userStatusKey) || {};
}

export function setUserStatus(status) {
    local.set(userStatusKey, status);
}

export function updateUserStatus(status) {
    const userStatus = local.get(userStatusKey);
    const data = Object.assign(userStatus, status);
    local.set(userStatusKey, data);
}

export function deleteUserStatus() {
    local.remove(userStatusKey);
}

// readPrivacy
export function getReadPrivacy() {
    return local.get(readPrivacyKey);
}

export function setReadPrivacy(status) {
    local.set(readPrivacyKey, status);
}

export function deleteReadPrivacy() {
    local.remove(readPrivacyKey);
}

// clear
export function clearStore() {
    local.clear();
}

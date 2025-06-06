export interface LoginCredentials {
    email?: string | null;
    password?: string | null;
}

export interface RegisterInfo {
    email?: string | null;
    password?: string | null;
    firstName?: string | null;
    lastName?: string | null;
}

export interface JwtResponse {
    token?: string | null;
    refreshToken?: string | null;
    firstName?: string | null;
    lastName?: string | null;
}

export interface RefreshTokenModel {
    jwt?: string | null;
    refreshToken?: string | null;
}

export interface UserProfile {
    id: string,
    email: string,
    firstName?: string;
    lastName?: string;
}

export interface DecodedToken {
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier' ?: string;
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name' ?: string;
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress' ?: string;
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname' ?: string;
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname' ?: string;
    'AspNet.Identity.SecurityStamp' ?: string;
    exp?: number; 
    iss?: string;
    aud?: string;
}

export interface TodoCategory {
    id: string;
    categoryName?: string | null;
    categorySort: number;
    syncDt: string;
    tag?: string | null;
}

export interface TodoCategoryCreate {
    categoryName?: string | null;
    categorySort: number;
    tag?: string | null;
}

export interface TodoCategoryEdit {
    id: string,
    categoryName?: string | null;
    categorySort: number;
    tag?: string | null;
    syncDt?: string | null;
}

export interface TodoPriority {
    id: string;
    appUserId: string;
    priorityName?: string | null;
    prioritySort: number;
    syncDt: string;
    tag?: string | null;
}

export interface TodoPriorityCreate {
    priorityName: string;
    prioritySort: number;
    tag?: string | null;
}

export interface TodoTask {
    id: string;
    taskName?: string | null;
    taskSort: number;
    createdDt: string;
    dueDt?: string | null;
    isCompleted: boolean;
    isArchived: boolean;
    todoCategoryId: string;
    todoPriorityId: string;
    syncDt: string;
    todoCategory?: TodoCategory | null;
    todoPriority?: TodoPriority | null;
}

export interface TodoTaskCreate {
    taskName: string;
    todoCategoryId: string;
    todoPriorityId: string;
    dueDt?: string | null;
}

export interface TodoTaskUpdate {
    id: string;
    taskName?: string | null;
    todoCategoryId?: string | null;
    todoPriorityId?: string | null;
    dueDt?: string | null;
    isCompleted?: boolean;
    isArchived?: boolean;
    taskSort?: number;
}

export interface SimpleListItem {
    id: string;
    description?: string | null;
    completed: boolean;
}

export interface ApiMessage {
    messages?: (string | null)[] | null;
}

export interface ProblemDetails {
    type?: string | null;
    title?: string | null;
    status?: number | null; 
    detail?: string | null;
    instance?: string | null;
    errors?: { [key: string]: string[] }; 
}
import axios from 'axios';
import API_ENDPOINTS from '../constants/api';
import { IConnectionApiModel, IUserApiModel, IUserApiResponse } from '../interfaces/api';
import { HttpResponse } from '../interfaces/app';

const getAuthUser = async (bearerToken: string): Promise<HttpResponse<IUserApiResponse>> => {
    const userProfileResponse = await axios
        .get<HttpResponse<IUserApiResponse>>(API_ENDPOINTS.GET_AUTH_USER(), {
            headers: { authorization: `Bearer ${bearerToken}` },
        })
        .then((res) => res.data)
        .catch((err) => err);
    return userProfileResponse;
};

const getConnection = async (basicToken: string, connectionId: string): Promise<HttpResponse<IConnectionApiModel>> => {
    const connection = await axios
        .get<HttpResponse<IConnectionApiModel>>(API_ENDPOINTS.GET_CONNECTION(connectionId), {
            headers: { authorization: `Basic ${basicToken}` },
        })
        .then((res) => res.data)
        .catch((err) => err);
    return connection;
};

const getUserConnections = async (
    basicToken: string,
    userId: string,
    connectionType: 'all' | 'connected' | 'pending' | 'sent',
    limit: number,
    nextSearchStartFromKey?: string
): Promise<HttpResponse<Array<IConnectionApiModel>>> => {
    const queryString = `?connectionType=${connectionType}&limit=${limit}&nextSearchStartFromKey=${
        nextSearchStartFromKey || ''
    }`;
    const connections = await axios
        .get<HttpResponse<IConnectionApiModel>>(API_ENDPOINTS.GET_CONNECTIONS(userId, queryString), {
            headers: { authorization: `Basic ${basicToken}` },
        })
        .then((res) => res.data)
        .catch((err) => err);
    return connections;
};

const getUsersInfo = async (
    basicToken: string,
    usersList: Array<string>
): Promise<HttpResponse<Array<Partial<IUserApiModel>>>> => {
    const usersInfo = await axios
        .post<HttpResponse<Array<Partial<IUserApiModel>>>>(API_ENDPOINTS.GET_USERS_INFO(), usersList, {
            headers: { authorization: `Basic ${basicToken}` },
        })
        .then((res) => res.data)
        .catch((err) => err);
    return usersInfo;
};

const getUser = async (basicToken: string, userId: string): Promise<HttpResponse<IUserApiModel>> => {
    const userProfileResponse = await axios
        .get<HttpResponse<IUserApiResponse>>(API_ENDPOINTS.GET_USER(userId), {
            headers: { authorization: `Basic ${basicToken}` },
        })
        .then((res) => res.data)
        .catch((err) => err);
    return userProfileResponse;
};

const AVKKONNECT_CORE_SERVICE = {
    getConnection,
    getUsersInfo,
    getUser,
    getAuthUser,
    getUserConnections,
};

export default AVKKONNECT_CORE_SERVICE;

import { Document } from 'dynamoose/dist/Document';
import { ObjectType } from 'dynamoose/dist/General';
import {
    ContextConfigDefault,
    preHandlerAsyncHookHandler,
    RawReplyDefaultExpression,
    RawRequestDefaultExpression,
    RawServerDefault,
    RequestGenericInterface,
    RouteHandlerMethod,
} from 'fastify';
import { ReplyGenericInterface } from 'fastify/types/reply';
import { IFeedSource } from '../db/models/feeds';
import { IPostsInfo, IPostsInfoResponse, IRelatedSource } from './api';

export interface HttpResponseError {
    code: string;
    message: string;
}

export interface HttpDynamoDBResponsePagination {
    nextSearchStartFromKey?: ObjectType;
    count: number;
}

export interface HttpResponsePagination {
    totalCount: number;
    totalPages: number;
    page: number;
    count: number;
}

export interface HttpResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: HttpResponseError;
    pagination?: HttpResponsePagination;
    dDBPagination?: HttpDynamoDBResponsePagination;
}

export type IDynamooseDocument<T> = T & Document;

interface FastifyRouteGenericInterface extends RequestGenericInterface, ReplyGenericInterface {}

export type RequestHandler<Request = unknown> = RouteHandlerMethod<
    RawServerDefault,
    RawRequestDefaultExpression<RawServerDefault>,
    RawReplyDefaultExpression<RawServerDefault>,
    Request & FastifyRouteGenericInterface,
    ContextConfigDefault
>;

export type PreRequestHandler<Request = unknown> = preHandlerAsyncHookHandler<
    RawServerDefault,
    RawRequestDefaultExpression<RawServerDefault>,
    RawReplyDefaultExpression<RawServerDefault>,
    Request & FastifyRouteGenericInterface,
    ContextConfigDefault
>;

export interface IFeedsEventRecord {
    eventType: 'generateFeeds' | 'computeTrendingPostScore';
    resourceId: string;
    resourceType: 'post' | 'comment' | 'subComment' | 'reaction';
}

export interface IUserFeeds {
    documents: ISourceFeedApiResponse;
    dDBPagination: HttpDynamoDBResponsePagination;
}

export interface ITrendingFeeds {
    documents: IPostsInfoResponse | undefined;
    dDBPagination: HttpDynamoDBResponsePagination;
}

export interface ISourceFeedApiModel extends IPostsInfo {
    feedId: string;
    feedSources: Array<IFeedSource>;
}

export interface ISourceFeedApiResponse {
    feeds: Array<ISourceFeedApiModel>;
    relatedSources: Array<IRelatedSource>;
}

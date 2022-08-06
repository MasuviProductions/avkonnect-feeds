export interface IConnectionApiModel {
    id: string;
    connectorId: string;
    connecteeId: string;
    isConnected: boolean;
    connectedAt?: number;
    connectionInitiatedBy: string;
}

export interface IUserApiModel {
    id: string;
    aboutUser: string;
    backgroundImageUrl: string;
    connectionCount: number;
    currentPosition: string;
    dateOfBirth?: Date;
    displayPictureUrl: string;
    email: string;
    followerCount: number;
    followeeCount: number;
    headline: string;
    name: string;
    phone: string;
    gender: string;
    location: string;
    projectsRefId: string;
    experiencesRefId: string;
    skillsRefId: string;
    certificationsRefId: string;
    unseenNotificationsCount?: number;
}

export type ICommentAndReactionApiModelResourceType = 'post' | 'comment';

export type ISourceType = 'user' | 'company';

export interface IRelatedSource {
    sourceId: string;
    sourceType: ISourceType;
}
export interface IReactionApiModel {
    id: string;
    sourceId: string;
    sourceType: ISourceType;
    createdAt: Date;
    resourceId: string;
    resourceType: ICommentAndReactionApiModelResourceType;
    reaction: IReactionType;
}

export interface ICommentApiModel {
    sourceId: string;
    sourceType: ISourceType;
    resourceId: string;
    resourceType: ICommentAndReactionApiModelResourceType;
    id: string;
    createdAt: Date;
    contents: ICommentContent[];
}

export interface IPostsContent {
    text: string;
    createdAt: Date;
    mediaUrls: string[];
    relatedSources: IRelatedSource[];
    hashtags: string[];
}

export interface IPostApiModel {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    sourceId: string;
    sourceType: ISourceType;
    contents: IPostsContent[];
    visibleOnlyToConnections: boolean;
    commentsOnlyByConnections: boolean;
}

export const REACTIONS = ['like', 'support', 'love', 'laugh', 'sad'] as const;
export type IReactionType = typeof REACTIONS[number];

export interface ICommentContent {
    text: string;
    createdAt: Date;
    mediaUrls: string[];
    relatedSources: IRelatedSource[];
}

export interface IPostInfoSourceActivity {
    sourceComments?: ICommentContent[];
    sourceReaction?: IReactionType;
}

export interface IPostsInfo extends Omit<IPostApiModel, 'id'> {
    postId: string;
    reactionsCount: Record<IReactionType, number>;
    commentsCount: number;
    sourceActivity?: IPostInfoSourceActivity;
}

export interface IPostsInfoRequest {
    sourceId?: string;
    sourceType?: ISourceType;
    postIds: Array<string>;
}

export type IPostsInfoResponse = Array<IPostsInfo>;

export type IUserApiResponse = IUserApiModel;

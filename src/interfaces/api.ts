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

export type IRelatedSource = Partial<IUserApiModel>;

export type INotificationResourceType = 'post' | 'comment' | 'connection' | 'broadcast';

export type IConnectionActivity = 'connectionRequest' | 'connectionConfirmation';
export type IPostActivity = 'postReaction' | 'postComment' | 'postCreation';
export type ICommentActivity = 'commentReaction' | 'commentComment' | 'commentCreation';

export type INotificationResourceActivity = IConnectionActivity | IPostActivity | ICommentActivity;

export interface INotificationActivity {
    resourceId: string;
    resourceType: INotificationResourceType;
    resourceActivity: INotificationResourceActivity;
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
}

export interface IPostInfoSourceActivity {
    sourceComments?: ICommentContent[];
    sourceReaction?: IReactionType;
}

interface IBanInfo {
    sourceId: string;
    sourceType: ISourceType;
    banReason: string;
}

interface IActivityReportSource {
    sourceId: string;
    sourceType: ISourceType;
    reportReason: string;
}

interface IActivityReportInfo {
    reportCount: number;
    sources: Array<IActivityReportSource>;
}

export interface IActivityApiModel {
    id: string;
    resourceId: string;
    resourceType: ICommentAndReactionApiModelResourceType;
    reactionsCount: Record<IReactionType, number>;
    commentsCount: number;
    reportInfo: IActivityReportInfo;
    banInfo?: IBanInfo;
}

export interface IPostsInfo extends Omit<IPostApiModel, 'id'> {
    postId: string;
    activity: IActivityApiModel;
    sourceActivity?: IPostInfoSourceActivity;
}

export interface IPostsInfoRequest {
    sourceId?: string;
    sourceType?: ISourceType;
    postIds: Array<string>;
}

export interface IPostsInfoResponse {
    postsInfo: Array<IPostsInfo>;
    relatedSources: Array<IRelatedSource>;
}

export type IUserApiResponse = IUserApiModel;

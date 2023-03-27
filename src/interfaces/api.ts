export interface IConnectionApiModel {
    id: string;
    connectorId: string;
    connecteeId: string;
    isConnected: boolean;
    connectedAt?: number;
    connectionInitiatedBy: string;
}

export interface IImage<T extends string = string> {
    resolution: string;
    url: string;
    type: T;
}

export type IUserImageType =
    | 'displayPictureOriginal'
    | 'displayPictureThumbnail'
    | 'displayPictureMax'
    | 'displayPictureStandard'
    | 'backgroundPictureOriginal'
    | 'backgroundPictureThumbnail'
    | 'backgroundPictureMax'
    | 'backgroundPictureStandard';

export interface IUserImage {
    mediaUrls: Array<IMediaUrl>;
    mediaStatus: string;
}

type IMediaUrl = IImage<IUserImageType>;

export type IProfilePictureImages = IUserImage;

export type IBackgroundPictureImages = IUserImage;

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
    profilePictureImages: IProfilePictureImages;
    backgroundPictureImages: IBackgroundPictureImages;
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

export type IPostImageType = 'postImageOriginal' | 'postImageThumbnail' | 'postImageMax' | 'postImageStandard';

export interface IPostMediaUrl {
    resolution: string;
    url: string;
    type: IPostImageType;
}

export interface IPostsContent {
    text: string;
    createdAt: Date;
    mediaUrls: Array<Array<IPostMediaUrl>>;
    stringifiedRawContent: string;
}

export type IPostStatus = 'created' | 'draft';
export type IPostMediaStatus = 'uploading' | 'uploaded' | 'processing' | 'failed' | 'success';

export interface IPostApiModel {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    sourceId: string;
    sourceType: ISourceType;
    contents: IPostsContent[];
    hashtags: Array<string>;
    visibleOnlyToConnections: boolean;
    commentsOnlyByConnections: boolean;
    postStatus: IPostStatus;
    postMediaStatus: IPostMediaStatus;
    isDeleted: boolean;
    isBanned: boolean;
}

export const REACTIONS = ['like', 'support', 'love', 'laugh', 'sad'] as const;
export type IReactionType = typeof REACTIONS[number];

export interface ICommentContent {
    text: string;
    createdAt: Date;
    mediaUrls: string[];
    stringifiedRawContent: string;
}

export interface ISourceActivity {
    comments?: ICommentContent[];
    reaction?: IReactionType;
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

export type ICommentCountType = 'comment' | 'subComment';

export interface IActivityApiModel {
    id: string;
    resourceId: string;
    resourceType: ICommentAndReactionApiModelResourceType;
    reactionsCount: Record<IReactionType, number>;
    commentsCount: Record<ICommentCountType, number>;
    reportInfo: IActivityReportInfo;
    banInfo?: IBanInfo;
}

export interface IPostsInfo extends Omit<IPostApiModel, 'id'> {
    postId: string;
    activity: IActivityApiModel;
    sourceActivity?: ISourceActivity;
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

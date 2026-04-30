import { responsibleAPI } from "../dsl/dsl.ts"
import { GET, POST } from "../dsl/methods.ts"
import { named, ref } from "../dsl/nameable.ts"
import { resp } from "../dsl/operation.ts"
import { type InlineQueryParam, queryParam } from "../dsl/params.ts"
import {
  array,
  boolean,
  dict,
  double,
  int32,
  integer,
  object,
  string,
  uint32,
  unknown,
} from "../dsl/schema.ts"
import { scope } from "../dsl/scope.ts"
import {
  oauth2Requirement,
  oauth2Security,
  securityAND,
  securityOR,
} from "../dsl/security.ts"
import { declareTags } from "../dsl/tags.ts"

const ytOAuthScopes = {
  "https://www.googleapis.com/auth/youtube": "Manage your YouTube account",
  "https://www.googleapis.com/auth/youtube.channel-memberships.creator":
    "See a list of your current active channel members, their current level, and when they became a member",
  "https://www.googleapis.com/auth/youtube.force-ssl":
    "See, edit, and permanently delete your YouTube videos, ratings, comments and captions",
  "https://www.googleapis.com/auth/youtube.readonly":
    "View your YouTube account",
  "https://www.googleapis.com/auth/youtube.upload":
    "Manage your YouTube videos",
  "https://www.googleapis.com/auth/youtubepartner":
    "View and manage your assets and associated content on YouTube",
  "https://www.googleapis.com/auth/youtubepartner-channel-audit":
    "View private information of your YouTube channel relevant during the audit process with a YouTube partner",
}

const Oauth2 = named(
  "Oauth2",
  oauth2Security({
    description: "Oauth 2.0 implicit authentication",
    flows: {
      implicit: {
        authorizationUrl: "https://accounts.google.com/o/oauth2/auth",
        scopes: ytOAuthScopes,
      },
    },
  }),
)

const Oauth2c = () =>
  oauth2Security({
    description: "Oauth 2.0 authorizationCode authentication",
    flows: {
      authorizationCode: {
        authorizationUrl: "https://accounts.google.com/o/oauth2/auth",
        tokenUrl: "https://accounts.google.com/o/oauth2/token",
        scopes: ytOAuthScopes,
      },
    },
  })

type YtOauthScope = keyof typeof ytOAuthScopes

const oauthScope = (k: YtOauthScope) =>
  securityAND(oauth2Requirement(Oauth2, [k]), oauth2Requirement(Oauth2c, [k]))

/** ORs everything */
function oauthScopes(
  ...scopes: readonly [YtOauthScope, YtOauthScope, ...YtOauthScope[]]
) {
  const [first, second, ...rest] = scopes

  return securityOR(
    oauthScope(first),
    oauthScope(second),
    ...rest.map(oauthScope),
  )
}

const AbuseType = () => object({ "id?": string() })

const Entity = () =>
  object({
    "id?": string(),
    "typeId?": string(),
    "url?": string(),
  })

const AbuseReport = () =>
  object({
    "abuseTypes?": array(AbuseType),
    "description?": string(),
    "relatedEntities?": array(RelatedEntity),
    "subject?": Entity,
  })

const AccessPolicy = () =>
  object(
    {
      "allowed?": boolean({
        description:
          "The value of allowed indicates whether the access to the policy is allowed or denied by default.",
      }),
      "exception?": array(string(), {
        description:
          "A list of region codes that identify countries where the default policy do not apply.",
      }),
    },
    {
      description: "Rights management policy for YouTube resources.",
    },
  )

const Activity = () =>
  object(
    {
      "contentDetails?": ref(ActivityContentDetails, {
        description:
          "The contentDetails object contains information about the content associated with the activity. For example, if the snippet.type value is videoRated, then the contentDetails object's content identifies the rated video.",
      }),
      "etag?": string({ description: "Etag of this resource" }),
      "id?": string({
        description:
          "The ID that YouTube uses to uniquely identify the activity.",
      }),
      "kind?": string({
        default: "youtube#activity",
        description:
          'Identifies what kind of resource this is. Value: the fixed string "youtube#activity".',
      }),
      "snippet?": ref(ActivitySnippet, {
        description:
          "The snippet object contains basic details about the activity, including the activity's type and group ID.",
      }),
    },
    {
      description:
        "An *activity* resource contains information about an action that a particular channel, or user, has taken on YouTube.The actions reported in activity feeds include rating a video, sharing a video, marking a video as a favorite, commenting on a video, uploading a video, and so forth. Each activity resource identifies the type of action, the channel associated with the action, and the resource(s) associated with the action, such as the video that was rated or uploaded.",
    },
  )

function ActivityContentDetails() {
  return object(
    {
      "bulletin?": ref(ActivityContentDetailsBulletin, {
        description:
          "The bulletin object contains details about a channel bulletin post. This object is only present if the snippet.type is bulletin.",
      }),
      "channelItem?": ref(ActivityContentDetailsChannelItem, {
        description:
          "The channelItem object contains details about a resource which was added to a channel. This property is only present if the snippet.type is channelItem.",
      }),
      "comment?": ref(ActivityContentDetailsComment, {
        description:
          "The comment object contains information about a resource that received a comment. This property is only present if the snippet.type is comment.",
      }),
      "favorite?": ref(ActivityContentDetailsFavorite, {
        description:
          "The favorite object contains information about a video that was marked as a favorite video. This property is only present if the snippet.type is favorite.",
      }),
      "like?": ref(ActivityContentDetailsLike, {
        description:
          "The like object contains information about a resource that received a positive (like) rating. This property is only present if the snippet.type is like.",
      }),
      "playlistItem?": ref(ActivityContentDetailsPlaylistItem, {
        description:
          "The playlistItem object contains information about a new playlist item. This property is only present if the snippet.type is playlistItem.",
      }),
      "promotedItem?": ref(ActivityContentDetailsPromotedItem, {
        description:
          "The promotedItem object contains details about a resource which is being promoted. This property is only present if the snippet.type is promotedItem.",
      }),
      "recommendation?": ref(ActivityContentDetailsRecommendation, {
        description:
          "The recommendation object contains information about a recommended resource. This property is only present if the snippet.type is recommendation.",
      }),
      "social?": ref(ActivityContentDetailsSocial, {
        description:
          "The social object contains details about a social network post. This property is only present if the snippet.type is social.",
      }),
      "subscription?": ref(ActivityContentDetailsSubscription, {
        description:
          "The subscription object contains information about a channel that a user subscribed to. This property is only present if the snippet.type is subscription.",
      }),
      "upload?": ref(ActivityContentDetailsUpload, {
        description:
          "The upload object contains information about the uploaded video. This property is only present if the snippet.type is upload.",
      }),
    },
    {
      description:
        "Details about the content of an activity: the video that was shared, the channel that was subscribed to, etc.",
    },
  )
}
function ActivityContentDetailsBulletin() {
  return object(
    {
      "resourceId?": ref(ResourceId, {
        description:
          "The resourceId object contains information that identifies the resource associated with a bulletin post. @mutable youtube.activities.insert",
      }),
    },
    {
      description: "Details about a channel bulletin post.",
    },
  )
}
function ActivityContentDetailsChannelItem() {
  return object(
    {
      "resourceId?": ref(ResourceId, {
        description:
          "The resourceId object contains information that identifies the resource that was added to the channel.",
      }),
    },
    {
      description: "Details about a resource which was added to a channel.",
    },
  )
}
function ActivityContentDetailsComment() {
  return object(
    {
      "resourceId?": ref(ResourceId, {
        description:
          "The resourceId object contains information that identifies the resource associated with the comment.",
      }),
    },
    {
      description: "Information about a resource that received a comment.",
    },
  )
}
function ActivityContentDetailsFavorite() {
  return object(
    {
      "resourceId?": ref(ResourceId, {
        description:
          "The resourceId object contains information that identifies the resource that was marked as a favorite.",
      }),
    },
    {
      description:
        "Information about a video that was marked as a favorite video.",
    },
  )
}
function ActivityContentDetailsLike() {
  return object(
    {
      "resourceId?": ref(ResourceId, {
        description:
          "The resourceId object contains information that identifies the rated resource.",
      }),
    },
    {
      description:
        "Information about a resource that received a positive (like) rating.",
    },
  )
}
function ActivityContentDetailsPlaylistItem() {
  return object(
    {
      "playlistId?": string({
        description:
          "The value that YouTube uses to uniquely identify the playlist.",
      }),
      "playlistItemId?": string({
        description: "ID of the item within the playlist.",
      }),
      "resourceId?": ref(ResourceId, {
        description:
          "The resourceId object contains information about the resource that was added to the playlist.",
      }),
    },
    {
      description: "Information about a new playlist item.",
    },
  )
}
function ActivityContentDetailsPromotedItem() {
  return object(
    {
      "adTag?": string({
        description:
          "The URL the client should fetch to request a promoted item.",
      }),
      "clickTrackingUrl?": string({
        description:
          "The URL the client should ping to indicate that the user clicked through on this promoted item.",
      }),
      "creativeViewUrl?": string({
        description:
          "The URL the client should ping to indicate that the user was shown this promoted item.",
      }),
      "ctaType?": string({
        description:
          "The type of call-to-action, a message to the user indicating action that can be taken.",
        enum: ["ctaTypeUnspecified", "visitAdvertiserSite"],
      }),
      "customCtaButtonText?": string({
        description:
          "The custom call-to-action button text. If specified, it will override the default button text for the cta_type.",
      }),
      "descriptionText?": string({
        description: "The text description to accompany the promoted item.",
      }),
      "destinationUrl?": string({
        description:
          "The URL the client should direct the user to, if the user chooses to visit the advertiser's website.",
      }),
      "forecastingUrl?": array(string(), {
        description:
          "The list of forecasting URLs. The client should ping all of these URLs when a promoted item is not available, to indicate that a promoted item could have been shown.",
      }),
      "impressionUrl?": array(string(), {
        description:
          "The list of impression URLs. The client should ping all of these URLs to indicate that the user was shown this promoted item.",
      }),
      "videoId?": string({
        description:
          "The ID that YouTube uses to uniquely identify the promoted video.",
      }),
    },
    {
      description: "Details about a resource which is being promoted.",
    },
  )
}
function ActivityContentDetailsRecommendation() {
  return object(
    {
      "reason?": string({
        description: "The reason that the resource is recommended to the user.",
        enum: [
          "reasonUnspecified",
          "videoFavorited",
          "videoLiked",
          "videoWatched",
        ],
      }),
      "resourceId?": ref(ResourceId, {
        description:
          "The resourceId object contains information that identifies the recommended resource.",
      }),
      "seedResourceId?": ref(ResourceId, {
        description:
          "The seedResourceId object contains information about the resource that caused the recommendation.",
      }),
    },
    {
      description: "Information that identifies the recommended resource.",
    },
  )
}
function ActivityContentDetailsSocial() {
  return object(
    {
      "author?": string({
        description: "The author of the social network post.",
      }),
      "imageUrl?": string({
        description: "An image of the post's author.",
      }),
      "referenceUrl?": string({
        description: "The URL of the social network post.",
      }),
      "resourceId?": ref(ResourceId, {
        description:
          "The resourceId object encapsulates information that identifies the resource associated with a social network post.",
      }),
      "type?": string({
        description: "The name of the social network.",
        enum: ["unspecified", "googlePlus", "facebook", "twitter"],
      }),
    },
    {
      description: "Details about a social network post.",
    },
  )
}
function ActivityContentDetailsSubscription() {
  return object(
    {
      "resourceId?": ref(ResourceId, {
        description:
          "The resourceId object contains information that identifies the resource that the user subscribed to.",
      }),
    },
    {
      description: "Information about a channel that a user subscribed to.",
    },
  )
}
function ActivityContentDetailsUpload() {
  return object(
    {
      "videoId?": string({
        description:
          "The ID that YouTube uses to uniquely identify the uploaded video.",
      }),
    },
    {
      description: "Information about the uploaded video.",
    },
  )
}
function ActivityListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(Activity),
    "kind?": string({
      default: "youtube#activityListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#activityListResponse".',
    }),
    "nextPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the next page in the result set.",
    }),
    "pageInfo?": ref(PageInfo, {
      description: "General pagination information.",
    }),
    "prevPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the previous page in the result set.",
    }),
    "tokenPagination?": TokenPagination,
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}
function ActivitySnippet() {
  return object(
    {
      "channelId?": string({
        description:
          "The ID that YouTube uses to uniquely identify the channel associated with the activity.",
      }),
      "channelTitle?": string({
        description:
          "Channel title for the channel responsible for this activity",
      }),
      "description?": string({
        description:
          "The description of the resource primarily associated with the activity. @mutable youtube.activities.insert",
      }),
      "groupId?": string({
        description:
          "The group ID associated with the activity. A group ID identifies user events that are associated with the same user and resource. For example, if a user rates a video and marks the same video as a favorite, the entries for those events would have the same group ID in the user's activity feed. In your user interface, you can avoid repetition by grouping events with the same groupId value.",
      }),
      "publishedAt?": string({
        description: "The date and time that the video was uploaded.",
        format: "date-time",
      }),
      "thumbnails?": ref(ThumbnailDetails, {
        description:
          "A map of thumbnail images associated with the resource that is primarily associated with the activity. For each object in the map, the key is the name of the thumbnail image, and the value is an object that contains other information about the thumbnail.",
      }),
      "title?": string({
        description:
          "The title of the resource primarily associated with the activity.",
      }),
      "type?": string({
        description: "The type of activity that the resource describes.",
        enum: [
          "typeUnspecified",
          "upload",
          "like",
          "favorite",
          "comment",
          "subscription",
          "playlistItem",
          "recommendation",
          "bulletin",
          "social",
          "channelItem",
          "promotedItem",
        ],
      }),
    },
    {
      description:
        "Basic details about an activity, including title, description, thumbnails, activity type and group. Next ID: 12",
    },
  )
}
function Caption() {
  return object(
    {
      "etag?": string({
        description: "Etag of this resource.",
      }),
      "id?": string({
        description:
          "The ID that YouTube uses to uniquely identify the caption track.",
      }),
      "kind?": string({
        default: "youtube#caption",
        description:
          'Identifies what kind of resource this is. Value: the fixed string "youtube#caption".',
      }),
      "snippet?": ref(CaptionSnippet, {
        description:
          "The snippet object contains basic details about the caption.",
      }),
    },
    {
      description:
        "A *caption* resource represents a YouTube caption track. A caption track is associated with exactly one YouTube video.",
    },
  )
}
function CaptionListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(Caption, {
      description: "A list of captions that match the request criteria.",
    }),
    "kind?": string({
      default: "youtube#captionListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#captionListResponse".',
    }),
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}

function CaptionSnippet() {
  return object(
    {
      "audioTrackType?": string({
        description:
          "The type of audio track associated with the caption track.",
        enum: ["unknown", "primary", "commentary", "descriptive"],
      }),
      "failureReason?": string({
        description:
          "The reason that YouTube failed to process the caption track. This property is only present if the state property's value is failed.",
        enum: ["unknownFormat", "unsupportedFormat", "processingFailed"],
      }),
      "isAutoSynced?": boolean({
        description:
          "Indicates whether YouTube synchronized the caption track to the audio track in the video. The value will be true if a sync was explicitly requested when the caption track was uploaded. For example, when calling the captions.insert or captions.update methods, you can set the sync parameter to true to instruct YouTube to sync the uploaded track to the video. If the value is false, YouTube uses the time codes in the uploaded caption track to determine when to display captions.",
      }),
      "isCC?": boolean({
        description:
          "Indicates whether the track contains closed captions for the deaf and hard of hearing. The default value is false.",
      }),
      "isDraft?": boolean({
        description:
          "Indicates whether the caption track is a draft. If the value is true, then the track is not publicly visible. The default value is false. @mutable youtube.captions.insert youtube.captions.update",
      }),
      "isEasyReader?": boolean({
        description:
          'Indicates whether caption track is formatted for "easy reader," meaning it is at a third-grade level for language learners. The default value is false.',
      }),
      "isLarge?": boolean({
        description:
          "Indicates whether the caption track uses large text for the vision-impaired. The default value is false.",
      }),
      "language?": string({
        description:
          "The language of the caption track. The property value is a BCP-47 language tag.",
      }),
      "lastUpdated?": string({
        description:
          "The date and time when the caption track was last updated.",
        format: "date-time",
      }),
      "name?": string({
        description:
          "The name of the caption track. The name is intended to be visible to the user as an option during playback.",
      }),
      "status?": string({
        description: "The caption track's status.",
        enum: ["serving", "syncing", "failed"],
      }),
      "trackKind?": string({
        description: "The caption track's type.",
        enum: ["standard", "ASR", "forced"],
      }),
      "videoId?": string({
        description:
          "The ID that YouTube uses to uniquely identify the video associated with the caption track. @mutable youtube.captions.insert",
      }),
    },
    {
      description:
        "Basic details about a caption track, such as its language and name.",
    },
  )
}
function CdnSettings() {
  return object(
    {
      "format?": string({
        description:
          "The format of the video stream that you are sending to Youtube. ",
      }),
      "frameRate?": string({
        description: "The frame rate of the inbound video data.",
        enum: ["30fps", "60fps", "variable"],
      }),
      "ingestionInfo?": ref(IngestionInfo, {
        description:
          "The ingestionInfo object contains information that YouTube provides that you need to transmit your RTMP or HTTP stream to YouTube.",
      }),
      "ingestionType?": string({
        description:
          " The method or protocol used to transmit the video stream.",
        enum: ["rtmp", "dash", "webrtc", "hls"],
      }),
      "resolution?": string({
        description: "The resolution of the inbound video data.",
        enum: [
          "240p",
          "360p",
          "480p",
          "720p",
          "1080p",
          "1440p",
          "2160p",
          "variable",
        ],
      }),
    },
    {
      description: "Brief description of the live stream cdn settings.",
    },
  )
}

const ChannelLocalization = () =>
  object(
    {
      "description?": string({
        description: "The localized strings for channel's description.",
      }),
      "title?": string({
        description: "The localized strings for channel's title.",
      }),
    },
    { description: "Channel localization setting" },
  )

const Channel = () =>
  object(
    {
      "auditDetails?": ref(ChannelAuditDetails, {
        description:
          "The auditionDetails object encapsulates channel data that is relevant for YouTube Partners during the audition process.",
      }),
      "brandingSettings?": ref(ChannelBrandingSettings, {
        description:
          "The brandingSettings object encapsulates information about the branding of the channel.",
      }),
      "contentDetails?": ref(ChannelContentDetails, {
        description:
          "The contentDetails object encapsulates information about the channel's content.",
      }),
      "contentOwnerDetails?": ref(ChannelContentOwnerDetails, {
        description:
          "The contentOwnerDetails object encapsulates channel data that is relevant for YouTube Partners linked with the channel.",
      }),
      "conversionPings?": ref(ChannelConversionPings, {
        description:
          "The conversionPings object encapsulates information about conversion pings that need to be respected by the channel.",
      }),
      "etag?": string({
        description: "Etag of this resource.",
      }),
      "id?": string({
        description:
          "The ID that YouTube uses to uniquely identify the channel.",
      }),
      "kind?": string({
        default: "youtube#channel",
        description:
          'Identifies what kind of resource this is. Value: the fixed string "youtube#channel".',
      }),
      "localizations?": dict(string(), ChannelLocalization, {
        description: "Localizations for different languages",
      }),
      "snippet?": ref(ChannelSnippet, {
        description:
          "The snippet object contains basic details about the channel, such as its title, description, and thumbnail images.",
      }),
      "statistics?": ref(ChannelStatistics, {
        description:
          "The statistics object encapsulates statistics for the channel.",
      }),
      "status?": ref(ChannelStatus, {
        description:
          "The status object encapsulates information about the privacy status of the channel.",
      }),
      "topicDetails?": ref(ChannelTopicDetails, {
        description:
          "The topicDetails object encapsulates information about Freebase topics associated with the channel.",
      }),
    },
    {
      description:
        "A *channel* resource contains information about a YouTube channel.",
    },
  )

function ChannelAuditDetails() {
  return object(
    {
      "communityGuidelinesGoodStanding?": boolean({
        description:
          "Whether or not the channel respects the community guidelines.",
      }),
      "contentIdClaimsGoodStanding?": boolean({
        description: "Whether or not the channel has any unresolved claims.",
      }),
      "copyrightStrikesGoodStanding?": boolean({
        description: "Whether or not the channel has any copyright strikes.",
      }),
    },
    {
      description:
        "The auditDetails object encapsulates channel data that is relevant for YouTube Partners during the audit process.",
    },
  )
}
function ChannelBannerResource() {
  return object(
    {
      "etag?": string(),
      "kind?": string({
        default: "youtube#channelBannerResource",
        description:
          'Identifies what kind of resource this is. Value: the fixed string "youtube#channelBannerResource".',
      }),
      "url?": string({
        description: "The URL of this banner image.",
      }),
    },
    {
      description:
        "A channel banner returned as the response to a channel_banner.insert call.",
    },
  )
}
function ChannelBrandingSettings() {
  return object(
    {
      "channel?": ref(ChannelSettings, {
        description: "Branding properties for the channel view.",
      }),
      "hints?": array(PropertyValue, {
        description: "Additional experimental branding properties.",
      }),
      "image?": ref(ImageSettings, {
        description: "Branding properties for branding images.",
      }),
      "watch?": ref(WatchSettings, {
        description: "Branding properties for the watch page.",
      }),
    },
    {
      description: "Branding properties of a YouTube channel.",
    },
  )
}
function ChannelContentDetails() {
  return object(
    {
      "relatedPlaylists?": object({
        "favorites?": string({
          description:
            'The ID of the playlist that contains the channel"s favorite videos. Use the playlistItems.insert and playlistItems.delete to add or remove items from that list.',
        }),
        "likes?": string({
          description:
            'The ID of the playlist that contains the channel"s liked videos. Use the playlistItems.insert and playlistItems.delete to add or remove items from that list.',
        }),
        "uploads?": string({
          description:
            'The ID of the playlist that contains the channel"s uploaded videos. Use the videos.insert method to upload new videos and the videos.delete method to delete previously uploaded videos.',
        }),
        "watchHistory?": string({
          description:
            'The ID of the playlist that contains the channel"s watch history. Use the playlistItems.insert and playlistItems.delete to add or remove items from that list.',
        }),
        "watchLater?": string({
          description:
            'The ID of the playlist that contains the channel"s watch later playlist. Use the playlistItems.insert and playlistItems.delete to add or remove items from that list.',
        }),
      }),
    },
    {
      description: "Details about the content of a channel.",
    },
  )
}
function ChannelContentOwnerDetails() {
  return object(
    {
      "contentOwner?": string({
        description: "The ID of the content owner linked to the channel.",
      }),
      "timeLinked?": string({
        description:
          "The date and time when the channel was linked to the content owner.",
        format: "date-time",
      }),
    },
    {
      description:
        "The contentOwnerDetails object encapsulates channel data that is relevant for YouTube Partners linked with the channel.",
    },
  )
}
function ChannelConversionPing() {
  return object(
    {
      "context?": string({
        description: "Defines the context of the ping.",
        enum: ["subscribe", "unsubscribe", "cview"],
      }),
      "conversionUrl?": string({
        description:
          "The url (without the schema) that the player shall send the ping to. It's at caller's descretion to decide which schema to use (http vs https) Example of a returned url: //googleads.g.doubleclick.net/pagead/ viewthroughconversion/962985656/?data=path%3DtHe_path%3Btype%3D cview%3Butuid%3DGISQtTNGYqaYl4sKxoVvKA&labe=default The caller must append biscotti authentication (ms param in case of mobile, for example) to this ping.",
      }),
    },
    {
      description:
        "Pings that the app shall fire (authenticated by biscotti cookie). Each ping has a context, in which the app must fire the ping, and a url identifying the ping.",
    },
  )
}
function ChannelConversionPings() {
  return object(
    {
      "pings?": array(ChannelConversionPing, {
        description:
          "Pings that the app shall fire (authenticated by biscotti cookie). Each ping has a context, in which the app must fire the ping, and a url identifying the ping.",
      }),
    },
    {
      description:
        "The conversionPings object encapsulates information about conversion pings that need to be respected by the channel.",
    },
  )
}
function ChannelListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(Channel),
    "kind?": string({
      default: "youtube#channelListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#channelListResponse".',
    }),
    "nextPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the next page in the result set.",
    }),
    "pageInfo?": ref(PageInfo, {
      description: "General pagination information.",
    }),
    "prevPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the previous page in the result set.",
    }),
    "tokenPagination?": TokenPagination,
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}

function ChannelProfileDetails() {
  return object({
    "channelId?": string({
      description: "The YouTube channel ID.",
    }),
    "channelUrl?": string({
      description: "The channel's URL.",
    }),
    "displayName?": string({
      description: "The channel's display name.",
    }),
    "profileImageUrl?": string({
      description: "The channels's avatar URL.",
    }),
  })
}
function ChannelSection() {
  return object({
    "contentDetails?": ref(ChannelSectionContentDetails, {
      description:
        "The contentDetails object contains details about the channel section content, such as a list of playlists or channels featured in the section.",
    }),
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "id?": string({
      description:
        "The ID that YouTube uses to uniquely identify the channel section.",
    }),
    "kind?": string({
      default: "youtube#channelSection",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#channelSection".',
    }),
    "localizations?": dict(string(), ChannelSectionLocalization, {
      description: "Localizations for different languages",
    }),
    "snippet?": ref(ChannelSectionSnippet, {
      description:
        "The snippet object contains basic details about the channel section, such as its type, style and title.",
    }),
    "targeting?": ref(ChannelSectionTargeting, {
      description:
        "The targeting object contains basic targeting settings about the channel section.",
    }),
  })
}
function ChannelSectionContentDetails() {
  return object(
    {
      "channels?": array(string(), {
        description: "The channel ids for type multiple_channels.",
      }),
      "playlists?": array(string(), {
        description:
          "The playlist ids for type single_playlist and multiple_playlists. For singlePlaylist, only one playlistId is allowed.",
      }),
    },
    {
      description:
        "Details about a channelsection, including playlists and channels.",
    },
  )
}
function ChannelSectionListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(ChannelSection, {
      description: "A list of ChannelSections that match the request criteria.",
    }),
    "kind?": string({
      default: "youtube#channelSectionListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#channelSectionListResponse".',
    }),
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}
function ChannelSectionLocalization() {
  return object(
    {
      "title?": string({
        description: "The localized strings for channel section's title.",
      }),
    },
    {
      description: "ChannelSection localization setting",
    },
  )
}
function ChannelSectionSnippet() {
  return object(
    {
      "channelId?": string({
        description:
          "The ID that YouTube uses to uniquely identify the channel that published the channel section.",
      }),
      "defaultLanguage?": string({
        description:
          "The language of the channel section's default title and description.",
      }),
      "localized?": ref(ChannelSectionLocalization, {
        description: "Localized title, read-only.",
      }),
      "position?": uint32({
        description: "The position of the channel section in the channel.",
      }),
      "style?": string({
        description: "The style of the channel section.",
        enum: [
          "channelsectionStyleUnspecified",
          "horizontalRow",
          "verticalList",
        ],
      }),
      "title?": string({
        description:
          "The channel section's title for multiple_playlists and multiple_channels.",
      }),
      "type?": string({
        description: "The type of the channel section.",
        enum: [
          "channelsectionTypeUndefined",
          "singlePlaylist",
          "multiplePlaylists",
          "popularUploads",
          "recentUploads",
          "likes",
          "allPlaylists",
          "likedPlaylists",
          "recentPosts",
          "recentActivity",
          "liveEvents",
          "upcomingEvents",
          "completedEvents",
          "multipleChannels",
          "postedVideos",
          "postedPlaylists",
          "subscriptions",
        ],
      }),
    },
    {
      description:
        "Basic details about a channel section, including title, style and position.",
    },
  )
}
function ChannelSectionTargeting() {
  return object(
    {
      "countries?": array(string(), {
        description: "The country the channel section is targeting.",
      }),
      "languages?": array(string(), {
        description: "The language the channel section is targeting.",
      }),
      "regions?": array(string(), {
        description: "The region the channel section is targeting.",
      }),
    },
    {
      description: "ChannelSection targeting setting.",
    },
  )
}
function ChannelSettings() {
  return object(
    {
      "country?": string({
        description: "The country of the channel.",
      }),
      "defaultLanguage?": string(),
      "defaultTab?": string({
        description:
          "Which content tab users should see when viewing the channel.",
      }),
      "description?": string({
        description: "Specifies the channel description.",
      }),
      "featuredChannelsTitle?": string({
        description: "Title for the featured channels tab.",
      }),
      "featuredChannelsUrls?": array(string(), {
        description: "The list of featured channels.",
      }),
      "keywords?": string({
        description:
          "Lists keywords associated with the channel, comma-separated.",
      }),
      "moderateComments?": boolean({
        description:
          "Whether user-submitted comments left on the channel page need to be approved by the channel owner to be publicly visible.",
      }),
      "profileColor?": string({
        description:
          "A prominent color that can be rendered on this channel page.",
      }),
      "showBrowseView?": boolean({
        description:
          "Whether the tab to browse the videos should be displayed.",
      }),
      "showRelatedChannels?": boolean({
        description: "Whether related channels should be proposed.",
      }),
      "title?": string({
        description: "Specifies the channel title.",
      }),
      "trackingAnalyticsAccountId?": string({
        description:
          "The ID for a Google Analytics account to track and measure traffic to the channels.",
      }),
      "unsubscribedTrailer?": string({
        description:
          "The trailer of the channel, for users that are not subscribers.",
      }),
    },
    {
      description: "Branding properties for the channel view.",
    },
  )
}
function ChannelSnippet() {
  return object(
    {
      "country?": string({
        description: "The country of the channel.",
      }),
      "customUrl?": string({
        description: "The custom url of the channel.",
      }),
      "defaultLanguage?": string({
        description:
          "The language of the channel's default title and description.",
      }),
      "description?": string({
        description: "The description of the channel.",
      }),
      "localized?": ref(ChannelLocalization, {
        description: "Localized title and description, read-only.",
      }),
      "publishedAt?": string({
        description: "The date and time that the channel was created.",
        format: "date-time",
      }),
      "thumbnails?": ref(ThumbnailDetails, {
        description:
          "A map of thumbnail images associated with the channel. For each object in the map, the key is the name of the thumbnail image, and the value is an object that contains other information about the thumbnail. When displaying thumbnails in your application, make sure that your code uses the image URLs exactly as they are returned in API responses. For example, your application should not use the http domain instead of the https domain in a URL returned in an API response. Beginning in July 2018, channel thumbnail URLs will only be available in the https domain, which is how the URLs appear in API responses. After that time, you might see broken images in your application if it tries to load YouTube images from the http domain. Thumbnail images might be empty for newly created channels and might take up to one day to populate.",
      }),
      "title?": string({
        description: "The channel's title.",
      }),
    },
    {
      description:
        "Basic details about a channel, including title, description and thumbnails.",
    },
  )
}
function ChannelStatistics() {
  return object(
    {
      "commentCount?": string({
        description: "The number of comments for the channel.",
        format: "uint64",
      }),
      "hiddenSubscriberCount?": boolean({
        description:
          "Whether or not the number of subscribers is shown for this user.",
      }),
      "subscriberCount?": string({
        description: "The number of subscribers that the channel has.",
        format: "uint64",
      }),
      "videoCount?": string({
        description: "The number of videos uploaded to the channel.",
        format: "uint64",
      }),
      "viewCount?": string({
        description: "The number of times the channel has been viewed.",
        format: "uint64",
      }),
    },
    {
      description:
        "Statistics about a channel: number of subscribers, number of videos in the channel, etc.",
    },
  )
}
function ChannelStatus() {
  return object(
    {
      "isLinked?": boolean({
        description:
          "If true, then the user is linked to either a YouTube username or G+ account. Otherwise, the user doesn't have a public YouTube identity.",
      }),
      "longUploadsStatus?": string({
        description:
          "The long uploads status of this channel. See https://support.google.com/youtube/answer/71673 for more information.",
        enum: ["longUploadsUnspecified", "allowed", "eligible", "disallowed"],
      }),
      "madeForKids?": boolean(),
      "privacyStatus?": string({
        description: "Privacy status of the channel.",
        enum: ["public", "unlisted", "private"],
      }),
      "selfDeclaredMadeForKids?": boolean(),
    },
    {
      description: "JSON template for the status part of a channel.",
    },
  )
}
function ChannelToStoreLinkDetails() {
  return object(
    {
      "merchantId?": string({
        description: "Google Merchant Center id of the store.",
        format: "uint64",
      }),
      "storeName?": string({
        description: "Name of the store.",
      }),
      "storeUrl?": string({
        description: "Landing page of the store.",
      }),
    },
    {
      description:
        "Information specific to a store on a merchandising platform linked to a YouTube channel.",
    },
  )
}
function ChannelTopicDetails() {
  return object(
    {
      "topicCategories?": array(string(), {
        description:
          "A list of Wikipedia URLs that describe the channel's content.",
      }),
      "topicIds?": array(string(), {
        description:
          "A list of Freebase topic IDs associated with the channel. You can retrieve information about each topic using the Freebase Topic API.",
      }),
    },
    {
      description: "Freebase topic information related to the channel.",
    },
  )
}
function Comment() {
  return object(
    {
      "etag?": string({
        description: "Etag of this resource.",
      }),
      "id?": string({
        description:
          "The ID that YouTube uses to uniquely identify the comment.",
      }),
      "kind?": string({
        default: "youtube#comment",
        description:
          'Identifies what kind of resource this is. Value: the fixed string "youtube#comment".',
      }),
      "snippet?": ref(CommentSnippet, {
        description:
          "The snippet object contains basic details about the comment.",
      }),
    },
    {
      description: "A *comment* represents a single YouTube comment.",
    },
  )
}
function CommentListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(Comment, {
      description: "A list of comments that match the request criteria.",
    }),
    "kind?": string({
      default: "youtube#commentListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#commentListResponse".',
    }),
    "nextPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the next page in the result set.",
    }),
    "pageInfo?": ref(PageInfo, {
      description: "General pagination information.",
    }),
    "tokenPagination?": TokenPagination,
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}
function CommentSnippet() {
  return object(
    {
      "authorChannelId?": CommentSnippetAuthorChannelId,
      "authorChannelUrl?": string({
        description: "Link to the author's YouTube channel, if any.",
      }),
      "authorDisplayName?": string({
        description: "The name of the user who posted the comment.",
      }),
      "authorProfileImageUrl?": string({
        description:
          "The URL for the avatar of the user who posted the comment.",
      }),
      "canRate?": boolean({
        description: "Whether the current viewer can rate this comment.",
      }),
      "channelId?": string({
        description:
          "The id of the corresponding YouTube channel. In case of a channel comment this is the channel the comment refers to. In case of a video comment it's the video's channel.",
      }),
      "likeCount?": uint32({
        description: "The total number of likes this comment has received.",
      }),
      "moderationStatus?": string({
        description:
          "The comment's moderation status. Will not be set if the comments were requested through the id filter.",
        enum: ["published", "heldForReview", "likelySpam", "rejected"],
      }),
      "parentId?": string({
        description:
          "The unique id of the parent comment, only set for replies.",
      }),
      "publishedAt?": string({
        description:
          "The date and time when the comment was originally published.",
        format: "date-time",
      }),
      "textDisplay?": string({
        description:
          "The comment's text. The format is either plain text or HTML dependent on what has been requested. Even the plain text representation may differ from the text originally posted in that it may replace video links with video titles etc.",
      }),
      "textOriginal?": string({
        description:
          "The comment's original raw text as initially posted or last updated. The original text will only be returned if it is accessible to the viewer, which is only guaranteed if the viewer is the comment's author.",
      }),
      "updatedAt?": string({
        description: "The date and time when the comment was last updated.",
        format: "date-time",
      }),
      "videoId?": string({
        description: "The ID of the video the comment refers to, if any.",
      }),
      "viewerRating?": string({
        description:
          "The rating the viewer has given to this comment. For the time being this will never return RATE_TYPE_DISLIKE and instead return RATE_TYPE_NONE. This may change in the future.",
        enum: ["none", "like", "dislike"],
      }),
    },
    {
      description:
        "Basic details about a comment, such as its author and text.",
    },
  )
}
function CommentSnippetAuthorChannelId() {
  return object(
    {
      "value?": string(),
    },
    {
      description: "The id of the author's YouTube channel, if any.",
    },
  )
}
function CommentThread() {
  return object(
    {
      "etag?": string({
        description: "Etag of this resource.",
      }),
      "id?": string({
        description:
          "The ID that YouTube uses to uniquely identify the comment thread.",
      }),
      "kind?": string({
        default: "youtube#commentThread",
        description:
          'Identifies what kind of resource this is. Value: the fixed string "youtube#commentThread".',
      }),
      "replies?": ref(CommentThreadReplies, {
        description:
          "The replies object contains a limited number of replies (if any) to the top level comment found in the snippet.",
      }),
      "snippet?": ref(CommentThreadSnippet, {
        description:
          "The snippet object contains basic details about the comment thread and also the top level comment.",
      }),
    },
    {
      description:
        "A *comment thread* represents information that applies to a top level comment and all its replies. It can also include the top level comment itself and some of the replies.",
    },
  )
}
function CommentThreadListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(CommentThread, {
      description: "A list of comment threads that match the request criteria.",
    }),
    "kind?": string({
      default: "youtube#commentThreadListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#commentThreadListResponse".',
    }),
    "nextPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the next page in the result set.",
    }),
    "pageInfo?": ref(PageInfo, {
      description: "General pagination information.",
    }),
    "tokenPagination?": TokenPagination,
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}
function CommentThreadReplies() {
  return object(
    {
      "comments?": array(Comment, {
        description:
          "A limited number of replies. Unless the number of replies returned equals total_reply_count in the snippet the returned replies are only a subset of the total number of replies.",
      }),
    },
    {
      description:
        "Comments written in (direct or indirect) reply to the top level comment.",
    },
  )
}
function CommentThreadSnippet() {
  return object(
    {
      "canReply?": boolean({
        description:
          "Whether the current viewer of the thread can reply to it. This is viewer specific - other viewers may see a different value for this field.",
      }),
      "channelId?": string({
        description:
          "The YouTube channel the comments in the thread refer to or the channel with the video the comments refer to. If video_id isn't set the comments refer to the channel itself.",
      }),
      "isPublic?": boolean({
        description:
          "Whether the thread (and therefore all its comments) is visible to all YouTube users.",
      }),
      "topLevelComment?": ref(Comment, {
        description: "The top level comment of this thread.",
      }),
      "totalReplyCount?": uint32({
        description:
          "The total number of replies (not including the top level comment).",
      }),
      "videoId?": string({
        description:
          "The ID of the video the comments refer to, if any. No video_id implies a channel discussion comment.",
      }),
    },
    {
      description: "Basic details about a comment thread.",
    },
  )
}
function ContentRating() {
  return object(
    {
      "acbRating?": string({
        description:
          "The video's Australian Classification Board (ACB) or Australian Communications and Media Authority (ACMA) rating. ACMA ratings are used to classify children's television programming.",
        enum: [
          "acbUnspecified",
          "acbE",
          "acbP",
          "acbC",
          "acbG",
          "acbPg",
          "acbM",
          "acbMa15plus",
          "acbR18plus",
          "acbUnrated",
        ],
      }),
      "agcomRating?": string({
        description:
          "The video's rating from Italy's Autorità per le Garanzie nelle Comunicazioni (AGCOM).",
        enum: [
          "agcomUnspecified",
          "agcomT",
          "agcomVm14",
          "agcomVm18",
          "agcomUnrated",
        ],
      }),
      "anatelRating?": string({
        description:
          "The video's Anatel (Asociación Nacional de Televisión) rating for Chilean television.",
        enum: [
          "anatelUnspecified",
          "anatelF",
          "anatelI",
          "anatelI7",
          "anatelI10",
          "anatelI12",
          "anatelR",
          "anatelA",
          "anatelUnrated",
        ],
      }),
      "bbfcRating?": string({
        description:
          "The video's British Board of Film Classification (BBFC) rating.",
        enum: [
          "bbfcUnspecified",
          "bbfcU",
          "bbfcPg",
          "bbfc12a",
          "bbfc12",
          "bbfc15",
          "bbfc18",
          "bbfcR18",
          "bbfcUnrated",
        ],
      }),
      "bfvcRating?": string({
        description:
          "The video's rating from Thailand's Board of Film and Video Censors.",
        enum: [
          "bfvcUnspecified",
          "bfvcG",
          "bfvcE",
          "bfvc13",
          "bfvc15",
          "bfvc18",
          "bfvc20",
          "bfvcB",
          "bfvcUnrated",
        ],
      }),
      "bmukkRating?": string({
        description:
          "The video's rating from the Austrian Board of Media Classification (Bundesministerium für Unterricht, Kunst und Kultur).",
        enum: [
          "bmukkUnspecified",
          "bmukkAa",
          "bmukk6",
          "bmukk8",
          "bmukk10",
          "bmukk12",
          "bmukk14",
          "bmukk16",
          "bmukkUnrated",
        ],
      }),
      "catvRating?": string({
        description:
          "Rating system for Canadian TV - Canadian TV Classification System The video's rating from the Canadian Radio-Television and Telecommunications Commission (CRTC) for Canadian English-language broadcasts. For more information, see the Canadian Broadcast Standards Council website.",
        enum: [
          "catvUnspecified",
          "catvC",
          "catvC8",
          "catvG",
          "catvPg",
          "catv14plus",
          "catv18plus",
          "catvUnrated",
          "catvE",
        ],
      }),
      "catvfrRating?": string({
        description:
          "The video's rating from the Canadian Radio-Television and Telecommunications Commission (CRTC) for Canadian French-language broadcasts. For more information, see the Canadian Broadcast Standards Council website.",
        enum: [
          "catvfrUnspecified",
          "catvfrG",
          "catvfr8plus",
          "catvfr13plus",
          "catvfr16plus",
          "catvfr18plus",
          "catvfrUnrated",
          "catvfrE",
        ],
      }),
      "cbfcRating?": string({
        description:
          "The video's Central Board of Film Certification (CBFC - India) rating.",
        enum: [
          "cbfcUnspecified",
          "cbfcU",
          "cbfcUA",
          "cbfcUA7plus",
          "cbfcUA13plus",
          "cbfcUA16plus",
          "cbfcA",
          "cbfcS",
          "cbfcUnrated",
        ],
      }),
      "cccRating?": string({
        description:
          "The video's Consejo de Calificación Cinematográfica (Chile) rating.",
        enum: [
          "cccUnspecified",
          "cccTe",
          "ccc6",
          "ccc14",
          "ccc18",
          "ccc18v",
          "ccc18s",
          "cccUnrated",
        ],
      }),
      "cceRating?": string({
        description:
          "The video's rating from Portugal's Comissão de Classificação de Espect´culos.",
        enum: [
          "cceUnspecified",
          "cceM4",
          "cceM6",
          "cceM12",
          "cceM16",
          "cceM18",
          "cceUnrated",
          "cceM14",
        ],
      }),
      "chfilmRating?": string({
        description: "The video's rating in Switzerland.",
        enum: [
          "chfilmUnspecified",
          "chfilm0",
          "chfilm6",
          "chfilm12",
          "chfilm16",
          "chfilm18",
          "chfilmUnrated",
        ],
      }),
      "chvrsRating?": string({
        description:
          "The video's Canadian Home Video Rating System (CHVRS) rating.",
        enum: [
          "chvrsUnspecified",
          "chvrsG",
          "chvrsPg",
          "chvrs14a",
          "chvrs18a",
          "chvrsR",
          "chvrsE",
          "chvrsUnrated",
        ],
      }),
      "cicfRating?": string({
        description:
          "The video's rating from the Commission de Contrôle des Films (Belgium).",
        enum: [
          "cicfUnspecified",
          "cicfE",
          "cicfKtEa",
          "cicfKntEna",
          "cicfUnrated",
        ],
      }),
      "cnaRating?": string({
        description:
          "The video's rating from Romania's CONSILIUL NATIONAL AL AUDIOVIZUALULUI (CNA).",
        enum: [
          "cnaUnspecified",
          "cnaAp",
          "cna12",
          "cna15",
          "cna18",
          "cna18plus",
          "cnaUnrated",
        ],
      }),
      "cncRating?": string({
        description:
          "Rating system in France - Commission de classification cinematographique",
        enum: [
          "cncUnspecified",
          "cncT",
          "cnc10",
          "cnc12",
          "cnc16",
          "cnc18",
          "cncE",
          "cncInterdiction",
          "cncUnrated",
        ],
      }),
      "csaRating?": string({
        description:
          "The video's rating from France's Conseil supérieur de l’audiovisuel, which rates broadcast content.",
        enum: [
          "csaUnspecified",
          "csaT",
          "csa10",
          "csa12",
          "csa16",
          "csa18",
          "csaInterdiction",
          "csaUnrated",
        ],
      }),
      "cscfRating?": string({
        description:
          "The video's rating from Luxembourg's Commission de surveillance de la classification des films (CSCF).",
        enum: [
          "cscfUnspecified",
          "cscfAl",
          "cscfA",
          "cscf6",
          "cscf9",
          "cscf12",
          "cscf16",
          "cscf18",
          "cscfUnrated",
        ],
      }),
      "czfilmRating?": string({
        description: "The video's rating in the Czech Republic.",
        enum: [
          "czfilmUnspecified",
          "czfilmU",
          "czfilm12",
          "czfilm14",
          "czfilm18",
          "czfilmUnrated",
        ],
      }),
      "djctqRating?": string({
        description:
          "The video's Departamento de Justiça, Classificação, Qualificação e Títulos (DJCQT - Brazil) rating.",
        enum: [
          "djctqUnspecified",
          "djctqL",
          "djctq10",
          "djctq12",
          "djctq14",
          "djctq16",
          "djctq18",
          "djctqEr",
          "djctqL10",
          "djctqL12",
          "djctqL14",
          "djctqL16",
          "djctqL18",
          "djctq1012",
          "djctq1014",
          "djctq1016",
          "djctq1018",
          "djctq1214",
          "djctq1216",
          "djctq1218",
          "djctq1416",
          "djctq1418",
          "djctq1618",
          "djctqUnrated",
        ],
      }),
      "djctqRatingReasons?": array(
        string({
          enum: [
            "djctqRatingReasonUnspecified",
            "djctqViolence",
            "djctqExtremeViolence",
            "djctqSexualContent",
            "djctqNudity",
            "djctqSex",
            "djctqExplicitSex",
            "djctqDrugs",
            "djctqLegalDrugs",
            "djctqIllegalDrugs",
            "djctqInappropriateLanguage",
            "djctqCriminalActs",
            "djctqImpactingContent",
          ],
        }),
        {
          description:
            "Reasons that explain why the video received its DJCQT (Brazil) rating.",
        },
      ),
      "ecbmctRating?": string({
        description:
          "Rating system in Turkey - Evaluation and Classification Board of the Ministry of Culture and Tourism",
        enum: [
          "ecbmctUnspecified",
          "ecbmctG",
          "ecbmct7a",
          "ecbmct7plus",
          "ecbmct13a",
          "ecbmct13plus",
          "ecbmct15a",
          "ecbmct15plus",
          "ecbmct18plus",
          "ecbmctUnrated",
        ],
      }),
      "eefilmRating?": string({
        description: "The video's rating in Estonia.",
        enum: [
          "eefilmUnspecified",
          "eefilmPere",
          "eefilmL",
          "eefilmMs6",
          "eefilmK6",
          "eefilmMs12",
          "eefilmK12",
          "eefilmK14",
          "eefilmK16",
          "eefilmUnrated",
        ],
      }),
      "egfilmRating?": string({
        description: "The video's rating in Egypt.",
        enum: [
          "egfilmUnspecified",
          "egfilmGn",
          "egfilm18",
          "egfilmBn",
          "egfilmUnrated",
        ],
      }),
      "eirinRating?": string({
        description:
          "The video's Eirin (映倫) rating. Eirin is the Japanese rating system.",
        enum: [
          "eirinUnspecified",
          "eirinG",
          "eirinPg12",
          "eirinR15plus",
          "eirinR18plus",
          "eirinUnrated",
        ],
      }),
      "fcbmRating?": string({
        description:
          "The video's rating from Malaysia's Film Censorship Board.",
        enum: [
          "fcbmUnspecified",
          "fcbmU",
          "fcbmPg13",
          "fcbmP13",
          "fcbm18",
          "fcbm18sx",
          "fcbm18pa",
          "fcbm18sg",
          "fcbm18pl",
          "fcbmUnrated",
        ],
      }),
      "fcoRating?": string({
        description:
          "The video's rating from Hong Kong's Office for Film, Newspaper and Article Administration.",
        enum: [
          "fcoUnspecified",
          "fcoI",
          "fcoIia",
          "fcoIib",
          "fcoIi",
          "fcoIii",
          "fcoUnrated",
        ],
      }),
      "fmocRating?": string({
        description:
          "This property has been deprecated. Use the contentDetails.contentRating.cncRating instead.",
        enum: [
          "fmocUnspecified",
          "fmocU",
          "fmoc10",
          "fmoc12",
          "fmoc16",
          "fmoc18",
          "fmocE",
          "fmocUnrated",
        ],
      }),
      "fpbRating?": string({
        description:
          "The video's rating from South Africa's Film and Publication Board.",
        enum: [
          "fpbUnspecified",
          "fpbA",
          "fpbPg",
          "fpb79Pg",
          "fpb1012Pg",
          "fpb13",
          "fpb16",
          "fpb18",
          "fpbX18",
          "fpbXx",
          "fpbUnrated",
          "fpb10",
        ],
      }),
      "fpbRatingReasons?": array(
        string({
          enum: [
            "fpbRatingReasonUnspecified",
            "fpbBlasphemy",
            "fpbLanguage",
            "fpbNudity",
            "fpbPrejudice",
            "fpbSex",
            "fpbViolence",
            "fpbDrugs",
            "fpbSexualViolence",
            "fpbHorror",
            "fpbCriminalTechniques",
            "fpbImitativeActsTechniques",
          ],
        }),
        {
          description:
            "Reasons that explain why the video received its FPB (South Africa) rating.",
        },
      ),
      "fskRating?": string({
        description:
          "The video's Freiwillige Selbstkontrolle der Filmwirtschaft (FSK - Germany) rating.",
        enum: [
          "fskUnspecified",
          "fsk0",
          "fsk6",
          "fsk12",
          "fsk16",
          "fsk18",
          "fskUnrated",
        ],
      }),
      "grfilmRating?": string({
        description: "The video's rating in Greece.",
        enum: [
          "grfilmUnspecified",
          "grfilmK",
          "grfilmE",
          "grfilmK12",
          "grfilmK13",
          "grfilmK15",
          "grfilmK17",
          "grfilmK18",
          "grfilmUnrated",
        ],
      }),
      "icaaRating?": string({
        description:
          "The video's Instituto de la Cinematografía y de las Artes Audiovisuales (ICAA - Spain) rating.",
        enum: [
          "icaaUnspecified",
          "icaaApta",
          "icaa7",
          "icaa12",
          "icaa13",
          "icaa16",
          "icaa18",
          "icaaX",
          "icaaUnrated",
        ],
      }),
      "ifcoRating?": string({
        description:
          "The video's Irish Film Classification Office (IFCO - Ireland) rating. See the IFCO website for more information.",
        enum: [
          "ifcoUnspecified",
          "ifcoG",
          "ifcoPg",
          "ifco12",
          "ifco12a",
          "ifco15",
          "ifco15a",
          "ifco16",
          "ifco18",
          "ifcoUnrated",
        ],
      }),
      "ilfilmRating?": string({
        description: "The video's rating in Israel.",
        enum: [
          "ilfilmUnspecified",
          "ilfilmAa",
          "ilfilm12",
          "ilfilm14",
          "ilfilm16",
          "ilfilm18",
          "ilfilmUnrated",
        ],
      }),
      "incaaRating?": string({
        description:
          "The video's INCAA (Instituto Nacional de Cine y Artes Audiovisuales - Argentina) rating.",
        enum: [
          "incaaUnspecified",
          "incaaAtp",
          "incaaSam13",
          "incaaSam16",
          "incaaSam18",
          "incaaC",
          "incaaUnrated",
        ],
      }),
      "kfcbRating?": string({
        description:
          "The video's rating from the Kenya Film Classification Board.",
        enum: [
          "kfcbUnspecified",
          "kfcbG",
          "kfcbPg",
          "kfcb16plus",
          "kfcbR",
          "kfcbUnrated",
        ],
      }),
      "kijkwijzerRating?": string({
        description:
          "The video's NICAM/Kijkwijzer rating from the Nederlands Instituut voor de Classificatie van Audiovisuele Media (Netherlands).",
        enum: [
          "kijkwijzerUnspecified",
          "kijkwijzerAl",
          "kijkwijzer6",
          "kijkwijzer9",
          "kijkwijzer12",
          "kijkwijzer16",
          "kijkwijzer18",
          "kijkwijzerUnrated",
        ],
      }),
      "kmrbRating?": string({
        description:
          "The video's Korea Media Rating Board (영상물등급위원회) rating. The KMRB rates videos in South Korea.",
        enum: [
          "kmrbUnspecified",
          "kmrbAll",
          "kmrb12plus",
          "kmrb15plus",
          "kmrbTeenr",
          "kmrbR",
          "kmrbUnrated",
        ],
      }),
      "lsfRating?": string({
        description: "The video's rating from Indonesia's Lembaga Sensor Film.",
        enum: [
          "lsfUnspecified",
          "lsfSu",
          "lsfA",
          "lsfBo",
          "lsf13",
          "lsfR",
          "lsf17",
          "lsfD",
          "lsf21",
          "lsfUnrated",
        ],
      }),
      "mccaaRating?": string({
        description:
          "The video's rating from Malta's Film Age-Classification Board.",
        enum: [
          "mccaaUnspecified",
          "mccaaU",
          "mccaaPg",
          "mccaa12a",
          "mccaa12",
          "mccaa14",
          "mccaa15",
          "mccaa16",
          "mccaa18",
          "mccaaUnrated",
        ],
      }),
      "mccypRating?": string({
        description:
          "The video's rating from the Danish Film Institute's (Det Danske Filminstitut) Media Council for Children and Young People.",
        enum: [
          "mccypUnspecified",
          "mccypA",
          "mccyp7",
          "mccyp11",
          "mccyp15",
          "mccypUnrated",
        ],
      }),
      "mcstRating?": string({
        description: "The video's rating system for Vietnam - MCST",
        enum: [
          "mcstUnspecified",
          "mcstP",
          "mcst0",
          "mcstC13",
          "mcstC16",
          "mcst16plus",
          "mcstC18",
          "mcstGPg",
          "mcstUnrated",
        ],
      }),
      "mdaRating?": string({
        description:
          "The video's rating from Singapore's Media Development Authority (MDA) and, specifically, it's Board of Film Censors (BFC).",
        enum: [
          "mdaUnspecified",
          "mdaG",
          "mdaPg",
          "mdaPg13",
          "mdaNc16",
          "mdaM18",
          "mdaR21",
          "mdaUnrated",
        ],
      }),
      "medietilsynetRating?": string({
        description:
          "The video's rating from Medietilsynet, the Norwegian Media Authority.",
        enum: [
          "medietilsynetUnspecified",
          "medietilsynetA",
          "medietilsynet6",
          "medietilsynet7",
          "medietilsynet9",
          "medietilsynet11",
          "medietilsynet12",
          "medietilsynet15",
          "medietilsynet18",
          "medietilsynetUnrated",
        ],
      }),
      "mekuRating?": string({
        description:
          "The video's rating from Finland's Kansallinen Audiovisuaalinen Instituutti (National Audiovisual Institute).",
        enum: [
          "mekuUnspecified",
          "mekuS",
          "meku7",
          "meku12",
          "meku16",
          "meku18",
          "mekuUnrated",
        ],
      }),
      "menaMpaaRating?": string({
        description:
          "The rating system for MENA countries, a clone of MPAA. It is needed to prevent titles go live w/o additional QC check, since some of them can be inappropriate for the countries at all. See b/33408548 for more details.",
        enum: [
          "menaMpaaUnspecified",
          "menaMpaaG",
          "menaMpaaPg",
          "menaMpaaPg13",
          "menaMpaaR",
          "menaMpaaUnrated",
        ],
      }),
      "mibacRating?": string({
        description:
          "The video's rating from the Ministero dei Beni e delle Attività Culturali e del Turismo (Italy).",
        enum: [
          "mibacUnspecified",
          "mibacT",
          "mibacVap",
          "mibacVm6",
          "mibacVm12",
          "mibacVm14",
          "mibacVm16",
          "mibacVm18",
          "mibacUnrated",
        ],
      }),
      "mocRating?": string({
        description: "The video's Ministerio de Cultura (Colombia) rating.",
        enum: [
          "mocUnspecified",
          "mocE",
          "mocT",
          "moc7",
          "moc12",
          "moc15",
          "moc18",
          "mocX",
          "mocBanned",
          "mocUnrated",
        ],
      }),
      "moctwRating?": string({
        description:
          "The video's rating from Taiwan's Ministry of Culture (文化部).",
        enum: [
          "moctwUnspecified",
          "moctwG",
          "moctwP",
          "moctwPg",
          "moctwR",
          "moctwUnrated",
          "moctwR12",
          "moctwR15",
        ],
      }),
      "mpaaRating?": string({
        description:
          "The video's Motion Picture Association of America (MPAA) rating.",
        enum: [
          "mpaaUnspecified",
          "mpaaG",
          "mpaaPg",
          "mpaaPg13",
          "mpaaR",
          "mpaaNc17",
          "mpaaX",
          "mpaaUnrated",
        ],
      }),
      "mpaatRating?": string({
        description:
          "The rating system for trailer, DVD, and Ad in the US. See http://movielabs.com/md/ratings/v2.3/html/US_MPAAT_Ratings.html.",
        enum: ["mpaatUnspecified", "mpaatGb", "mpaatRb"],
      }),
      "mtrcbRating?": string({
        description:
          "The video's rating from the Movie and Television Review and Classification Board (Philippines).",
        enum: [
          "mtrcbUnspecified",
          "mtrcbG",
          "mtrcbPg",
          "mtrcbR13",
          "mtrcbR16",
          "mtrcbR18",
          "mtrcbX",
          "mtrcbUnrated",
        ],
      }),
      "nbcRating?": string({
        description:
          "The video's rating from the Maldives National Bureau of Classification.",
        enum: [
          "nbcUnspecified",
          "nbcG",
          "nbcPg",
          "nbc12plus",
          "nbc15plus",
          "nbc18plus",
          "nbc18plusr",
          "nbcPu",
          "nbcUnrated",
        ],
      }),
      "nbcplRating?": string({
        description: "The video's rating in Poland.",
        enum: [
          "nbcplUnspecified",
          "nbcplI",
          "nbcplIi",
          "nbcplIii",
          "nbcplIv",
          "nbcpl18plus",
          "nbcplUnrated",
        ],
      }),
      "nfrcRating?": string({
        description:
          "The video's rating from the Bulgarian National Film Center.",
        enum: [
          "nfrcUnspecified",
          "nfrcA",
          "nfrcB",
          "nfrcC",
          "nfrcD",
          "nfrcX",
          "nfrcUnrated",
        ],
      }),
      "nfvcbRating?": string({
        description:
          "The video's rating from Nigeria's National Film and Video Censors Board.",
        enum: [
          "nfvcbUnspecified",
          "nfvcbG",
          "nfvcbPg",
          "nfvcb12",
          "nfvcb12a",
          "nfvcb15",
          "nfvcb18",
          "nfvcbRe",
          "nfvcbUnrated",
        ],
      }),
      "nkclvRating?": string({
        description:
          "The video's rating from the Nacionãlais Kino centrs (National Film Centre of Latvia).",
        enum: [
          "nkclvUnspecified",
          "nkclvU",
          "nkclv7plus",
          "nkclv12plus",
          "nkclv16plus",
          "nkclv18plus",
          "nkclvUnrated",
        ],
      }),
      "nmcRating?": string({
        description:
          "The National Media Council ratings system for United Arab Emirates.",
        enum: [
          "nmcUnspecified",
          "nmcG",
          "nmcPg",
          "nmcPg13",
          "nmcPg15",
          "nmc15plus",
          "nmc18plus",
          "nmc18tc",
          "nmcUnrated",
        ],
      }),
      "oflcRating?": string({
        description:
          "The video's Office of Film and Literature Classification (OFLC - New Zealand) rating.",
        enum: [
          "oflcUnspecified",
          "oflcG",
          "oflcPg",
          "oflcM",
          "oflcR13",
          "oflcR15",
          "oflcR16",
          "oflcR18",
          "oflcUnrated",
          "oflcRp13",
          "oflcRp16",
          "oflcRp18",
        ],
      }),
      "pefilmRating?": string({
        description: "The video's rating in Peru.",
        enum: [
          "pefilmUnspecified",
          "pefilmPt",
          "pefilmPg",
          "pefilm14",
          "pefilm18",
          "pefilmUnrated",
        ],
      }),
      "rcnofRating?": string({
        description:
          "The video's rating from the Hungarian Nemzeti Filmiroda, the Rating Committee of the National Office of Film.",
        enum: [
          "rcnofUnspecified",
          "rcnofI",
          "rcnofIi",
          "rcnofIii",
          "rcnofIv",
          "rcnofV",
          "rcnofVi",
          "rcnofUnrated",
        ],
      }),
      "resorteviolenciaRating?": string({
        description: "The video's rating in Venezuela.",
        enum: [
          "resorteviolenciaUnspecified",
          "resorteviolenciaA",
          "resorteviolenciaB",
          "resorteviolenciaC",
          "resorteviolenciaD",
          "resorteviolenciaE",
          "resorteviolenciaUnrated",
        ],
      }),
      "rtcRating?": string({
        description:
          "The video's General Directorate of Radio, Television and Cinematography (Mexico) rating.",
        enum: [
          "rtcUnspecified",
          "rtcAa",
          "rtcA",
          "rtcB",
          "rtcB15",
          "rtcC",
          "rtcD",
          "rtcUnrated",
        ],
      }),
      "rteRating?": string({
        description:
          "The video's rating from Ireland's Raidió Teilifís Éireann.",
        enum: [
          "rteUnspecified",
          "rteGa",
          "rteCh",
          "rtePs",
          "rteMa",
          "rteUnrated",
        ],
      }),
      "russiaRating?": string({
        description:
          "The video's National Film Registry of the Russian Federation (MKRF - Russia) rating.",
        enum: [
          "russiaUnspecified",
          "russia0",
          "russia6",
          "russia12",
          "russia16",
          "russia18",
          "russiaUnrated",
        ],
      }),
      "skfilmRating?": string({
        description: "The video's rating in Slovakia.",
        enum: [
          "skfilmUnspecified",
          "skfilmG",
          "skfilmP2",
          "skfilmP5",
          "skfilmP8",
          "skfilmUnrated",
        ],
      }),
      "smaisRating?": string({
        description: "The video's rating in Iceland.",
        enum: [
          "smaisUnspecified",
          "smaisL",
          "smais7",
          "smais12",
          "smais14",
          "smais16",
          "smais18",
          "smaisUnrated",
        ],
      }),
      "smsaRating?": string({
        description:
          "The video's rating from Statens medieråd (Sweden's National Media Council).",
        enum: [
          "smsaUnspecified",
          "smsaA",
          "smsa7",
          "smsa11",
          "smsa15",
          "smsaUnrated",
        ],
      }),
      "tvpgRating?": string({
        description: "The video's TV Parental Guidelines (TVPG) rating.",
        enum: [
          "tvpgUnspecified",
          "tvpgY",
          "tvpgY7",
          "tvpgY7Fv",
          "tvpgG",
          "tvpgPg",
          "pg14",
          "tvpgMa",
          "tvpgUnrated",
        ],
      }),
      "ytRating?": string({
        description:
          "A rating that YouTube uses to identify age-restricted content.",
        enum: ["ytUnspecified", "ytAgeRestricted"],
      }),
    },
    {
      description:
        "Ratings schemes. The country-specific ratings are mostly for movies and shows. LINT.IfChange",
    },
  )
}
function Cuepoint() {
  return object(
    {
      "cueType?": string({
        enum: ["cueTypeUnspecified", "cueTypeAd"],
      }),
      "durationSecs?": uint32({
        description: "The duration of this cuepoint.",
      }),
      "etag?": string(),
      "id?": string({
        description: "The identifier for cuepoint resource.",
      }),
      "insertionOffsetTimeMs?": string({
        description:
          "The time when the cuepoint should be inserted by offset to the broadcast actual start time.",
        format: "int64",
      }),
      "walltimeMs?": string({
        description:
          "The wall clock time at which the cuepoint should be inserted. Only one of insertion_offset_time_ms and walltime_ms may be set at a time.",
        format: "uint64",
      }),
    },
    {
      description:
        "Note that there may be a 5-second end-point resolution issue. For instance, if a cuepoint comes in for 22:03:27, we may stuff the cuepoint into 22:03:25 or 22:03:30, depending. This is an artifact of HLS.",
    },
  )
}
function GeoPoint() {
  return object(
    {
      "altitude?": double({
        description: "Altitude above the reference ellipsoid, in meters.",
      }),
      "latitude?": double({ description: "Latitude in degrees." }),
      "longitude?": double({ description: "Longitude in degrees." }),
    },
    {
      description: "Geographical coordinates of a point, in WGS84.",
    },
  )
}
function I18nLanguage() {
  return object(
    {
      "etag?": string({
        description: "Etag of this resource.",
      }),
      "id?": string({
        description:
          "The ID that YouTube uses to uniquely identify the i18n language.",
      }),
      "kind?": string({
        default: "youtube#i18nLanguage",
        description:
          'Identifies what kind of resource this is. Value: the fixed string "youtube#i18nLanguage".',
      }),
      "snippet?": ref(I18nLanguageSnippet, {
        description:
          "The snippet object contains basic details about the i18n language, such as language code and human-readable name.",
      }),
    },
    {
      description:
        "An *i18nLanguage* resource identifies a UI language currently supported by YouTube.",
    },
  )
}
function I18nLanguageListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(I18nLanguage, {
      description:
        "A list of supported i18n languages. In this map, the i18n language ID is the map key, and its value is the corresponding i18nLanguage resource.",
    }),
    "kind?": string({
      default: "youtube#i18nLanguageListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#i18nLanguageListResponse".',
    }),
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}
function I18nLanguageSnippet() {
  return object(
    {
      "hl?": string({
        description: "A short BCP-47 code that uniquely identifies a language.",
      }),
      "name?": string({
        description:
          "The human-readable name of the language in the language itself.",
      }),
    },
    {
      description:
        "Basic details about an i18n language, such as language code and human-readable name.",
    },
  )
}
function I18nRegion() {
  return object(
    {
      "etag?": string({
        description: "Etag of this resource.",
      }),
      "id?": string({
        description:
          "The ID that YouTube uses to uniquely identify the i18n region.",
      }),
      "kind?": string({
        default: "youtube#i18nRegion",
        description:
          'Identifies what kind of resource this is. Value: the fixed string "youtube#i18nRegion".',
      }),
      "snippet?": ref(I18nRegionSnippet, {
        description:
          "The snippet object contains basic details about the i18n region, such as region code and human-readable name.",
      }),
    },
    {
      description:
        "A *i18nRegion* resource identifies a region where YouTube is available.",
    },
  )
}
function I18nRegionListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(I18nRegion, {
      description:
        "A list of regions where YouTube is available. In this map, the i18n region ID is the map key, and its value is the corresponding i18nRegion resource.",
    }),
    "kind?": string({
      default: "youtube#i18nRegionListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#i18nRegionListResponse".',
    }),
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}
function I18nRegionSnippet() {
  return object(
    {
      "gl?": string({
        description: "The region code as a 2-letter ISO country code.",
      }),
      "name?": string({
        description: "The human-readable name of the region.",
      }),
    },
    {
      description:
        "Basic details about an i18n region, such as region code and human-readable name.",
    },
  )
}
function ImageSettings() {
  return object(
    {
      "backgroundImageUrl?": ref(LocalizedProperty, {
        description:
          "The URL for the background image shown on the video watch page. The image should be 1200px by 615px, with a maximum file size of 128k.",
      }),
      "bannerExternalUrl?": string({
        description:
          "This is generated when a ChannelBanner.Insert request has succeeded for the given channel.",
      }),
      "bannerImageUrl?": string({
        description: "Banner image. Desktop size (1060x175).",
      }),
      "bannerMobileExtraHdImageUrl?": string({
        description: "Banner image. Mobile size high resolution (1440x395).",
      }),
      "bannerMobileHdImageUrl?": string({
        description: "Banner image. Mobile size high resolution (1280x360).",
      }),
      "bannerMobileImageUrl?": string({
        description: "Banner image. Mobile size (640x175).",
      }),
      "bannerMobileLowImageUrl?": string({
        description: "Banner image. Mobile size low resolution (320x88).",
      }),
      "bannerMobileMediumHdImageUrl?": string({
        description:
          "Banner image. Mobile size medium/high resolution (960x263).",
      }),
      "bannerTabletExtraHdImageUrl?": string({
        description:
          "Banner image. Tablet size extra high resolution (2560x424).",
      }),
      "bannerTabletHdImageUrl?": string({
        description: "Banner image. Tablet size high resolution (2276x377).",
      }),
      "bannerTabletImageUrl?": string({
        description: "Banner image. Tablet size (1707x283).",
      }),
      "bannerTabletLowImageUrl?": string({
        description: "Banner image. Tablet size low resolution (1138x188).",
      }),
      "bannerTvHighImageUrl?": string({
        description: "Banner image. TV size high resolution (1920x1080).",
      }),
      "bannerTvImageUrl?": string({
        description: "Banner image. TV size extra high resolution (2120x1192).",
      }),
      "bannerTvLowImageUrl?": string({
        description: "Banner image. TV size low resolution (854x480).",
      }),
      "bannerTvMediumImageUrl?": string({
        description: "Banner image. TV size medium resolution (1280x720).",
      }),
      "largeBrandedBannerImageImapScript?": ref(LocalizedProperty, {
        description: "The image map script for the large banner image.",
      }),
      "largeBrandedBannerImageUrl?": ref(LocalizedProperty, {
        description:
          "The URL for the 854px by 70px image that appears below the video player in the expanded video view of the video watch page.",
      }),
      "smallBrandedBannerImageImapScript?": ref(LocalizedProperty, {
        description: "The image map script for the small banner image.",
      }),
      "smallBrandedBannerImageUrl?": ref(LocalizedProperty, {
        description:
          "The URL for the 640px by 70px banner image that appears below the video player in the default view of the video watch page. The URL for the image that appears above the top-left corner of the video player. This is a 25-pixel-high image with a flexible width that cannot exceed 170 pixels.",
      }),
      "trackingImageUrl?": string({
        description:
          "The URL for a 1px by 1px tracking pixel that can be used to collect statistics for views of the channel or video pages.",
      }),
      "watchIconImageUrl?": string(),
    },
    {
      description:
        "Branding properties for images associated with the channel.",
    },
  )
}
function IngestionInfo() {
  return object(
    {
      "backupIngestionAddress?": string({
        description:
          "The backup ingestion URL that you should use to stream video to YouTube. You have the option of simultaneously streaming the content that you are sending to the ingestionAddress to this URL.",
      }),
      "ingestionAddress?": string({
        description:
          "The primary ingestion URL that you should use to stream video to YouTube. You must stream video to this URL. Depending on which application or tool you use to encode your video stream, you may need to enter the stream URL and stream name separately or you may need to concatenate them in the following format: *STREAM_URL/STREAM_NAME* ",
      }),
      "rtmpsBackupIngestionAddress?": string({
        description:
          "This ingestion url may be used instead of backupIngestionAddress in order to stream via RTMPS. Not applicable to non-RTMP streams.",
      }),
      "rtmpsIngestionAddress?": string({
        description:
          "This ingestion url may be used instead of ingestionAddress in order to stream via RTMPS. Not applicable to non-RTMP streams.",
      }),
      "streamName?": string({
        description:
          "The stream name that YouTube assigns to the video stream.",
      }),
    },
    {
      description:
        "Describes information necessary for ingesting an RTMP, HTTP, or SRT stream.",
    },
  )
}
function InvideoBranding() {
  return object(
    {
      "imageBytes?": string({
        description:
          "The bytes the uploaded image. Only used in api to youtube communication.",
        format: "byte",
      }),
      "imageUrl?": string({
        description:
          "The url of the uploaded image. Only used in apiary to api communication.",
      }),
      "position?": ref(InvideoPosition, {
        description:
          "The spatial position within the video where the branding watermark will be displayed.",
      }),
      "targetChannelId?": string({
        description:
          "The channel to which this branding links. If not present it defaults to the current channel.",
      }),
      "timing?": ref(InvideoTiming, {
        description:
          "The temporal position within the video where watermark will be displayed.",
      }),
    },
    {
      description: "LINT.IfChange Describes an invideo branding.",
    },
  )
}
function InvideoPosition() {
  return object(
    {
      "cornerPosition?": string({
        description:
          "Describes in which corner of the video the visual widget will appear.",
        enum: ["topLeft", "topRight", "bottomLeft", "bottomRight"],
      }),
      "type?": string({
        description: "Defines the position type.",
        const: "corner",
      }),
    },
    {
      description:
        "Describes the spatial position of a visual widget inside a video. It is a union of various position types, out of which only will be set one.",
    },
  )
}
function InvideoTiming() {
  return object(
    {
      "durationMs?": string({
        description:
          "Defines the duration in milliseconds for which the promotion should be displayed. If missing, the client should use the default.",
        format: "uint64",
      }),
      "offsetMs?": string({
        description:
          "Defines the time at which the promotion will appear. Depending on the value of type the value of the offsetMs field will represent a time offset from the start or from the end of the video, expressed in milliseconds.",
        format: "uint64",
      }),
      "type?": string({
        description:
          "Describes a timing type. If the value is offsetFromStart, then the offsetMs field represents an offset from the start of the video. If the value is offsetFromEnd, then the offsetMs field represents an offset from the end of the video.",
        enum: ["offsetFromStart", "offsetFromEnd"],
      }),
    },
    {
      description:
        "Describes a temporal position of a visual widget inside a video.",
    },
  )
}
function LanguageTag() {
  return object({
    "value?": string(),
  })
}
function LevelDetails() {
  return object({
    "displayName?": string({
      description: "The name that should be used when referring to this level.",
    }),
  })
}
function LiveBroadcast() {
  return object(
    {
      "contentDetails?": ref(LiveBroadcastContentDetails, {
        description:
          "The contentDetails object contains information about the event's video content, such as whether the content can be shown in an embedded video player or if it will be archived and therefore available for viewing after the event has concluded.",
      }),
      "etag?": string({
        description: "Etag of this resource.",
      }),
      "id?": string({
        description:
          "The ID that YouTube assigns to uniquely identify the broadcast.",
      }),
      "kind?": string({
        default: "youtube#liveBroadcast",
        description:
          'Identifies what kind of resource this is. Value: the fixed string "youtube#liveBroadcast".',
      }),
      "snippet?": ref(LiveBroadcastSnippet, {
        description:
          "The snippet object contains basic details about the event, including its title, description, start time, and end time.",
      }),
      "statistics?": ref(LiveBroadcastStatistics, {
        description:
          "The statistics object contains info about the event's current stats. These include concurrent viewers and total chat count. Statistics can change (in either direction) during the lifetime of an event. Statistics are only returned while the event is live.",
      }),
      "status?": ref(LiveBroadcastStatus, {
        description:
          "The status object contains information about the event's status.",
      }),
    },
    {
      description:
        "A *liveBroadcast* resource represents an event that will be streamed, via live video, on YouTube.",
    },
  )
}
function LiveBroadcastContentDetails() {
  return object(
    {
      "boundStreamId?": string({
        description:
          "This value uniquely identifies the live stream bound to the broadcast.",
      }),
      "boundStreamLastUpdateTimeMs?": string({
        description:
          "The date and time that the live stream referenced by boundStreamId was last updated.",
        format: "date-time",
      }),
      "closedCaptionsType?": string({
        enum: [
          "closedCaptionsTypeUnspecified",
          "closedCaptionsDisabled",
          "closedCaptionsHttpPost",
          "closedCaptionsEmbedded",
        ],
      }),
      "enableAutoStart?": boolean({
        description:
          "This setting indicates whether auto start is enabled for this broadcast. The default value for this property is false. This setting can only be used by Events.",
      }),
      "enableAutoStop?": boolean({
        description:
          "This setting indicates whether auto stop is enabled for this broadcast. The default value for this property is false. This setting can only be used by Events.",
      }),
      "enableClosedCaptions?": boolean({
        description:
          "This setting indicates whether HTTP POST closed captioning is enabled for this broadcast. The ingestion URL of the closed captions is returned through the liveStreams API. This is mutually exclusive with using the closed_captions_type property, and is equivalent to setting closed_captions_type to CLOSED_CAPTIONS_HTTP_POST.",
      }),
      "enableContentEncryption?": boolean({
        description:
          "This setting indicates whether YouTube should enable content encryption for the broadcast.",
      }),
      "enableDvr?": boolean({
        description:
          "This setting determines whether viewers can access DVR controls while watching the video. DVR controls enable the viewer to control the video playback experience by pausing, rewinding, or fast forwarding content. The default value for this property is true. *Important:* You must set the value to true and also set the enableArchive property's value to true if you want to make playback available immediately after the broadcast ends.",
      }),
      "enableEmbed?": boolean({
        description:
          "This setting indicates whether the broadcast video can be played in an embedded player. If you choose to archive the video (using the enableArchive property), this setting will also apply to the archived video.",
      }),
      "enableLowLatency?": boolean({
        description:
          "Indicates whether this broadcast has low latency enabled.",
      }),
      "latencyPreference?": string({
        description:
          "If both this and enable_low_latency are set, they must match. LATENCY_NORMAL should match enable_low_latency=false LATENCY_LOW should match enable_low_latency=true LATENCY_ULTRA_LOW should have enable_low_latency omitted.",
        enum: ["latencyPreferenceUnspecified", "normal", "low", "ultraLow"],
      }),
      "mesh?": string({
        description:
          "The mesh for projecting the video if projection is mesh. The mesh value must be a UTF-8 string containing the base-64 encoding of 3D mesh data that follows the Spherical Video V2 RFC specification for an mshp box, excluding the box size and type but including the following four reserved zero bytes for the version and flags.",
        format: "byte",
      }),
      "monitorStream?": ref(MonitorStreamInfo, {
        description:
          "The monitorStream object contains information about the monitor stream, which the broadcaster can use to review the event content before the broadcast stream is shown publicly.",
      }),
      "projection?": string({
        description:
          "The projection format of this broadcast. This defaults to rectangular.",
        enum: ["projectionUnspecified", "rectangular", "360", "mesh"],
      }),
      "recordFromStart?": boolean({
        description:
          "Automatically start recording after the event goes live. The default value for this property is true. *Important:* You must also set the enableDvr property's value to true if you want the playback to be available immediately after the broadcast ends. If you set this property's value to true but do not also set the enableDvr property to true, there may be a delay of around one day before the archived video will be available for playback.",
      }),
      "startWithSlate?": boolean({
        description:
          "This setting indicates whether the broadcast should automatically begin with an in-stream slate when you update the broadcast's status to live. After updating the status, you then need to send a liveCuepoints.insert request that sets the cuepoint's eventState to end to remove the in-stream slate and make your broadcast stream visible to viewers.",
      }),
      "stereoLayout?": string({
        description:
          "The 3D stereo layout of this broadcast. This defaults to mono.",
        enum: ["stereoLayoutUnspecified", "mono", "leftRight", "topBottom"],
      }),
    },
    {
      description: "Detailed settings of a broadcast.",
    },
  )
}
function LiveBroadcastListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(LiveBroadcast, {
      description: "A list of broadcasts that match the request criteria.",
    }),
    "kind?": string({
      default: "youtube#liveBroadcastListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#liveBroadcastListResponse".',
    }),
    "nextPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the next page in the result set.",
    }),
    "pageInfo?": ref(PageInfo, {
      description: "General pagination information.",
    }),
    "prevPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the previous page in the result set.",
    }),
    "tokenPagination?": TokenPagination,
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}
function LiveBroadcastSnippet() {
  return object(
    {
      "actualEndTime?": string({
        description:
          "The date and time that the broadcast actually ended. This information is only available once the broadcast's state is complete.",
        format: "date-time",
      }),
      "actualStartTime?": string({
        description:
          "The date and time that the broadcast actually started. This information is only available once the broadcast's state is live.",
        format: "date-time",
      }),
      "channelId?": string({
        description:
          "The ID that YouTube uses to uniquely identify the channel that is publishing the broadcast.",
      }),
      "description?": string({
        description:
          "The broadcast's description. As with the title, you can set this field by modifying the broadcast resource or by setting the description field of the corresponding video resource.",
      }),
      "isDefaultBroadcast?": boolean({
        description:
          "Indicates whether this broadcast is the default broadcast. Internal only.",
      }),
      "liveChatId?": string({
        description: "The id of the live chat for this broadcast.",
      }),
      "publishedAt?": string({
        description:
          "The date and time that the broadcast was added to YouTube's live broadcast schedule.",
        format: "date-time",
      }),
      "scheduledEndTime?": string({
        description:
          "The date and time that the broadcast is scheduled to end.",
        format: "date-time",
      }),
      "scheduledStartTime?": string({
        description:
          "The date and time that the broadcast is scheduled to start.",
        format: "date-time",
      }),
      "thumbnails?": ref(ThumbnailDetails, {
        description:
          "A map of thumbnail images associated with the broadcast. For each nested object in this object, the key is the name of the thumbnail image, and the value is an object that contains other information about the thumbnail.",
      }),
      "title?": string({
        description:
          "The broadcast's title. Note that the broadcast represents exactly one YouTube video. You can set this field by modifying the broadcast resource or by setting the title field of the corresponding video resource.",
      }),
    },
    {
      description: "Basic broadcast information.",
    },
  )
}
function LiveBroadcastStatistics() {
  return object(
    {
      "concurrentViewers?": string({
        description:
          "The number of viewers currently watching the broadcast. The property and its value will be present if the broadcast has current viewers and the broadcast owner has not hidden the viewcount for the video. Note that YouTube stops tracking the number of concurrent viewers for a broadcast when the broadcast ends. So, this property would not identify the number of viewers watching an archived video of a live broadcast that already ended.",
        format: "uint64",
      }),
    },
    {
      description:
        "Statistics about the live broadcast. These represent a snapshot of the values at the time of the request. Statistics are only returned for live broadcasts.",
    },
  )
}
function LiveBroadcastStatus() {
  return object(
    {
      "lifeCycleStatus?": string({
        description:
          "The broadcast's status. The status can be updated using the API's liveBroadcasts.transition method.",
        enum: [
          "lifeCycleStatusUnspecified",
          "created",
          "ready",
          "testing",
          "live",
          "complete",
          "revoked",
          "testStarting",
          "liveStarting",
        ],
      }),
      "liveBroadcastPriority?": string({
        description: "Priority of the live broadcast event (internal state).",
        enum: ["liveBroadcastPriorityUnspecified", "low", "normal", "high"],
      }),
      "madeForKids?": boolean({
        description:
          "Whether the broadcast is made for kids or not, decided by YouTube instead of the creator. This field is read only.",
      }),
      "privacyStatus?": string({
        description:
          "The broadcast's privacy status. Note that the broadcast represents exactly one YouTube video, so the privacy settings are identical to those supported for videos. In addition, you can set this field by modifying the broadcast resource or by setting the privacyStatus field of the corresponding video resource.",
        enum: ["public", "unlisted", "private"],
      }),
      "recordingStatus?": string({
        description: "The broadcast's recording status.",
        enum: [
          "liveBroadcastRecordingStatusUnspecified",
          "notRecording",
          "recording",
          "recorded",
        ],
      }),
      "selfDeclaredMadeForKids?": boolean({
        description:
          "This field will be set to True if the creator declares the broadcast to be kids only: go/live-cw-work.",
      }),
    },
    {
      description: "Live broadcast state.",
    },
  )
}
function LiveChatBan() {
  return object(
    {
      "etag?": string({
        description: "Etag of this resource.",
      }),
      "id?": string({
        description:
          "The ID that YouTube assigns to uniquely identify the ban.",
      }),
      "kind?": string({
        default: "youtube#liveChatBan",
        description:
          'Identifies what kind of resource this is. Value: the fixed string `"youtube#liveChatBan"`.',
      }),
      "snippet?": ref(LiveChatBanSnippet, {
        description:
          "The `snippet` object contains basic details about the ban.",
      }),
    },
    {
      description:
        "A `__liveChatBan__` resource represents a ban for a YouTube live chat.",
    },
  )
}
function LiveChatBanSnippet() {
  return object({
    "banDurationSeconds?": string({
      description:
        "The duration of a ban, only filled if the ban has type TEMPORARY.",
      format: "uint64",
    }),
    "bannedUserDetails?": ChannelProfileDetails,
    "liveChatId?": string({
      description: "The chat this ban is pertinent to.",
    }),
    "type?": string({
      description: "The type of ban.",
      enum: ["liveChatBanTypeUnspecified", "permanent", "temporary"],
    }),
  })
}
function LiveChatFanFundingEventDetails() {
  return object({
    "amountDisplayString?": string({
      description:
        "A rendered string that displays the fund amount and currency to the user.",
    }),
    "amountMicros?": string({
      description: "The amount of the fund.",
      format: "uint64",
    }),
    "currency?": string({
      description: "The currency in which the fund was made.",
    }),
    "userComment?": string({
      description: "The comment added by the user to this fan funding event.",
    }),
  })
}
function LiveChatGiftMembershipReceivedDetails() {
  return object({
    "associatedMembershipGiftingMessageId?": string({
      description:
        "The ID of the membership gifting message that is related to this gift membership. This ID will always refer to a message whose type is 'membershipGiftingEvent'.",
    }),
    "gifterChannelId?": string({
      description:
        "The ID of the user that made the membership gifting purchase. This matches the `snippet.authorChannelId` of the associated membership gifting message.",
    }),
    "memberLevelName?": string({
      description:
        "The name of the Level at which the viewer is a member. This matches the `snippet.membershipGiftingDetails.giftMembershipsLevelName` of the associated membership gifting message. The Level names are defined by the YouTube channel offering the Membership. In some situations this field isn't filled.",
    }),
  })
}
function LiveChatMemberMilestoneChatDetails() {
  return object({
    "memberLevelName?": string({
      description:
        "The name of the Level at which the viever is a member. The Level names are defined by the YouTube channel offering the Membership. In some situations this field isn't filled.",
    }),
    "memberMonth?": uint32({
      description:
        "The total amount of months (rounded up) the viewer has been a member that granted them this Member Milestone Chat. This is the same number of months as is being displayed to YouTube users.",
    }),
    "userComment?": string({
      description:
        "The comment added by the member to this Member Milestone Chat. This field is empty for messages without a comment from the member.",
    }),
  })
}
function LiveChatMembershipGiftingDetails() {
  return object({
    "giftMembershipsCount?": int32({
      description: "The number of gift memberships purchased by the user.",
    }),
    "giftMembershipsLevelName?": string({
      description:
        "The name of the level of the gift memberships purchased by the user. The Level names are defined by the YouTube channel offering the Membership. In some situations this field isn't filled.",
    }),
  })
}
function LiveChatMessage() {
  return object(
    {
      "authorDetails?": ref(LiveChatMessageAuthorDetails, {
        description:
          "The authorDetails object contains basic details about the user that posted this message.",
      }),
      "etag?": string({
        description: "Etag of this resource.",
      }),
      "id?": string({
        description:
          "The ID that YouTube assigns to uniquely identify the message.",
      }),
      "kind?": string({
        default: "youtube#liveChatMessage",
        description:
          'Identifies what kind of resource this is. Value: the fixed string "youtube#liveChatMessage".',
      }),
      "snippet?": ref(LiveChatMessageSnippet, {
        description:
          "The snippet object contains basic details about the message.",
      }),
    },
    {
      description:
        "A *liveChatMessage* resource represents a chat message in a YouTube Live Chat.",
    },
  )
}
function LiveChatMessageAuthorDetails() {
  return object({
    "channelId?": string({
      description: "The YouTube channel ID.",
    }),
    "channelUrl?": string({
      description: "The channel's URL.",
    }),
    "displayName?": string({
      description: "The channel's display name.",
    }),
    "isChatModerator?": boolean({
      description: "Whether the author is a moderator of the live chat.",
    }),
    "isChatOwner?": boolean({
      description: "Whether the author is the owner of the live chat.",
    }),
    "isChatSponsor?": boolean({
      description: "Whether the author is a sponsor of the live chat.",
    }),
    "isVerified?": boolean({
      description:
        "Whether the author's identity has been verified by YouTube.",
    }),
    "profileImageUrl?": string({
      description: "The channels's avatar URL.",
    }),
  })
}
function LiveChatMessageDeletedDetails() {
  return object({
    "deletedMessageId?": string(),
  })
}
function LiveChatMessageListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(LiveChatMessage),
    "kind?": string({
      default: "youtube#liveChatMessageListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#liveChatMessageListResponse".',
    }),
    "nextPageToken?": string(),
    "offlineAt?": string({
      description: "The date and time when the underlying stream went offline.",
      format: "date-time",
    }),
    "pageInfo?": ref(PageInfo, {
      description: "General pagination information.",
    }),
    "pollingIntervalMillis?": uint32({
      description:
        "The amount of time the client should wait before polling again.",
    }),
    "tokenPagination?": TokenPagination,
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}
function LiveChatMessageRetractedDetails() {
  return object({
    "retractedMessageId?": string(),
  })
}
function LiveChatMessageSnippet() {
  return object(
    {
      "authorChannelId?": string({
        description:
          "The ID of the user that authored this message, this field is not always filled. textMessageEvent - the user that wrote the message fanFundingEvent - the user that funded the broadcast newSponsorEvent - the user that just became a sponsor memberMilestoneChatEvent - the member that sent the message membershipGiftingEvent - the user that made the purchase giftMembershipReceivedEvent - the user that received the gift membership messageDeletedEvent - the moderator that took the action messageRetractedEvent - the author that retracted their message userBannedEvent - the moderator that took the action superChatEvent - the user that made the purchase superStickerEvent - the user that made the purchase",
      }),
      "displayMessage?": string({
        description:
          "Contains a string that can be displayed to the user. If this field is not present the message is silent, at the moment only messages of type TOMBSTONE and CHAT_ENDED_EVENT are silent.",
      }),
      "fanFundingEventDetails?": ref(LiveChatFanFundingEventDetails, {
        description:
          "Details about the funding event, this is only set if the type is 'fanFundingEvent'.",
      }),
      "giftMembershipReceivedDetails?": ref(
        LiveChatGiftMembershipReceivedDetails,
        {
          description:
            "Details about the Gift Membership Received event, this is only set if the type is 'giftMembershipReceivedEvent'.",
        },
      ),
      "hasDisplayContent?": boolean({
        description:
          "Whether the message has display content that should be displayed to users.",
      }),
      "liveChatId?": string(),
      "memberMilestoneChatDetails?": ref(LiveChatMemberMilestoneChatDetails, {
        description:
          "Details about the Member Milestone Chat event, this is only set if the type is 'memberMilestoneChatEvent'.",
      }),
      "membershipGiftingDetails?": ref(LiveChatMembershipGiftingDetails, {
        description:
          "Details about the Membership Gifting event, this is only set if the type is 'membershipGiftingEvent'.",
      }),
      "messageDeletedDetails?": LiveChatMessageDeletedDetails,
      "messageRetractedDetails?": LiveChatMessageRetractedDetails,
      "newSponsorDetails?": ref(LiveChatNewSponsorDetails, {
        description:
          'Details about the New Member Announcement event, this is only set if the type is \'newSponsorEvent\'. Please note that "member" is the new term for "sponsor".',
      }),
      "publishedAt?": string({
        description:
          "The date and time when the message was orignally published.",
        format: "date-time",
      }),
      "superChatDetails?": ref(LiveChatSuperChatDetails, {
        description:
          "Details about the Super Chat event, this is only set if the type is 'superChatEvent'.",
      }),
      "superStickerDetails?": ref(LiveChatSuperStickerDetails, {
        description:
          "Details about the Super Sticker event, this is only set if the type is 'superStickerEvent'.",
      }),
      "textMessageDetails?": ref(LiveChatTextMessageDetails, {
        description:
          "Details about the text message, this is only set if the type is 'textMessageEvent'.",
      }),
      "type?": string({
        description:
          "The type of message, this will always be present, it determines the contents of the message as well as which fields will be present.",
        enum: [
          "invalidType",
          "textMessageEvent",
          "tombstone",
          "fanFundingEvent",
          "chatEndedEvent",
          "sponsorOnlyModeStartedEvent",
          "sponsorOnlyModeEndedEvent",
          "newSponsorEvent",
          "memberMilestoneChatEvent",
          "membershipGiftingEvent",
          "giftMembershipReceivedEvent",
          "messageDeletedEvent",
          "messageRetractedEvent",
          "userBannedEvent",
          "superChatEvent",
          "superStickerEvent",
        ],
      }),
      "userBannedDetails?": LiveChatUserBannedMessageDetails,
    },
    {
      description: "Next ID: 33",
    },
  )
}
function LiveChatModerator() {
  return object(
    {
      "etag?": string({
        description: "Etag of this resource.",
      }),
      "id?": string({
        description:
          "The ID that YouTube assigns to uniquely identify the moderator.",
      }),
      "kind?": string({
        default: "youtube#liveChatModerator",
        description:
          'Identifies what kind of resource this is. Value: the fixed string "youtube#liveChatModerator".',
      }),
      "snippet?": ref(LiveChatModeratorSnippet, {
        description:
          "The snippet object contains basic details about the moderator.",
      }),
    },
    {
      description:
        "A *liveChatModerator* resource represents a moderator for a YouTube live chat. A chat moderator has the ability to ban/unban users from a chat, remove message, etc.",
    },
  )
}
function LiveChatModeratorListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(LiveChatModerator, {
      description: "A list of moderators that match the request criteria.",
    }),
    "kind?": string({
      default: "youtube#liveChatModeratorListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#liveChatModeratorListResponse".',
    }),
    "nextPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the next page in the result set.",
    }),
    "pageInfo?": ref(PageInfo, {
      description: "General pagination information.",
    }),
    "prevPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the previous page in the result set.",
    }),
    "tokenPagination?": TokenPagination,
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}

function LiveChatModeratorSnippet() {
  return object({
    "liveChatId?": string({
      description: "The ID of the live chat this moderator can act on.",
    }),
    "moderatorDetails?": ref(ChannelProfileDetails, {
      description: "Details about the moderator.",
    }),
  })
}

function LiveChatNewSponsorDetails() {
  return object({
    "isUpgrade?": boolean({
      description:
        "If the viewer just had upgraded from a lower level. For viewers that were not members at the time of purchase, this field is false.",
    }),
    "memberLevelName?": string({
      description:
        "The name of the Level that the viewer just had joined. The Level names are defined by the YouTube channel offering the Membership. In some situations this field isn't filled.",
    }),
  })
}
function LiveChatSuperChatDetails() {
  return object({
    "amountDisplayString?": string({
      description:
        "A rendered string that displays the fund amount and currency to the user.",
    }),
    "amountMicros?": string({
      description:
        "The amount purchased by the user, in micros (1,750,000 micros = 1.75).",
      format: "uint64",
    }),
    "currency?": string({
      description: "The currency in which the purchase was made.",
    }),
    "tier?": uint32({
      description:
        "The tier in which the amount belongs. Lower amounts belong to lower tiers. The lowest tier is 1.",
    }),
    "userComment?": string({
      description: "The comment added by the user to this Super Chat event.",
    }),
  })
}

function LiveChatSuperStickerDetails() {
  return object({
    "amountDisplayString?": string({
      description:
        "A rendered string that displays the fund amount and currency to the user.",
    }),
    "amountMicros?": string({
      description:
        "The amount purchased by the user, in micros (1,750,000 micros = 1.75).",
      format: "uint64",
    }),
    "currency?": string({
      description: "The currency in which the purchase was made.",
    }),
    "superStickerMetadata?": ref(SuperStickerMetadata, {
      description: "Information about the Super Sticker.",
    }),
    "tier?": uint32({
      description:
        "The tier in which the amount belongs. Lower amounts belong to lower tiers. The lowest tier is 1.",
    }),
  })
}

function LiveChatTextMessageDetails() {
  return object({
    "messageText?": string({
      description: "The user's message.",
    }),
  })
}
function LiveChatUserBannedMessageDetails() {
  return object({
    "banDurationSeconds?": string({
      description:
        "The duration of the ban. This property is only present if the banType is temporary.",
      format: "uint64",
    }),
    "banType?": string({
      description: "The type of ban.",
      enum: ["permanent", "temporary"],
    }),
    "bannedUserDetails?": ref(ChannelProfileDetails, {
      description: "The details of the user that was banned.",
    }),
  })
}
function LiveStream() {
  return object(
    {
      "cdn?": ref(CdnSettings, {
        description:
          "The cdn object defines the live stream's content delivery network (CDN) settings. These settings provide details about the manner in which you stream your content to YouTube.",
      }),
      "contentDetails?": ref(LiveStreamContentDetails, {
        description:
          "The content_details object contains information about the stream, including the closed captions ingestion URL.",
      }),
      "etag?": string({
        description: "Etag of this resource.",
      }),
      "id?": string({
        description:
          "The ID that YouTube assigns to uniquely identify the stream.",
      }),
      "kind?": string({
        default: "youtube#liveStream",
        description:
          'Identifies what kind of resource this is. Value: the fixed string "youtube#liveStream".',
      }),
      "snippet?": ref(LiveStreamSnippet, {
        description:
          "The snippet object contains basic details about the stream, including its channel, title, and description.",
      }),
      "status?": ref(LiveStreamStatus, {
        description:
          "The status object contains information about live stream's status.",
      }),
    },
    {
      description: "A live stream describes a live ingestion point.",
    },
  )
}
function LiveStreamConfigurationIssue() {
  return object({
    "description?": string({
      description:
        "The long-form description of the issue and how to resolve it.",
    }),
    "reason?": string({
      description: "The short-form reason for this issue.",
    }),
    "severity?": string({
      description: "How severe this issue is to the stream.",
      enum: ["info", "warning", "error"],
    }),
    "type?": string({
      description: "The kind of error happening.",
      enum: [
        "gopSizeOver",
        "gopSizeLong",
        "gopSizeShort",
        "openGop",
        "badContainer",
        "audioBitrateHigh",
        "audioBitrateLow",
        "audioSampleRate",
        "bitrateHigh",
        "bitrateLow",
        "audioCodec",
        "videoCodec",
        "noAudioStream",
        "noVideoStream",
        "multipleVideoStreams",
        "multipleAudioStreams",
        "audioTooManyChannels",
        "interlacedVideo",
        "frameRateHigh",
        "resolutionMismatch",
        "videoCodecMismatch",
        "videoInterlaceMismatch",
        "videoProfileMismatch",
        "videoBitrateMismatch",
        "framerateMismatch",
        "gopMismatch",
        "audioSampleRateMismatch",
        "audioStereoMismatch",
        "audioCodecMismatch",
        "audioBitrateMismatch",
        "videoResolutionSuboptimal",
        "videoResolutionUnsupported",
        "videoIngestionStarved",
        "videoIngestionFasterThanRealtime",
      ],
    }),
  })
}
function LiveStreamContentDetails() {
  return object(
    {
      "closedCaptionsIngestionUrl?": string({
        description:
          "The ingestion URL where the closed captions of this stream are sent.",
      }),
      "isReusable?": boolean({
        description:
          "Indicates whether the stream is reusable, which means that it can be bound to multiple broadcasts. It is common for broadcasters to reuse the same stream for many different broadcasts if those broadcasts occur at different times. If you set this value to false, then the stream will not be reusable, which means that it can only be bound to one broadcast. Non-reusable streams differ from reusable streams in the following ways: - A non-reusable stream can only be bound to one broadcast. - A non-reusable stream might be deleted by an automated process after the broadcast ends. - The liveStreams.list method does not list non-reusable streams if you call the method and set the mine parameter to true. The only way to use that method to retrieve the resource for a non-reusable stream is to use the id parameter to identify the stream. ",
      }),
    },
    {
      description: "Detailed settings of a stream.",
    },
  )
}
function LiveStreamHealthStatus() {
  return object({
    "configurationIssues?": array(LiveStreamConfigurationIssue, {
      description: "The configurations issues on this stream",
    }),
    "lastUpdateTimeSeconds?": string({
      description: "The last time this status was updated (in seconds)",
      format: "uint64",
    }),
    "status?": string({
      description: "The status code of this stream",
      enum: ["good", "ok", "bad", "noData", "revoked"],
    }),
  })
}
function LiveStreamListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(LiveStream, {
      description: "A list of live streams that match the request criteria.",
    }),
    "kind?": string({
      default: "youtube#liveStreamListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#liveStreamListResponse".',
    }),
    "nextPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the next page in the result set.",
    }),
    "pageInfo?": PageInfo,
    "prevPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the previous page in the result set.",
    }),
    "tokenPagination?": TokenPagination,
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}
function LiveStreamSnippet() {
  return object({
    "channelId?": string({
      description:
        "The ID that YouTube uses to uniquely identify the channel that is transmitting the stream.",
    }),
    "description?": string({
      description:
        "The stream's description. The value cannot be longer than 10000 characters.",
    }),
    "isDefaultStream?": boolean(),
    "publishedAt?": string({
      description: "The date and time that the stream was created.",
      format: "date-time",
    }),
    "title?": string({
      description:
        "The stream's title. The value must be between 1 and 128 characters long.",
    }),
  })
}
function LiveStreamStatus() {
  return object(
    {
      "healthStatus?": ref(LiveStreamHealthStatus, {
        description: "The health status of the stream.",
      }),
      "streamStatus?": string({
        enum: ["created", "ready", "active", "inactive", "error"],
      }),
    },
    {
      description: "Brief description of the live stream status.",
    },
  )
}
function LocalizedProperty() {
  return object({
    "defaultLanguage?": ref(LanguageTag, {
      description: "The language of the default property.",
    }),
    "localized?": array(LocalizedString),
  })
}
function LocalizedString() {
  return object({
    "language?": string(),
    "value?": string(),
  })
}
function Member() {
  return object(
    {
      "etag?": string({
        description: "Etag of this resource.",
      }),
      "kind?": string({
        default: "youtube#member",
        description:
          'Identifies what kind of resource this is. Value: the fixed string "youtube#member".',
      }),
      "snippet?": ref(MemberSnippet, {
        description:
          "The snippet object contains basic details about the member.",
      }),
    },
    {
      description:
        "A *member* resource represents a member for a YouTube channel. A member provides recurring monetary support to a creator and receives special benefits.",
    },
  )
}
function MemberListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(Member, {
      description: "A list of members that match the request criteria.",
    }),
    "kind?": string({
      default: "youtube#memberListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#memberListResponse".',
    }),
    "nextPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the next page in the result set.",
    }),
    "pageInfo?": PageInfo,
    "tokenPagination?": TokenPagination,
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}
function MemberSnippet() {
  return object({
    "creatorChannelId?": string({
      description: "The id of the channel that's offering memberships.",
    }),
    "memberDetails?": ref(ChannelProfileDetails, {
      description: "Details about the member.",
    }),
    "membershipsDetails?": ref(MembershipsDetails, {
      description: "Details about the user's membership.",
    }),
  })
}
function MembershipsDetails() {
  return object({
    "accessibleLevels?": array(string(), {
      description:
        "Ids of all levels that the user has access to. This includes the currently active level and all other levels that are included because of a higher purchase.",
    }),
    "highestAccessibleLevel?": string({
      description:
        "Id of the highest level that the user has access to at the moment.",
    }),
    "highestAccessibleLevelDisplayName?": string({
      description:
        "Display name for the highest level that the user has access to at the moment.",
    }),
    "membershipsDuration?": ref(MembershipsDuration, {
      description:
        "Data about memberships duration without taking into consideration pricing levels.",
    }),
    "membershipsDurationAtLevels?": array(MembershipsDurationAtLevel, {
      description:
        "Data about memberships duration on particular pricing levels.",
    }),
  })
}
function MembershipsDuration() {
  return object({
    "memberSince?": string({
      description:
        "The date and time when the user became a continuous member across all levels.",
    }),
    "memberTotalDurationMonths?": int32({
      description:
        "The cumulative time the user has been a member across all levels in complete months (the time is rounded down to the nearest integer).",
    }),
  })
}
function MembershipsDurationAtLevel() {
  return object({
    "level?": string({
      description: "Pricing level ID.",
    }),
    "memberSince?": string({
      description:
        "The date and time when the user became a continuous member for the given level.",
    }),
    "memberTotalDurationMonths?": int32({
      description:
        "The cumulative time the user has been a member for the given level in complete months (the time is rounded down to the nearest integer).",
    }),
  })
}
function MembershipsLevel() {
  return object(
    {
      "etag?": string({
        description: "Etag of this resource.",
      }),
      "id?": string({
        description:
          "The ID that YouTube assigns to uniquely identify the memberships level.",
      }),
      "kind?": string({
        default: "youtube#membershipsLevel",
        description:
          'Identifies what kind of resource this is. Value: the fixed string "youtube#membershipsLevelListResponse".',
      }),
      "snippet?": ref(MembershipsLevelSnippet, {
        description:
          "The snippet object contains basic details about the level.",
      }),
    },
    {
      description:
        "A *membershipsLevel* resource represents an offer made by YouTube creators for their fans. Users can become members of the channel by joining one of the available levels. They will provide recurring monetary support and receives special benefits.",
    },
  )
}
function MembershipsLevelListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(MembershipsLevel, {
      description: "A list of pricing levels offered by a creator to the fans.",
    }),
    "kind?": string({
      default: "youtube#membershipsLevelListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#membershipsLevelListResponse".',
    }),
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}
function MembershipsLevelSnippet() {
  return object({
    "creatorChannelId?": string({
      description: "The id of the channel that's offering channel memberships.",
    }),
    "levelDetails?": ref(LevelDetails, {
      description: "Details about the pricing level.",
    }),
  })
}
function MonitorStreamInfo() {
  return object(
    {
      "broadcastStreamDelayMs?": uint32({
        description:
          "If you have set the enableMonitorStream property to true, then this property determines the length of the live broadcast delay.",
      }),
      "embedHtml?": string({
        description:
          "HTML code that embeds a player that plays the monitor stream.",
      }),
      "enableMonitorStream?": boolean({
        description:
          "This value determines whether the monitor stream is enabled for the broadcast. If the monitor stream is enabled, then YouTube will broadcast the event content on a special stream intended only for the broadcaster's consumption. The broadcaster can use the stream to review the event content and also to identify the optimal times to insert cuepoints. You need to set this value to true if you intend to have a broadcast delay for your event. *Note:* This property cannot be updated once the broadcast is in the testing or live state.",
      }),
    },
    {
      description: "Settings and Info of the monitor stream",
    },
  )
}
function PageInfo() {
  return object(
    {
      "resultsPerPage?": int32({
        description: "The number of results included in the API response.",
      }),
      "totalResults?": int32({
        description: "The total number of results in the result set.",
      }),
    },
    {
      description:
        "Paging details for lists of resources, including total number of items available and number of resources returned in a single page.",
    },
  )
}
function Playlist() {
  return object(
    {
      "contentDetails?": ref(PlaylistContentDetails, {
        description:
          "The contentDetails object contains information like video count.",
      }),
      "etag?": string({
        description: "Etag of this resource.",
      }),
      "id?": string({
        description:
          "The ID that YouTube uses to uniquely identify the playlist.",
      }),
      "kind?": string({
        default: "youtube#playlist",
        description:
          'Identifies what kind of resource this is. Value: the fixed string "youtube#playlist".',
      }),
      "localizations?": dict(string(), PlaylistLocalization, {
        description: "Localizations for different languages",
      }),
      "player?": ref(PlaylistPlayer, {
        description:
          "The player object contains information that you would use to play the playlist in an embedded player.",
      }),
      "snippet?": ref(PlaylistSnippet, {
        description:
          "The snippet object contains basic details about the playlist, such as its title and description.",
      }),
      "status?": ref(PlaylistStatus, {
        description:
          "The status object contains status information for the playlist.",
      }),
    },
    {
      description:
        "A *playlist* resource represents a YouTube playlist. A playlist is a collection of videos that can be viewed sequentially and shared with other users. A playlist can contain up to 200 videos, and YouTube does not limit the number of playlists that each user creates. By default, playlists are publicly visible to other users, but playlists can be public or private. YouTube also uses playlists to identify special collections of videos for a channel, such as: - uploaded videos - favorite videos - positively rated (liked) videos - watch history - watch later To be more specific, these lists are associated with a channel, which is a collection of a person, group, or company's videos, playlists, and other YouTube information. You can retrieve the playlist IDs for each of these lists from the channel resource for a given channel. You can then use the playlistItems.list method to retrieve any of those lists. You can also add or remove items from those lists by calling the playlistItems.insert and playlistItems.delete methods.",
    },
  )
}
function PlaylistContentDetails() {
  return object({
    "itemCount?": uint32({
      description: "The number of videos in the playlist.",
    }),
  })
}
function PlaylistItem() {
  return object(
    {
      "contentDetails?": ref(PlaylistItemContentDetails, {
        description:
          "The contentDetails object is included in the resource if the included item is a YouTube video. The object contains additional information about the video.",
      }),
      "etag?": string({
        description: "Etag of this resource.",
      }),
      "id?": string({
        description:
          "The ID that YouTube uses to uniquely identify the playlist item.",
      }),
      "kind?": string({
        default: "youtube#playlistItem",
        description:
          'Identifies what kind of resource this is. Value: the fixed string "youtube#playlistItem".',
      }),
      "snippet?": ref(PlaylistItemSnippet, {
        description:
          "The snippet object contains basic details about the playlist item, such as its title and position in the playlist.",
      }),
      "status?": ref(PlaylistItemStatus, {
        description:
          "The status object contains information about the playlist item's privacy status.",
      }),
    },
    {
      description:
        "A *playlistItem* resource identifies another resource, such as a video, that is included in a playlist. In addition, the playlistItem resource contains details about the included resource that pertain specifically to how that resource is used in that playlist. YouTube uses playlists to identify special collections of videos for a channel, such as: - uploaded videos - favorite videos - positively rated (liked) videos - watch history - watch later To be more specific, these lists are associated with a channel, which is a collection of a person, group, or company's videos, playlists, and other YouTube information. You can retrieve the playlist IDs for each of these lists from the channel resource for a given channel. You can then use the playlistItems.list method to retrieve any of those lists. You can also add or remove items from those lists by calling the playlistItems.insert and playlistItems.delete methods. For example, if a user gives a positive rating to a video, you would insert that video into the liked videos playlist for that user's channel.",
    },
  )
}
function PlaylistItemContentDetails() {
  return object({
    "endAt?": string({
      description:
        "The time, measured in seconds from the start of the video, when the video should stop playing. (The playlist owner can specify the times when the video should start and stop playing when the video is played in the context of the playlist.) By default, assume that the video.endTime is the end of the video.",
    }),
    "note?": string({
      description: "A user-generated note for this item.",
    }),
    "startAt?": string({
      description:
        "The time, measured in seconds from the start of the video, when the video should start playing. (The playlist owner can specify the times when the video should start and stop playing when the video is played in the context of the playlist.) The default value is 0.",
    }),
    "videoId?": string({
      description:
        "The ID that YouTube uses to uniquely identify a video. To retrieve the video resource, set the id query parameter to this value in your API request.",
    }),
    "videoPublishedAt?": string({
      description: "The date and time that the video was published to YouTube.",
      format: "date-time",
    }),
  })
}
function PlaylistItemListResponse() {
  return object({
    "etag?": string(),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(PlaylistItem, {
      description: "A list of playlist items that match the request criteria.",
    }),
    "kind?": string({
      default: "youtube#playlistItemListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#playlistItemListResponse". Etag of this resource.',
    }),
    "nextPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the next page in the result set.",
    }),
    "pageInfo?": ref(PageInfo, {
      description: "General pagination information.",
    }),
    "prevPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the previous page in the result set.",
    }),
    "tokenPagination?": TokenPagination,
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}
function PlaylistItemSnippet() {
  return object(
    {
      "channelId?": string({
        description:
          "The ID that YouTube uses to uniquely identify the user that added the item to the playlist.",
      }),
      "channelTitle?": string({
        description:
          "Channel title for the channel that the playlist item belongs to.",
      }),
      "description?": string({
        description: "The item's description.",
      }),
      "playlistId?": string({
        description:
          "The ID that YouTube uses to uniquely identify thGe playlist that the playlist item is in.",
      }),
      "position?": uint32({
        description:
          "The order in which the item appears in the playlist. The value uses a zero-based index, so the first item has a position of 0, the second item has a position of 1, and so forth.",
      }),
      "publishedAt?": string({
        description:
          "The date and time that the item was added to the playlist.",
        format: "date-time",
      }),
      "resourceId?": ref(ResourceId, {
        description:
          "The id object contains information that can be used to uniquely identify the resource that is included in the playlist as the playlist item.",
      }),
      "thumbnails?": ref(ThumbnailDetails, {
        description:
          "A map of thumbnail images associated with the playlist item. For each object in the map, the key is the name of the thumbnail image, and the value is an object that contains other information about the thumbnail.",
      }),
      "title?": string({
        description: "The item's title.",
      }),
      "videoOwnerChannelId?": string({
        description: "Channel id for the channel this video belongs to.",
      }),
      "videoOwnerChannelTitle?": string({
        description: "Channel title for the channel this video belongs to.",
      }),
    },
    {
      description:
        "Basic details about a playlist, including title, description and thumbnails. Basic details of a YouTube Playlist item provided by the author. Next ID: 15",
    },
  )
}
function PlaylistItemStatus() {
  return object(
    {
      "privacyStatus?": string({
        description: "This resource's privacy status.",
        enum: ["public", "unlisted", "private"],
      }),
    },
    {
      description: "Information about the playlist item's privacy status.",
    },
  )
}
function PlaylistListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(Playlist, {
      description: "A list of playlists that match the request criteria",
    }),
    "kind?": string({
      default: "youtube#playlistListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#playlistListResponse".',
    }),
    "nextPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the next page in the result set.",
    }),
    "pageInfo?": ref(PageInfo, {
      description: "General pagination information.",
    }),
    "prevPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the previous page in the result set.",
    }),
    "tokenPagination?": TokenPagination,
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}
function PlaylistLocalization() {
  return object(
    {
      "description?": string({
        description: "The localized strings for playlist's description.",
      }),
      "title?": string({
        description: "The localized strings for playlist's title.",
      }),
    },
    {
      description: "Playlist localization setting",
    },
  )
}
function PlaylistPlayer() {
  return object({
    "embedHtml?": string({
      description:
        "An <iframe> tag that embeds a player that will play the playlist.",
    }),
  })
}
function PlaylistSnippet() {
  return object(
    {
      "channelId?": string({
        description:
          "The ID that YouTube uses to uniquely identify the channel that published the playlist.",
      }),
      "channelTitle?": string({
        description:
          "The channel title of the channel that the video belongs to.",
      }),
      "defaultLanguage?": string({
        description:
          "The language of the playlist's default title and description.",
      }),
      "description?": string({
        description: "The playlist's description.",
      }),
      "localized?": ref(PlaylistLocalization, {
        description: "Localized title and description, read-only.",
      }),
      "publishedAt?": string({
        description: "The date and time that the playlist was created.",
        format: "date-time",
      }),
      "tags?": array(string(), {
        description: "Keyword tags associated with the playlist.",
      }),
      "thumbnailVideoId?": string({
        description:
          "Note: if the playlist has a custom thumbnail, this field will not be populated. The video id selected by the user that will be used as the thumbnail of this playlist. This field defaults to the first publicly viewable video in the playlist, if: 1. The user has never selected a video to be the thumbnail of the playlist. 2. The user selects a video to be the thumbnail, and then removes that video from the playlist. 3. The user selects a non-owned video to be the thumbnail, but that video becomes private, or gets deleted.",
      }),
      "thumbnails?": ref(ThumbnailDetails, {
        description:
          "A map of thumbnail images associated with the playlist. For each object in the map, the key is the name of the thumbnail image, and the value is an object that contains other information about the thumbnail.",
      }),
      "title?": string({
        description: "The playlist's title.",
      }),
    },
    {
      description:
        "Basic details about a playlist, including title, description and thumbnails.",
    },
  )
}
function PlaylistStatus() {
  return object({
    "privacyStatus?": string({
      description: "The playlist's privacy status.",
      enum: ["public", "unlisted", "private"],
    }),
  })
}
function PropertyValue() {
  return object(
    {
      "property?": string({
        description: "A property.",
      }),
      "value?": string({
        description: "The property's value.",
      }),
    },
    {
      description: "A pair Property / Value.",
    },
  )
}
function RelatedEntity() {
  return object({
    "entity?": Entity,
  })
}
function ResourceId() {
  return object(
    {
      "channelId?": string({
        description:
          "The ID that YouTube uses to uniquely identify the referred resource, if that resource is a channel. This property is only present if the resourceId.kind value is youtube#channel.",
      }),
      "kind?": string({
        description: "The type of the API resource.",
      }),
      "playlistId?": string({
        description:
          "The ID that YouTube uses to uniquely identify the referred resource, if that resource is a playlist. This property is only present if the resourceId.kind value is youtube#playlist.",
      }),
      "videoId?": string({
        description:
          "The ID that YouTube uses to uniquely identify the referred resource, if that resource is a video. This property is only present if the resourceId.kind value is youtube#video.",
      }),
    },
    {
      description:
        "A resource id is a generic reference that points to another YouTube resource.",
    },
  )
}
function SearchListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(SearchResult, {
      description: "Pagination information for token pagination.",
    }),
    "kind?": string({
      default: "youtube#searchListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#searchListResponse".',
    }),
    "nextPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the next page in the result set.",
    }),
    "pageInfo?": ref(PageInfo, {
      description: "General pagination information.",
    }),
    "prevPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the previous page in the result set.",
    }),
    "regionCode?": string(),
    "tokenPagination?": TokenPagination,
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}
function SearchResult() {
  return object(
    {
      "etag?": string({
        description: "Etag of this resource.",
      }),
      "id?": ref(ResourceId, {
        description:
          "The id object contains information that can be used to uniquely identify the resource that matches the search request.",
      }),
      "kind?": string({
        default: "youtube#searchResult",
        description:
          'Identifies what kind of resource this is. Value: the fixed string "youtube#searchResult".',
      }),
      "snippet?": ref(SearchResultSnippet, {
        description:
          "The snippet object contains basic details about a search result, such as its title or description. For example, if the search result is a video, then the title will be the video's title and the description will be the video's description.",
      }),
    },
    {
      description:
        "A search result contains information about a YouTube video, channel, or playlist that matches the search parameters specified in an API request. While a search result points to a uniquely identifiable resource, like a video, it does not have its own persistent data.",
    },
  )
}
function SearchResultSnippet() {
  return object(
    {
      "channelId?": string({
        description:
          "The value that YouTube uses to uniquely identify the channel that published the resource that the search result identifies.",
      }),
      "channelTitle?": string({
        description:
          "The title of the channel that published the resource that the search result identifies.",
      }),
      "description?": string({
        description: "A description of the search result.",
      }),
      "liveBroadcastContent?": string({
        description:
          'It indicates if the resource (video or channel) has upcoming/active live broadcast content. Or it\'s "none" if there is not any upcoming/active live broadcasts.',
        enum: ["none", "upcoming", "live", "completed"],
      }),
      "publishedAt?": string({
        description:
          "The creation date and time of the resource that the search result identifies.",
        format: "date-time",
      }),
      "thumbnails?": ref(ThumbnailDetails, {
        description:
          "A map of thumbnail images associated with the search result. For each object in the map, the key is the name of the thumbnail image, and the value is an object that contains other information about the thumbnail.",
      }),
      "title?": string({
        description: "The title of the search result.",
      }),
    },
    {
      description:
        "Basic details about a search result, including title, description and thumbnails of the item referenced by the search result.",
    },
  )
}
function Subscription() {
  return object(
    {
      "contentDetails?": ref(SubscriptionContentDetails, {
        description:
          "The contentDetails object contains basic statistics about the subscription.",
      }),
      "etag?": string({
        description: "Etag of this resource.",
      }),
      "id?": string({
        description:
          "The ID that YouTube uses to uniquely identify the subscription.",
      }),
      "kind?": string({
        default: "youtube#subscription",
        description:
          'Identifies what kind of resource this is. Value: the fixed string "youtube#subscription".',
      }),
      "snippet?": ref(SubscriptionSnippet, {
        description:
          "The snippet object contains basic details about the subscription, including its title and the channel that the user subscribed to.",
      }),
      "subscriberSnippet?": ref(SubscriptionSubscriberSnippet, {
        description:
          "The subscriberSnippet object contains basic details about the subscriber.",
      }),
    },
    {
      description:
        "A *subscription* resource contains information about a YouTube user subscription. A subscription notifies a user when new videos are added to a channel or when another user takes one of several actions on YouTube, such as uploading a video, rating a video, or commenting on a video.",
    },
  )
}
function SubscriptionContentDetails() {
  return object(
    {
      "activityType?": string({
        description:
          "The type of activity this subscription is for (only uploads, everything).",
        enum: ["subscriptionActivityTypeUnspecified", "all", "uploads"],
      }),
      "newItemCount?": uint32({
        description:
          "The number of new items in the subscription since its content was last read.",
      }),
      "totalItemCount?": uint32({
        description:
          "The approximate number of items that the subscription points to.",
      }),
    },
    {
      description: "Details about the content to witch a subscription refers.",
    },
  )
}
function SubscriptionListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(Subscription, {
      description: "A list of subscriptions that match the request criteria.",
    }),
    "kind?": string({
      default: "youtube#subscriptionListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#subscriptionListResponse".',
    }),
    "nextPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the next page in the result set.",
    }),
    "pageInfo?": PageInfo,
    "prevPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the previous page in the result set.",
    }),
    "tokenPagination?": TokenPagination,
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}
function SubscriptionSnippet() {
  return object(
    {
      "channelId?": string({
        description:
          "The ID that YouTube uses to uniquely identify the subscriber's channel.",
      }),
      "channelTitle?": string({
        description:
          "Channel title for the channel that the subscription belongs to.",
      }),
      "description?": string({
        description: "The subscription's details.",
      }),
      "publishedAt?": string({
        description: "The date and time that the subscription was created.",
        format: "date-time",
      }),
      "resourceId?": ref(ResourceId, {
        description:
          "The id object contains information about the channel that the user subscribed to.",
      }),
      "thumbnails?": ref(ThumbnailDetails, {
        description:
          "A map of thumbnail images associated with the video. For each object in the map, the key is the name of the thumbnail image, and the value is an object that contains other information about the thumbnail.",
      }),
      "title?": string({
        description: "The subscription's title.",
      }),
    },
    {
      description:
        "Basic details about a subscription, including title, description and thumbnails of the subscribed item.",
    },
  )
}
function SubscriptionSubscriberSnippet() {
  return object(
    {
      "channelId?": string({
        description: "The channel ID of the subscriber.",
      }),
      "description?": string({
        description: "The description of the subscriber.",
      }),
      "thumbnails?": ref(ThumbnailDetails, {
        description: "Thumbnails for this subscriber.",
      }),
      "title?": string({
        description: "The title of the subscriber.",
      }),
    },
    {
      description:
        "Basic details about a subscription's subscriber including title, description, channel ID and thumbnails.",
    },
  )
}
function SuperChatEvent() {
  return object(
    {
      "etag?": string({
        description: "Etag of this resource.",
      }),
      "id?": string({
        description:
          "The ID that YouTube assigns to uniquely identify the Super Chat event.",
      }),
      "kind?": string({
        default: "youtube#superChatEvent",
        description:
          'Identifies what kind of resource this is. Value: the fixed string `"youtube#superChatEvent"`.',
      }),
      "snippet?": ref(SuperChatEventSnippet, {
        description:
          "The `snippet` object contains basic details about the Super Chat event.",
      }),
    },
    {
      description:
        "A `__superChatEvent__` resource represents a Super Chat purchase on a YouTube channel.",
    },
  )
}
function SuperChatEventListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(SuperChatEvent, {
      description:
        "A list of Super Chat purchases that match the request criteria.",
    }),
    "kind?": string({
      default: "youtube#superChatEventListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#superChatEventListResponse".',
    }),
    "nextPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the next page in the result set.",
    }),
    "pageInfo?": PageInfo,
    "tokenPagination?": TokenPagination,
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}
function SuperChatEventSnippet() {
  return object({
    "amountMicros?": string({
      description:
        "The purchase amount, in micros of the purchase currency. e.g., 1 is represented as 1000000.",
      format: "uint64",
    }),
    "channelId?": string({
      description: "Channel id where the event occurred.",
    }),
    "commentText?": string({
      description: "The text contents of the comment left by the user.",
    }),
    "createdAt?": string({
      description: "The date and time when the event occurred.",
      format: "date-time",
    }),
    "currency?": string({
      description: "The currency in which the purchase was made. ISO 4217.",
    }),
    "displayString?": string({
      description:
        'A rendered string that displays the purchase amount and currency (e.g., "$1.00"). The string is rendered for the given language.',
    }),
    "isSuperStickerEvent?": boolean({
      description: "True if this event is a Super Sticker event.",
    }),
    "messageType?": uint32({
      description:
        "The tier for the paid message, which is based on the amount of money spent to purchase the message.",
    }),
    "superStickerMetadata?": ref(SuperStickerMetadata, {
      description:
        "If this event is a Super Sticker event, this field will contain metadata about the Super Sticker.",
    }),
    "supporterDetails?": ref(ChannelProfileDetails, {
      description: "Details about the supporter.",
    }),
  })
}
function SuperStickerMetadata() {
  return object({
    "altText?": string({
      description:
        "Internationalized alt text that describes the sticker image and any animation associated with it.",
    }),
    "altTextLanguage?": string({
      description:
        "Specifies the localization language in which the alt text is returned.",
    }),
    "stickerId?": string({
      description:
        "Unique identifier of the Super Sticker. This is a shorter form of the alt_text that includes pack name and a recognizable characteristic of the sticker.",
    }),
  })
}
function TestItem() {
  return object({
    "featuredPart?": boolean(),
    "gaia?": string({
      format: "int64",
    }),
    "id?": string(),
    "snippet?": TestItemTestItemSnippet,
  })
}
function TestItemTestItemSnippet() {
  return object({})
}
function ThirdPartyLink() {
  return object(
    {
      "etag?": string({
        description: "Etag of this resource",
      }),
      "kind?": string({
        default: "youtube#thirdPartyLink",
        description:
          'Identifies what kind of resource this is. Value: the fixed string "youtube#thirdPartyLink".',
      }),
      "linkingToken?": string({
        description:
          "The linking_token identifies a YouTube account and channel with which the third party account is linked.",
      }),
      "snippet?": ref(ThirdPartyLinkSnippet, {
        description:
          "The snippet object contains basic details about the third- party account link.",
      }),
      "status?": ref(ThirdPartyLinkStatus, {
        description:
          "The status object contains information about the status of the link.",
      }),
    },
    {
      description:
        "A *third party account link* resource represents a link between a YouTube account or a channel and an account on a third-party service.",
    },
  )
}
function ThirdPartyLinkListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "items?": array(ThirdPartyLink),
    "kind?": string({
      default: "youtube#thirdPartyLinkListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#thirdPartyLinkListResponse".',
    }),
  })
}
function ThirdPartyLinkSnippet() {
  return object(
    {
      "channelToStoreLink?": ref(ChannelToStoreLinkDetails, {
        description:
          "Information specific to a link between a channel and a store on a merchandising platform.",
      }),
      "type?": string({
        description:
          "Type of the link named after the entities that are being linked.",
        enum: ["linkUnspecified", "channelToStoreLink"],
      }),
    },
    {
      description:
        "Basic information about a third party account link, including its type and type-specific information.",
    },
  )
}
function ThirdPartyLinkStatus() {
  return object(
    {
      "linkStatus?": string({
        enum: ["unknown", "failed", "pending", "linked"],
      }),
    },
    {
      description:
        "The third-party link status object contains information about the status of the link.",
    },
  )
}
function Thumbnail() {
  return object(
    {
      "height?": uint32({
        description: "(Optional) Height of the thumbnail image.",
      }),
      "url?": string({
        description: "The thumbnail image's URL.",
      }),
      "width?": uint32({
        description: "(Optional) Width of the thumbnail image.",
      }),
    },
    {
      description: "A thumbnail is an image representing a YouTube resource.",
    },
  )
}
function ThumbnailDetails() {
  return object(
    {
      "high?": ref(Thumbnail, {
        description: "The high quality image for this resource.",
      }),
      "maxres?": ref(Thumbnail, {
        description: "The maximum resolution quality image for this resource.",
      }),
      "medium?": ref(Thumbnail, {
        description: "The medium quality image for this resource.",
      }),
      "standard?": ref(Thumbnail, {
        description: "The standard quality image for this resource.",
      }),
    },
    {
      description:
        "Internal representation of thumbnails for a YouTube resource.",
    },
  )
}
function ThumbnailSetResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(ThumbnailDetails, {
      description: "A list of thumbnails.",
    }),
    "kind?": string({
      default: "youtube#thumbnailSetResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#thumbnailSetResponse".',
    }),
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}
function TokenPagination() {
  return object(
    {},
    {
      description: "Stub token pagination template to suppress results.",
    },
  )
}
function Video() {
  return object(
    {
      "ageGating?": ref(VideoAgeGating, {
        description:
          "Age restriction details related to a video. This data can only be retrieved by the video owner.",
      }),
      "contentDetails?": ref(VideoContentDetails, {
        description:
          "The contentDetails object contains information about the video content, including the length of the video and its aspect ratio.",
      }),
      "etag?": string({ description: "Etag of this resource." }),
      "fileDetails?": ref(VideoFileDetails, {
        description:
          "The fileDetails object encapsulates information about the video file that was uploaded to YouTube, including the file's resolution, duration, audio and video codecs, stream bitrates, and more. This data can only be retrieved by the video owner.",
      }),
      "id?": string({
        description: "The ID that YouTube uses to uniquely identify the video.",
      }),
      "kind?": string({
        default: "youtube#video",
        description:
          'Identifies what kind of resource this is. Value: the fixed string "youtube#video".',
      }),
      "liveStreamingDetails?": ref(VideoLiveStreamingDetails, {
        description:
          "The liveStreamingDetails object contains metadata about a live video broadcast. The object will only be present in a video resource if the video is an upcoming, live, or completed live broadcast.",
      }),
      "localizations?": dict(string(), VideoLocalization, {
        description:
          "The localizations object contains localized versions of the basic details about the video, such as its title and description.",
      }),
      "monetizationDetails?": ref(VideoMonetizationDetails, {
        description:
          "The monetizationDetails object encapsulates information about the monetization status of the video.",
      }),
      "player?": ref(VideoPlayer, {
        description:
          "The player object contains information that you would use to play the video in an embedded player.",
      }),
      "processingDetails?": ref(VideoProcessingDetails, {
        description:
          "The processingDetails object encapsulates information about YouTube's progress in processing the uploaded video file. The properties in the object identify the current processing status and an estimate of the time remaining until YouTube finishes processing the video. This part also indicates whether different types of data or content, such as file details or thumbnail images, are available for the video. The processingProgress object is designed to be polled so that the video uploaded can track the progress that YouTube has made in processing the uploaded video file. This data can only be retrieved by the video owner.",
      }),
      "projectDetails?": ref(VideoProjectDetails, {
        description:
          "The projectDetails object contains information about the project specific video metadata. b/157517979: This part was never populated after it was added. However, it sees non-zero traffic because there is generated client code in the wild that refers to it [1]. We keep this field and do NOT remove it because otherwise V3 would return an error when this part gets requested [2]. [1] https://developers.google.com/resources/api-libraries/documentation/youtube/v3/csharp/latest/classGoogle_1_1Apis_1_1YouTube_1_1v3_1_1Data_1_1VideoProjectDetails.html [2] http://google3/video/youtube/src/python/servers/data_api/common.py?l=1565-1569&rcl=344141677",
      }),
      "recordingDetails?": ref(VideoRecordingDetails, {
        description:
          "The recordingDetails object encapsulates information about the location, date and address where the video was recorded.",
      }),
      "snippet?": ref(VideoSnippet, {
        description:
          "The snippet object contains basic details about the video, such as its title, description, and category.",
      }),
      "statistics?": ref(VideoStatistics, {
        description:
          "The statistics object contains statistics about the video.",
      }),
      "status?": ref(VideoStatus, {
        description:
          "The status object contains information about the video's uploading, processing, and privacy statuses.",
      }),
      "suggestions?": ref(VideoSuggestions, {
        description:
          "The suggestions object encapsulates suggestions that identify opportunities to improve the video quality or the metadata for the uploaded video. This data can only be retrieved by the video owner.",
      }),
      "topicDetails?": ref(VideoTopicDetails, {
        description:
          "The topicDetails object encapsulates information about Freebase topics associated with the video.",
      }),
    },
    {
      description: "A *video* resource represents a YouTube video.",
    },
  )
}
function VideoAbuseReport() {
  return object({
    "comments?": string({
      description: "Additional comments regarding the abuse report.",
    }),
    "language?": string({
      description: "The language that the content was viewed in.",
    }),
    "reasonId?": string({
      description:
        "The high-level, or primary, reason that the content is abusive. The value is an abuse report reason ID.",
    }),
    "secondaryReasonId?": string({
      description:
        "The specific, or secondary, reason that this content is abusive (if available). The value is an abuse report reason ID that is a valid secondary reason for the primary reason.",
    }),
    "videoId?": string({
      description: "The ID that YouTube uses to uniquely identify the video.",
    }),
  })
}
function VideoAbuseReportReason() {
  return object(
    {
      "etag?": string({
        description: "Etag of this resource.",
      }),
      "id?": string({
        description: "The ID of this abuse report reason.",
      }),
      "kind?": string({
        default: "youtube#videoAbuseReportReason",
        description:
          'Identifies what kind of resource this is. Value: the fixed string `"youtube#videoAbuseReportReason"`.',
      }),
      "snippet?": ref(VideoAbuseReportReasonSnippet, {
        description:
          "The `snippet` object contains basic details about the abuse report reason.",
      }),
    },
    {
      description:
        "A `__videoAbuseReportReason__` resource identifies a reason that a video could be reported as abusive. Video abuse report reasons are used with `video.ReportAbuse`.",
    },
  )
}
function VideoAbuseReportReasonListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(VideoAbuseReportReason, {
      description:
        "A list of valid abuse reasons that are used with `video.ReportAbuse`.",
    }),
    "kind?": string({
      default: "youtube#videoAbuseReportReasonListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string `"youtube#videoAbuseReportReasonListResponse"`.',
    }),
    "visitorId?": string({
      description: "The `visitorId` identifies the visitor.",
    }),
  })
}
function VideoAbuseReportReasonSnippet() {
  return object(
    {
      "label?": string({
        description:
          "The localized label belonging to this abuse report reason.",
      }),
      "secondaryReasons?": array(VideoAbuseReportSecondaryReason, {
        description:
          "The secondary reasons associated with this reason, if any are available. (There might be 0 or more.)",
      }),
    },
    {
      description:
        "Basic details about a video category, such as its localized title.",
    },
  )
}
function VideoAbuseReportSecondaryReason() {
  return object({
    "id?": string({
      description: "The ID of this abuse report secondary reason.",
    }),
    "label?": string({
      description:
        "The localized label for this abuse report secondary reason.",
    }),
  })
}
function VideoAgeGating() {
  return object({
    "alcoholContent?": boolean({
      description:
        "Indicates whether or not the video has alcoholic beverage content. Only users of legal purchasing age in a particular country, as identified by ICAP, can view the content.",
    }),
    "restricted?": boolean({
      description:
        "Age-restricted trailers. For redband trailers and adult-rated video-games. Only users aged 18+ can view the content. The the field is true the content is restricted to viewers aged 18+. Otherwise The field won't be present.",
    }),
    "videoGameRating?": string({
      description: "Video game rating, if any.",
      enum: ["anyone", "m15Plus", "m16Plus", "m17Plus"],
    }),
  })
}
function VideoCategory() {
  return object(
    {
      "etag?": string({
        description: "Etag of this resource.",
      }),
      "id?": string({
        description:
          "The ID that YouTube uses to uniquely identify the video category.",
      }),
      "kind?": string({
        default: "youtube#videoCategory",
        description:
          'Identifies what kind of resource this is. Value: the fixed string "youtube#videoCategory".',
      }),
      "snippet?": ref(VideoCategorySnippet, {
        description:
          "The snippet object contains basic details about the video category, including its title.",
      }),
    },
    {
      description:
        "A *videoCategory* resource identifies a category that has been or could be associated with uploaded videos.",
    },
  )
}
function VideoCategoryListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(VideoCategory, {
      description:
        "A list of video categories that can be associated with YouTube videos. In this map, the video category ID is the map key, and its value is the corresponding videoCategory resource.",
    }),
    "kind?": string({
      default: "youtube#videoCategoryListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#videoCategoryListResponse".',
    }),
    "nextPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the next page in the result set.",
    }),
    "pageInfo?": ref(PageInfo, {
      description: "General pagination information.",
    }),
    "prevPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the previous page in the result set.",
    }),
    "tokenPagination?": TokenPagination,
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}
function VideoCategorySnippet() {
  return object(
    {
      "assignable?": boolean(),
      "channelId?": string({
        default: "UCBR8-60-B28hp2BmDPdntcQ",
        description: "The YouTube channel that created the video category.",
      }),
      "title?": string({
        description: "The video category's title.",
      }),
    },
    {
      description:
        "Basic details about a video category, such as its localized title.",
    },
  )
}
function VideoContentDetails() {
  return object(
    {
      "caption?": string({
        description:
          "The value of captions indicates whether the video has captions or not.",
        enum: ["true", "false"],
      }),
      "contentRating?": ref(ContentRating, {
        description:
          "Specifies the ratings that the video received under various rating schemes.",
      }),
      "countryRestriction?": ref(AccessPolicy, {
        description:
          "The countryRestriction object contains information about the countries where a video is (or is not) viewable.",
      }),
      "definition?": string({
        description:
          "The value of definition indicates whether the video is available in high definition or only in standard definition.",
        enum: ["sd", "hd"],
      }),
      "dimension?": string({
        description:
          "The value of dimension indicates whether the video is available in 3D or in 2D.",
      }),
      "duration?": string({
        description:
          "The length of the video. The tag value is an ISO 8601 duration in the format PT#M#S, in which the letters PT indicate that the value specifies a period of time, and the letters M and S refer to length in minutes and seconds, respectively. The # characters preceding the M and S letters are both integers that specify the number of minutes (or seconds) of the video. For example, a value of PT15M51S indicates that the video is 15 minutes and 51 seconds long.",
      }),
      "hasCustomThumbnail?": boolean({
        description:
          "Indicates whether the video uploader has provided a custom thumbnail image for the video. This property is only visible to the video uploader.",
      }),
      "licensedContent?": boolean({
        description:
          "The value of is_license_content indicates whether the video is licensed content.",
      }),
      "projection?": string({
        description: "Specifies the projection format of the video.",
        enum: ["rectangular", "360"],
      }),
      "regionRestriction?": ref(VideoContentDetailsRegionRestriction, {
        description:
          "The regionRestriction object contains information about the countries where a video is (or is not) viewable. The object will contain either the contentDetails.regionRestriction.allowed property or the contentDetails.regionRestriction.blocked property.",
      }),
    },
    {
      description: "Details about the content of a YouTube Video.",
    },
  )
}
function VideoContentDetailsRegionRestriction() {
  return object(
    {
      "allowed?": array(string(), {
        description:
          "A list of region codes that identify countries where the video is viewable. If this property is present and a country is not listed in its value, then the video is blocked from appearing in that country. If this property is present and contains an empty list, the video is blocked in all countries.",
      }),
      "blocked?": array(string(), {
        description:
          "A list of region codes that identify countries where the video is blocked. If this property is present and a country is not listed in its value, then the video is viewable in that country. If this property is present and contains an empty list, the video is viewable in all countries.",
      }),
    },
    {
      description: "DEPRECATED Region restriction of the video.",
    },
  )
}
function VideoFileDetails() {
  return object(
    {
      "audioStreams?": array(VideoFileDetailsAudioStream, {
        description:
          "A list of audio streams contained in the uploaded video file. Each item in the list contains detailed metadata about an audio stream.",
      }),
      "bitrateBps?": string({
        description:
          "The uploaded video file's combined (video and audio) bitrate in bits per second.",
        format: "uint64",
      }),
      "container?": string({
        description: "The uploaded video file's container format.",
      }),
      "creationTime?": string({
        description:
          "The date and time when the uploaded video file was created. The value is specified in ISO 8601 format. Currently, the following ISO 8601 formats are supported: - Date only: YYYY-MM-DD - Naive time: YYYY-MM-DDTHH:MM:SS - Time with timezone: YYYY-MM-DDTHH:MM:SS+HH:MM ",
      }),
      "durationMs?": string({
        description: "The length of the uploaded video in milliseconds.",
        format: "uint64",
      }),
      "fileName?": string({
        description:
          "The uploaded file's name. This field is present whether a video file or another type of file was uploaded.",
      }),
      "fileSize?": string({
        description:
          "The uploaded file's size in bytes. This field is present whether a video file or another type of file was uploaded.",
        format: "uint64",
      }),
      "fileType?": string({
        description:
          "The uploaded file's type as detected by YouTube's video processing engine. Currently, YouTube only processes video files, but this field is present whether a video file or another type of file was uploaded.",
        enum: [
          "video",
          "audio",
          "image",
          "archive",
          "document",
          "project",
          "other",
        ],
      }),
      "videoStreams?": array(VideoFileDetailsVideoStream, {
        description:
          "A list of video streams contained in the uploaded video file. Each item in the list contains detailed metadata about a video stream.",
      }),
    },
    {
      description:
        "Describes original video file properties, including technical details about audio and video streams, but also metadata information like content length, digitization time, or geotagging information.",
    },
  )
}
function VideoFileDetailsAudioStream() {
  return object(
    {
      "bitrateBps?": string({
        description: "The audio stream's bitrate, in bits per second.",
        format: "uint64",
      }),
      "channelCount?": uint32({
        description: "The number of audio channels that the stream contains.",
      }),
      "codec?": string({
        description: "The audio codec that the stream uses.",
      }),
      "vendor?": string({
        description:
          "A value that uniquely identifies a video vendor. Typically, the value is a four-letter vendor code.",
      }),
    },
    {
      description: "Information about an audio stream.",
    },
  )
}
function VideoFileDetailsVideoStream() {
  return object(
    {
      "aspectRatio?": double({
        description:
          "The video content's display aspect ratio, which specifies the aspect ratio in which the video should be displayed.",
      }),
      "bitrateBps?": string({
        description: "The video stream's bitrate, in bits per second.",
        format: "uint64",
      }),
      "codec?": string({
        description: "The video codec that the stream uses.",
      }),
      "frameRateFps?": double({
        description: "The video stream's frame rate, in frames per second.",
      }),
      "heightPixels?": uint32({
        description: "The encoded video content's height in pixels.",
      }),
      "rotation?": string({
        description:
          "The amount that YouTube needs to rotate the original source content to properly display the video.",
        enum: ["none", "clockwise", "upsideDown", "counterClockwise", "other"],
      }),
      "vendor?": string({
        description:
          "A value that uniquely identifies a video vendor. Typically, the value is a four-letter vendor code.",
      }),
      "widthPixels?": uint32({
        description:
          "The encoded video content's width in pixels. You can calculate the video's encoding aspect ratio as width_pixels / height_pixels.",
      }),
    },
    {
      description: "Information about a video stream.",
    },
  )
}
function VideoGetRatingResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(VideoRating, {
      description: "A list of ratings that match the request criteria.",
    }),
    "kind?": string({
      default: "youtube#videoGetRatingResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#videoGetRatingResponse".',
    }),
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}
function VideoListResponse() {
  return object({
    "etag?": string({
      description: "Etag of this resource.",
    }),
    "eventId?": string({
      description:
        "Serialized EventId of the request which produced this response.",
    }),
    "items?": array(Video),
    "kind?": string({
      default: "youtube#videoListResponse",
      description:
        'Identifies what kind of resource this is. Value: the fixed string "youtube#videoListResponse".',
    }),
    "nextPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the next page in the result set.",
    }),
    "pageInfo?": ref(PageInfo, {
      description: "General pagination information.",
    }),
    "prevPageToken?": string({
      description:
        "The token that can be used as the value of the pageToken parameter to retrieve the previous page in the result set.",
    }),
    "tokenPagination?": TokenPagination,
    "visitorId?": string({
      description: "The visitorId identifies the visitor.",
    }),
  })
}
function VideoLiveStreamingDetails() {
  return object(
    {
      "activeLiveChatId?": string({
        description:
          "The ID of the currently active live chat attached to this video. This field is filled only if the video is a currently live broadcast that has live chat. Once the broadcast transitions to complete this field will be removed and the live chat closed down. For persistent broadcasts that live chat id will no longer be tied to this video but rather to the new video being displayed at the persistent page.",
      }),
      "actualEndTime?": string({
        description:
          "The time that the broadcast actually ended. This value will not be available until the broadcast is over.",
        format: "date-time",
      }),
      "actualStartTime?": string({
        description:
          "The time that the broadcast actually started. This value will not be available until the broadcast begins.",
        format: "date-time",
      }),
      "concurrentViewers?": string({
        description:
          "The number of viewers currently watching the broadcast. The property and its value will be present if the broadcast has current viewers and the broadcast owner has not hidden the viewcount for the video. Note that YouTube stops tracking the number of concurrent viewers for a broadcast when the broadcast ends. So, this property would not identify the number of viewers watching an archived video of a live broadcast that already ended.",
        format: "uint64",
      }),
      "scheduledEndTime?": string({
        description:
          "The time that the broadcast is scheduled to end. If the value is empty or the property is not present, then the broadcast is scheduled to contiue indefinitely.",
        format: "date-time",
      }),
      "scheduledStartTime?": string({
        description: "The time that the broadcast is scheduled to begin.",
        format: "date-time",
      }),
    },
    {
      description: "Details about the live streaming metadata.",
    },
  )
}
function VideoLocalization() {
  return object(
    {
      "description?": string({
        description: "Localized version of the video's description.",
      }),
      "title?": string({
        description: "Localized version of the video's title.",
      }),
    },
    {
      description:
        "Localized versions of certain video properties (e.g. title).",
    },
  )
}
function VideoMonetizationDetails() {
  return object(
    {
      "access?": ref(AccessPolicy, {
        description:
          "The value of access indicates whether the video can be monetized or not.",
      }),
    },
    {
      description: "Details about monetization of a YouTube Video.",
    },
  )
}
function VideoPlayer() {
  return object(
    {
      "embedHeight?": string({
        format: "int64",
      }),
      "embedHtml?": string({
        description:
          "An <iframe> tag that embeds a player that will play the video.",
      }),
      "embedWidth?": string({
        description: "The embed width",
        format: "int64",
      }),
    },
    {
      description: "Player to be used for a video playback.",
    },
  )
}
function VideoProcessingDetails() {
  return object(
    {
      "editorSuggestionsAvailability?": string({
        description:
          "This value indicates whether video editing suggestions, which might improve video quality or the playback experience, are available for the video. You can retrieve these suggestions by requesting the suggestions part in your videos.list() request.",
      }),
      "fileDetailsAvailability?": string({
        description:
          "This value indicates whether file details are available for the uploaded video. You can retrieve a video's file details by requesting the fileDetails part in your videos.list() request.",
      }),
      "processingFailureReason?": string({
        description:
          "The reason that YouTube failed to process the video. This property will only have a value if the processingStatus property's value is failed.",
        enum: ["uploadFailed", "transcodeFailed", "streamingFailed", "other"],
      }),
      "processingIssuesAvailability?": string({
        description:
          "This value indicates whether the video processing engine has generated suggestions that might improve YouTube's ability to process the the video, warnings that explain video processing problems, or errors that cause video processing problems. You can retrieve these suggestions by requesting the suggestions part in your videos.list() request.",
      }),
      "processingProgress?": ref(VideoProcessingDetailsProcessingProgress, {
        description:
          "The processingProgress object contains information about the progress YouTube has made in processing the video. The values are really only relevant if the video's processing status is processing.",
      }),
      "processingStatus?": string({
        description:
          "The video's processing status. This value indicates whether YouTube was able to process the video or if the video is still being processed.",
        enum: ["processing", "succeeded", "failed", "terminated"],
      }),
      "tagSuggestionsAvailability?": string({
        description:
          "This value indicates whether keyword (tag) suggestions are available for the video. Tags can be added to a video's metadata to make it easier for other users to find the video. You can retrieve these suggestions by requesting the suggestions part in your videos.list() request.",
      }),
      "thumbnailsAvailability?": string({
        description:
          "This value indicates whether thumbnail images have been generated for the video.",
      }),
    },
    {
      description:
        "Describes processing status and progress and availability of some other Video resource parts.",
    },
  )
}
function VideoProcessingDetailsProcessingProgress() {
  return object(
    {
      "partsProcessed?": string({
        description:
          "The number of parts of the video that YouTube has already processed. You can estimate the percentage of the video that YouTube has already processed by calculating: 100 * parts_processed / parts_total Note that since the estimated number of parts could increase without a corresponding increase in the number of parts that have already been processed, it is possible that the calculated progress could periodically decrease while YouTube processes a video.",
        format: "uint64",
      }),
      "partsTotal?": string({
        description:
          "An estimate of the total number of parts that need to be processed for the video. The number may be updated with more precise estimates while YouTube processes the video.",
        format: "uint64",
      }),
      "timeLeftMs?": string({
        description:
          "An estimate of the amount of time, in millseconds, that YouTube needs to finish processing the video.",
        format: "uint64",
      }),
    },
    {
      description: "Video processing progress and completion time estimate.",
    },
  )
}
function VideoProjectDetails() {
  return object(
    {},
    {
      description:
        "DEPRECATED. b/157517979: This part was never populated after it was added. However, it sees non-zero traffic because there is generated client code in the wild that refers to it [1]. We keep this field and do NOT remove it because otherwise V3 would return an error when this part gets requested [2]. [1] https://developers.google.com/resources/api-libraries/documentation/youtube/v3/csharp/latest/classGoogle_1_1Apis_1_1YouTube_1_1v3_1_1Data_1_1VideoProjectDetails.html [2] http://google3/video/youtube/src/python/servers/data_api/common.py?l=1565-1569&rcl=344141677",
    },
  )
}
function VideoRating() {
  return object(
    {
      "rating?": string({
        description: "Rating of a video.",
        enum: ["none", "like", "dislike"],
      }),
      "videoId?": string({
        description: "The ID that YouTube uses to uniquely identify the video.",
      }),
    },
    {
      description: "Basic details about rating of a video.",
    },
  )
}
function VideoRecordingDetails() {
  return object(
    {
      "location?": ref(GeoPoint, {
        description: "The geolocation information associated with the video.",
      }),
      "locationDescription?": string({
        description:
          "The text description of the location where the video was recorded.",
      }),
      "recordingDate?": string({
        description: "The date and time when the video was recorded.",
        format: "date-time",
      }),
    },
    {
      description: "Recording information associated with the video.",
    },
  )
}
function VideoSnippet() {
  return object(
    {
      "categoryId?": string({
        description: "The YouTube video category associated with the video.",
      }),
      "channelId?": string({
        description:
          "The ID that YouTube uses to uniquely identify the channel that the video was uploaded to.",
      }),
      "channelTitle?": string({
        description: "Channel title for the channel that the video belongs to.",
      }),
      "defaultAudioLanguage?": string({
        description:
          "The default_audio_language property specifies the language spoken in the video's default audio track.",
      }),
      "defaultLanguage?": string({
        description: "The language of the videos's default snippet.",
      }),
      "description?": string({
        description:
          "The video's description. @mutable youtube.videos.insert youtube.videos.update",
      }),
      "liveBroadcastContent?": string({
        description:
          'Indicates if the video is an upcoming/active live broadcast. Or it\'s "none" if the video is not an upcoming/active live broadcast.',
        enum: ["none", "upcoming", "live", "completed"],
      }),
      "localized?": ref(VideoLocalization, {
        description:
          "Localized snippet selected with the hl parameter. If no such localization exists, this field is populated with the default snippet. (Read-only)",
      }),
      "publishedAt?": string({
        description: "The date and time when the video was uploaded.",
        format: "date-time",
      }),
      "tags?": array(string(), {
        description:
          "A list of keyword tags associated with the video. Tags may contain spaces.",
      }),
      "thumbnails?": ref(ThumbnailDetails, {
        description:
          "A map of thumbnail images associated with the video. For each object in the map, the key is the name of the thumbnail image, and the value is an object that contains other information about the thumbnail.",
      }),
      "title?": string({
        description:
          "The video's title. @mutable youtube.videos.insert youtube.videos.update",
      }),
    },
    {
      description:
        "Basic details about a video, including title, description, uploader, thumbnails and category.",
    },
  )
}
function VideoStatistics() {
  return object(
    {
      "commentCount?": string({
        description: "The number of comments for the video.",
        format: "uint64",
      }),
      "dislikeCount?": string({
        description:
          "The number of users who have indicated that they disliked the video by giving it a negative rating.",
        format: "uint64",
      }),
      "favoriteCount?": string({
        description:
          "The number of users who currently have the video marked as a favorite video.",
        format: "uint64",
      }),
      "likeCount?": string({
        description:
          "The number of users who have indicated that they liked the video by giving it a positive rating.",
        format: "uint64",
      }),
      "viewCount?": string({
        description: "The number of times the video has been viewed.",
        format: "uint64",
      }),
    },
    {
      description:
        "Statistics about the video, such as the number of times the video was viewed or liked.",
    },
  )
}
function VideoStatus() {
  return object(
    {
      "embeddable?": boolean({
        description:
          "This value indicates if the video can be embedded on another website. @mutable youtube.videos.insert youtube.videos.update",
      }),
      "failureReason?": string({
        description:
          "This value explains why a video failed to upload. This property is only present if the uploadStatus property indicates that the upload failed.",
        enum: [
          "conversion",
          "invalidFile",
          "emptyFile",
          "tooSmall",
          "codec",
          "uploadAborted",
        ],
      }),
      "license?": string({
        description:
          "The video's license. @mutable youtube.videos.insert youtube.videos.update",
        enum: ["youtube", "creativeCommon"],
      }),
      "madeForKids?": boolean(),
      "privacyStatus?": string({
        description: "The video's privacy status.",
        enum: ["public", "unlisted", "private"],
      }),
      "publicStatsViewable?": boolean({
        description:
          "This value indicates if the extended video statistics on the watch page can be viewed by everyone. Note that the view count, likes, etc will still be visible if this is disabled. @mutable youtube.videos.insert youtube.videos.update",
      }),
      "publishAt?": string({
        description:
          "The date and time when the video is scheduled to publish. It can be set only if the privacy status of the video is private..",
        format: "date-time",
      }),
      "rejectionReason?": string({
        description:
          "This value explains why YouTube rejected an uploaded video. This property is only present if the uploadStatus property indicates that the upload was rejected.",
        enum: [
          "copyright",
          "inappropriate",
          "duplicate",
          "termsOfUse",
          "uploaderAccountSuspended",
          "length",
          "claim",
          "uploaderAccountClosed",
          "trademark",
          "legal",
        ],
      }),
      "selfDeclaredMadeForKids?": boolean(),
      "uploadStatus?": string({
        description: "The status of the uploaded video.",
        enum: ["uploaded", "processed", "failed", "rejected", "deleted"],
      }),
    },
    {
      description:
        "Basic details about a video category, such as its localized title. Next Id: 18",
    },
  )
}

function VideoSuggestions() {
  return object(
    {
      "editorSuggestions?": array(
        string({
          enum: [
            "videoAutoLevels",
            "videoStabilize",
            "videoCrop",
            "audioQuietAudioSwap",
          ],
        }),
        {
          description:
            "A list of video editing operations that might improve the video quality or playback experience of the uploaded video.",
        },
      ),
      "processingErrors?": array(
        string({
          enum: [
            "audioFile",
            "imageFile",
            "projectFile",
            "notAVideoFile",
            "docFile",
            "archiveFile",
            "unsupportedSpatialAudioLayout",
          ],
        }),
        {
          description:
            "A list of errors that will prevent YouTube from successfully processing the uploaded video video. These errors indicate that, regardless of the video's current processing status, eventually, that status will almost certainly be failed.",
        },
      ),
      "processingHints?": array(
        string({
          enum: [
            "nonStreamableMov",
            "sendBestQualityVideo",
            "sphericalVideo",
            "spatialAudio",
            "vrVideo",
            "hdrVideo",
          ],
        }),
        {
          description:
            "A list of suggestions that may improve YouTube's ability to process the video.",
        },
      ),
      "processingWarnings?": array(
        string({
          enum: [
            "unknownContainer",
            "unknownVideoCodec",
            "unknownAudioCodec",
            "inconsistentResolution",
            "hasEditlist",
            "problematicVideoCodec",
            "problematicAudioCodec",
            "unsupportedVrStereoMode",
            "unsupportedSphericalProjectionType",
            "unsupportedHdrPixelFormat",
            "unsupportedHdrColorMetadata",
            "problematicHdrLookupTable",
          ],
        }),
        {
          description:
            "A list of reasons why YouTube may have difficulty transcoding the uploaded video or that might result in an erroneous transcoding. These warnings are generated before YouTube actually processes the uploaded video file. In addition, they identify issues that are unlikely to cause the video processing to fail but that might cause problems such as sync issues, video artifacts, or a missing audio track.",
        },
      ),
      "tagSuggestions?": array(VideoSuggestionsTagSuggestion, {
        description:
          "A list of keyword tags that could be added to the video's metadata to increase the likelihood that users will locate your video when searching or browsing on YouTube.",
      }),
    },
    {
      description:
        "Specifies suggestions on how to improve video content, including encoding hints, tag suggestions, and editor suggestions.",
    },
  )
}
function VideoSuggestionsTagSuggestion() {
  return object(
    {
      "categoryRestricts?": array(string(), {
        description:
          "A set of video categories for which the tag is relevant. You can use this information to display appropriate tag suggestions based on the video category that the video uploader associates with the video. By default, tag suggestions are relevant for all categories if there are no restricts defined for the keyword.",
      }),
      "tag?": string({
        description: "The keyword tag suggested for the video.",
      }),
    },
    {
      description: "A single tag suggestion with it's relevance information.",
    },
  )
}
function VideoTopicDetails() {
  return object(
    {
      "relevantTopicIds?": array(string(), {
        description:
          "Similar to topic_id, except that these topics are merely relevant to the video. These are topics that may be mentioned in, or appear in the video. You can retrieve information about each topic using Freebase Topic API.",
      }),
      "topicCategories?": array(string(), {
        description:
          "A list of Wikipedia URLs that provide a high-level description of the video's content.",
      }),
      "topicIds?": array(string(), {
        description:
          'A list of Freebase topic IDs that are centrally associated with the video. These are topics that are centrally featured in the video, and it can be said that the video is mainly about each of these. You can retrieve information about each topic using the < a href="http://wiki.freebase.com/wiki/Topic_API">Freebase Topic API.',
      }),
    },
    {
      description: "Freebase topic information related to the video.",
    },
  )
}
function WatchSettings() {
  return object(
    {
      "backgroundColor?": string({
        description: "The text color for the video watch page's branded area.",
      }),
      "featuredPlaylistId?": string({
        description:
          "An ID that uniquely identifies a playlist that displays next to the video player.",
      }),
      "textColor?": string({
        description:
          "The background color for the video watch page's branded area.",
      }),
    },
    {
      description: "Branding properties for the watch. All deprecated.",
    },
  )
}
const tags = declareTags({
  abuseReports: {},
  activities: {},
  captions: {},
  channelBanners: {},
  channels: {},
  channelSections: {},
  comments: {},
  commentThreads: {},
  i18nLanguages: {},
  i18nRegions: {},
  liveBroadcasts: {},
  liveChatBans: {},
  liveChatMessages: {},
  liveChatModerators: {},
  liveStreams: {},
  members: {},
  membershipsLevels: {},
  playlistItems: {},
  playlists: {},
  search: {},
  subscriptions: {},
  superChatEvents: {},
  tests: {},
  thirdPartyLinks: {},
  thumbnails: {},
  videoAbuseReportReasons: {},
  videoCategories: {},
  videos: {},
  watermarks: {},
  youtube: {},
})

const xgafv = named(
  "_.xgafv",
  queryParam({
    description: "V1 error format.",
    name: "$.xgafv",
    schema: string({
      enum: ["1", "2"],
    }),
  }),
)

const access_token = named(
  "access_token",
  queryParam({
    description: "OAuth access token.",
    name: "access_token",
    schema: string(),
  }),
)

const alt = named(
  "alt",
  queryParam({
    description: "Data format for response.",
    name: "alt",
    schema: string({
      enum: ["json", "media", "proto"],
    }),
  }),
)

const callback = named(
  "callback",
  queryParam({
    description: "JSONP",
    name: "callback",
    schema: string(),
  }),
)

const fields = named(
  "fields",
  queryParam({
    description:
      "Selector specifying which fields to include in a partial response.",
    name: "fields",
    schema: string(),
  }),
)

const key = named(
  "key",
  queryParam({
    description:
      "API key. Your API key identifies your project and provides you with API access, quota, and reports. Required unless you provide an OAuth 2.0 token.",
    name: "key",
    schema: string(),
  }),
)

const oauth_token = named(
  "oauth_token",
  queryParam({
    description: "OAuth 2.0 token for the current user.",
    name: "oauth_token",
    schema: string(),
  }),
)

const prettyPrint = named(
  "prettyPrint",
  queryParam({
    description: "Returns response with indentations and line breaks.",
    name: "prettyPrint",
    schema: boolean(),
  }),
)

const quotaUser = named(
  "quotaUser",
  queryParam({
    description:
      "Available to use for quota purposes for server-side applications. Can be any arbitrary string assigned to a user, but should not exceed 40 characters.",
    name: "quotaUser",
    schema: string(),
  }),
)

const uploadType = named(
  "uploadType",
  queryParam({
    description:
      'Legacy upload protocol for media (e.g. "media", "multipart").',
    name: "uploadType",
    schema: string(),
  }),
)

const upload_protocol = named(
  "upload_protocol",
  queryParam({
    description: 'Upload protocol for media (e.g. "raw", "multipart").',
    name: "upload_protocol",
    schema: string(),
  }),
)

const successfulResponse = resp({ description: "Successful response" })

const liveBroadcastTags = [tags.liveBroadcasts]
const videoTags = [tags.videos]

const onBehalfOfContentOwner = queryParam({
  description:
    "*Note:* This parameter is intended exclusively for YouTube content partners. The *onBehalfOfContentOwner* parameter indicates that the request's authorization credentials identify a YouTube CMS user who is acting on behalf of the content owner specified in the parameter value. This parameter is intended for YouTube content partners that own and manage many different YouTube channels. It allows content owners to authenticate once and get access to all their video and channel data, without having to provide authentication credentials for each individual channel. The actual CMS account that the user authenticates with must be linked to the specified YouTube content owner.",
  name: "onBehalfOfContentOwner",
  schema: string(),
})

const onBehalfOfContentOwnerSchemaCms = queryParam({
  description:
    "*Note:* This parameter is intended exclusively for YouTube content partners. The *onBehalfOfContentOwner* parameter indicates that the request's authorization credentials identify a YouTube CMS user who is acting on behalf of the content owner specified in the parameter value. This parameter is intended for YouTube content partners that own and manage many different YouTube channels. It allows content owners to authenticate once and get access to all their video and channel data, without having to provide authentication credentials for each individual channel. The CMS account that the user authenticates with must be linked to the specified YouTube content owner.",
  name: "onBehalfOfContentOwner",
  schema: string(),
})

const onBehalfOfContentOwnerSchemaShort = {
  description:
    "The *onBehalfOfContentOwner* parameter indicates that the authenticated user is acting on behalf of the content owner specified in the parameter value. This parameter is intended for YouTube content partners that own and manage many different YouTube channels. It allows content owners to authenticate once and get access to all their video and channel data, without having to provide authentication credentials for each individual channel. The actual CMS account that the user authenticates with needs to be linked to the specified YouTube content owner.",
  schema: string(),
}

const onBehalfOfContentOwnerChannelSchema = {
  description:
    "This parameter can only be used in a properly authorized request. *Note:* This parameter is intended exclusively for YouTube content partners. The *onBehalfOfContentOwnerChannel* parameter specifies the YouTube channel ID of the channel to which a video is being added. This parameter is required when a request specifies a value for the onBehalfOfContentOwner parameter, and it can only be used in conjunction with that parameter. In addition, the request must be authorized using a CMS account that is linked to the content owner that the onBehalfOfContentOwner parameter specifies. Finally, the channel that the onBehalfOfContentOwnerChannel parameter value specifies must be linked to the content owner that the onBehalfOfContentOwner parameter specifies. This parameter is intended for YouTube content partners that own and manage many different YouTube channels. It allows content owners to authenticate once and perform actions on behalf of the channel specified in the parameter value, without having to provide authentication credentials for each separate channel.",
  schema: string(),
}

const pageTokenSchema = {
  description:
    "The *pageToken* parameter identifies a specific page in the result set that should be returned. In an API response, the nextPageToken and prevPageToken properties identify other pages that could be retrieved.",
  schema: string(),
}

const liveChatMessagesPageTokenSchema = {
  description:
    "The *pageToken* parameter identifies a specific page in the result set that should be returned. In an API response, the nextPageToken property identify other pages that could be retrieved.",
  schema: string(),
}

const videosListPageTokenSchema = {
  description:
    "The *pageToken* parameter identifies a specific page in the result set that should be returned. In an API response, the nextPageToken and prevPageToken properties identify other pages that could be retrieved. *Note:* This parameter is supported for use in conjunction with the myRating and chart parameters, but it is not supported for use in conjunction with the id parameter.",
  schema: string(),
}

const videoPartnerSecurity = oauthScopes(
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/youtubepartner",
)

const youtubeForceSslSecurity = oauthScopes(
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.force-ssl",
)

const watermarkChannelIdSchema: InlineQueryParam = { schema: string() }

const onBehalfOf = (description: string): InlineQueryParam => ({
  description,
  schema: string(),
})

const onBehalfOfPage = onBehalfOf(
  "ID of the Google+ Page for the channel that the request is on behalf of.",
)

const onBehalfOfTypo = onBehalfOf(
  "ID of the Google+ Page for the channel that the request is be on behalf of",
)

function liveBroadcastResponse() {
  return resp({
    description: "Successful response",
    body: LiveBroadcast,
  })
}
function liveBroadcastListResponse() {
  return resp({
    description: "Successful response",
    body: LiveBroadcastListResponse,
  })
}

function cuepointResponse() {
  return resp({
    description: "Successful response",
    body: Cuepoint,
  })
}

const partArray = (description?: string): InlineQueryParam => ({
  schema: array(string()),
  description,
  explode: true,
  style: "form",
})

const hlQuery = (description?: string): InlineQueryParam => ({
  description,
  schema: string(),
})

const listMaxResultsSchema: InlineQueryParam = {
  description:
    "The *maxResults* parameter specifies the maximum number of items that should be returned in the result set.",
  schema: integer({
    maximum: 50,
    minimum: 0,
  }),
}

const requiredListMaxResultsSchema: InlineQueryParam = {
  description:
    "The *maxResults* parameter specifies the maximum number of items that should be returned in the result set.",
  schema: integer({
    maximum: 50,
    minimum: 1,
  }),
}

const commentMaxResultsSchema: InlineQueryParam = {
  description:
    "The *maxResults* parameter specifies the maximum number of items that should be returned in the result set.",
  schema: integer({
    maximum: 100,
    minimum: 1,
  }),
}

const liveChatListMaxResultsSchema: InlineQueryParam = {
  description:
    "The *maxResults* parameter specifies the maximum number of items that should be returned in the result set.",
  schema: integer({
    maximum: 2000,
    minimum: 200,
  }),
}

const membersListMaxResultsSchema: InlineQueryParam = {
  description:
    "The *maxResults* parameter specifies the maximum number of items that should be returned in the result set.",
  schema: integer({
    maximum: 1000,
    minimum: 0,
  }),
}

const videosListMaxResultsSchema: InlineQueryParam = {
  description:
    "The *maxResults* parameter specifies the maximum number of items that should be returned in the result set. *Note:* This parameter is supported for use in conjunction with the myRating and chart parameters, but it is not supported for use in conjunction with the id parameter.",
  schema: integer({
    maximum: 50,
    minimum: 1,
  }),
}

export default responsibleAPI({
  partialDoc: {
    openapi: "3.1.0",
    info: {
      contact: {
        name: "Google",
        url: "https://google.com",
        "x-twitter": "youtube",
      },
      description:
        "The YouTube Data API v3 is an API that provides access to YouTube data, such as videos, playlists, and channels.",
      license: {
        name: "Creative Commons Attribution 3.0",
        url: "http://creativecommons.org/licenses/by/3.0/",
      },
      termsOfService: "https://developers.google.com/terms/",
      title: "YouTube Data API v3",
      version: "v3",
      "x-apiClientRegistration": {
        url: "https://console.developers.google.com",
      },
      "x-apisguru-categories": ["analytics", "media"],
      "x-logo": {
        url: "https://api.apis.guru/v2/cache/logo/https_www.google.com_images_branding_googlelogo_2x_googlelogo_color_272x92dp.png",
      },
      "x-origin": [
        {
          format: "google",
          url: "https://youtube.googleapis.com/$discovery/rest?version=v3",
          version: "v1",
        },
      ],
      "x-providerName": "googleapis.com",
      "x-serviceName": "youtube",
    },
    externalDocs: {
      url: "https://developers.google.com/youtube/",
    },
    servers: [
      {
        url: "https://youtube.googleapis.com/",
      },
    ],
    tags: Object.values(tags),
  },
  forEachPath: {
    params: [
      xgafv,
      access_token,
      alt,
      callback,
      fields,
      key,
      oauth_token,
      prettyPrint,
      quotaUser,
      upload_protocol,
      uploadType,
    ],
  },
  forEachOp: {
    req: {
      mime: "application/json",
    },
    res: {
      mime: "application/json",
    },
  },
  routes: {
    "/youtube/v3/abuseReports": POST({
      description: "Inserts a new resource into this collection.",
      id: "youtube.abuseReports.insert",
      req: {
        query: {
          part: partArray(
            "The *part* parameter serves two purposes in this operation. It identifies the properties that the write operation will set as well as the properties that the API response will include.",
          ),
        },
        security: oauthScopes(
          "https://www.googleapis.com/auth/youtube",
          "https://www.googleapis.com/auth/youtube.force-ssl",
        ),
        "body?": AbuseReport,
      },
      res: {
        200: resp({
          description: "Successful response",
          body: AbuseReport,
        }),
      },
      tags: [tags.abuseReports],
    }),
    "/youtube/v3/activities": GET({
      description: "Retrieves a list of resources, possibly filtered.",
      id: "youtube.activities.list",
      req: {
        query: {
          part: partArray(
            "The *part* parameter specifies a comma-separated list of one or more activity resource properties that the API response will include. If the parameter identifies a property that contains child properties, the child properties will be included in the response. For example, in an activity resource, the snippet property contains other properties that identify the type of activity, a display title for the activity, and so forth. If you set *part=snippet*, the API response will also contain all of those nested properties.",
          ),
          "maxResults?": listMaxResultsSchema,
          "pageToken?": pageTokenSchema,
          "channelId?": {
            schema: string(),
          },
          "home?": {
            schema: boolean(),
          },
          "mine?": {
            schema: boolean(),
          },
          "publishedAfter?": {
            schema: string(),
          },
          "publishedBefore?": {
            schema: string(),
          },
          "regionCode?": {
            schema: string(),
          },
        },
        security: oauthScopes(
          "https://www.googleapis.com/auth/youtube",
          "https://www.googleapis.com/auth/youtube.force-ssl",
          "https://www.googleapis.com/auth/youtube.readonly",
        ),
      },
      res: {
        200: resp({
          description: "Successful response",
          body: ActivityListResponse,
        }),
      },
      tags: [tags.activities],
    }),
    "/youtube/v3/captions": scope({
      forEachOp: {
        tags: [tags.captions],
        req: {
          security: oauthScopes(
            "https://www.googleapis.com/auth/youtube.force-ssl",
            "https://www.googleapis.com/auth/youtubepartner",
          ),
        },
        res: {
          add: {
            200: successfulResponse,
          },
        },
      },
      DELETE: {
        description: "Deletes a resource.",
        id: "youtube.captions.delete",
        req: {
          params: [onBehalfOfContentOwner],
          query: {
            id: { schema: string() },
            "onBehalfOf?": onBehalfOfTypo,
          },
        },
      },
      GET: {
        description: "Retrieves a list of resources, possibly filtered.",
        id: "youtube.captions.list",
        req: {
          params: [onBehalfOfContentOwner],
          query: {
            part: partArray(
              "The *part* parameter specifies a comma-separated list of one or more caption resource parts that the API response will include. The part names that you can include in the parameter value are id and snippet.",
            ),
            videoId: {
              description: "Returns the captions for the specified video.",
              schema: string(),
            },
            "id?": {
              description:
                "Returns the captions with the given IDs for Stubby or Apiary.",
              explode: true,
              schema: array(string()),
              style: "form",
            },
            "onBehalfOf?": onBehalfOfPage,
          },
        },
        res: {
          200: resp({
            description: "Successful response",
            body: CaptionListResponse,
          }),
        },
      },
      POST: {
        description: "Inserts a new resource into this collection.",
        id: "youtube.captions.insert",
        req: {
          params: [onBehalfOfContentOwner],
          query: {
            part: partArray(
              "The *part* parameter specifies the caption resource parts that the API response will include. Set the parameter value to snippet.",
            ),
            "onBehalfOf?": onBehalfOfTypo,
            "sync?": {
              description:
                "Extra parameter to allow automatically syncing the uploaded caption/transcript with the audio.",
              schema: boolean(),
            },
          },
          "body?": {
            "application/octet-stream": unknown(),
            "text/xml": Caption,
          },
        },
        res: {
          200: resp({
            description: "Successful response",
            body: Caption,
          }),
        },
      },
      PUT: {
        description: "Updates an existing resource.",
        id: "youtube.captions.update",
        req: {
          params: [onBehalfOfContentOwner],
          query: {
            part: partArray(
              "The *part* parameter specifies a comma-separated list of one or more caption resource parts that the API response will include. The part names that you can include in the parameter value are id and snippet.",
            ),
            "onBehalfOf?": onBehalfOfPage,
            "sync?": {
              description:
                "Extra parameter to allow automatically syncing the uploaded caption/transcript with the audio.",
              schema: boolean(),
            },
          },
          "body?": {
            "application/octet-stream": unknown(),
            "text/xml": Caption,
          },
        },
        res: {
          200: resp({
            description: "Successful response",
            body: Caption,
          }),
        },
      },
      "/{id}": GET({
        description: "Downloads a caption track.",
        id: "youtube.captions.download",
        req: {
          pathParams: {
            id: {
              description:
                "The ID of the caption track to download, required for One Platform.",
              schema: string(),
            },
          },
          params: [onBehalfOfContentOwner],
          query: {
            "onBehalfOf?": onBehalfOfTypo,
            "tfmt?": {
              description:
                "Convert the captions into this format. Supported options are sbv, srt, and vtt.",
              schema: string(),
            },
            "tlang?": {
              description:
                "tlang is the language code; machine translate the captions into this language.",
              schema: string(),
            },
          },
        },
      }),
    }),
    "/youtube/v3/channelBanners/insert": POST({
      description: "Inserts a new resource into this collection.",
      id: "youtube.channelBanners.insert",
      req: {
        params: [onBehalfOfContentOwner],
        query: {
          "onBehalfOfContentOwnerChannel?": onBehalfOfContentOwnerChannelSchema,
          "channelId?": {
            description:
              "Unused, channel_id is currently derived from the security context of the requestor.",
            schema: string(),
          },
        },
        security: oauthScopes(
          "https://www.googleapis.com/auth/youtube",
          "https://www.googleapis.com/auth/youtube.force-ssl",
          "https://www.googleapis.com/auth/youtube.upload",
        ),
        "body?": {
          "application/octet-stream": unknown(),
          "image/jpeg": ChannelBannerResource,
          "image/png": ChannelBannerResource,
        },
      },
      res: {
        200: resp({
          description: "Successful response",
          body: ChannelBannerResource,
        }),
      },
      tags: [tags.channelBanners],
    }),
    "/youtube/v3/channelSections": scope({
      forEachOp: {
        tags: [tags.channelSections],
        req: {
          security: videoPartnerSecurity,
        },
        res: {
          add: {
            200: resp({
              description: "Successful response",
              body: ChannelSection,
            }),
          },
        },
      },
      DELETE: {
        description: "Deletes a resource.",
        id: "youtube.channelSections.delete",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            id: {
              schema: string(),
            },
          },
        },
        res: {
          200: successfulResponse,
        },
      },
      GET: {
        description: "Retrieves a list of resources, possibly filtered.",
        id: "youtube.channelSections.list",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            part: partArray(
              "The *part* parameter specifies a comma-separated list of one or more channelSection resource properties that the API response will include. The part names that you can include in the parameter value are id, snippet, and contentDetails. If the parameter identifies a property that contains child properties, the child properties will be included in the response. For example, in a channelSection resource, the snippet property contains other properties, such as a display title for the channelSection. If you set *part=snippet*, the API response will also contain all of those nested properties.",
            ),
            "hl?": hlQuery("Return content in specified language"),
            "channelId?": {
              description:
                "Return the ChannelSections owned by the specified channel ID.",
              schema: string(),
            },
            "id?": {
              description:
                "Return the ChannelSections with the given IDs for Stubby or Apiary.",
              explode: true,
              schema: array(string()),
              style: "form",
            },
            "mine?": {
              description:
                "Return the ChannelSections owned by the authenticated user.",
              schema: boolean(),
            },
          },
          security: oauthScope(
            "https://www.googleapis.com/auth/youtube.readonly",
          ),
        },
        res: {
          200: resp({
            description: "Successful response",
            body: ChannelSectionListResponse,
          }),
        },
      },
      POST: {
        description: "Inserts a new resource into this collection.",
        id: "youtube.channelSections.insert",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            part: partArray(
              "The *part* parameter serves two purposes in this operation. It identifies the properties that the write operation will set as well as the properties that the API response will include. The part names that you can include in the parameter value are snippet and contentDetails.",
            ),
            "onBehalfOfContentOwnerChannel?":
              onBehalfOfContentOwnerChannelSchema,
          },
          "body?": ChannelSection,
        },
      },
      PUT: {
        description: "Updates an existing resource.",
        id: "youtube.channelSections.update",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            part: partArray(
              "The *part* parameter serves two purposes in this operation. It identifies the properties that the write operation will set as well as the properties that the API response will include. The part names that you can include in the parameter value are snippet and contentDetails.",
            ),
          },
          "body?": ChannelSection,
        },
      },
    }),
    "/youtube/v3/channels": scope({
      forEachOp: {
        tags: [tags.channels],
        req: {
          security: videoPartnerSecurity,
        },
      },
      GET: {
        description: "Retrieves a list of resources, possibly filtered.",
        id: "youtube.channels.list",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            part: partArray(
              "The *part* parameter specifies a comma-separated list of one or more channel resource properties that the API response will include. If the parameter identifies a property that contains child properties, the child properties will be included in the response. For example, in a channel resource, the contentDetails property contains other properties, such as the uploads properties. As such, if you set *part=contentDetails*, the API response will also contain all of those nested properties.",
            ),
            "hl?": hlQuery(
              'Stands for "host language". Specifies the localization language of the metadata to be filled into snippet.localized. The field is filled with the default metadata if there is no localization in the specified language. The parameter value must be a language code included in the list returned by the i18nLanguages.list method (e.g. en_US, es_MX).',
            ),
            "maxResults?": listMaxResultsSchema,
            "pageToken?": pageTokenSchema,
            "categoryId?": {
              description:
                "Return the channels within the specified guide category ID.",
              schema: string(),
            },
            "forUsername?": {
              description:
                "Return the channel associated with a YouTube username.",
              schema: string(),
            },
            "id?": {
              description: "Return the channels with the specified IDs.",
              explode: true,
              schema: array(string()),
              style: "form",
            },
            "managedByMe?": {
              description:
                "Return the channels managed by the authenticated user.",
              schema: boolean(),
            },
            "mine?": {
              description:
                "Return the ids of channels owned by the authenticated user.",
              schema: boolean(),
            },
            "mySubscribers?": {
              description:
                "Return the channels subscribed to the authenticated user",
              schema: boolean(),
            },
          },
          security: oauthScopes(
            "https://www.googleapis.com/auth/youtube.readonly",
            "https://www.googleapis.com/auth/youtubepartner-channel-audit",
          ),
        },
        res: {
          200: resp({
            description: "Successful response",
            body: ChannelListResponse,
          }),
        },
      },
      PUT: {
        description: "Updates an existing resource.",
        id: "youtube.channels.update",
        req: {
          query: {
            part: partArray(
              "The *part* parameter serves two purposes in this operation. It identifies the properties that the write operation will set as well as the properties that the API response will include. The API currently only allows the parameter value to be set to either brandingSettings or invideoPromotion. (You cannot update both of those parts with a single request.) Note that this method overrides the existing values for all of the mutable properties that are contained in any parts that the parameter value specifies.",
            ),
            "onBehalfOfContentOwner?": onBehalfOfContentOwnerSchemaShort,
          },
          "body?": Channel,
        },
        res: {
          200: resp({
            description: "Successful response",
            body: Channel,
          }),
        },
      },
    }),
    "/youtube/v3/commentThreads": scope({
      forEachOp: {
        tags: [tags.commentThreads],
        res: {
          add: {
            200: resp({
              description: "Successful response",
              body: CommentThread,
            }),
          },
        },
      },
      GET: {
        description: "Retrieves a list of resources, possibly filtered.",
        id: "youtube.commentThreads.list",
        req: {
          query: {
            part: partArray(
              "The *part* parameter specifies a comma-separated list of one or more commentThread resource properties that the API response will include.",
            ),
            "maxResults?": commentMaxResultsSchema,
            "pageToken?": pageTokenSchema,
            "allThreadsRelatedToChannelId?": {
              description:
                "Returns the comment threads of all videos of the channel and the channel comments as well.",
              schema: string(),
            },
            "channelId?": {
              description:
                "Returns the comment threads for all the channel comments (ie does not include comments left on videos).",
              schema: string(),
            },
            "id?": {
              description:
                "Returns the comment threads with the given IDs for Stubby or Apiary.",
              explode: true,
              schema: array(string()),
              style: "form",
            },
            "moderationStatus?": {
              description:
                "Limits the returned comment threads to those with the specified moderation status. Not compatible with the 'id' filter. Valid values: published, heldForReview, likelySpam.",
              schema: string({
                enum: ["published", "heldForReview", "likelySpam", "rejected"],
              }),
            },
            "order?": {
              schema: string({
                enum: ["orderUnspecified", "time", "relevance"],
              }),
            },
            "searchTerms?": {
              description:
                "Limits the returned comment threads to those matching the specified key words. Not compatible with the 'id' filter.",
              schema: string(),
            },
            "textFormat?": {
              description:
                "The requested text format for the returned comments.",
              schema: string({
                enum: ["textFormatUnspecified", "html", "plainText"],
              }),
            },
            "videoId?": {
              description:
                "Returns the comment threads of the specified video.",
              schema: string(),
            },
          },
          security: oauthScope(
            "https://www.googleapis.com/auth/youtube.force-ssl",
          ),
        },
        res: {
          200: resp({
            description: "Successful response",
            body: CommentThreadListResponse,
          }),
        },
      },
      POST: {
        description: "Inserts a new resource into this collection.",
        id: "youtube.commentThreads.insert",
        req: {
          query: {
            part: partArray(
              "The *part* parameter identifies the properties that the API response will include. Set the parameter value to snippet. The snippet part has a quota cost of 2 units.",
            ),
          },
          security: oauthScope(
            "https://www.googleapis.com/auth/youtube.force-ssl",
          ),
          "body?": CommentThread,
        },
      },
      PUT: {
        description: "Updates an existing resource.",
        id: "youtube.youtube.v3.updateCommentThreads",
        req: {
          query: {
            "part?": partArray(
              "The *part* parameter specifies a comma-separated list of commentThread resource properties that the API response will include. You must at least include the snippet part in the parameter value since that part contains all of the properties that the API request can update.",
            ),
          },
          "body?": CommentThread,
        },
        tags: [tags.youtube],
      },
    }),
    "/youtube/v3/comments": scope({
      forEachOp: {
        tags: [tags.comments],
        req: {
          security: oauthScope(
            "https://www.googleapis.com/auth/youtube.force-ssl",
          ),
        },
        res: {
          add: {
            200: successfulResponse,
          },
        },
      },
      DELETE: {
        description: "Deletes a resource.",
        id: "youtube.comments.delete",
        req: {
          query: {
            id: {
              schema: string(),
            },
          },
        },
      },
      GET: {
        description: "Retrieves a list of resources, possibly filtered.",
        id: "youtube.comments.list",
        req: {
          query: {
            part: partArray(
              "The *part* parameter specifies a comma-separated list of one or more comment resource properties that the API response will include.",
            ),
            "maxResults?": commentMaxResultsSchema,
            "pageToken?": pageTokenSchema,
            "id?": {
              description:
                "Returns the comments with the given IDs for One Platform.",
              explode: true,
              schema: array(string()),
              style: "form",
            },
            "parentId?": {
              description:
                "Returns replies to the specified comment. Note, currently YouTube features only one level of replies (ie replies to top level comments). However replies to replies may be supported in the future.",
              schema: string(),
            },
            "textFormat?": {
              description:
                "The requested text format for the returned comments.",
              schema: string({
                enum: ["textFormatUnspecified", "html", "plainText"],
              }),
            },
          },
        },
        res: {
          200: resp({
            description: "Successful response",
            body: CommentListResponse,
          }),
        },
      },
      POST: {
        description: "Inserts a new resource into this collection.",
        id: "youtube.comments.insert",
        req: {
          query: {
            part: partArray(
              "The *part* parameter identifies the properties that the API response will include. Set the parameter value to snippet. The snippet part has a quota cost of 2 units.",
            ),
          },
          "body?": Comment,
        },
        res: {
          200: resp({
            description: "Successful response",
            body: Comment,
          }),
        },
      },
      PUT: {
        description: "Updates an existing resource.",
        id: "youtube.comments.update",
        req: {
          query: {
            part: partArray(
              "The *part* parameter identifies the properties that the API response will include. You must at least include the snippet part in the parameter value since that part contains all of the properties that the API request can update.",
            ),
          },
          "body?": Comment,
        },
        res: {
          200: resp({
            description: "Successful response",
            body: Comment,
          }),
        },
      },
      "/markAsSpam": POST({
        description:
          "Expresses the caller's opinion that one or more comments should be flagged as spam.",
        id: "youtube.comments.markAsSpam",
        req: {
          query: {
            id: {
              description:
                "Flags the comments with the given IDs as spam in the caller's opinion.",
              explode: true,
              schema: array(string()),
              style: "form",
            },
          },
        },
      }),
      "/setModerationStatus": POST({
        description: "Sets the moderation status of one or more comments.",
        id: "youtube.comments.setModerationStatus",
        req: {
          query: {
            id: {
              description:
                "Modifies the moderation status of the comments with the given IDs",
              explode: true,
              schema: array(string()),
              style: "form",
            },
            moderationStatus: {
              description:
                "Specifies the requested moderation status. Note, comments can be in statuses, which are not available through this call. For example, this call does not allow to mark a comment as 'likely spam'. Valid values: MODERATION_STATUS_PUBLISHED, MODERATION_STATUS_HELD_FOR_REVIEW, MODERATION_STATUS_REJECTED.",
              schema: string({
                enum: ["published", "heldForReview", "likelySpam", "rejected"],
              }),
            },
            "banAuthor?": {
              description:
                "If set to true the author of the comment gets added to the ban list. This means all future comments of the author will autmomatically be rejected. Only valid in combination with STATUS_REJECTED.",
              schema: boolean(),
            },
          },
        },
      }),
    }),
    "/youtube/v3/i18nLanguages": GET({
      description: "Retrieves a list of resources, possibly filtered.",
      id: "youtube.i18nLanguages.list",
      req: {
        query: {
          part: partArray(
            "The *part* parameter specifies the i18nLanguage resource properties that the API response will include. Set the parameter value to snippet.",
          ),
          "hl?": hlQuery(),
        },
        security: oauthScopes(
          "https://www.googleapis.com/auth/youtube",
          "https://www.googleapis.com/auth/youtube.force-ssl",
          "https://www.googleapis.com/auth/youtube.readonly",
          "https://www.googleapis.com/auth/youtubepartner",
        ),
      },
      res: {
        200: resp({
          description: "Successful response",
          body: I18nLanguageListResponse,
        }),
      },
      tags: [tags.i18nLanguages],
    }),
    "/youtube/v3/i18nRegions": GET({
      description: "Retrieves a list of resources, possibly filtered.",
      id: "youtube.i18nRegions.list",
      req: {
        query: {
          part: partArray(
            "The *part* parameter specifies the i18nRegion resource properties that the API response will include. Set the parameter value to snippet.",
          ),
          "hl?": hlQuery(),
        },
        security: oauthScopes(
          "https://www.googleapis.com/auth/youtube",
          "https://www.googleapis.com/auth/youtube.force-ssl",
          "https://www.googleapis.com/auth/youtube.readonly",
          "https://www.googleapis.com/auth/youtubepartner",
        ),
      },
      res: {
        200: resp({
          description: "Successful response",
          body: I18nRegionListResponse,
        }),
      },
      tags: [tags.i18nRegions],
    }),
    "/youtube/v3/liveBroadcasts": scope({
      forEachOp: {
        tags: liveBroadcastTags,
        req: {
          security: youtubeForceSslSecurity,
        },
        res: {
          add: {
            200: liveBroadcastResponse(),
          },
        },
      },
      DELETE: {
        description: "Delete a given broadcast.",
        id: "youtube.liveBroadcasts.delete",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            id: {
              description: "Broadcast to delete.",
              schema: string(),
            },
            "onBehalfOfContentOwnerChannel?":
              onBehalfOfContentOwnerChannelSchema,
          },
        },
        res: {
          200: successfulResponse,
        },
      },
      GET: {
        description:
          "Retrieve the list of broadcasts associated with the given channel.",
        id: "youtube.liveBroadcasts.list",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            part: partArray(
              "The *part* parameter specifies a comma-separated list of one or more liveBroadcast resource properties that the API response will include. The part names that you can include in the parameter value are id, snippet, contentDetails, status and statistics.",
            ),
            "maxResults?": listMaxResultsSchema,
            "pageToken?": pageTokenSchema,
            "onBehalfOfContentOwnerChannel?":
              onBehalfOfContentOwnerChannelSchema,
            "broadcastStatus?": {
              description:
                "Return broadcasts with a certain status, e.g. active broadcasts.",
              schema: string({
                enum: [
                  "broadcastStatusFilterUnspecified",
                  "all",
                  "active",
                  "upcoming",
                  "completed",
                ],
              }),
            },
            "broadcastType?": {
              description: "Return only broadcasts with the selected type.",
              schema: string({
                enum: [
                  "broadcastTypeFilterUnspecified",
                  "all",
                  "event",
                  "persistent",
                ],
              }),
            },
            "id?": {
              description:
                "Return broadcasts with the given ids from Stubby or Apiary.",
              explode: true,
              schema: array(string()),
              style: "form",
            },
            "mine?": {
              schema: boolean(),
            },
          },
          security: oauthScope(
            "https://www.googleapis.com/auth/youtube.readonly",
          ),
        },
        res: {
          200: liveBroadcastListResponse(),
        },
      },
      POST: {
        description: "Inserts a new stream for the authenticated user.",
        id: "youtube.liveBroadcasts.insert",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            part: partArray(
              "The *part* parameter serves two purposes in this operation. It identifies the properties that the write operation will set as well as the properties that the API response will include. The part properties that you can include in the parameter value are id, snippet, contentDetails, and status.",
            ),
            "onBehalfOfContentOwnerChannel?":
              onBehalfOfContentOwnerChannelSchema,
          },
          "body?": LiveBroadcast,
        },
      },
      PUT: {
        description:
          "Updates an existing broadcast for the authenticated user.",
        id: "youtube.liveBroadcasts.update",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            part: partArray(
              "The *part* parameter serves two purposes in this operation. It identifies the properties that the write operation will set as well as the properties that the API response will include. The part properties that you can include in the parameter value are id, snippet, contentDetails, and status. Note that this method will override the existing values for all of the mutable properties that are contained in any parts that the parameter value specifies. For example, a broadcast's privacy status is defined in the status part. As such, if your request is updating a private or unlisted broadcast, and the request's part parameter value includes the status part, the broadcast's privacy setting will be updated to whatever value the request body specifies. If the request body does not specify a value, the existing privacy setting will be removed and the broadcast will revert to the default privacy setting.",
            ),
            "onBehalfOfContentOwnerChannel?":
              onBehalfOfContentOwnerChannelSchema,
          },
          "body?": LiveBroadcast,
        },
      },
      "/bind": POST({
        description: "Bind a broadcast to a stream.",
        id: "youtube.liveBroadcasts.bind",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            part: partArray(
              "The *part* parameter specifies a comma-separated list of one or more liveBroadcast resource properties that the API response will include. The part names that you can include in the parameter value are id, snippet, contentDetails, and status.",
            ),
            "onBehalfOfContentOwnerChannel?":
              onBehalfOfContentOwnerChannelSchema,
            id: {
              description: "Broadcast to bind to the stream",
              schema: string(),
            },
            "streamId?": {
              description: "Stream to bind, if not set unbind the current one.",
              schema: string(),
            },
          },
        },
      }),
      "/cuepoint": POST({
        description: "Insert cuepoints in a broadcast",
        id: "youtube.liveBroadcasts.insertCuepoint",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            "part?": partArray(
              "The *part* parameter specifies a comma-separated list of one or more liveBroadcast resource properties that the API response will include. The part names that you can include in the parameter value are id, snippet, contentDetails, and status.",
            ),
            "onBehalfOfContentOwnerChannel?":
              onBehalfOfContentOwnerChannelSchema,
            "id?": {
              description:
                "Broadcast to insert ads to, or equivalently `external_video_id` for internal use.",
              schema: string(),
            },
          },
          security: oauthScope(
            "https://www.googleapis.com/auth/youtubepartner",
          ),
          "body?": Cuepoint,
        },
        res: {
          200: cuepointResponse(),
        },
      }),
      "/transition": POST({
        description: "Transition a broadcast to a given status.",
        id: "youtube.liveBroadcasts.transition",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            part: partArray(
              "The *part* parameter specifies a comma-separated list of one or more liveBroadcast resource properties that the API response will include. The part names that you can include in the parameter value are id, snippet, contentDetails, and status.",
            ),
            "onBehalfOfContentOwnerChannel?":
              onBehalfOfContentOwnerChannelSchema,
            broadcastStatus: {
              description:
                "The status to which the broadcast is going to transition.",
              schema: string({
                enum: ["statusUnspecified", "testing", "live", "complete"],
              }),
            },
            id: {
              description: "Broadcast to transition.",
              schema: string(),
            },
          },
        },
      }),
    }),
    "/youtube/v3/liveChat/bans": scope({
      forEachOp: {
        tags: [tags.liveChatBans],
        req: {
          security: youtubeForceSslSecurity,
        },
      },
      DELETE: {
        description: "Deletes a chat ban.",
        id: "youtube.liveChatBans.delete",
        req: {
          query: {
            id: {
              schema: string(),
            },
          },
        },
        res: {
          200: successfulResponse,
        },
      },
      POST: {
        description: "Inserts a new resource into this collection.",
        id: "youtube.liveChatBans.insert",
        req: {
          query: {
            part: partArray(
              "The *part* parameter serves two purposes in this operation. It identifies the properties that the write operation will set as well as the properties that the API response returns. Set the parameter value to snippet.",
            ),
          },
          "body?": LiveChatBan,
        },
        res: {
          200: resp({
            description: "Successful response",
            body: LiveChatBan,
          }),
        },
      },
    }),
    "/youtube/v3/liveChat/messages": scope({
      forEachOp: {
        tags: [tags.liveChatMessages],
        req: {
          security: youtubeForceSslSecurity,
        },
      },
      DELETE: {
        description: "Deletes a chat message.",
        id: "youtube.liveChatMessages.delete",
        req: {
          query: {
            id: {
              schema: string(),
            },
          },
        },
        res: {
          200: successfulResponse,
        },
      },
      GET: {
        description: "Retrieves a list of resources, possibly filtered.",
        id: "youtube.liveChatMessages.list",
        req: {
          query: {
            part: partArray(
              "The *part* parameter specifies the liveChatComment resource parts that the API response will include. Supported values are id and snippet.",
            ),
            "hl?": hlQuery(
              "Specifies the localization language in which the system messages should be returned.",
            ),
            "maxResults?": liveChatListMaxResultsSchema,
            "pageToken?": liveChatMessagesPageTokenSchema,
            liveChatId: {
              description:
                "The id of the live chat for which comments should be returned.",
              schema: string(),
            },
            "profileImageSize?": {
              description:
                "Specifies the size of the profile image that should be returned for each user.",
              schema: integer({
                maximum: 720,
                minimum: 16,
              }),
            },
          },
          security: oauthScope(
            "https://www.googleapis.com/auth/youtube.readonly",
          ),
        },
        res: {
          200: resp({
            description: "Successful response",
            body: LiveChatMessageListResponse,
          }),
        },
      },
      POST: {
        description: "Inserts a new resource into this collection.",
        id: "youtube.liveChatMessages.insert",
        req: {
          query: {
            part: partArray(
              "The *part* parameter serves two purposes. It identifies the properties that the write operation will set as well as the properties that the API response will include. Set the parameter value to snippet.",
            ),
          },
          "body?": LiveChatMessage,
        },
        res: {
          200: resp({
            description: "Successful response",
            body: LiveChatMessage,
          }),
        },
      },
    }),
    "/youtube/v3/liveChat/moderators": scope({
      forEachOp: {
        tags: [tags.liveChatModerators],
        req: {
          security: youtubeForceSslSecurity,
        },
      },
      DELETE: {
        description: "Deletes a chat moderator.",
        id: "youtube.liveChatModerators.delete",
        req: {
          query: {
            id: {
              schema: string(),
            },
          },
        },
        res: {
          200: successfulResponse,
        },
      },
      GET: {
        description: "Retrieves a list of resources, possibly filtered.",
        id: "youtube.liveChatModerators.list",
        req: {
          query: {
            part: partArray(
              "The *part* parameter specifies the liveChatModerator resource parts that the API response will include. Supported values are id and snippet.",
            ),
            "maxResults?": listMaxResultsSchema,
            "pageToken?": pageTokenSchema,
            liveChatId: {
              description:
                "The id of the live chat for which moderators should be returned.",
              schema: string(),
            },
          },
          security: oauthScope(
            "https://www.googleapis.com/auth/youtube.readonly",
          ),
        },
        res: {
          200: resp({
            description: "Successful response",
            body: LiveChatModeratorListResponse,
          }),
        },
      },
      POST: {
        description: "Inserts a new resource into this collection.",
        id: "youtube.liveChatModerators.insert",
        req: {
          query: {
            part: partArray(
              "The *part* parameter serves two purposes in this operation. It identifies the properties that the write operation will set as well as the properties that the API response returns. Set the parameter value to snippet.",
            ),
          },
          "body?": LiveChatModerator,
        },
        res: {
          200: resp({
            description: "Successful response",
            body: LiveChatModerator,
          }),
        },
      },
    }),
    "/youtube/v3/liveStreams": scope({
      forEachOp: {
        tags: [tags.liveStreams],
        req: {
          security: youtubeForceSslSecurity,
        },
        res: {
          add: {
            200: resp({
              description: "Successful response",
              body: LiveStream,
            }),
          },
        },
      },
      DELETE: {
        description: "Deletes an existing stream for the authenticated user.",
        id: "youtube.liveStreams.delete",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            id: {
              schema: string(),
            },
            "onBehalfOfContentOwnerChannel?":
              onBehalfOfContentOwnerChannelSchema,
          },
        },
        res: {
          200: successfulResponse,
        },
      },
      GET: {
        description:
          "Retrieve the list of streams associated with the given channel. --",
        id: "youtube.liveStreams.list",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            part: partArray(
              "The *part* parameter specifies a comma-separated list of one or more liveStream resource properties that the API response will include. The part names that you can include in the parameter value are id, snippet, cdn, and status.",
            ),
            "maxResults?": listMaxResultsSchema,
            "pageToken?": pageTokenSchema,
            "onBehalfOfContentOwnerChannel?":
              onBehalfOfContentOwnerChannelSchema,
            "id?": {
              description:
                "Return LiveStreams with the given ids from Stubby or Apiary.",
              explode: true,
              schema: array(string()),
              style: "form",
            },
            "mine?": {
              schema: boolean(),
            },
          },
          security: oauthScope(
            "https://www.googleapis.com/auth/youtube.readonly",
          ),
        },
        res: {
          200: resp({
            description: "Successful response",
            body: LiveStreamListResponse,
          }),
        },
      },
      POST: {
        description: "Inserts a new stream for the authenticated user.",
        id: "youtube.liveStreams.insert",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            part: partArray(
              "The *part* parameter serves two purposes in this operation. It identifies the properties that the write operation will set as well as the properties that the API response will include. The part properties that you can include in the parameter value are id, snippet, cdn, content_details, and status.",
            ),
            "onBehalfOfContentOwnerChannel?":
              onBehalfOfContentOwnerChannelSchema,
          },
          "body?": LiveStream,
        },
      },
      PUT: {
        description: "Updates an existing stream for the authenticated user.",
        id: "youtube.liveStreams.update",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            part: partArray(
              "The *part* parameter serves two purposes in this operation. It identifies the properties that the write operation will set as well as the properties that the API response will include. The part properties that you can include in the parameter value are id, snippet, cdn, and status. Note that this method will override the existing values for all of the mutable properties that are contained in any parts that the parameter value specifies. If the request body does not specify a value for a mutable property, the existing value for that property will be removed.",
            ),
            "onBehalfOfContentOwnerChannel?":
              onBehalfOfContentOwnerChannelSchema,
          },
          "body?": LiveStream,
        },
      },
    }),
    "/youtube/v3/members": GET({
      description:
        "Retrieves a list of members that match the request criteria for a channel.",
      id: "youtube.members.list",
      req: {
        query: {
          part: partArray(
            "The *part* parameter specifies the member resource parts that the API response will include. Set the parameter value to snippet.",
          ),
          "maxResults?": membersListMaxResultsSchema,
          "pageToken?": pageTokenSchema,
          "filterByMemberChannelId?": {
            description:
              "Comma separated list of channel IDs. Only data about members that are part of this list will be included in the response.",
            schema: string(),
          },
          "hasAccessToLevel?": {
            description:
              "Filter members in the results set to the ones that have access to a level.",
            schema: string(),
          },
          "mode?": {
            description:
              "Parameter that specifies which channel members to return.",
            schema: string({
              enum: ["listMembersModeUnknown", "updates", "all_current"],
            }),
          },
        },
        security: oauthScope(
          "https://www.googleapis.com/auth/youtube.channel-memberships.creator",
        ),
      },
      res: {
        200: resp({
          description: "Successful response",
          body: MemberListResponse,
        }),
      },
      tags: [tags.members],
    }),
    "/youtube/v3/membershipsLevels": GET({
      description:
        "Retrieves a list of all pricing levels offered by a creator to the fans.",
      id: "youtube.membershipsLevels.list",
      req: {
        query: {
          part: partArray(
            "The *part* parameter specifies the membershipsLevel resource parts that the API response will include. Supported values are id and snippet.",
          ),
        },
        security: oauthScope(
          "https://www.googleapis.com/auth/youtube.channel-memberships.creator",
        ),
      },
      res: {
        200: resp({
          description: "Successful response",
          body: MembershipsLevelListResponse,
        }),
      },
      tags: [tags.membershipsLevels],
    }),
    "/youtube/v3/playlistItems": scope({
      forEachOp: {
        tags: [tags.playlistItems],
        req: {
          security: videoPartnerSecurity,
        },
        res: {
          add: {
            200: resp({
              description: "Successful response",
              body: PlaylistItem,
            }),
          },
        },
      },
      DELETE: {
        description: "Deletes a resource.",
        id: "youtube.playlistItems.delete",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            id: {
              schema: string(),
            },
          },
        },
        res: {
          200: successfulResponse,
        },
      },
      GET: {
        description: "Retrieves a list of resources, possibly filtered.",
        id: "youtube.playlistItems.list",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            part: partArray(
              "The *part* parameter specifies a comma-separated list of one or more playlistItem resource properties that the API response will include. If the parameter identifies a property that contains child properties, the child properties will be included in the response. For example, in a playlistItem resource, the snippet property contains numerous fields, including the title, description, position, and resourceId properties. As such, if you set *part=snippet*, the API response will contain all of those properties.",
            ),
            "maxResults?": listMaxResultsSchema,
            "pageToken?": pageTokenSchema,
            "id?": {
              explode: true,
              schema: array(string()),
              style: "form",
            },
            "playlistId?": {
              description:
                "Return the playlist items within the given playlist.",
              schema: string(),
            },
            "videoId?": {
              description:
                "Return the playlist items associated with the given video ID.",
              schema: string(),
            },
          },
          security: oauthScope(
            "https://www.googleapis.com/auth/youtube.readonly",
          ),
        },
        res: {
          200: resp({
            description: "Successful response",
            body: PlaylistItemListResponse,
          }),
        },
      },
      POST: {
        description: "Inserts a new resource into this collection.",
        id: "youtube.playlistItems.insert",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            part: partArray(
              "The *part* parameter serves two purposes in this operation. It identifies the properties that the write operation will set as well as the properties that the API response will include.",
            ),
          },
          "body?": PlaylistItem,
        },
      },
      PUT: {
        description: "Updates an existing resource.",
        id: "youtube.playlistItems.update",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            part: partArray(
              "The *part* parameter serves two purposes in this operation. It identifies the properties that the write operation will set as well as the properties that the API response will include. Note that this method will override the existing values for all of the mutable properties that are contained in any parts that the parameter value specifies. For example, a playlist item can specify a start time and end time, which identify the times portion of the video that should play when users watch the video in the playlist. If your request is updating a playlist item that sets these values, and the request's part parameter value includes the contentDetails part, the playlist item's start and end times will be updated to whatever value the request body specifies. If the request body does not specify values, the existing start and end times will be removed and replaced with the default settings.",
            ),
          },
          "body?": PlaylistItem,
        },
      },
    }),
    "/youtube/v3/playlists": scope({
      forEachOp: {
        tags: [tags.playlists],
        req: {
          security: videoPartnerSecurity,
        },
        res: {
          add: {
            200: resp({
              description: "Successful response",
              body: Playlist,
            }),
          },
        },
      },
      DELETE: {
        description: "Deletes a resource.",
        id: "youtube.playlists.delete",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            id: {
              schema: string(),
            },
          },
        },
        res: {
          200: successfulResponse,
        },
      },
      GET: {
        description: "Retrieves a list of resources, possibly filtered.",
        id: "youtube.playlists.list",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            part: partArray(
              "The *part* parameter specifies a comma-separated list of one or more playlist resource properties that the API response will include. If the parameter identifies a property that contains child properties, the child properties will be included in the response. For example, in a playlist resource, the snippet property contains properties like author, title, description, tags, and timeCreated. As such, if you set *part=snippet*, the API response will contain all of those properties.",
            ),
            "hl?": hlQuery("Return content in specified language"),
            "maxResults?": listMaxResultsSchema,
            "pageToken?": pageTokenSchema,
            "onBehalfOfContentOwnerChannel?":
              onBehalfOfContentOwnerChannelSchema,
            "channelId?": {
              description:
                "Return the playlists owned by the specified channel ID.",
              schema: string(),
            },
            "id?": {
              description:
                "Return the playlists with the given IDs for Stubby or Apiary.",
              explode: true,
              schema: array(string()),
              style: "form",
            },
            "mine?": {
              description:
                "Return the playlists owned by the authenticated user.",
              schema: boolean(),
            },
          },
          security: oauthScope(
            "https://www.googleapis.com/auth/youtube.readonly",
          ),
        },
        res: {
          200: resp({
            description: "Successful response",
            body: PlaylistListResponse,
          }),
        },
      },
      POST: {
        description: "Inserts a new resource into this collection.",
        id: "youtube.playlists.insert",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            part: partArray(
              "The *part* parameter serves two purposes in this operation. It identifies the properties that the write operation will set as well as the properties that the API response will include.",
            ),
            "onBehalfOfContentOwnerChannel?":
              onBehalfOfContentOwnerChannelSchema,
          },
          "body?": Playlist,
        },
      },
      PUT: {
        description: "Updates an existing resource.",
        id: "youtube.playlists.update",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            part: partArray(
              "The *part* parameter serves two purposes in this operation. It identifies the properties that the write operation will set as well as the properties that the API response will include. Note that this method will override the existing values for mutable properties that are contained in any parts that the request body specifies. For example, a playlist's description is contained in the snippet part, which must be included in the request body. If the request does not specify a value for the snippet.description property, the playlist's existing description will be deleted.",
            ),
          },
          "body?": Playlist,
        },
      },
    }),
    "/youtube/v3/search": GET({
      description: "Retrieves a list of search resources",
      id: "youtube.search.list",
      req: {
        params: [onBehalfOfContentOwnerSchemaCms],
        query: {
          part: partArray(
            "The *part* parameter specifies a comma-separated list of one or more search resource properties that the API response will include. Set the parameter value to snippet.",
          ),
          "maxResults?": listMaxResultsSchema,
          "pageToken?": pageTokenSchema,
          "channelId?": {
            description: "Filter on resources belonging to this channelId.",
            schema: string(),
          },
          "channelType?": {
            description: "Add a filter on the channel search.",
            schema: string({
              enum: ["channelTypeUnspecified", "any", "show"],
            }),
          },
          "eventType?": {
            description: "Filter on the livestream status of the videos.",
            schema: string({
              enum: ["none", "upcoming", "live", "completed"],
            }),
          },
          "forContentOwner?": {
            description: "Search owned by a content owner.",
            schema: boolean(),
          },
          "forDeveloper?": {
            description:
              "Restrict the search to only retrieve videos uploaded using the project id of the authenticated user.",
            schema: boolean(),
          },
          "forMine?": {
            description:
              "Search for the private videos of the authenticated user.",
            schema: boolean(),
          },
          "location?": {
            description: "Filter on location of the video",
            schema: string(),
          },
          "locationRadius?": {
            description:
              "Filter on distance from the location (specified above).",
            schema: string(),
          },
          "order?": {
            description: "Sort order of the results.",
            schema: string({
              enum: [
                "searchSortUnspecified",
                "date",
                "rating",
                "viewCount",
                "relevance",
                "title",
                "videoCount",
              ],
            }),
          },
          "publishedAfter?": {
            description: "Filter on resources published after this date.",
            schema: string(),
          },
          "publishedBefore?": {
            description: "Filter on resources published before this date.",
            schema: string(),
          },
          "q?": {
            description: "Textual search terms to match.",
            schema: string(),
          },
          "regionCode?": {
            description:
              "Display the content as seen by viewers in this country.",
            schema: string(),
          },
          "relatedToVideoId?": {
            description: "Search related to a resource.",
            schema: string(),
          },
          "relevanceLanguage?": {
            description: "Return results relevant to this language.",
            schema: string(),
          },
          "safeSearch?": {
            description:
              "Indicates whether the search results should include restricted content as well as standard content.",
            schema: string({
              enum: [
                "safeSearchSettingUnspecified",
                "none",
                "moderate",
                "strict",
              ],
            }),
          },
          "topicId?": {
            description: "Restrict results to a particular topic.",
            schema: string(),
          },
          "type?": {
            description:
              "Restrict results to a particular set of resource types from One Platform.",
            explode: true,
            schema: array(string()),
            style: "form",
          },
          "videoCaption?": {
            description: "Filter on the presence of captions on the videos.",
            schema: string({
              enum: ["videoCaptionUnspecified", "any", "closedCaption", "none"],
            }),
          },
          "videoCategoryId?": {
            description: "Filter on videos in a specific category.",
            schema: string(),
          },
          "videoDefinition?": {
            description: "Filter on the definition of the videos.",
            schema: string({
              enum: ["any", "standard", "high"],
            }),
          },
          "videoDimension?": {
            description: "Filter on 3d videos.",
            schema: string({
              enum: ["any", "2d", "3d"],
            }),
          },
          "videoDuration?": {
            description: "Filter on the duration of the videos.",
            schema: string({
              enum: [
                "videoDurationUnspecified",
                "any",
                "short",
                "medium",
                "long",
              ],
            }),
          },
          "videoEmbeddable?": {
            description: "Filter on embeddable videos.",
            schema: string({
              enum: ["videoEmbeddableUnspecified", "any", "true"],
            }),
          },
          "videoLicense?": {
            description: "Filter on the license of the videos.",
            schema: string({
              enum: ["any", "youtube", "creativeCommon"],
            }),
          },
          "videoSyndicated?": {
            description: "Filter on syndicated videos.",
            schema: string({
              enum: ["videoSyndicatedUnspecified", "any", "true"],
            }),
          },
          "videoType?": {
            description: "Filter on videos of a specific type.",
            schema: string({
              enum: ["videoTypeUnspecified", "any", "movie", "episode"],
            }),
          },
        },
        security: oauthScopes(
          "https://www.googleapis.com/auth/youtube",
          "https://www.googleapis.com/auth/youtube.force-ssl",
          "https://www.googleapis.com/auth/youtube.readonly",
          "https://www.googleapis.com/auth/youtubepartner",
        ),
      },
      res: {
        200: resp({
          description: "Successful response",
          body: SearchListResponse,
        }),
      },
      tags: [tags.search],
    }),
    "/youtube/v3/subscriptions": scope({
      forEachOp: {
        tags: [tags.subscriptions],
        req: {
          security: videoPartnerSecurity,
        },
      },
      DELETE: {
        description: "Deletes a resource.",
        id: "youtube.subscriptions.delete",
        req: {
          query: {
            id: {
              schema: string(),
            },
          },
        },
        res: {
          200: successfulResponse,
        },
      },
      GET: {
        description: "Retrieves a list of resources, possibly filtered.",
        id: "youtube.subscriptions.list",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            part: partArray(
              "The *part* parameter specifies a comma-separated list of one or more subscription resource properties that the API response will include. If the parameter identifies a property that contains child properties, the child properties will be included in the response. For example, in a subscription resource, the snippet property contains other properties, such as a display title for the subscription. If you set *part=snippet*, the API response will also contain all of those nested properties.",
            ),
            "maxResults?": listMaxResultsSchema,
            "pageToken?": pageTokenSchema,
            "onBehalfOfContentOwnerChannel?":
              onBehalfOfContentOwnerChannelSchema,
            "channelId?": {
              description:
                "Return the subscriptions of the given channel owner.",
              schema: string(),
            },
            "forChannelId?": {
              description:
                "Return the subscriptions to the subset of these channels that the authenticated user is subscribed to.",
              schema: string(),
            },
            "id?": {
              description:
                "Return the subscriptions with the given IDs for Stubby or Apiary.",
              explode: true,
              schema: array(string()),
              style: "form",
            },
            "mine?": {
              description:
                "Flag for returning the subscriptions of the authenticated user.",
              schema: boolean(),
            },
            "myRecentSubscribers?": {
              schema: boolean(),
            },
            "mySubscribers?": {
              description: "Return the subscribers of the given channel owner.",
              schema: boolean(),
            },
            "order?": {
              description: "The order of the returned subscriptions",
              schema: string({
                enum: [
                  "subscriptionOrderUnspecified",
                  "relevance",
                  "unread",
                  "alphabetical",
                ],
              }),
            },
          },
          security: oauthScope(
            "https://www.googleapis.com/auth/youtube.readonly",
          ),
        },
        res: {
          200: resp({
            description: "Successful response",
            body: SubscriptionListResponse,
          }),
        },
      },
      POST: {
        description: "Inserts a new resource into this collection.",
        id: "youtube.subscriptions.insert",
        req: {
          query: {
            part: partArray(
              "The *part* parameter serves two purposes in this operation. It identifies the properties that the write operation will set as well as the properties that the API response will include.",
            ),
          },
          "body?": Subscription,
        },
        res: {
          200: resp({
            description: "Successful response",
            body: Subscription,
          }),
        },
      },
    }),
    "/youtube/v3/superChatEvents": GET({
      description: "Retrieves a list of resources, possibly filtered.",
      id: "youtube.superChatEvents.list",
      req: {
        query: {
          part: partArray(
            "The *part* parameter specifies the superChatEvent resource parts that the API response will include. This parameter is currently not supported.",
          ),
          "hl?": hlQuery(
            "Return rendered funding amounts in specified language.",
          ),
          "maxResults?": requiredListMaxResultsSchema,
          "pageToken?": pageTokenSchema,
        },
        security: oauthScopes(
          "https://www.googleapis.com/auth/youtube",
          "https://www.googleapis.com/auth/youtube.force-ssl",
          "https://www.googleapis.com/auth/youtube.readonly",
        ),
      },
      res: {
        200: resp({
          description: "Successful response",
          body: SuperChatEventListResponse,
        }),
      },
      tags: [tags.superChatEvents],
    }),
    "/youtube/v3/tests": POST({
      description: "POST method.",
      id: "youtube.tests.insert",
      req: {
        query: {
          part: partArray(),
          "externalChannelId?": {
            schema: string(),
          },
        },
        security: oauthScope(
          "https://www.googleapis.com/auth/youtube.readonly",
        ),
        "body?": TestItem,
      },
      res: {
        200: resp({
          description: "Successful response",
          body: TestItem,
        }),
      },
      tags: [tags.tests],
    }),
    "/youtube/v3/thirdPartyLinks": scope({
      forEachOp: {
        tags: [tags.thirdPartyLinks],
        res: {
          add: {
            200: resp({
              description: "Successful response",
              body: ThirdPartyLink,
            }),
          },
        },
      },
      DELETE: {
        description: "Deletes a resource.",
        id: "youtube.thirdPartyLinks.delete",
        req: {
          query: {
            "part?": partArray("Do not use. Required for compatibility."),
            linkingToken: {
              description:
                "Delete the partner links with the given linking token.",
              schema: string(),
            },
            type: {
              description: "Type of the link to be deleted.",
              schema: string({
                enum: ["linkUnspecified", "channelToStoreLink"],
              }),
            },
            "externalChannelId?": {
              description:
                "Channel ID to which changes should be applied, for delegation.",
              schema: string(),
            },
          },
        },
        res: {
          200: successfulResponse,
        },
      },
      GET: {
        description: "Retrieves a list of resources, possibly filtered.",
        id: "youtube.thirdPartyLinks.list",
        req: {
          query: {
            part: partArray(
              "The *part* parameter specifies the thirdPartyLink resource parts that the API response will include. Supported values are linkingToken, status, and snippet.",
            ),
            "externalChannelId?": {
              description:
                "Channel ID to which changes should be applied, for delegation.",
              schema: string(),
            },
            "linkingToken?": {
              description:
                "Get a third party link with the given linking token.",
              schema: string(),
            },
            "type?": {
              description: "Get a third party link of the given type.",
              schema: string({
                enum: ["linkUnspecified", "channelToStoreLink"],
              }),
            },
          },
        },
        res: {
          200: resp({
            description: "Successful response",
            body: ThirdPartyLinkListResponse,
          }),
        },
      },
      POST: {
        description: "Inserts a new resource into this collection.",
        id: "youtube.thirdPartyLinks.insert",
        req: {
          query: {
            part: partArray(
              "The *part* parameter specifies the thirdPartyLink resource parts that the API request and response will include. Supported values are linkingToken, status, and snippet.",
            ),
            "externalChannelId?": {
              description:
                "Channel ID to which changes should be applied, for delegation.",
              schema: string(),
            },
          },
          "body?": ThirdPartyLink,
        },
      },
      PUT: {
        description: "Updates an existing resource.",
        id: "youtube.thirdPartyLinks.update",
        req: {
          query: {
            part: partArray(
              "The *part* parameter specifies the thirdPartyLink resource parts that the API request and response will include. Supported values are linkingToken, status, and snippet.",
            ),
            "externalChannelId?": {
              description:
                "Channel ID to which changes should be applied, for delegation.",
              schema: string(),
            },
          },
          "body?": ThirdPartyLink,
        },
      },
    }),
    "/youtube/v3/thumbnails/set": POST({
      description:
        "As this is not an insert in a strict sense (it supports uploading/setting of a thumbnail for multiple videos, which doesn't result in creation of a single resource), I use a custom verb here.",
      id: "youtube.thumbnails.set",
      req: {
        params: [onBehalfOfContentOwner],
        query: {
          videoId: {
            description:
              "Returns the Thumbnail with the given video IDs for Stubby or Apiary.",
            schema: string(),
          },
        },
        security: oauthScopes(
          "https://www.googleapis.com/auth/youtube",
          "https://www.googleapis.com/auth/youtube.force-ssl",
          "https://www.googleapis.com/auth/youtube.upload",
          "https://www.googleapis.com/auth/youtubepartner",
        ),
      },
      res: {
        200: resp({
          description: "Successful response",
          body: ThumbnailSetResponse,
        }),
      },
      tags: [tags.thumbnails],
    }),
    "/youtube/v3/videoAbuseReportReasons": GET({
      description: "Retrieves a list of resources, possibly filtered.",
      id: "youtube.videoAbuseReportReasons.list",
      req: {
        query: {
          part: partArray(
            "The *part* parameter specifies the videoCategory resource parts that the API response will include. Supported values are id and snippet.",
          ),
          "hl?": hlQuery(),
        },
        security: oauthScopes(
          "https://www.googleapis.com/auth/youtube",
          "https://www.googleapis.com/auth/youtube.force-ssl",
          "https://www.googleapis.com/auth/youtube.readonly",
        ),
      },
      res: {
        200: resp({
          description: "Successful response",
          body: VideoAbuseReportReasonListResponse,
        }),
      },
      tags: [tags.videoAbuseReportReasons],
    }),
    "/youtube/v3/videoCategories": GET({
      description: "Retrieves a list of resources, possibly filtered.",
      id: "youtube.videoCategories.list",
      req: {
        query: {
          part: partArray(
            "The *part* parameter specifies the videoCategory resource properties that the API response will include. Set the parameter value to snippet.",
          ),
          "hl?": hlQuery(),
          "id?": {
            description:
              "Returns the video categories with the given IDs for Stubby or Apiary.",
            explode: true,
            schema: array(string()),
            style: "form",
          },
          "regionCode?": {
            schema: string(),
          },
        },
        security: oauthScopes(
          "https://www.googleapis.com/auth/youtube",
          "https://www.googleapis.com/auth/youtube.force-ssl",
          "https://www.googleapis.com/auth/youtube.readonly",
          "https://www.googleapis.com/auth/youtubepartner",
        ),
      },
      res: {
        200: resp({
          description: "Successful response",
          body: VideoCategoryListResponse,
        }),
      },
      tags: [tags.videoCategories],
    }),
    "/youtube/v3/videos": scope({
      forEachOp: {
        tags: videoTags,
        req: {
          security: videoPartnerSecurity,
        },
        res: {
          add: {
            200: successfulResponse,
          },
        },
      },
      DELETE: {
        description: "Deletes a resource.",
        id: "youtube.videos.delete",
        req: {
          params: [onBehalfOfContentOwner],
          query: {
            id: {
              schema: string(),
            },
          },
        },
      },
      GET: {
        description: "Retrieves a list of resources, possibly filtered.",
        id: "youtube.videos.list",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            part: partArray(
              "The *part* parameter specifies a comma-separated list of one or more video resource properties that the API response will include. If the parameter identifies a property that contains child properties, the child properties will be included in the response. For example, in a video resource, the snippet property contains the channelId, title, description, tags, and categoryId properties. As such, if you set *part=snippet*, the API response will contain all of those properties.",
            ),
            "hl?": hlQuery(
              'Stands for "host language". Specifies the localization language of the metadata to be filled into snippet.localized. The field is filled with the default metadata if there is no localization in the specified language. The parameter value must be a language code included in the list returned by the i18nLanguages.list method (e.g. en_US, es_MX).',
            ),
            "maxResults?": videosListMaxResultsSchema,
            "pageToken?": videosListPageTokenSchema,
            "chart?": {
              description: "Return the videos that are in the specified chart.",
              schema: string({
                enum: ["chartUnspecified", "mostPopular"],
              }),
            },
            "id?": {
              description: "Return videos with the given ids.",
              explode: true,
              schema: array(string()),
              style: "form",
            },
            "locale?": {
              schema: string(),
            },
            "maxHeight?": {
              schema: integer({
                maximum: 8192,
                minimum: 72,
              }),
            },
            "maxWidth?": {
              description: "Return the player with maximum height specified in",
              schema: integer({
                maximum: 8192,
                minimum: 72,
              }),
            },
            "myRating?": {
              description:
                "Return videos liked/disliked by the authenticated user. Does not support RateType.RATED_TYPE_NONE.",
              schema: string({
                enum: ["none", "like", "dislike"],
              }),
            },
            "regionCode?": {
              description:
                "Use a chart that is specific to the specified region",
              schema: string(),
            },
            "videoCategoryId?": {
              description:
                "Use chart that is specific to the specified video category",
              schema: string(),
            },
          },
          security: oauthScope(
            "https://www.googleapis.com/auth/youtube.readonly",
          ),
        },
        res: {
          200: resp({
            description: "Successful response",
            body: VideoListResponse,
          }),
        },
      },
      POST: {
        description: "Inserts a new resource into this collection.",
        id: "youtube.videos.insert",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            part: partArray(
              "The *part* parameter serves two purposes in this operation. It identifies the properties that the write operation will set as well as the properties that the API response will include. Note that not all parts contain properties that can be set when inserting or updating a video. For example, the statistics object encapsulates statistics that YouTube calculates for a video and does not contain values that you can set or modify. If the parameter value specifies a part that does not contain mutable values, that part will still be included in the API response.",
            ),
            "onBehalfOfContentOwnerChannel?":
              onBehalfOfContentOwnerChannelSchema,
            "autoLevels?": {
              description: "Should auto-levels be applied to the upload.",
              schema: boolean(),
            },
            "notifySubscribers?": {
              description:
                "Notify the channel subscribers about the new video. As default, the notification is enabled.",
              schema: boolean(),
            },
            "stabilize?": {
              description: "Should stabilize be applied to the upload.",
              schema: boolean(),
            },
          },
          security: oauthScope(
            "https://www.googleapis.com/auth/youtube.upload",
          ),
          "body?": {
            "application/octet-stream": unknown(),
            "video/1d-interleaved-parityfec": Video,
            "video/3gpp": Video,
            "video/3gpp-tt": Video,
            "video/3gpp2": Video,
            "video/av1": Video,
            "video/bmpeg": Video,
            "video/bt656": Video,
            "video/celb": Video,
            "video/dv": Video,
            "video/encaprtp": Video,
            "video/ffv1": Video,
            "video/flexfec": Video,
            "video/h261": Video,
            "video/h263": Video,
            "video/h263-1998": Video,
            "video/h263-2000": Video,
            "video/h264": Video,
            "video/h264-rcdo": Video,
            "video/h264-svc": Video,
            "video/h265": Video,
            "video/iso.segment": Video,
            "video/jpeg": Video,
            "video/jpeg2000": Video,
            "video/jpm": Video,
            "video/jxsv": Video,
            "video/mj2": Video,
            "video/mp1s": Video,
            "video/mp2p": Video,
            "video/mp2t": Video,
            "video/mp4": Video,
            "video/mp4v-es": Video,
            "video/mpeg": Video,
            "video/mpeg4-generic": Video,
            "video/mpv": Video,
            "video/nv": Video,
            "video/ogg": Video,
            "video/parityfec": Video,
            "video/pointer": Video,
            "video/quicktime": Video,
            "video/raptorfec": Video,
            "video/raw": Video,
            "video/rtp-enc-aescm128": Video,
            "video/rtploopback": Video,
            "video/rtx": Video,
            "video/scip": Video,
            "video/smpte291": Video,
            "video/smpte292m": Video,
            "video/ulpfec": Video,
            "video/vc1": Video,
            "video/vc2": Video,
            "video/vnd.cctv": Video,
            "video/vnd.dece.hd": Video,
            "video/vnd.dece.mobile": Video,
            "video/vnd.dece.mp4": Video,
            "video/vnd.dece.pd": Video,
            "video/vnd.dece.sd": Video,
            "video/vnd.dece.video": Video,
            "video/vnd.directv.mpeg": Video,
            "video/vnd.directv.mpeg-tts": Video,
            "video/vnd.dlna.mpeg-tts": Video,
            "video/vnd.dvb.file": Video,
            "video/vnd.fvt": Video,
            "video/vnd.hns.video": Video,
            "video/vnd.iptvforum.1dparityfec-1010": Video,
            "video/vnd.iptvforum.1dparityfec-2005": Video,
            "video/vnd.iptvforum.2dparityfec-1010": Video,
            "video/vnd.iptvforum.2dparityfec-2005": Video,
            "video/vnd.iptvforum.ttsavc": Video,
            "video/vnd.iptvforum.ttsmpeg2": Video,
            "video/vnd.motorola.video": Video,
            "video/vnd.motorola.videop": Video,
            "video/vnd.mpegurl": Video,
            "video/vnd.ms-playready.media.pyv": Video,
            "video/vnd.nokia.interleaved-multimedia": Video,
            "video/vnd.nokia.mp4vr": Video,
            "video/vnd.nokia.videovoip": Video,
            "video/vnd.objectvideo": Video,
            "video/vnd.radgamettools.bink": Video,
            "video/vnd.radgamettools.smacker": Video,
            "video/vnd.sealed.mpeg1": Video,
            "video/vnd.sealed.mpeg4": Video,
            "video/vnd.sealed.swf": Video,
            "video/vnd.sealedmedia.softseal.mov": Video,
            "video/vnd.uvvu.mp4": Video,
            "video/vnd.vivo": Video,
            "video/vnd.youtube.yt": Video,
            "video/vp8": Video,
            "video/vp9": Video,
            "video/webm": Video,
            "video/x-f4v": Video,
            "video/x-fli": Video,
            "video/x-flv": Video,
            "video/x-m4v": Video,
            "video/x-matroska": Video,
            "video/x-mng": Video,
            "video/x-ms-asf": Video,
            "video/x-ms-vob": Video,
            "video/x-ms-wm": Video,
            "video/x-ms-wmv": Video,
            "video/x-ms-wmx": Video,
            "video/x-ms-wvx": Video,
            "video/x-msvideo": Video,
            "video/x-sgi-movie": Video,
            "video/x-smv": Video,
          },
        },
        res: {
          200: resp({
            description: "Successful response",
            body: Video,
          }),
        },
      },
      PUT: {
        description: "Updates an existing resource.",
        id: "youtube.videos.update",
        req: {
          params: [onBehalfOfContentOwner],
          query: {
            part: partArray(
              "The *part* parameter serves two purposes in this operation. It identifies the properties that the write operation will set as well as the properties that the API response will include. Note that this method will override the existing values for all of the mutable properties that are contained in any parts that the parameter value specifies. For example, a video's privacy setting is contained in the status part. As such, if your request is updating a private video, and the request's part parameter value includes the status part, the video's privacy setting will be updated to whatever value the request body specifies. If the request body does not specify a value, the existing privacy setting will be removed and the video will revert to the default privacy setting. In addition, not all parts contain properties that can be set when inserting or updating a video. For example, the statistics object encapsulates statistics that YouTube calculates for a video and does not contain values that you can set or modify. If the parameter value specifies a part that does not contain mutable values, that part will still be included in the API response.",
            ),
          },
          "body?": Video,
        },
        res: {
          200: resp({
            description: "Successful response",
            body: Video,
          }),
        },
      },
      "/getRating": GET({
        description:
          "Retrieves the ratings that the authorized user gave to a list of specified videos.",
        id: "youtube.videos.getRating",
        req: {
          params: [
            onBehalfOfContentOwnerSchemaCms,
            queryParam({
              required: true,
              schema: array(string()),
              explode: true,
              style: "form",
              name: "id",
            }),
          ],
        },
        res: {
          200: resp({
            description: "Successful response",
            body: VideoGetRatingResponse,
          }),
        },
      }),
      "/rate": POST({
        description:
          "Adds a like or dislike rating to a video or removes a rating from a video.",
        id: "youtube.videos.rate",
        req: {
          query: {
            id: {
              schema: string(),
            },
            rating: {
              schema: string({
                enum: ["none", "like", "dislike"],
              }),
            },
          },
        },
      }),
      "/reportAbuse": POST({
        description: "Report abuse for a video.",
        id: "youtube.videos.reportAbuse",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          "body?": VideoAbuseReport,
        },
      }),
    }),
    "/youtube/v3/watermarks": scope({
      forEachOp: {
        tags: [tags.watermarks],
        res: {
          add: {
            200: successfulResponse,
          },
        },
      },
      "/set": POST({
        description:
          "Allows upload of watermark image and setting it for a channel.",
        id: "youtube.watermarks.set",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            channelId: watermarkChannelIdSchema,
          },
          security: securityOR(
            oauthScope("https://www.googleapis.com/auth/youtube"),
            oauthScope("https://www.googleapis.com/auth/youtube.force-ssl"),
            oauthScope("https://www.googleapis.com/auth/youtube.upload"),
            oauthScope("https://www.googleapis.com/auth/youtubepartner"),
          ),
          "body?": {
            "application/octet-stream": unknown(),
            "image/jpeg": InvideoBranding,
            "image/png": InvideoBranding,
          },
        },
      }),
      "/unset": POST({
        description: "Allows removal of channel watermark.",
        id: "youtube.watermarks.unset",
        req: {
          params: [onBehalfOfContentOwnerSchemaCms],
          query: {
            channelId: watermarkChannelIdSchema,
          },
          security: videoPartnerSecurity,
        },
      }),
    }),
  },
})

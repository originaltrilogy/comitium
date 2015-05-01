
create index on "tblForumPrivateMessages" ( "intPrivateMessageID", "intConversationID" );

create table "conversations" (
  "id" serial not null,
  "firstMessageID" integer not null,
  "lastMessageID" integer not null,
  -- make not null for installation script:
  -- "firstMessageID" integer not null,
  -- "lastMessageID" integer not null,
  "titleMarkdown" text not null,
  "titleHtml" text,
  -- make not null for installation script:
  -- "titleHtml" text not null,
  "url" text,
  -- Make unique/not null for installation script:
  -- "url" text unique not null,
  "sortDate" timestamp not null,
  "replies" integer not null,
  "views" integer not null,
  "draft" boolean not null,
  primary key ("id")
);

create table "messages" (
  "id" serial not null,
  "conversationID" integer not null,
  "userID" integer not null,
  "html" text not null,
  "markdown" text not null,
  "dateCreated" timestamp without time zone,
  "draft" boolean not null,
  primary key ("id")
);

create table "conversationParticipants" (
  "id" serial not null,
  "userID" integer not null,
  "conversationID" integer not null,
  "lastViewed" timestamp not null,
  primary key ("id")
);

insert into "conversations" (
  "id",
  "firstMessageID",
  "lastMessageID",
  "titleMarkdown",
  "titleHtml",
  "url",
  "sortDate",
  "replies",
  "views",
  "draft"
)
select
  "intConversationID",
  "intFirstTopicPostID",
  "intLastTopicPostID",
  ' ',
  (
    select "vchPostTitle"
    from "tblForumPosts"
    where "intPostID" = "intFirstTopicPostID"
  ),
  ' ',
  "dteStickyDate",
  "intTopicReplyCount",
  "intTopicViewCount",
  "bitDraft"
from "tblForumTopics" t where "intFirstTopicPostID" is not null;


SELECT SETVAL('conversations_id_seq', ( select max("id") + 1 from conversations ) );


update conversations set "titleHtml" = "id" where "titleHtml" is null;

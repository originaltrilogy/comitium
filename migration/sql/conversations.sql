
create index on "tblForumPrivateMessages" ( "intPrivateMessageID", "intConversationID" );

create table "conversations" (
  "id" serial not null,
  "firstMessageID" integer not null,
  "lastMessageID" integer not null,
  "subjectMarkdown" text not null,
  "subjectHtml" text not null,
  "sortDate" timestamp not null,
  "replies" integer not null,
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
  "notificationSent" timestamp not null,
  primary key ("id")
);

insert into "conversations" (
  "id",
  "firstMessageID",
  "lastMessageID",
  "titleMarkdown",
  "titleHtml",
  "sortDate",
  "replies",
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
  "dteStickyDate",
  "intTopicReplyCount",
  "bitDraft"
from "tblForumTopics" t where "intFirstTopicPostID" is not null;


SELECT SETVAL('conversations_id_seq', ( select max("id") + 1 from conversations ) );


update conversations set "titleHtml" = "id" where "titleHtml" is null;


create index on "tblForumPosts" ( "intPostID", "intTopicID" );

create table "topics" (
  "id" serial not null,
  "discussionID" integer,
  -- make not null in installation script:
  -- "discussionID" integer not null,
  "titleMarkdown" text not null,
  "titleHtml" text,
  -- make not null for installation script:
  -- "titleHtml" text not null,
  "url" text not null,
  "created" timestamp without time zone not null,
  "modified" timestamp without time zone,
  "sortDate" timestamp without time zone not null,
  "replies" integer not null,
  "draft" boolean not null,
  "private" boolean not null,
  "lockedByID" integer default 0,
  "lockReason" text,
  primary key (id)
);

create table "topicInvitations" (
  "userID" integer not null,
  "topicID" integer not null
);

insert into "topics" (
  "id",
  "discussionID",
  "titleMarkdown",
  "titleHtml",
  "url",
  "created",
  "sortDate",
  "replies",
  "draft",
  "private"
)
select
  "intTopicID",
  0,
  ' ',
  (
    select "vchPostTitle"
    from "tblForumPosts"
    where "intPostID" = "intFirstTopicPostID"
  ),
  ' ',
  coalesce((
    select "dtePostDateCreated"
    from "tblForumPosts"
    where "intPostID" = "intFirstTopicPostID"
  ), date '2000-01-01' + time '03:00'),
  "dteStickyDate",
  "intTopicReplyCount",
  "bitDraft",
  false
from "tblForumTopics" t where "intFirstTopicPostID" is not null;


SELECT SETVAL('topics_id_seq', ( select max("id") + 1 from topics ) );


update topics set "titleHtml" = "id" where "titleHtml" is null;

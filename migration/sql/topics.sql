
create index on "tblForumPosts" ( "intPostID", "intTopicID" );

create table "topics" (
  "id" serial not null,
  "discussionID" integer,
  -- make not null in installation script:
  -- "discussionID" integer not null,
  "firstPostID" integer,
  "lastPostID" integer,
  -- make not null for installation script:
  -- "firstPostID" integer not null,
  -- "lastPostID" integer not null,
  "titleMarkdown" text not null,
  "titleHtml" text,
  -- make not null for installation script:
  -- "titleHtml" text not null,
  "url" text not null,
  "sortDate" timestamp not null,
  "replies" integer not null,
  -- "views" integer not null,
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
  "firstPostID",
  "lastPostID",
  "titleMarkdown",
  "titleHtml",
  "url",
  "sortDate",
  "replies",
  -- "views",
  "draft",
  "private"
)
select
  "intTopicID",
  0,
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
  -- "intTopicViewCount",
  "bitDraft",
  false
from "tblForumTopics" t where "intFirstTopicPostID" is not null;


SELECT SETVAL('topics_id_seq', ( select max("id") + 1 from topics ) );


update topics set "titleHtml" = "id" where "titleHtml" is null;

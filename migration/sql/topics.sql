
create index on "tblForumPosts" ( "intPostID", "intTopicID" );

analyze "tblForumPosts";

create table "topics" (
  "id" serial not null,
  "discussionID" integer,
  -- make not null in installation script:
  -- "discussionID" integer not null,
  "title" text not null,
  "titleHtml" text,
  -- make not null for installation script:
  -- "titleHtml" text not null,
  "url" text not null,
  "created" timestamp without time zone not null,
  "modified" timestamp without time zone,
  "sticky" timestamp without time zone,
  "replies" integer default 0,
  "draft" boolean not null,
  "private" boolean not null,
  "lockedByID" integer,
  "lockReason" text,
  primary key (id)
);

create table "topicInvitations" (
  "userID" integer not null,
  "topicID" integer not null,
  primary key ( "userID", "topicID" )
);

insert into "topics" (
  "id",
  "discussionID",
  "title",
  "titleHtml",
  "url",
  "created",
  "sticky",
  "replies",
  "draft",
  "private"
)
select
  "intTopicID",
  0,
  '',
  (
    select "vchPostTitle"
    from "tblForumPosts"
    where "intPostID" = "intFirstTopicPostID"
  ),
  '',
  coalesce((
    select "dtePostDateCreated"
    from "tblForumPosts"
    where "intPostID" = "intFirstTopicPostID"
  ), date '2000-01-01' + time '03:00'),
  null,
  "intTopicReplyCount",
  "bitDraft",
  false
from "tblForumTopics" t where "intFirstTopicPostID" is not null;


SELECT SETVAL('topics_id_seq', ( select max("id") + 1 from topics ) );


update topics set "titleHtml" = "id" where "titleHtml" is null;

update topics t set "sticky" = (
  select "dteStickyDate" from "tblForumTopics" where "intTopicID" = t.id
)
where id in ( select "intTopicID" from "tblForumTopics" where "dteStickyDate" > now() );

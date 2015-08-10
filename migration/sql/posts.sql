
create table "posts" (
  "id" serial not null,
  "topicID" integer not null,
  "userID" integer not null,
  "html" text not null,
  "markdown" text not null,
  "dateCreated" timestamp not null,
  "draft" boolean not null,
  "editorID" integer default 0,
  "editReason" text,
  "lastModified" timestamp not null,
  "lockedByID" integer default 0,
  "lockReason" text,
  primary key ("id")
);


insert into "posts" (
  "id",
  "topicID",
  "userID",
  "html",
  "markdown",
  "dateCreated",
  "draft",
  "lastModified"
)
select
  "intPostID",
  "intTopicID",
  "intUserID",
  "vchPostText",
  ' ',
  "dtePostDateCreated",
  "bitDraft",
  "dtePostDateCreated"
from "tblForumPosts";


SELECT SETVAL('posts_id_seq', ( select max("id") + 1 from posts ) );

create index on posts ( "id" );


-- Update posts with existing edit notes
create index on "tblForumPostEditNotes" ( "intPostID" );
create index on "tblForumPostEditNotes" ( "dtePostEditDate" );

update posts p
set "editorID" = coalesce(( select "intUserID" from "tblForumPostEditNotes" where "intPostID" = p.id order by "dtePostEditDate" desc limit 1 ), 0),
    "editReason" = ( select "vchPostEditReason" from "tblForumPostEditNotes" where "intPostID" = p.id order by "dtePostEditDate" desc limit 1 ),
    "lastModified" = coalesce(( select "dtePostEditDate" from "tblForumPostEditNotes" where "intPostID" = p.id order by "dtePostEditDate" desc limit 1 ), p."lastModified")
where id = p.id;




create table "postHistory" (
  "id" serial not null,
  "postID" integer not null,
  "editorID" integer not null,
  "editReason" text,
  "markdown" text not null,
  "html" text not null,
  "time" timestamp not null,
  primary key ("id")
);


create table "postReports" (
  "id" serial not null,
  "postID" integer not null,
  "reportedByID" integer not null,
  "reason" text not null,
  primary key ("id")
);


create table "postTrash" (
  "id" integer not null,
  "topicID" integer not null,
  "userID" integer not null,
  "html" text not null,
  "markdown" text not null,
  "dateCreated" timestamp not null,
  "draft" boolean not null,
  "editorID" integer not null,
  "editReason" text,
  "lastModified" timestamp not null,
  "lockedByID" integer default 0,
  "lockReason" text,
  "deletedByID" integer not null,
  "deleteReason" text,
  primary key ("id")
);

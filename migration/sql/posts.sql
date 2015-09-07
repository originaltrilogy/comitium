
create table "posts" (
  "id" serial not null,
  "topicID" integer not null,
  "userID" integer not null,
  "text" text not null,
  "html" text not null,
  "created" timestamp without time zone not null,
  "modified" timestamp without time zone,
  "draft" boolean not null,
  "editorID" integer,
  "editReason" text,
  "lockedByID" integer,
  "lockReason" text,
  primary key ("id")
);


insert into "posts" (
  "id",
  "topicID",
  "userID",
  "text",
  "html",
  "created",
  "draft"
)
select
  "intPostID",
  "intTopicID",
  "intUserID",
  '',
  "vchPostText",
  "dtePostDateCreated",
  "bitDraft"
from "tblForumPosts";


SELECT SETVAL('posts_id_seq', ( select max("id") + 1 from posts ) );

create table "postHistory" (
  "id" serial not null,
  "postID" integer not null,
  "editorID" integer,
  "editReason" text,
  "text" text not null,
  "html" text not null,
  "time" timestamp without time zone not null,
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
  "text" text not null,
  "html" text not null,
  "created" timestamp without time zone not null,
  "modified" timestamp without time zone,
  "draft" boolean not null,
  "editorID" integer,
  "editReason" text,
  "lockedByID" integer,
  "lockReason" text,
  "deletedByID" integer not null,
  "deleteReason" text,
  primary key ("id")
);

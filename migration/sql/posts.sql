
create table "posts" (
  "id" serial not null,
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
  "editorID",
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
  "intUserID",
  "dtePostDateCreated"
from "tblForumPosts";


create index on posts ( "id" );


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


create table "bookmarks" (
  "id" serial not null,
  "userID" integer not null,
  "postID" integer not null,
  "notes" text,
  primary key ("id")
);


insert into "bookmarks" (
  "id",
  "userID",
  "postID",
  "notes"
)
select
  "intBookmarkID",
  "intUserID",
  "intPostID",
  "vchBookmarkNotes"
from "tblForumBookmarks";


SELECT SETVAL('bookmarks_id_seq', ( select max("id") + 1 from bookmarks ) );

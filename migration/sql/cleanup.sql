
alter table "users" add unique ("url");

alter table "topics" alter column "discussionID" set not null;
alter table "topics" alter column "firstPostID" set not null;
alter table "topics" alter column "lastPostID" set not null;
alter table "topics" alter column "titleHtml" set not null;
alter table "topics" alter column "url" set not null;
alter table "topics" add unique ("url");

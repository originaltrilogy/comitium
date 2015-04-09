
create table "announcements" (
  "id" serial not null,
  "discussionID" integer not null,
  "topicID" integer not null,
  primary key ("id")
);


insert into "announcements" (
  "id",
  "discussionID",
  "topicID"
)
select
  "intTopicForumLookupID",
  "intForumID",
  "intTopicID"
from "tblForumTopicForumLookup" where "bitAnnouncement" = true;


update "topics" t set "discussionID" = (
  select "intForumID"
  from "tblForumTopicForumLookup" l
  where l."intTopicID" = t."id"
)
where t."id" not in (
  select "topicID"
  from "announcements"
);


-- Put any topics without a lookup record in the trash
update "topics" t set "discussionID" = 1
where t."discussionID" is null;

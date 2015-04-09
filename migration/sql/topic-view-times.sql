
create table "topicViews" (
  "id" serial not null,
  "userID" integer not null,
  "topicID" integer not null,
  "time" timestamp not null,
  primary key ("id")
);


insert into "topicViews" (
  "id",
  "userID",
  "topicID",
  "time"
)
select
  "intTopicViewTimeID",
  "intUserID",
  "intTopicID",
  "dteTopicViewTime"
from "tblForumTopicViewTimes";

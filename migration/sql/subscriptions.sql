
create table "subscriptions" (
  "id" serial not null,
  "userID" integer not null,
  "topicID" integer not null,
  "notificationSent" timestamp not null,
  primary key ("id")
);


insert into "subscriptions" (
  "id",
  "userID",
  "topicID",
  "notificationSent"
)
select
  "intTopicSubscriptionID",
  "intUserID",
  "intTopicID",
  "dteSubscriptionNotificationSent"
from "tblForumTopicSubscriptions";


SELECT SETVAL('subscriptions_id_seq', ( select max("id") + 1 from subscriptions ) );

create table "users" (
  "id" serial not null,
  "groupID" integer not null,
  "username" text unique not null,
  "usernameHash" text not null,
  "passwordHash" text not null,
  "url" text not null,
  "email" text unique not null,
  "timezone" text not null,
  "dateFormat" text not null,
  "theme" text not null,
  "signatureMarkdown" text,
  "signatureHtml" text,
  "lastActivity" timestamp not null,
  "joinDate" timestamp not null,
  "website" text,
  "blog" text,
  "privateTopicEmailNotification" boolean not null,
  "subscriptionEmailNotification" boolean not null,
  "activated" boolean not null,
  "activationCode" text not null,
  "system" boolean not null,
  "locked" boolean not null,
  primary key (id)
);


insert into "users" (
  "id",
  "groupID",
  "username",
  "usernameHash",
  "passwordHash",
  "url",
  "email",
  "timezone",
  "dateFormat",
  "theme",
  "signatureMarkdown",
  "signatureHtml",
  "lastActivity",
  "joinDate",
  "website",
  "blog",
  "privateTopicEmailNotification",
  "subscriptionEmailNotification",
  "activated",
  "activationCode",
  "system",
  "locked"
)
select
  "intUserID",
  "intGroupID",
  "vchUsername",
  'placeholder',
  "vchPassword",
  "intUserID",
  "vchUserEmail",
  'GMT',
  "vchUserDateFormat",
  'Default',
  "vchForumSignature",
  "vchForumSignature",
  "dteLastActivityDate",
  "dteUserJoinDate",
  "vchUserHomePage",
  "vchUserBlog",
  "bitPMEmailNotification",
  "bitSubscriptionEmailNotification",
  true,
  'N/A',
  "bitLocked",
  "bitSystem"
from "tblForumUsers";


SELECT SETVAL('users_id_seq', ( select max("id") + 1 from users ) );


create table "userLogs" (
  "id" serial not null,
  "userID" integer not null,
  "action" text not null,
  "IP" cidr not null,
  "time" timestamp not null,
  primary key ("id")
);

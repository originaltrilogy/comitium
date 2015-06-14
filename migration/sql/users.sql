create table "users" (
  "id" serial not null,
  "groupID" integer not null,
  "username" text not null,
  "usernameHash" text not null,
  "passwordHash" text not null,
  "url" text not null,
  "email" text not null,
  "timezone" integer not null,
  "dateFormat" text not null,
  "signature" text,
  "lastActivity" timestamp not null,
  "joinDate" timestamp not null,
  "website" text,
  "blog" text,
  "pmEmailNotification" boolean not null,
  "subscriptionEmailNotification" boolean not null,
  "activationDate" timestamp,
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
  "signature",
  "lastActivity",
  "joinDate",
  "website",
  "blog",
  "pmEmailNotification",
  "subscriptionEmailNotification",
  "activationDate",
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
  "decUserTimeZoneOffset",
  "vchUserDateFormat",
  "vchForumSignature",
  "dteLastActivityDate",
  "dteUserJoinDate",
  "vchUserHomePage",
  "vchUserBlog",
  "bitPMEmailNotification",
  "bitSubscriptionEmailNotification",
  "dteUserJoinDate",
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

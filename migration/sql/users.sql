create table "users" (
  "id" serial not null,
  "groupID" integer not null,
  -- Make username unique for final script
  -- "username" text unique not null,
  "username" text not null,
  "usernameHash" text not null,
  "passwordHash" text not null,
  "url" text not null,
  -- Make email unique for final script
  -- "email" text unique not null,
  "email" text not null,
  "timezone" text not null,
  "dateFormat" text not null,
  "theme" text not null,
  "signature" text,
  "signatureHtml" text,
  "lastActivity" timestamp without time zone not null,
  "joined" timestamp without time zone not null,
  "website" text,
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
  "signature",
  "signatureHtml",
  "lastActivity",
  "joined",
  "website",
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
  '',
  "vchPassword",
  '',
  "vchUserEmail",
  'GMT',
  "vchUserDateFormat",
  'Default',
  null,
  "vchForumSignature",
  "dteLastActivityDate",
  "dteUserJoinDate",
  "vchUserHomePage",
  "bitPMEmailNotification",
  "bitSubscriptionEmailNotification",
  true,
  'N/A',
  "bitLocked",
  "bitSystem"
from "tblForumUsers";


SELECT SETVAL('users_id_seq', ( select max("id") + 1 from users ) );

delete from "users" where "id" in ( 1, 2 );

create table "userLogs" (
  "id" serial not null,
  "userID" integer not null,
  "action" text not null,
  "ip" cidr not null,
  "time" timestamp without time zone not null,
  primary key ("id")
);

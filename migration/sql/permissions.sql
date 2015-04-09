
create table "groups" (
    "id" serial not null,
    "name" text not null,
    "description" text not null,
    "login" boolean not null,
    "post" boolean not null,
    "reply" boolean not null,
    "talkPrivately" boolean not null,
    "moderateDiscussions" boolean not null,
    "administrateDiscussions" boolean not null,
    "moderateUsers" boolean not null,
    "administrateUsers" boolean not null,
    "administrateApp" boolean not null,
    "bypassLockdown" boolean not null,
    "system" boolean not null,
    "locked" boolean not null,
    primary key ("id")
);


insert into "groups"
( id, name, description, login, post, reply, "talkPrivately", "moderateDiscussions", "administrateDiscussions", "moderateUsers", "administrateUsers", "administrateApp", "bypassLockdown", system, locked )
values
( 1, 'Public', 'Public (anonymous) visitors.', false, false, false, false, false, false, false, false, false, false, true, false ),
( 2, 'New Members', 'Forum members who can reply to existing topics, but haven''t met the minimum post requirement to start new topics.', true, false, true, false, false, false, false, false, false, false, true, false ),
( 3, 'Trusted Members', 'Forum members with full access to post and reply.', true, true, true, true, false, false, false, false, false, false, true, false ),
( 4, 'Moderators', 'Members responsible for moderating users and content.', true, true, true, true, true, false, true, false, false, true, true, false ),
( 5, 'Administrators', 'Members with full control over the forum, including access to the admin. This group''s permissions are locked in order to prevent accidental removal of administration capabilities.', true, true, true, true, true, true, true, true, true, true, true, true ),
( 6, 'Banned Users', 'Users who have had their forum access privileges revoked.', false, false, false, false, false, false, false, false, false, false, true, false );


update users set "groupID" = (
  select id from groups where name = 'Moderators'
) where username in (
  'Moth3r',
  'SilverWook',
  'Anchorhead'
);


update users set "groupID" = (
  select id from groups where name = 'Administrators'
) where username = 'Jay';


create table "moderators" (
    "id" serial not null,
    "userID" integer not null,
    "discussionID" integer not null,
    primary key ("id")
);


insert into moderators
( "userID", "discussionID" )
values
( 1321, 1 ),
( 1321, 2 ),
( 1321, 3 ),
( 1321, 4 ),
( 1321, 5 ),
( 1321, 6 ),
( 1321, 7 ),
( 1321, 8 ),
( 1321, 9 ),
( 1321, 11 ),
( 1321, 12 ),
( 1321, 13 ),
( 1321, 14 ),
( 1321, 15 ),
( 1321, 16 ),
( 1321, 17 ),
( 1321, 18 ),
( 1321, 19 ),
( 1321, 20 ),
( 1321, 21 ),
( 1411, 1 ),
( 1411, 2 ),
( 1411, 3 ),
( 1411, 4 ),
( 1411, 5 ),
( 1411, 6 ),
( 1411, 7 ),
( 1411, 8 ),
( 1411, 9 ),
( 1411, 11 ),
( 1411, 12 ),
( 1411, 13 ),
( 1411, 14 ),
( 1411, 15 ),
( 1411, 16 ),
( 1411, 17 ),
( 1411, 18 ),
( 1411, 19 ),
( 1411, 20 ),
( 1411, 21 ),
( 1926, 1 ),
( 1926, 2 ),
( 1926, 3 ),
( 1926, 4 ),
( 1926, 5 ),
( 1926, 6 ),
( 1926, 7 ),
( 1926, 8 ),
( 1926, 9 ),
( 1926, 11 ),
( 1926, 12 ),
( 1926, 13 ),
( 1926, 14 ),
( 1926, 15 ),
( 1926, 16 ),
( 1926, 17 ),
( 1926, 18 ),
( 1926, 19 ),
( 1926, 20 ),
( 1926, 21 );


create table "discussionPermissions" (
  "id" serial not null,
  "groupID" integer not null,
  "discussionID" integer not null,
  "read" boolean not null,
  "post" boolean not null,
  "reply" boolean not null,
  primary key ("id")
);

insert into "discussionPermissions"
( "groupID", "discussionID", "read", "post", "reply" )
values
( 1, 1, false, false, false ),
( 1, 2, true, false, false ),
( 1, 3, true, false, false ),
( 1, 4, true, false, false ),
( 1, 5, true, false, false ),
( 1, 6, true, false, false ),
( 1, 7, true, false, false ),
( 1, 8, true, false, false ),
( 1, 9, true, false, false ),
( 1, 11, true, false, false ),
( 1, 12, true, false, false ),
( 1, 13, false, false, false ),
( 1, 14, true, false, false ),
( 1, 15, true, false, false ),
( 1, 16, false, false, false ),
( 1, 17, true, false, false ),
( 1, 18, true, false, false ),
( 1, 19, true, false, false ),
( 1, 20, true, false, false ),
( 1, 21, true, false, false ),
( 2, 1, false, false, false ),
( 2, 2, true, false, true ),
( 2, 3, true, false, true ),
( 2, 4, true, false, true ),
( 2, 5, true, false, true ),
( 2, 6, true, false, true ),
( 2, 7, true, false, true ),
( 2, 8, true, false, true ),
( 2, 9, true, false, true ),
( 2, 11, true, false, true ),
( 2, 12, true, false, true ),
( 2, 13, false, false, false ),
( 2, 14, true, false, true ),
( 2, 15, true, false, true ),
( 2, 16, false, false, false ),
( 2, 17, true, false, true ),
( 2, 18, true, false, true ),
( 2, 19, true, false, true ),
( 2, 20, true, false, true ),
( 2, 21, true, false, true ),
( 3, 1, false, false, false ),
( 3, 2, true, true, true ),
( 3, 3, true, true, true ),
( 3, 4, true, true, true ),
( 3, 5, true, true, true ),
( 3, 6, true, true, true ),
( 3, 7, true, true, true ),
( 3, 8, true, true, true ),
( 3, 9, true, true, true ),
( 3, 11, true, true, true ),
( 3, 12, true, true, true ),
( 3, 13, false, false, false ),
( 3, 14, true, true, true ),
( 3, 15, true, true, true ),
( 3, 16, false, false, false ),
( 3, 17, true, true, true ),
( 3, 18, true, true, true ),
( 3, 19, true, true, true ),
( 3, 20, true, true, true ),
( 3, 21, true, true, true ),
( 4, 1, false, false, false ),
( 4, 2, true, true, true ),
( 4, 3, true, true, true ),
( 4, 4, true, true, true ),
( 4, 5, true, true, true ),
( 4, 6, true, true, true ),
( 4, 7, true, true, true ),
( 4, 8, true, true, true ),
( 4, 9, true, true, true ),
( 4, 11, true, true, true ),
( 4, 12, true, true, true ),
( 4, 13, false, false, false ),
( 4, 14, true, true, true ),
( 4, 15, true, true, true ),
( 4, 16, false, false, false ),
( 4, 17, true, true, true ),
( 4, 18, true, true, true ),
( 4, 19, true, true, true ),
( 4, 20, true, true, true ),
( 4, 21, true, true, true ),
( 5, 1, false, false, false ),
( 5, 2, true, true, true ),
( 5, 3, true, true, true ),
( 5, 4, true, true, true ),
( 5, 5, true, true, true ),
( 5, 6, true, true, true ),
( 5, 7, true, true, true ),
( 5, 8, true, true, true ),
( 5, 9, true, true, true ),
( 5, 11, true, true, true ),
( 5, 12, true, true, true ),
( 5, 13, true, true, true ),
( 5, 14, true, true, true ),
( 5, 15, true, true, true ),
( 5, 16, true, true, true ),
( 5, 17, true, true, true ),
( 5, 18, true, true, true ),
( 5, 19, true, true, true ),
( 5, 20, true, true, true ),
( 5, 21, true, true, true );

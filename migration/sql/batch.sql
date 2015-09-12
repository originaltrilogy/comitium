
-- email templates
create table "emailTemplates" (
  "name" text unique not null,
  "description" text,
  "default_subject" text not null,
  "default_text" text not null,
  "subject" text not null,
  "text" text not null,
  "html" text,
  primary key ( "name" )
);

insert into "emailTemplates" ( "name", "description", "default_subject", "default_text", "subject", "text" ) values
(
'Registration',
'This e-mail is sent to new users after they register so they can activate their account.',
'Forum account activation',
'Thanks for signing up! To activate your account, please click the link below:

[activationUrl]',
'Welcome to originaltrilogy.com, [username]!',
'You''ve taken your first step into a larger world.

Click the link below to activate your account and take part in our community:

[activationUrl]

MTFBWY!'
),
(
'Reactivation',
'When users update their e-mail address, they''re asked to reactivate their account in order to verify that the e-mail they provided is valid.',
'Your account requires reactivation',
'When you update your e-mail address, we send this verification e-mail to make sure it''s a valid address. This helps us fight spammers and provide a better community experience.

Click the link below to verify this address and reactivate your account:

[activationUrl]',
'Your account requires reactivation',
'When you update your e-mail address, we send this verification e-mail to make sure it''s a valid address. This helps us fight spammers and provide a better community experience.

Click the link below to verify this address and reactivate your account:

[activationUrl]'
),
(
'Password Reset',
'Users who have forgotten their passwords can request a password reset link via e-mail.',
'Forum password reset request',
'We received a request to reset your password. Please click the link below to start the process:

[resetUrl]

If you didn''t initiate this request, it''s possible someone made a typo while entering their own e-mail address. Please let us know if you have any concerns.',
'Forum password reset request',
'We received a request to reset your password. Please click the link below to start the process:

[resetUrl]

If you didn''t initiate this request, it''s possible someone made a typo while entering their own e-mail address. Please let us know if you have any concerns.'
),
(
'Post Report',
'When users report a post, moderators are notified via e-mail.',
'Post report',
'Submitted by: [reporter]
Reason: [reason]

Post: [postUrl]
Topic: [topicTitle]

[topicUrl]

Post content:

[postText]',
'Post report',
'Submitted by: [reporter]
Reason: [reason]

Post: [postUrl]
Topic: [topicTitle]

[topicUrl]

Post content:

[postText]'
),
(
'Post Lock',
'When moderators lock a post, they can notify the author using this e-mail.',
'Your post was locked',
'A moderator locked one of your posts.

Post: [postUrl]
Topic: [topicTitle]

[topicUrl]

Reason: [reason]

Post content:
[postText]',
'Your post was locked',
'A moderator locked one of your posts.

Post: [postUrl]
Topic: [topicTitle]

[topicUrl]

Reason: [reason]

Post content:
[postText]'
),
(
'Post Delete',
'When moderators delete a post, they can notify the author using this e-mail.',
'Your post was deleted',
'A moderator deleted one of your posts.

Post ID: [postID]
Topic: [topicTitle]

[topicUrl]

Reason: [reason]

Post content:
[postText]',
'Your post was deleted',
'A moderator deleted one of your posts.

Post ID: [postID]
Topic: [topicTitle]

[topicUrl]

Reason: [reason]

Post content:
[postText]'
),
(
'Topic Lock',
'When moderators lock a topic, they can notify subscribers using this e-mail.',
'A topic you''re following was locked',
'A moderator locked a topic you were following.

Topic: [topicTitle]

[topicUrl]

Reason: [reason]',
'A topic you''re following was locked',
'A moderator locked a topic you were following.

Topic: [topicTitle]

[topicUrl]

Reason: [reason]'
),
(
'Topic Delete',
'When moderators delete a topic, they can notify subscribers using this e-mail.',
'A topic you''re following was deleted',
'A moderator deleted a topic you were following.

Topic: [topicTitle]

Reason: [reason]',
'A topic you''re following was deleted',
'A moderator deleted a topic you were following.

Topic: [topicTitle]

Reason: [reason]'
),
(
'Topic Invitation',
'Users who opt in to notifications receive this e-mail when they''re invited to participate in a private topic.',
'Private topic invitation',
'[author] invited you to a private topic:

[topicUrl]

Private topics are visible only to members who receive invitations; not even moderators can view your private topics.',
'Private topic invitation',
'[author] invited you to a private topic:

[topicUrl]

Private topics are visible only to members who receive invitations; not even moderators can view your private topics.'
),
(
'Topic Move',
'Subscribers receive an e-mail notification when a topic they''re following is moved to a different discussion.',
'A topic you''re following was moved',
'The following topic was moved from [oldDiscussionTitle] to [newDiscussionTitle].

[topicTitle]
[topicUrl]',
'A topic you''re following was moved',
'The following topic was moved from [oldDiscussionTitle] to [newDiscussionTitle].

[topicTitle]
[topicUrl]'
),
(
'Topic Reply',
'Subscribers receive an e-mail notification when someone replies to a topic they''re following.',
'Topic update: [topicTitle]',
'[replyAuthor] posted a reply to [topicTitle]:

[replyUrl]


There may be additional replies, but you won''t receive any further notifications until you visit the forum again.


Unsubscribe:

[unsubscribeUrl]',
'Topic update: [topicTitle]',
'[replyAuthor] posted a reply to [topicTitle]:

[replyUrl]


There may be additional replies, but you won''t receive any further notifications until you visit the forum again.


Unsubscribe:

[unsubscribeUrl]'
);


-- categories

create table "categories" (
  "id" serial not null,
  "title" text not null,
  "url" text not null,
  "description" text,
  "metaDescription" text,
  "keywords" text,
  "sort" smallint unique not null,
  "created" timestamp without time zone not null,
  "hidden" boolean not null,
  "system" boolean not null,
  "locked" boolean not null,
  primary key ("id")
);


insert into "categories" (
  "id",
  "title",
  "url",
  "description",
  "metaDescription",
  "keywords",
  "sort",
  "created",
  "hidden",
  "system",
  "locked"
)
select
  "intCategoryID",
  "vchCategoryTitle",
  "vchCategoryURLTitle",
  "vchCategoryDescription",
  "vchCategoryMetaDescription",
  "vchCategoryMetaKeywords",
  "intCategoryPosition",
  "dteCategoryDateCreated",
  "bitHidden",
  "bitSystem",
  "bitLocked"
from "tblForumCategories";


SELECT SETVAL('categories_id_seq', ( select max("id") + 1 from categories ) );

update "categories" set "title" = 'Preservation Efforts, Fan Edits, and Other Fan Projects', url = 'Preservation-Efforts-Fan Edits-and-Other-Fan-Projects' where "id" = 4;


-- bookmarks
create table "bookmarks" (
  "userID" integer not null,
  "postID" integer not null,
  "notes" text,
  primary key ( "userID", "postID" )
);


insert into "bookmarks" (
  "userID",
  "postID",
  "notes"
)
select distinct
  "intUserID",
  "intPostID",
  "vchBookmarkNotes"
from "tblForumBookmarks";




-- permissions
create table "groups" (
  "id" serial not null,
  "name" text unique not null,
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
( "id", "name", "description", "login", "post", "reply", "talkPrivately", "moderateDiscussions", "administrateDiscussions", "moderateUsers", "administrateUsers", "administrateApp", "bypassLockdown", "system", "locked" )
values
( 1, 'Public', 'Public (anonymous) visitors.', false, false, false, false, false, false, false, false, false, false, true, false ),
( 2, 'New Members', 'Forum members who can reply to existing topics, but haven''t met the minimum post requirement to start new topics.', true, false, true, false, false, false, false, false, false, false, true, false ),
( 3, 'Trusted Members', 'Forum members with full access to post and reply.', true, true, true, true, false, false, false, false, false, false, true, false ),
( 4, 'Moderators', 'Members responsible for moderating users and content.', true, true, true, true, true, false, true, false, false, true, true, false ),
( 5, 'Administrators', 'Members with full control over the forum, including access to the admin. This group''s permissions are locked in order to prevent accidental removal of administration capabilities.', true, true, true, true, true, true, true, true, true, true, true, true ),
( 6, 'Banned Users', 'Users who have had their forum access privileges revoked.', false, false, false, false, false, false, false, false, false, false, true, false );


-- Update banned user groupID (needs to be first due to conflicting IDs)
update users set "groupID" = (
  select id from groups where name = 'Banned Users'
) where "groupID" = 4;


update users set "groupID" = (
  select id from groups where name = 'Moderators'
) where username in (
  'Moth3r',
  'SilverWook',
  'Anchorhead'
);


update users set "groupID" = (
  select id from groups where name = 'Administrators'
) where username in ( 'Jay', 'Administrator');

-- Clean up admins
delete from "users" where "id" in ( 1, 2 );

update "users" set "email" = 'jay@jaysylvester.com' where "username" = 'Jay';
update "users" set "email" = 'jay@tehinnernets.com' where "username" = 'testaccount';

-- Put existing members in the Trusted Members group
update users set "groupID" = 3 where "groupID" = 2;


create table "moderators" (
  "userID" integer not null,
  "discussionID" integer not null,
  primary key ( "userID", "discussionID" )
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
( 1321, 22 ),
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
( 1411, 22 ),
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
( 1926, 21 ),
( 1926, 22 );


create table "discussionPermissions" (
  "groupID" integer not null,
  "discussionID" integer not null,
  "read" boolean not null,
  "post" boolean not null,
  "reply" boolean not null,
  primary key ( "groupID", "discussionID" )
);

insert into "discussionPermissions"
( "groupID", "discussionID", "read", "post", "reply" )
values
-- Public
( 1, 1, false, false, false ),
( 1, 2, true, false, false ),
( 1, 3, true, false, false ),
( 1, 4, true, false, false ),
( 1, 5, true, false, false ),
( 1, 6, true, false, false ),
( 1, 7, true, false, false ),
( 1, 8, true, false, false ),
( 1, 9, true, false, false ),
( 1, 10, true, false, false ),
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
( 1, 22, true, false, false ),

-- New Members
( 2, 1, false, false, false ),
( 2, 2, true, false, true ),
( 2, 3, true, false, true ),
( 2, 4, true, false, true ),
( 2, 5, true, false, true ),
( 2, 6, true, false, true ),
( 2, 7, true, false, true ),
( 2, 8, true, false, true ),
( 2, 9, true, false, true ),
( 2, 10, true, false, true ),
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
( 2, 22, true, false, true ),

-- Trusted Members
( 3, 1, false, false, false ),
( 3, 2, true, false, true ),
( 3, 3, true, true, true ),
( 3, 4, true, true, true ),
( 3, 5, true, true, true ),
( 3, 6, true, true, true ),
( 3, 7, true, true, true ),
( 3, 8, true, true, true ),
( 3, 9, true, true, true ),
( 3, 10, true, true, true ),
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
( 3, 22, true, true, true ),

-- Moderators
( 4, 1, true, false, false ),
( 4, 2, true, true, true ),
( 4, 3, true, true, true ),
( 4, 4, true, true, true ),
( 4, 5, true, true, true ),
( 4, 6, true, true, true ),
( 4, 7, true, true, true ),
( 4, 8, true, true, true ),
( 4, 9, true, true, true ),
( 4, 10, true, true, true ),
( 4, 11, true, true, true ),
( 4, 12, true, true, true ),
( 4, 13, true, true, true ),
( 4, 14, true, true, true ),
( 4, 15, true, true, true ),
( 4, 16, true, true, true ),
( 4, 17, true, true, true ),
( 4, 18, true, true, true ),
( 4, 19, true, true, true ),
( 4, 20, true, true, true ),
( 4, 21, true, true, true ),
( 4, 22, true, true, true ),

-- Administrators
( 5, 1, true, false, false ),
( 5, 2, true, true, true ),
( 5, 3, true, true, true ),
( 5, 4, true, true, true ),
( 5, 5, true, true, true ),
( 5, 6, true, true, true ),
( 5, 7, true, true, true ),
( 5, 8, true, true, true ),
( 5, 9, true, true, true ),
( 5, 10, true, true, true ),
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
( 5, 21, true, true, true ),
( 5, 22, true, true, true ),

-- Banned Members
( 6, 1, false, false, false ),
( 6, 2, false, false, false ),
( 6, 3, false, false, false ),
( 6, 4, false, false, false ),
( 6, 5, false, false, false ),
( 6, 6, false, false, false ),
( 6, 7, false, false, false ),
( 6, 8, false, false, false ),
( 6, 9, false, false, false ),
( 6, 10, false, false, false ),
( 6, 11, false, false, false ),
( 6, 12, false, false, false ),
( 6, 13, false, false, false ),
( 6, 14, false, false, false ),
( 6, 15, false, false, false ),
( 6, 16, false, false, false ),
( 6, 17, false, false, false ),
( 6, 18, false, false, false ),
( 6, 19, false, false, false ),
( 6, 20, false, false, false ),
( 6, 21, false, false, false ),
( 6, 22, false, false, false );



-- topic subscriptions
create temp table topicsubscriptionstemp as
select
  "intUserID",
  "intTopicID",
  "dteSubscriptionNotificationSent"
from "tblForumTopicSubscriptions";

-- dedupe topic subscriptions
create function topicsubscriptionscleanup() returns text as $$
  declare
    dupe record;

  begin
    for dupe in SELECT "intUserID", "intTopicID"
          FROM "topicsubscriptionstemp"
          GROUP BY "intUserID", "intTopicID"
          HAVING ( COUNT("intUserID") > 1 and COUNT("intTopicID") > 1 )
          order by "intTopicID" asc

      loop
        delete from "topicsubscriptionstemp" where "intUserID" = dupe."intUserID" and "intTopicID" = dupe."intTopicID";
      end loop;

    return true;
  end;

$$ language 'plpgsql';
select topicsubscriptionscleanup();
drop function topicsubscriptionscleanup();

create table "topicSubscriptions" (
  "userID" integer not null,
  "topicID" integer not null,
  "notificationSent" timestamp without time zone not null,
  primary key ( "userID", "topicID" )
);

insert into "topicSubscriptions" (
  "userID",
  "topicID",
  "notificationSent"
)
select
  "intUserID",
  "intTopicID",
  "dteSubscriptionNotificationSent"
from topicsubscriptionstemp;

drop table topicsubscriptionstemp;



-- topicViews
create temp table topicviewtemp as
select
  "intUserID",
  "intTopicID",
  "dteTopicViewTime"
from "tblForumTopicViewTimes";

-- dedupe topic view times
create function topicviewcleanup() returns text as $$
  declare
    dupe record;

  begin
    for dupe in SELECT "intUserID", "intTopicID"
          FROM "topicviewtemp"
          GROUP BY "intUserID", "intTopicID"
          HAVING ( COUNT("intUserID") > 1 and COUNT("intTopicID") > 1 )
          order by "intTopicID" asc

      loop
        delete from "topicviewtemp" where "intUserID" = dupe."intUserID" and "intTopicID" = dupe."intTopicID";
      end loop;

    return true;
  end;

$$ language 'plpgsql';
select topicviewcleanup();
drop function topicviewcleanup();

create table "topicViews" (
  "userID" integer not null,
  "topicID" integer not null,
  "time" timestamp without time zone not null,
  primary key ( "userID", "topicID" )
);

insert into "topicViews"
  select "intUserID", "intTopicID", "dteTopicViewTime" from topicviewtemp;

drop table topicviewtemp;



-- ignored users
create table "ignoredUsers" (
  "userID" integer not null,
  "ignoredUserID" integer not null,
  primary key ( "userID", "ignoredUserID" )
);

insert into "ignoredUsers" (
  "userID",
  "ignoredUserID"
)
select distinct
  "intUserID",
  "intIgnoreUserID"
from "tblForumIgnoredUsers";



-- Password reset
create table "passwordReset" (
  "userID" integer not null,
  "verificationCode" text not null,
  "ip" cidr not null,
  "time" timestamp without time zone not null,
  primary key ( "userID", "verificationCode" )
);



-- announcements
create table "announcements" (
  "discussionID" integer not null,
  "topicID" integer not null,
  primary key ( "discussionID", "topicID" )
);

insert into "announcements" (
  "discussionID",
  "topicID"
)
select distinct
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

-- Put announcements in discussion ID 2 and move General Discussion topics to a new discussion ID
update "topics"
set "discussionID" = 22
where "discussionID" = 2;

update "announcements"
set "discussionID" = 22
where "discussionID" = 2;

update "topics"
set "discussionID" = 2
where "id" in (
  select distinct "topicID"
  from "announcements"
);



-- discussions
create table "discussions" (
  "id" serial not null,
  "categoryID" integer not null,
  "title" text not null,
  "url" text not null,
  "description" text,
  "metaDescription" text,
  "keywords" text,
  "posts" integer not null,
  "topics" integer not null,
  "sort" smallint not null,
  "created" timestamp without time zone not null,
  "hidden" boolean not null,
  "system" boolean not null,
  "locked" boolean not null,
  primary key ( "id" )
);

insert into "discussions" (
  "id",
  "categoryID",
  "title",
  "url",
  "description",
  "metaDescription",
  "keywords",
  "posts",
  "topics",
  "sort",
  "created",
  "hidden",
  "system",
  "locked"
)
select
  "intForumID",
  "intCategoryID",
  "vchForumTitle",
  "vchForumURLTitle",
  "vchForumDescription",
  "vchForumMetaDescription",
  "vchForumMetaKeywords",
  "intForumPostCount",
  "intForumTopicCount",
  "intForumPosition",
  "dteForumDateCreated",
  "bitHidden",
  "bitSystem",
  "bitLocked"
from "tblForumSubcategories";

update "discussions"
set "id" = 22
where "id" = 2;

insert into "discussions" (
  "id",
  "categoryID",
  "title",
  "url",
  "description",
  "metaDescription",
  "keywords",
  "posts",
  "topics",
  "sort",
  "created",
  "hidden",
  "system",
  "locked"
) values (
  2,
  0,
  'Announcements',
  'Announcements',
  '',
  'Site and forum announcements.',
  'announcements, news',
  0,
  0,
  0,
  now(),
  false,
  true,
  true
);

SELECT SETVAL('discussions_id_seq', ( select max("id") + 1 from discussions ) );

update "discussions"
set "metaDescription" = "description"
where "metaDescription" = '';



-- Discussion views
create table "discussionViews" (
  "userID" integer not null,
  "discussionID" integer not null,
  "discussionRead" timestamp without time zone not null,
  "topicsRead" timestamp without time zone,
  primary key ( "userID", "discussionID" )
);



-- Put any topics without a lookup record in the trash
update "topics" t set "discussionID" = 1
where t."discussionID" is null;



-- Delete stray topics without any posts and clean up topic and post counts
-- create index on posts ( id );
create index on posts ( "topicID" );
create index on posts ( draft ) where draft = false;
create index on posts ( created asc );

create function cleanup() returns text as $$

  declare
    discussion record;

  begin

    for discussion in select * from discussions order by id asc

      loop

        raise notice 'cleaning %', discussion.title;

        delete from "topics" t where t."discussionID" = discussion.id and t."id" not in (
          select t."id" from topics t join posts p on p."topicID" = t."id" and p."id" = ( select id from posts where "topicID" = t.id and draft = false order by posts.created asc limit 1 ) where t."discussionID" = discussion.id
        );

        update discussions set posts = ( select count(p.id) from posts p join topics t on p."topicID" = t.id where t."discussionID" = discussion.id and p.draft = false ), topics = ( select count(t.id) from topics t where t."discussionID" = discussion.id and t.draft = false ) where "id" = discussion.id;

      end loop;

    return 'topic and post counts cleaned up';

  end;

$$ language 'plpgsql';

select cleanup();

drop function cleanup();



-- Update topics with existing locks

-- create index on topics ( "id" );
create index on "tblForumTopicLock" ( "intTopicID" );
create index on "tblForumTopicLock" ( "dteTopicLockDate" );

update topics t
set "lockedByID" = coalesce(( select "intTopicLockedBy" from "tblForumTopicLock" where "intTopicID" = t.id order by "dteTopicLockDate" desc limit 1 ), null),
    "lockReason" = coalesce(( select "vchTopicLockReason" from "tblForumTopicLock" where "intTopicID" = t.id order by "dteTopicLockDate" desc limit 1 ), null)
where id = t.id;



-- Update posts with existing edit notes

-- create index on posts ( "id" );
create index on "tblForumPostEditNotes" ( "intPostID" );
create index on "tblForumPostEditNotes" ( "dtePostEditDate" );

update posts p
set "editorID" = coalesce(( select "intUserID" from "tblForumPostEditNotes" where "intPostID" = p.id order by "dtePostEditDate" desc limit 1 ), null),
    "editReason" = coalesce(( select "vchPostEditReason" from "tblForumPostEditNotes" where "intPostID" = p.id order by "dtePostEditDate" desc limit 1 ), null),
    "modified" = coalesce(( select "dtePostEditDate" from "tblForumPostEditNotes" where "intPostID" = p.id order by "dtePostEditDate" desc limit 1 ), p."modified")
where id = p.id;



-- Column settings after migration

alter table "users" add unique ("username"), add unique ("email");
alter table "topics" alter column "discussionID" set not null;
alter table "topics" alter column "titleHtml" set not null;
alter table "topics" alter column "url" set not null;



-- Indexes

-- create index on "categories" ( "id" );
create index on "categories" ( "sort" );
-- create index on "discussions" ( "id" );
create index on "discussions" ( "categoryID" );
create index on "discussions" ( "sort" );
create index on "discussionPermissions" ( "discussionID" );
create index on "discussionPermissions" ( "groupID" );
create index on "discussionPermissions" ( "read" );
create index on "discussionPermissions" ( "post" );
create index on "discussionPermissions" ( "reply" );
create index on "topics" ( "discussionID" );
-- create index on "topics" ( "id" );
create index on "topics" ( "draft" );
create index on "topics" ( "sticky" );
create index on "topics" ( "private" );
create index on "topicInvitations" ( "userID" );
create index on "topicInvitations" ( "topicID" );
create index on "posts" ( "draft" );
-- create index on "posts" ( "id" );
create index on "posts" ( "topicID" );
create index on "posts" ( "userID" );
create index on "posts" ( "created" );
create index on "posts" ( "topicID" asc );
create index on "posts" ( "topicID" desc );
create index on "posts" ( "topicID", created asc );
create index on "posts" ( "topicID", created desc );
create index on "posts" ( "draft" ) where draft = false;
create index on "postReports" ( "postID" );
create index on "postReports" ( "reportedByID" );
-- create index on "users" ( "id" );
create index on "topicViews" ( "userID" );
create index on "topicViews" ( "topicID" );
create index on "topicViews" ( "time" );
-- create index on "passwordReset" ( "id" );
create index on "passwordReset" ( "userID" );
create index on "passwordReset" ( "verificationCode" );
create index on "topicSubscriptions" ( "userID" );
create index on "topicSubscriptions" ( "topicID" );
create index on "topicSubscriptions" ( "notificationSent" );



-- Analyze all tables
analyze "announcements";
analyze "bookmarks";
analyze "categories";
analyze "discussionPermissions";
analyze "discussions";
-- analyze "discussionSubscriptions";
analyze "discussionViews";
analyze "groups";
analyze "ignoredUsers";
analyze "moderators";
analyze "passwordReset";
analyze "postHistory";
analyze "postReports";
analyze "posts";
analyze "postTrash";
analyze "topicSubscriptions";
analyze "topicInvitations";
analyze "topics";
analyze "topicViews";
analyze "userLogs";
analyze "users";

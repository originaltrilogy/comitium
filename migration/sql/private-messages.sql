
create index on "tblForumPrivateMessages" ( "intConversationID" );
create index on "tblForumPrivateMessages" ( "intPrivateMessageID" );
create index on "tblForumPrivateMessages" ( "dteTimeSent" );
create index on "tblForumPrivateMessages" ( "intSenderUserID" );
create index on "tblForumPrivateMessages" ( "dteTimeSent" );
create index on "topics" ( "discussionID" );
-- create index on "topics" ( "id" );
create index on "topics" ( "draft" );
create index on "topics" ( "created" );
create index on "topics" ( "sticky" );
create index on "topics" ( "private" );
create index on "topicInvitations" ( "userID" );
create index on "topicInvitations" ( "topicID" );
create index on "posts" ( "draft" );
-- create index on "posts" ( "id" );
create index on "posts" ( "topicID" );
create index on "posts" ( "userID" );
create index on "posts" ( "created" );
-- create index on "users" ( "id" );

insert into "topicInvitations"
  select distinct * from (
    select distinct "intSenderUserID" as "userID", "intConversationID" + 20000 as "topicID" from "tblForumPrivateMessages"
    union
    select distinct "intRecipientUserID" as "userID", "intConversationID" + 20000 as "topicID" from "tblForumPrivateMessages"
  ) "topicInvitees"
  order by "topicID" asc;

insert into "topicViews" ( "userID", "topicID", "time" )
  select distinct "userID", "topicID", "time" from (
    select distinct "intSenderUserID" as "userID", "intConversationID" + 20000 as "topicID", date '2016-01-01' + time '03:00' as "time" from "tblForumPrivateMessages"
    union
    select distinct "intRecipientUserID" as "userID", "intConversationID" + 20000 as "topicID", date '2016-01-01' + time '03:00' as "time" from "tblForumPrivateMessages"
  ) "topicViews"
  order by "topicID" asc;

insert into "posts" ( "topicID", "userID", "text", "html", "created", "draft" )
  select distinct "intConversationID" + 20000 as "topicID", "intSenderUserID" as "userID", '' as "text", "vchMessageText" as "html", "dteTimeSent" as "created", false as "draft" from "tblForumPrivateMessages"
  order by "dteTimeSent" asc, "topicID" asc;

insert into "topics" ( "id", "discussionID", "title", "titleHtml", "url", "created", "replies", "draft", "private" )
  select m."intConversationID" + 20000 as "id", 0 as "discussionID", '' as "title", "vchMessageTitle" as "titleHtml", ' ' as "url", ( select min("dteTimeSent") from "tblForumPrivateMessages" where "intConversationID" = m."intConversationID" ) as "created", ( select count("id") - 1 from "posts" where "topicID" = m."intConversationID" + 20000 ) as replies, false as "draft", true as "private"
  from "tblForumPrivateMessages" m
  where "intPrivateMessageID" = ( select min("intPrivateMessageID") from "tblForumPrivateMessages" where "intConversationID" = m."intConversationID" )
  order by "id" asc;


SELECT SETVAL('topics_id_seq', ( select max("id") + 1 from topics ) );

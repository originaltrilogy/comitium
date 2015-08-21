
create index on "tblForumPrivateMessages" ( "intConversationID" );
create index on "tblForumPrivateMessages" ( "intPrivateMessageID" );
create index on "tblForumPrivateMessages" ( "dteTimeSent" );
create index on "tblForumPrivateMessages" ( "intSenderUserID" );
create index on "tblForumPrivateMessages" ( "dteTimeSent" );
create index on "topics" ( "discussionID" );
create index on "topics" ( "id" );
create index on "topics" ( "draft" );
create index on "topics" ( "sortDate" );
create index on "topics" ( "firstPostID" );
create index on "topics" ( "lastPostID" );
create index on "topics" ( "sortDate" );
create index on "topics" ( "private" );
create index on "topicInvitations" ( "userID" );
create index on "topicInvitations" ( "topicID" );
create index on "posts" ( "draft" );
create index on "posts" ( "id" );
create index on "posts" ( "topicID" );
create index on "posts" ( "userID" );
create index on "posts" ( "dateCreated" );
create index on "users" ( "id" );

insert into "topicInvitations"
  select distinct * from (
    select distinct "intSenderUserID" as "userID", "intConversationID" + 20000 as "topicID" from "tblForumPrivateMessages"
    union
    select distinct "intRecipientUserID" as "userID", "intConversationID" + 20000 as "topicID" from "tblForumPrivateMessages"
  ) "topicInvitees"
  order by "topicID" asc;

insert into "posts" ( "topicID", "userID", "html", "markdown", "dateCreated", "draft", "editorID", "lastModified", "lockedByID" )
  select distinct "intConversationID" + 20000 as "topicID", "intSenderUserID" as "userID", "vchMessageText" as "html", ' ' as "markdown", "dteTimeSent" as "dateCreated", false as "draft", "intSenderUserID" as "editorID", "dteTimeSent" as "lastModified", 0 as "lockedByID" from "tblForumPrivateMessages"
  order by "dteTimeSent" asc, "topicID" asc;

insert into "topics" ( "id", "discussionID", "firstPostID", "lastPostID", "titleMarkdown", "titleHtml", "url", "sortDate", "replies", "draft", "private", "lockedByID" )
select m."intConversationID" + 20000 as "id", 0 as "discussionID", ( select min("id") from "posts" where "topicID" = m."intConversationID" + 20000 ) as "firstPostID", ( select max("id") from "posts" where "topicID" = m."intConversationID" + 20000 ) as "lastPostID", "vchMessageTitle" as "titleMarkdown", "vchMessageTitle" as "titleHtml", ' ' as "url", ( select max("dteTimeSent") from "tblForumPrivateMessages" where "intConversationID" = m."intConversationID" ) as "sortDate", ( select count("id") - 1 from "posts" where "topicID" = m."intConversationID" + 20000 ) as replies, false as "draft", true as "private", 0 as "lockedByID"
from "tblForumPrivateMessages" m
where "intPrivateMessageID" = ( select min("intPrivateMessageID") from "tblForumPrivateMessages" where "intConversationID" = m."intConversationID" )
order by "id" asc;


SELECT SETVAL('topics_id_seq', ( select max("id") + 1 from topics ) );

create index on "categories" ( "id" );

create index on "categories" ( "sort" );

create index on "categories" ( "url" );

create index on "discussions" ( "id" );

create index on "discussions" ( "categoryID" );

create index on "discussions" ( "sort" );

create index on "discussions" ( "url" );

create index on "discussionPermissions" ( "discussionID" );

create index on "discussionPermissions" ( "groupID" );

create index on "discussionPermissions" ( "read" );

create index on "discussionPermissions" ( "post" );

create index on "discussionPermissions" ( "reply" );

create index on "topics" ( "discussionID" );

create index on "topics" ( "id" );

create index on "topics" ( "url" );

create index on "topics" ( "draft" );

create index on "topics" ( "sortDate" );

create index on "posts" ( "draft" );

create index on "posts" ( "id" );

create index on "posts" ( "topicID" );

create index on "posts" ( "userID" );

create index on "posts" ( "dateCreated" );

create index on "users" ( "id" );

create index on "users" ( "url" );

create index on "topicViews" ( "userID", "topicID", "time" );

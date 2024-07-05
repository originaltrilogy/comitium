-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE announcements (
    discussion_id integer,
    topic_id integer,
    CONSTRAINT announcements_pkey PRIMARY KEY (discussion_id, topic_id)
);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE banned_ip_addresses (
    id integer primary key generated always as identity,
    ip cidr NOT NULL,
    admin_user_id integer NOT NULL,
    time timestamp without time zone NOT NULL
);

-- Indices -------------------------------------------------------

CREATE INDEX banned_ip_addresses_ip_idx ON banned_ip_addresses(ip inet_ops);
CREATE INDEX banned_ip_addresses_time_idx ON banned_ip_addresses(time timestamp_ops);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE bookmarks (
    user_id integer,
    post_id integer,
    notes text,
    CONSTRAINT bookmarks_pkey PRIMARY KEY (user_id, post_id)
);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE categories (
    id integer primary key generated always as identity,
    title text NOT NULL,
    url text NOT NULL,
    description text,
    meta_description text,
    keywords text,
    sort smallint NOT NULL UNIQUE,
    created timestamp without time zone NOT NULL,
    hidden boolean NOT NULL,
    system boolean NOT NULL,
    locked boolean NOT NULL
);

-- Indices -------------------------------------------------------

CREATE INDEX categories_sort_idx ON categories(sort int2_ops);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE content (
    id integer primary key generated always as identity,
    title_markdown text,
    title_html text,
    url text UNIQUE,
    content_markdown text,
    content_html text,
    author_id integer,
    created timestamp without time zone,
    modified timestamp without time zone,
    modified_by_id integer
);

-- Indices -------------------------------------------------------

CREATE INDEX author_id ON content(author_id int4_ops);
CREATE INDEX url ON content(url text_ops);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE discussion_permissions (
    group_id integer,
    discussion_id integer,
    read boolean NOT NULL,
    post boolean NOT NULL,
    reply boolean NOT NULL,
    CONSTRAINT discussion_permissions_pkey PRIMARY KEY (group_id, discussion_id)
);

-- Indices -------------------------------------------------------

CREATE INDEX discussion_permissions_discussionID_idx ON discussion_permissions(discussion_id int4_ops);
CREATE INDEX discussion_permissions_groupID_idx ON discussion_permissions(group_id int4_ops);
CREATE INDEX discussion_permissions_post_idx ON discussion_permissions(post bool_ops);
CREATE INDEX discussion_permissions_read_idx ON discussion_permissions(read bool_ops);
CREATE INDEX discussion_permissions_reply_idx ON discussion_permissions(reply bool_ops);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE discussions (
    id integer primary key generated always as identity,
    category_id integer NOT NULL,
    title text NOT NULL,
    url text NOT NULL,
    description text,
    meta_description text,
    keywords text,
    posts integer NOT NULL,
    topics integer NOT NULL,
    sort smallint NOT NULL,
    created timestamp without time zone NOT NULL,
    hidden boolean NOT NULL,
    system boolean NOT NULL,
    locked boolean NOT NULL,
    last_post_id integer
);

-- Indices -------------------------------------------------------

CREATE INDEX discussions_category_id_idx ON discussions(category_id int4_ops);
CREATE INDEX discussions_sort_idx ON discussions(sort int2_ops);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE discussion_views (
    user_id integer,
    discussion_id integer,
    discussion_read timestamp without time zone NOT NULL,
    topics_read timestamp without time zone,
    CONSTRAINT discussion_views_pkey PRIMARY KEY (user_id, discussion_id)
);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE email_templates (
    name text PRIMARY KEY,
    description text,
    default_subject text NOT NULL,
    default_text text NOT NULL,
    subject text NOT NULL,
    text text NOT NULL,
    html text
);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE groups (
    id integer primary key generated always as identity,
    name text NOT NULL UNIQUE,
    description text NOT NULL,
    login boolean NOT NULL,
    post boolean NOT NULL,
    reply boolean NOT NULL,
    talk_privately boolean NOT NULL,
    moderate_discussions boolean NOT NULL,
    administrate_discussions boolean NOT NULL,
    moderate_users boolean NOT NULL,
    administrate_users boolean NOT NULL,
    administrate_app boolean NOT NULL,
    bypass_lockdown boolean NOT NULL,
    system boolean NOT NULL,
    locked boolean NOT NULL,
    url text NOT NULL
);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE ignored_users (
    user_id integer,
    ignored_user_id integer,
    CONSTRAINT ignored_users_pkey PRIMARY KEY (user_id, ignored_user_id)
);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE moderators (
    user_id integer,
    discussion_id integer,
    CONSTRAINT moderators_pkey PRIMARY KEY (user_id, discussion_id)
);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE password_reset (
    user_id integer,
    verification_code text,
    time timestamp without time zone NOT NULL,
    CONSTRAINT password_reset_pkey PRIMARY KEY (user_id, verification_code)
);

-- Indices -------------------------------------------------------

CREATE INDEX password_reset_userID_idx ON password_reset(user_id int4_ops);
CREATE INDEX password_reset_verification_code_idx ON password_reset(verification_code text_ops);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE post_history (
    id integer primary key generated always as identity,
    post_id integer NOT NULL,
    editor_id integer,
    edit_reason text,
    text text NOT NULL,
    html text NOT NULL,
    time timestamp without time zone NOT NULL
);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE post_reports (
    id integer primary key generated always as identity,
    post_id integer NOT NULL,
    reported_by_id integer NOT NULL,
    reason text NOT NULL
);

-- Indices -------------------------------------------------------

CREATE INDEX post_reports_postID_idx ON post_reports(post_id int4_ops);
CREATE INDEX post_reports_reportedByID_idx ON post_reports(reported_by_id int4_ops);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE posts (
    id integer primary key generated always as identity,
    topic_id integer NOT NULL,
    user_id integer NOT NULL,
    text text NOT NULL,
    html text NOT NULL,
    created timestamp without time zone NOT NULL,
    modified timestamp without time zone,
    draft boolean NOT NULL,
    editor_id integer,
    edit_reason text,
    locked_by_id integer,
    lock_reason text
);

-- Indices -------------------------------------------------------

CREATE INDEX posts_created_desc ON posts(created timestamp_ops DESC);
CREATE INDEX posts_created_idx ON posts(created timestamp_ops);
CREATE INDEX posts_draft_idx ON posts(draft bool_ops) WHERE draft = false;
CREATE INDEX posts_draft_idx1 ON posts(draft bool_ops);
CREATE INDEX posts_topic_id_created_idx ON posts(topic_id int4_ops,created timestamp_ops);
CREATE INDEX posts_topic_id_created_idx1 ON posts(topic_id int4_ops,created timestamp_ops DESC);
CREATE INDEX posts_topic_id_idx ON posts(topic_id int4_ops);
CREATE INDEX posts_topic_id_idx3 ON posts(topic_id int4_ops DESC);
CREATE INDEX posts_user_id_idx ON posts(user_id int4_ops);
CREATE INDEX posts_topic_id_draft_created ON posts(topic_id int4_ops,draft bool_ops,created timestamp_ops);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE post_trash (
    id integer primary key generated always as identity,
    topic_id integer NOT NULL,
    user_id integer NOT NULL,
    text text NOT NULL,
    html text NOT NULL,
    created timestamp without time zone NOT NULL,
    modified timestamp without time zone,
    draft boolean NOT NULL,
    editor_id integer,
    edit_reason text,
    locked_by_id integer,
    lock_reason text,
    deleted_by_id integer NOT NULL,
    delete_reason text
);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE topic_invitations (
    user_id integer,
    topic_id integer,
    accepted boolean DEFAULT false,
    left_topic boolean DEFAULT false,
    CONSTRAINT topic_invitations_pkey PRIMARY KEY (user_id, topic_id)
);

-- Indices -------------------------------------------------------

CREATE INDEX topic_invitations_topic_id_idx ON topic_invitations(topic_id int4_ops);
CREATE INDEX topic_invitations_topic_id_idx1 ON topic_invitations(topic_id int4_ops);
CREATE INDEX topic_invitations_user_id_idx ON topic_invitations(user_id int4_ops);
CREATE INDEX topic_invitations_user_id_idx1 ON topic_invitations(user_id int4_ops);
CREATE INDEX topic_invitations_accepted_idx ON topic_invitations(accepted bool_ops);
CREATE INDEX topic_invitations_left_idx ON topic_invitations(left_topic bool_ops);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE topics (
    id integer primary key generated always as identity,
    discussion_id integer NOT NULL,
    title text NOT NULL,
    title_html text NOT NULL,
    url text NOT NULL,
    created timestamp without time zone NOT NULL,
    modified timestamp without time zone,
    sticky timestamp without time zone,
    replies integer DEFAULT 0,
    draft boolean NOT NULL,
    private boolean NOT NULL,
    locked_by_id integer,
    lock_reason text,
    edited_by_id integer,
    edit_reason text
);

-- Indices -------------------------------------------------------

CREATE INDEX topics_created_idx ON topics(created timestamp_ops);
CREATE INDEX topics_discussion_id_idx ON topics(discussion_id int4_ops);
CREATE INDEX topics_draft_idx ON topics(draft bool_ops);
CREATE INDEX topics_private_idx ON topics(private bool_ops);
CREATE INDEX topics_sticky_idx ON topics(sticky timestamp_ops);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE topic_subscriptions (
    user_id integer,
    topic_id integer,
    notification_sent timestamp without time zone NOT NULL,
    CONSTRAINT topic_subscriptions_pkey PRIMARY KEY (user_id, topic_id)
);

-- Indices -------------------------------------------------------

CREATE INDEX topic_subscriptions_notificationSent_idx ON topic_subscriptions(notification_sent timestamp_ops);
CREATE INDEX topic_subscriptions_topic_id_idx ON topic_subscriptions(topic_id int4_ops);
CREATE INDEX topic_subscriptions_user_id_idx ON topic_subscriptions(user_id int4_ops);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE topic_views (
    user_id integer,
    topic_id integer,
    time timestamp without time zone NOT NULL,
    CONSTRAINT topic_views_pkey PRIMARY KEY (user_id, topic_id)
);

-- Indices -------------------------------------------------------

CREATE INDEX topic_views_time_idx ON topic_views(time timestamp_ops);
CREATE INDEX topic_views_topic_id_idx ON topic_views(topic_id int4_ops);
CREATE INDEX topic_views_user_id_idx ON topic_views(user_id int4_ops);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE user_logs (
    id integer primary key generated always as identity,
    user_id integer NOT NULL,
    action text NOT NULL,
    ip cidr NOT NULL,
    time timestamp without time zone NOT NULL
);



-- DDL generated by Postico 1.5.10
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE users (
    id integer primary key generated always as identity,
    group_id integer NOT NULL,
    username text NOT NULL UNIQUE,
    username_hash text NOT NULL,
    password_hash text NOT NULL,
    url text NOT NULL,
    email text NOT NULL UNIQUE,
    timezone text NOT NULL,
    date_format text NOT NULL,
    theme text NOT NULL,
    signature text,
    signature_html text,
    last_activity timestamp without time zone NOT NULL,
    joined timestamp without time zone NOT NULL,
    website text,
    private_topic_email_notification boolean NOT NULL,
    subscription_email_notification boolean NOT NULL,
    activated boolean NOT NULL,
    activation_code text NOT NULL,
    system boolean NOT NULL,
    locked boolean NOT NULL
);



-- Default categories

INSERT INTO "categories"("title","url","description","meta_description","keywords","sort","created","hidden","system","locked")
VALUES
('Administrative Functions','Administrative-Functions','Forums related to administrative concerns. This category is hidden from users who don''t have access.','','',1,now(),TRUE,TRUE,FALSE),
('Sample Category','Sample-Category','Default category created during setup.','This is the meta description for display in search engine results.','insert, meta, keywoards, here',2,now(),FALSE,FALSE,FALSE);

INSERT INTO "public"."discussions"("category_id","title","url","description","meta_description","keywords","posts","topics","last_post_id","sort","created","hidden","system","locked")
VALUES
(1,'Trash','Trash','Dumping ground for deleted topics. Topics are not truly deleted until removed from this forum.','Dumping ground for deleted topics. Topics are not truly deleted until removed from this forum.','',0,0,0,1,now(),TRUE,TRUE,TRUE),
(0,'Announcements','Announcements','Site and forum announcements.','Site and forum announcements.','announcements, news',0,0,0,1,now(),FALSE,TRUE,TRUE),
(2,'Sample Subcategory','Sample-Subcategory','Default subcategory created during setup.','This is the meta description for display in search engine results.','insert, meta, keywoards, here',0,0,0,1,now(),FALSE,FALSE,FALSE);



-- Default groups

INSERT INTO "groups" ("name","url","description","login","post","reply","talk_privately","moderate_discussions","administrate_discussions","moderate_users","administrate_users","administrate_app","bypass_lockdown","system","locked")
VALUES
('Public','Public','Public (anonymous) visitors.',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE),
('New Members','New-Members','Forum members who can reply to existing topics, but haven''t met the minimum post requirement to start new topics.',TRUE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE),
('Members','Members','Forum members with full access to post and reply.',TRUE,TRUE,TRUE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE),
('Moderators','Moderators','Members responsible for moderating users and content.',TRUE,TRUE,TRUE,TRUE,TRUE,FALSE,TRUE,FALSE,FALSE,TRUE,TRUE,FALSE),
('Administrators','Administrators','Members with full control over the forum, including access to the admin. This group''s permissions are locked in order to prevent accidental removal of administration capabilities.',TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE),
('Banned Members','Banned-Members','Users who have had their forum access privileges revoked.',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE);



-- Default permissions
INSERT INTO "discussion_permissions" ("group_id","discussion_id","read","post","reply")
VALUES
(1,1,FALSE,FALSE,FALSE),
(1,2,TRUE,FALSE,FALSE),
(1,3,TRUE,FALSE,FALSE),
(2,1,FALSE,FALSE,FALSE),
(2,2,TRUE,FALSE,TRUE),
(2,3,TRUE,FALSE,TRUE),
(3,1,FALSE,FALSE,FALSE),
(3,2,TRUE,FALSE,TRUE),
(3,3,TRUE,TRUE,TRUE),
(4,1,TRUE,FALSE,FALSE),
(4,2,TRUE,TRUE,TRUE),
(4,3,TRUE,TRUE,TRUE),
(5,1,TRUE,FALSE,FALSE),
(5,2,TRUE,TRUE,TRUE),
(5,3,TRUE,TRUE,TRUE),
(6,1,FALSE,FALSE,FALSE),
(6,2,FALSE,FALSE,FALSE),
(6,3,FALSE,FALSE,FALSE);



-- Administrator account
INSERT INTO "users" ("group_id","username","username_hash","password_hash","url","email","timezone","date_format","theme","signature","signature_html","last_activity","joined","website","private_topic_email_notification","subscription_email_notification","activated","activation_code","system","locked")
VALUES
(5,'Administrator','$2a$10$OcEsQ1L2jizBqw1CPmLG6uK6ZJuUB39TDYOBH9RLXmKD44mvm3sCa','$2a$12$BUs.SDPtAxSkSAjJGf6G2eb348JbZPVR0OmnXySJs2M5IDDh0Wf62','Administrator','admin@comitium.com','GMT','MMMM D, YYYY','Comitium Light',NULL,NULL,now(),now(),NULL,TRUE,TRUE,TRUE,'N/A',TRUE,TRUE);



-- E-mail templates
INSERT INTO "email_templates" ("name","description","default_subject","default_text","subject","text","html")
VALUES
('Password Reset','Users who have forgotten their passwords can request a password reset link via e-mail.','Forum password reset request','We received a request to reset your password. Please click the link below to start the process:

[resetUrl]

If you didn''t initiate this request, it''s possible someone made a typo while entering their own e-mail address. Please let us know if you have any concerns.','Forum password reset request','We received a request to reset your password. Please click the link below to start the process:

[resetUrl]

If you didn''t initiate this request, it''s possible someone made a typo while entering their own e-mail address. Please let us know if you have any concerns.',NULL),
('Post Delete','When moderators delete a post, they can notify the author using this e-mail.','Your post was deleted','A moderator deleted one of your posts.

Post ID: [postID]\nTopic: [topicTitle]

[topicUrl]

Reason: [reason]

Post content:\n[postText]','Your post was deleted','A moderator deleted one of your posts.

Post ID: [postID]\nTopic: [topicTitle]

[topicUrl]

Reason: [reason]

Post content:\n[postText]',NULL),
('Post Lock','When moderators lock a post, they can notify the author using this e-mail.','Your post was locked','A moderator locked one of your posts.

Post: [postUrl]\nTopic: [topicTitle]

[topicUrl]

Reason: [reason]

Post content:\n[postText]','Your post was locked','A moderator locked one of your posts.

Post: [postUrl]\nTopic: [topicTitle]

[topicUrl]

Reason: [reason]

Post content:\n[postText]',NULL),
('Post Report','When users report a post, moderators are notified via e-mail.','Post report','Submitted by: [reporter]\nReason: [reason]

Post: [postUrl]\nTopic: [topicTitle]

[topicUrl]

Post content:

[postText]','Post report','Submitted by: [reporter]\nReason: [reason]

Post: [postUrl]\nTopic: [topicTitle]

[topicUrl]

Post content:

[postText]',NULL),
('Reactivation','When users update their e-mail address, they''re asked to reactivate their account in order to verify that the e-mail they provided is valid.','Your account requires reactivation','When you update your e-mail address, we send this verification e-mail to make sure it''s a valid address. This helps us fight spammers and provide a better community experience.

Click the link below to verify this address and reactivate your account:

[activationUrl]','Your account requires reactivation','When you update your e-mail address, we send this verification e-mail to make sure it''s a valid address. This helps us fight spammers and provide a better community experience.

Click the link below to verify this address and reactivate your account:

[activationUrl]',NULL),
('Registration','This e-mail is sent to new users after they register so they can activate their account.','Welcome to the forum, [username]!','Thanks for signing up! To activate your account, please click the link below:

[activationUrl]','Welcome to the forum, [username]!','Thanks for signing up! To activate your account, please click the link below:

[activationUrl]',NULL),
('Registration Resend Failure', 'This e-mail is sent to users who request a duplicate of their registration e-mail, but the associated account is already activated.', 'Forum account activation', 'We received a request to resend the [siteName] forum registration e-mail associated with this e-mail account. However, the account has already been activated.

You should be able to log in with the credentials you provided at signup. If you''re having difficulty, you can reset your password here:

[siteUrl]password-reset', 'Forum account activation', 'We received a request to resend the [siteName] forum registration e-mail associated with this e-mail account. However, the account has already been activated.

You should be able to log in with the credentials you provided at signup. If you''re having difficulty, you can reset your password here:

[siteUrl]password-reset', NULL),
('Topic Delete','When moderators delete a topic, they can notify subscribers using this e-mail.','A topic you''re following was deleted','A moderator deleted a topic you were following.

Topic: [topicTitle]

Reason: [reason]','A topic you''re following was deleted','A moderator deleted a topic you were following.

Topic: [topicTitle]

Reason: [reason]',NULL),
('Topic Invitation','Users who opt in to notifications receive this e-mail when they''re invited to participate in a private topic.','Private topic invitation','[author] invited you to a private topic. Private topics are visible only to members who receive an invitation; not even moderators can view your private topics.

To accept the invitation and read the topic:\n[topicUrl]','Private topic invitation','[author] invited you to a private topic. Private topics are visible only to members who receive an invitation; not even moderators can view your private topics.

To accept the invitation and read the topic:\n[topicUrl]',NULL),
('Topic Lock','When moderators lock a topic, they can notify subscribers using this e-mail.','A topic you''re following was locked','A moderator locked a topic you were following.

Topic: [topicTitle]

[topicUrl]

Reason: [reason]','A topic you''re following was locked','A moderator locked a topic you were following.

Topic: [topicTitle]

[topicUrl]

Reason: [reason]',NULL),
('Topic Move','Subscribers receive an e-mail notification when a topic they''re following is moved to a different discussion.','A topic you''re following was moved','The following topic was moved from [oldDiscussionTitle] to [newDiscussionTitle].

[topicTitle]\n[topicUrl]','A topic you''re following was moved','The following topic was moved from [oldDiscussionTitle] to [newDiscussionTitle].

[topicTitle]\n[topicUrl]',NULL),
('Topic Reply','Subscribers receive an e-mail notification when someone replies to a topic they''re following.','Topic update: [topicTitle]','[replyAuthor] posted a reply to the following topic:

[topicTitle]\n[replyUrl]

\nThere may be additional replies, but you won''t receive any further notifications until you visit the forum again.

\nUnsubscribe:

[unsubscribeUrl]','Topic update: [topicTitle]','[replyAuthor] posted a reply to the following topic:

[topicTitle]\n[replyUrl]

\nThere may be additional replies, but you won''t receive any further notifications until you visit the forum again.

\nUnsubscribe:

[unsubscribeUrl]',NULL),
( 'Topic Merge','Subscribers receive an e-mail notification when moderators merge a topic they''re following.','Topic update: [topicTitle]','A topic you''re following has been merged with another topic:

[topicTitle]\n[topicUrl]

\nUnsubscribe from this topic:

[unsubscribeUrl]','Topic update: [topicTitle]','A topic you''re following has been merged with another topic:

[topicTitle]\n[topicUrl]

\nUnsubscribe from this topic:

[unsubscribeUrl]',NULL);

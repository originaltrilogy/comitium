'insert into tblForumTopicForumLookup (
  intTopicID,
  intForumID,
  bitAnnouncement )
values (
  ' + connection.escape(args.topicID) + ',
  ' + connection.escape(args.discussionID) + ',
  ' + connection.escape(args.isAnnouncement) + '
);'

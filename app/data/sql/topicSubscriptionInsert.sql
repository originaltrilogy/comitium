'insert into tblForumTopicSubscriptions (
  intUserID,
  intTopicID,
  dteSubscriptionNotificationSent )
values (
  ' + connection.escape(args.userID) + ',
  ' + connection.escape(args.topicID) + ',
  ' + connection.escape(args.time) + '
);'

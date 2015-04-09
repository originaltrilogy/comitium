'update tblForumTopicSubscriptions ts
set ts.dteSubscriptionNotificationSent = ' + connection.escape(args.time)  + '
where ts.intTopicID = ' + connection.escape(args.topicID) + ';'

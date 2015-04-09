'delete from tblForumTopicSubscriptions
where intUserID = ' + connection.escape(args.userID) + ' and intTopicID = ' + connection.escape(args.topicID) + ';'

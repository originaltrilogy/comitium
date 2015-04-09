'update tblForumTopics
set vchTopicUrlTitle = ' + connection.escape(args.urlTitle) + '
where intTopicID = ' + connection.escape(args.topicID) + ';'

'update tblForumTopics
set intTopicReplyCount = (
    select count(intPostID)
    from tblForumPosts
    where intTopicID = ' + connection.escape(args.topicID) + '
      and bitDraft = 0
  ) - 1
where intTopicID = ' + connection.escape(args.topicID) + ';'

'update tblForumSubcategories
set intForumPostCount = (
    select count(p.intPostID)
    from tblForumPosts p
    join tblForumTopicForumLookup l on p.intTopicID = l.intTopicID
    where l.intForumID = ' + connection.escape(args.discussionID) + '
      and l.bitAnnouncement = 0
      and p.bitDraft = 0
  ),
  intForumTopicCount = (
    select count(t.intTopicID)
    from tblForumTopics t
    join tblForumTopicForumLookup l on t.intTopicID = l.intTopicID
    where l.intForumID = ' + connection.escape(args.discussionID) + '
      and l.bitAnnouncement = 0
      and t.bitDraft = 0
  )
where intForumID = ' + connection.escape(args.discussionID) + ';'

'select s.vchForumTitle as discussionTitle, s.vchForumUrlTitle as discussionUrlTitle, t.dteStickyDate as time, t.intTopicID as id, t.vchTopicUrlTitle as urlTitle, t.intTopicReplyCount as replies, t.intTopicViewCount as views, t.vchTopicTitle as topicTitle, p.intUserID as authorID, u.vchUsername as author, u.vchURLUsername as authorUrl, l.intTopicLockedBy as lockedBy, l.vchTopicLockReason as lockReason, l.dteTopicLockDate as lockTime
from tblForumTopics t
inner join tblForumTopicForumLookup lu on lu.intTopicID = t.intTopicID
inner join tblForumSubcategories s on s.intForumID = lu.intForumID
inner join tblForumPosts p on p.intPostID = (
  select min(intPostID)
  from tblForumPosts
  where intTopicID = t.intTopicID
)
inner join tblForumUsers u on u.intUserID = p.intUserID
left outer join tblForumTopicLock l on l.intTopicID = t.intTopicID
where t.intTopicID = ' + connection.escape(topicID) + ';'

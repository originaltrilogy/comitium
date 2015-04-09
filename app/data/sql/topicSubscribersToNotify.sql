'select u.vchUserEmail as email
from tblForumUsers u
inner join tblForumTopicSubscriptions ts on u.intUserID = ts.intUserID
  and u.intUserID <> ' + connection.escape(args.replyAuthorID) + '
where ts.intTopicID = ' + connection.escape(args.topicID) + ' and ts.dteSubscriptionNotificationSent <= (
  select tvt.dteTopicViewTime
  from tblForumTopicViewTimes tvt
  where tvt.intUserID = ts.intUserID and tvt.intTopicID = ts.intTopicID
);'

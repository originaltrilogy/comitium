'insert into tblForumTopics (
  vchTopicLabel,
  dteStickyDate,
  intFirstTopicPostID,
  intLastTopicPostID,
  intTopicReplyCount,
  intTopicViewCount,
  bitDraft,
  vchTopicTitle,
  vchTopicUrlTitle,
  titleMarkdown )
values (
  ' + connection.escape(args.label) + ',
  ' + connection.escape(app.toolbox.helpers.isoDate()) + ',
  0,
  0,
  0,
  0,
  ' + connection.escape(args.isDraft) + ',
  ' + connection.escape(args.title.html) + ',
  ' + connection.escape(args.urlTitle) + ',
  ' + connection.escape(args.title.markdown) + '
);'

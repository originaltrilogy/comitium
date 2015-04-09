'insert into tblForumPosts (
  intParentPostID,
  intTopicID,
  intUserID,
  vchPostTitle,
  vchPostUrlTitle,
  vchPostText,
  markdown,
  dtePostDateCreated,
  bitShowSignature,
  bitDraft,
  editorID,
  lastModified )
values (
  0,
  ' + connection.escape(args.topicID) + ',
  ' + connection.escape(args.authorID) + ',
  "",
  "",
  ' + connection.escape(args.content.html) + ',
  ' + connection.escape(args.content.markdown) + ',
  ' + connection.escape(args.time) + ',
  1,
  ' + connection.escape(args.isDraft) + ',
  ' + connection.escape(args.authorID) + ',
  ' + connection.escape(args.time) + '
);'

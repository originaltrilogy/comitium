// _footer controller

export const handler = async () => {
  let [
    topics,
    posts,
    users,
    firstPost
  ] = await Promise.all([
    app.models.stats.topics(),
    app.models.stats.posts(),
    app.models.stats.users(),
    app.models.stats.firstPost()
  ])

  let copyrightYear = new Date(firstPost).getFullYear(),
      year = new Date().getFullYear()

  if ( copyrightYear !== year ) {
    copyrightYear += '-' + year
  }

  return {
    public: {
      stats: {
        topics: app.toolbox.numeral(topics).format('0,0'),
        posts: app.toolbox.numeral(posts).format('0,0'),
        users: app.toolbox.numeral(users).format('0,0'),
        firstPostCreated: app.toolbox.moment.tz(firstPost, 'America/New_York').format('MMMM D, YYYY')
      },
      copyrightYear: copyrightYear
    },
    cache: {
      controller: {
        lifespan: 'application'
      }
    }
  }
}
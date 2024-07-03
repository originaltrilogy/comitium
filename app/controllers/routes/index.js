// index controller

export const handler = async () => {
  return {
    next: '/discussions',
    view: false
  }
}


export const head = () => {
  return app.models.index.metaData()
}

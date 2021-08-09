// index controller

export const handler = () => {
  return {
    handoff: {
      controller: 'discussions'
    },
    view: false
  }
}


export const head = () => {
  return app.models.index.metaData()
}

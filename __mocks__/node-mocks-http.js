module.exports = {
  createMocks: () => ({
    req: {
      method: 'GET',
      url: '/',
      headers: {},
      body: {}
    },
    res: {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    }
  })
}
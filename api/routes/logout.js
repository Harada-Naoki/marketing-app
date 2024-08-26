let refreshTokens = [];

module.exports = (req, res) => {
  if (req.method === 'POST') {
    const { token } = req.body;
    refreshTokens = refreshTokens.filter(t => t !== token);
    res.sendStatus(204);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

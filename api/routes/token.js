const jwt = require('jsonwebtoken');

let refreshTokens = [];

module.exports = (req, res) => {
  if (req.method === 'POST') {
    const { token } = req.body;
    if (!token) return res.sendStatus(401);
    if (!refreshTokens.includes(token)) return res.sendStatus(403);

    jwt.verify(token, process.env.REFRESH_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);

      const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
      res.json({ accessToken });
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

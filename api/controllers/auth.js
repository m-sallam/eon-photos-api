const auth = require('../../services/auth')

module.exports.login = async (req, res) => {
  try {
    let { token, user } = await auth.authenticate(req.body.username, req.body.password)
    let { username, email, name, uploads, likes } = user
    res.status(200).send({ token, user: { username, email, name, uploads, likes } })
  } catch (err) {
    console.log(err)
    if (err.name === 'AUTHERROR') {
      res.status(401).send({ message: err.message })
    } else {
      console.log(err)
      res.status(500).send('huh!')
    }
  }
}

module.exports.refreshToken = async (req, res) => {
  try {
    let { token } = await auth.refreshToken(req.body.token)
    res.status(200).send({ token })
  } catch (err) {
    console.log(err)
    res.status(500).send(err.message)
  }
}

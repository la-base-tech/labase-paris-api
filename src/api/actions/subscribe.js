module.exports = (req, res) => {
  res.send('hello world ' + process.env.APP_ENV)
}
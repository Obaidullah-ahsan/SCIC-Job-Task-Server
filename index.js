const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Audiophile is running....')
})

app.listen(port, () => {
  console.log(`Audiophile app listening on port ${port}`)
})
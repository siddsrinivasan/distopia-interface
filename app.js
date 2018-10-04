const server = require('express')

const express = server()

// express.set('view engine', 'ejs')
express.use(server.static(__dirname+'/views'))


  let ssn = [];

  express.get('/', (req,res) => {
    res.sendFile('index.html')
  })

express.listen(3000)

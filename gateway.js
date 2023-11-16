const express = require('express');
const morgan = require('morgan');
const config = require('./gatewayConfig.json')
const app = express();
app.use(express.json());
app.use(morgan('dev'));
const PORT = 3000;
const axios = require('axios');

const validateToken = (AccessToken) => {
  return AccessToken === '12345'
}
app.post('/v1/auth/getToken', (req, res) => {
  axios.post('http://localhost:3001/v1/auth/getToken', req.body)
    .then(response => {
      // Handle the response here
      res.send(response.data); // Send the data back to the client
    })
    .catch(error => {
      // Handle errors here
      console.error(error);
      res.status(500).send({ errorMessage: 'An error occurred' }); // Send an error response to the client
    });
});

config.endpoints.forEach(endpoint => {
  endpoint.services.forEach(service => {
    app[service.method](service.path + "*", (req, res) => {
      if (validateToken(req.headers["accesstoken"])) {
        //Did this for quick implementation Ideally we should url decode and only pass allowable querystring
          const qString = req.originalUrl.split(service.path)
          // console.log(qString,"--------",endpoint.url + service.path + (qString[1] ? qString[1] : ''))
        axios[service.method](endpoint.url + service.path + (qString[1] ? qString[1] : ''), req.body)
          .then(response => {
            // Handle the response here
            res.send(response.data); // Send the data back to the client
          })
          .catch(error => {
            // Handle errors here
            console.error(error);
            res.status(500).send({ errorMessage: 'An error occurred' }); // Send an error response to the client
          });
      }
      else {
        res.status(401).send({ errorMessage: 'Token Invalid' });
      }
    })

  })
})

app.get('/info', (req, res, next) => {
  res.status(200).send("API Gateway running on port 3000");
})
app.listen(PORT, () => {
  console.log("API Gateway started on port" + PORT);
});
const express = require('express');
const routes = require('./routes/');

const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;

// router
routes(router);
app.use(router);

app.use((req, res, next) => {
  res.status(404).json({
    status: 404,
    message: 'Not found!',
  });
  return next();
});

app.listen(port, () => {
  console.log(`App Listening to ${port}`)
});
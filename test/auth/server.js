var express = require('express')
  , logger = require('morgan');

var app = express();

app.set('views', __dirname);
app.set('view engine', 'jade');

app.use(logger('dev'));

app.get('/', function(req, res) {
  res.render('authenticate', {
    app_id: process.env.APP_ID || 'your-app-id-here'
  });
});

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

var server = app.listen(process.env.PORT || 3000, function() {
  console.log('Test server listening on port %d', server.address().port);
});

#!/usr/bin/node

const
conf = require('../lib/configuration.js'),
express = require('express'),
routes = require('../routes');

var app = express();

app.configure(function(){
  app.set('views', __dirname + '/../views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'passwords in git ftw' }));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.post('/auth', routes.auth(conf.get('public_url')));
app.get('/logout', routes.logout);

app.listen(conf.get('bind_to').port, function() {
  console.log("running on " + conf.get('public_url'));
});

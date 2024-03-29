const
conf = require('../lib/configuration.js'),
https = require('https'),
qs = require('qs');

exports.index = function (req, resp){
  resp.render('index', { title: 'Express', includejs: conf.get('browserid').includejs,
                              user: req.session.email, layout: true })
};

exports.auth = function (audience) {
  return function(req, resp){
    function onVerifyResp(bidRes) {
      var data = "";
      bidRes.setEncoding('utf8');
      bidRes.on('data', function (chunk) {
        data += chunk;
      });
      bidRes.on('end', function () {
        var verified = JSON.parse(data);
        resp.contentType('application/json');
        if (verified.status == 'okay') {
          console.info('browserid auth successful, setting req.session.email');
          req.session.email = verified.email;
          resp.redirect('/');
        } else {
          console.error(verified.reason);
          resp.writeHead(403);
        }
        resp.write(data);
        resp.end();
      });
    };

    var assertion = req.body.assertion;

    var body = qs.stringify({
      assertion: assertion,
      audience: audience
    });
    console.info('verifying with browserid');
    var request = https.request({
      host: conf.get('browserid').verifier.host,
      port: conf.get('browserid').verifier.port,
      path: '/verify',
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'content-length': body.length
      }
    }, onVerifyResp);
    request.write(body);
    request.end();
  };
};

exports.logout = function (req, resp) {
  req.session.destroy();
  resp.redirect('/');
};

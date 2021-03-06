var OAlib = require('oauth').OAuth;
var serializer = require('serializer');
var url = require('url');
var util = require('util');

var BASE_URL = 'https://mysleep.myzeo.com:8443/zeows/oauth';

module.exports = {
  handler: function (callback, apiKeys, done, req, res) {
    var OA = new OAlib(BASE_URL + '/request_token',
      BASE_URL + '/access_token',
      apiKeys.appKey,
      apiKeys.appSecret,
      '1.0',
      callback,
      'HMAC-SHA1',
      null,
      { 'Accept': '*/*', 'Connection': 'close' });

    var qs = url.parse(req.url, true).query;

    var appSecretSerializer = serializer
      .createSecureSerializer(apiKeys.appSecret, apiKeys.appSecret);

    // Second phase, post-user-authorization
    var sess;

    if (req.cookies && req.cookies.zeo_client) {
      try {
        sess = appSecretSerializer.parse(req.cookies.zeo_client);
      } catch (E) {
        // Pass
      }
    }

    if (qs && qs.oauth_token && sess && sess.token_secret) {
      OA.getOAuthAccessToken(qs.oauth_token,
        sess.token_secret,
        qs.oauth_verifier,
        function (error, oauth_token, oauth_token_secret) {
        if (error || !oauth_token) {
          return done(new Error("oauth failed to get access token"));
        }

        done(null, {
          consumerKey: apiKeys.appKey,
          consumerSecret: apiKeys.appSecret,
          token: oauth_token,
          tokenSecret: oauth_token_secret,
          callerKey: apiKeys.callerKey
        });
      });

      return;
    }

    // First phase, initiate user authorization
    OA.getOAuthRequestToken({ oauth_callback: callback },
      function (error, oauth_token, oauth_token_secret) {
      if (error) {
        return res.end("Failed to get token: " + util.inspect(error));
      }

      // Stash the secret
      res.cookie('zeo_client',
        appSecretSerializer.stringify({ token_secret: oauth_token_secret }),
        { path: '/', httpOnly: false });

      res.redirect(BASE_URL + '/confirm_access?oauth_token=' + oauth_token);
    });
  }
};

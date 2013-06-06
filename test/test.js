require('chai').should();

var CREDENTIALS = require('../test-credentials.json');

describe('zeo-connector', function () {
  it('should load cleanly', function () {
    var zeo = require('../connector.js');

    var connector = new zeo.Connector({});

    connector.archive.should.be.a('function');

    connector.credentials.should.deep.equal({});
  });

  it('should archive', function (done) {
    this.timeout(5 * 60 * 1000);

    var zeo = require('../connector.js');

    var connector = new zeo.Connector(CREDENTIALS);

    connector.on('data', function (err, endpoint, data) {
      console.log('data', endpoint, data ? data.length : data);
    });

    connector.on('done', function (err) {
      done(err);
    });

    connector.archive();
  });
});

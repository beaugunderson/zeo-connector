var async = require('async');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var ENDPOINTS = [
  'self',
  'sleep-records',
  'sleep-stats',
  'zq-scores'
];

var Connector = function (credentials) {
  EventEmitter.call(this);

  this.credentials = credentials;

  var self = this;

  // TODO: Roll this into a base Connector class?
  this.archive = function () {
    async.each(ENDPOINTS, function (endpoint, cbEachEndpoint) {
      var endpointModule = require('./synclets/' + endpoint);

      endpointModule.sync({ auth: self.credentials }, function (err, data) {
        self.emit('data', err, endpoint, data);

        cbEachEndpoint(err);
      });
    }, function (err) {
      self.emit('done', err);
    });
  };
};

util.inherits(Connector, EventEmitter);

exports.auth = require('./auth');
exports.Connector = Connector;

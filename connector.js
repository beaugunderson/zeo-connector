var async = require('async');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var zipstream = require('zipstream');

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

  this.archive = function () {
    async.each(ENDPOINTS, function (endpoint, cbEachEndpoint) {
      var endpointModule = require('./' + endpoint);

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

'use strict';

const cors = require('cors');
const _ = {
  mergeWith: require('lodash.mergewith'),
  union: require('lodash.union'),
};

module.exports = (opts) => {
  opts = opts || {};
  return (req, res, next) => {
    cors(
      _.mergeWith(
        {
          origin: true,
          credentials: true,
          methods: ['GET', 'PUT', 'POST', 'DELETE'],
          allowedHeaders: ['accept', 'content-type', 'platform', 'clienttype', 'x-device'],
          maxAge: 3600,
          optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
          preflightContinue: true
        },
        opts,
        (objValue, srcValue) => {
          if (Array.isArray(objValue)) {
            return _.union(objValue, srcValue);
          }
        }
      )
    )(req, res, (err) => {
      if (err) {
        return next(err);
      }

      const method = req.method && req.method.toUpperCase && req.method.toUpperCase();
      const devices = ['Media/BP440', 'Media/BP530', 'Media/BP540', 'Media/BH6430', 'Media/BP550', 'Media/BP730'];

      if (/^ott/i.test(req.headers['platform']) === 'ott' && req.headers['clienttype'] === 'lg_bd' && devices.indexOf(req.headers['x-device']) > -1) {
        res.setHeader('access-control-allow-origin', '*');
        res.removeHeader('access-control-allow-credentials');
      } else if (res.get('access-control-allow-origin') === undefined && res.get('access-control-allow-credentials') !== undefined) {
        res.removeHeader('access-control-allow-credentials');
      }

      if (method === 'OPTIONS') {
        return res.status(200).end();
      }

      return next();
    });
  };
};

'use strict';

const cors = require('cors');

function merge(a, b) {
  const c = JSON.parse(JSON.stringify(a));
  for (const k in b) {
    if (Array.isArray(b[k]) && Array.isArray(c[k])) {
      c[k] = c[k].concat(b[k]);
    } else if (typeof b[k] === 'object' && typeof c[k] === 'object') {
      c[k] = merge(c[k], b[k]);
    } else {
      c[k] = b[k];
    }
  }
  return c;
}

module.exports = (opts) => {
  opts = opts || {};
  return (req, res, next) => {
    cors(
      merge({
        origin: true,
        credentials: true,
        methods: ['GET', 'PUT', 'POST', 'DELETE'],
        allowedHeaders: ['accept', 'content-type', 'platform', 'clienttype', 'x-device'],
        maxAge: 3600,
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
      }, opts)
    )(req, res, (err) => {
      if (err) {
        next(err);
      } else {
        const devices = ['Media/BP530', 'Media/BP540', 'Media/BH6430'];
        if (req.headers['platform'] === 'ott' && req.headers['clienttype'] === 'lg_bd' && devices.indexOf(req.headers['x-device']) > -1) {
          res.setHeader('access-control-allow-origin', '*');
          res.removeHeader('access-control-allow-credentials');
        } else if (res.get('access-control-allow-origin') === undefined && res.get('access-control-allow-credentials') !== undefined) {
          res.removeHeader('access-control-allow-credentials');
        }
        next();
      }
    });
  };
};

const querystring = require('querystring');
const url = require('url');
const https = require('https');
const zlib = require('zlib');

const TextifyUpvotes = require('../streams/TextifyUpvotes');
const TransformHrefs = require('../streams/TransformHrefs');
const replaceDomain = require('../utils/replaceDomain');

module.exports = function proxyHandler(req, res) {
  let fullPath = 'https://news.ycombinator.com'
    + req.path;
  
  if (Object.keys(req.query).length > 0) {
    fullPath += '?' + querystring.stringify(req.query);
  }
  
  const options = url.parse(fullPath);
  options.headers = options.headers || {};
  
  const headersToPass = ['accept', 'accept-encoding', 'user-agent', 'cookie'];
  headersToPass.forEach((name) => {
    if (req.headers[name]) {
      options.headers[name] = req.headers[name];
    }
  });
  options.headers['referrer'] = '.ycombinator.com';
  options.headers['origin'] = '.ycombinator.com';
  options.method = req.method;
  options.agent = false;
  
  const connector = https.request(options, function(response) {
    Object.keys(response.headers).forEach((key) => {
      if (key === 'set-cookie') {
        const cookie = replaceDomain(response.headers[key], process.env.HOSTNAME);
        res.set(key, cookie);
      } else {
        res.set(key, response.headers[key]);
      }
    });
    
    res.status(response.statusCode)
    
    const isHtml = /text\/html/.test(response.headers['content-type']);
    const isGzip = /gzip/.test(response.headers['content-encoding']);
    
    if (response.statusCode !== 200 || !isHtml) {
      response.pipe(res);
    } else if (!isGzip) {
      response
        .pipe(new TextifyUpvotes())
        .pipe(new TransformHrefs())
        .pipe(res);
    } else {
      response
        .pipe(zlib.createGunzip())
        .pipe(new TextifyUpvotes())
        .pipe(new TransformHrefs())
        .pipe(zlib.createGzip())
        .pipe(res);
    }
  });
  
  req.pipe(connector);
};

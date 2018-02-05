const { Transform } = require('stream');
const { inherits } = require('util');
const { load } = require('cheerio');

const upvotePattern = /(<div\sclass="votearrow"\stitle="upvote">)(<\/div>)/g;

function TransformHrefs(options) {
  if (!(this instanceof TransformHrefs)) {
    return new TransformHrefs(options);
  }
  
  this._buf = [];
  
  Transform.call(this, options);
}

inherits(TransformHrefs, Transform);

TransformHrefs.prototype._transform = function transform(chunk, encoding, done) {
  this._buf.push(chunk);
  done();
};

TransformHrefs.prototype._flush = function flush(done) {
  const markup = Buffer.concat(this._buf).toString();
  const $ = load(markup);
  
  $('a').each(function(i, el) {
    const href = $(this).attr('href');
    const proxyHref = href.replace(/news\.ycombinator\.com/g, process.env.HOSTNAME);
    $(this).attr('href', proxyHref);
  });
  
  this.push(new Buffer($.html()));
  done();
};

module.exports = TransformHrefs;

const { Transform } = require('stream');
const { inherits } = require('util');
const { load } = require('cheerio');

const upvotePattern = /(<div\sclass="votearrow"\stitle="upvote">)(<\/div>)/g;

function TextifyUpvotes(options) {
  if (!(this instanceof TextifyUpvotes)) {
    return new TextifyUpvotes(options);
  }
  
  this._buf = [];
  
  Transform.call(this, options);
}

inherits(TextifyUpvotes, Transform);

TextifyUpvotes.prototype._transform = function transform(chunk, encoding, done) {
  this._buf.push(chunk);
  done();
};

TextifyUpvotes.prototype._flush = function flush(done) {
  const markup = Buffer.concat(this._buf).toString();
  const $ = load(markup);
  
  $('.votelinks a').each(function(i, el) {
    // Upvote Arrow used to be this:
    // <div class="votearrow" title="upvote"></div>
    $(this).html(`<span title="upvote">[upvote]</span>`);
  });
  
  this.push(new Buffer($.html()));
  done();
};

module.exports = TextifyUpvotes;

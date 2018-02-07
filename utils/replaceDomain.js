// Replaces the domain value in a cookie string or array of strings

module.exports = function replaceDomain(cookie, domain) {
  const replaceDomain = (cookie, domain) => cookie.replace(/(;\s?domain=)(.*)(;)/, '$1' + domain + '$3');
  
  if (typeof cookie === 'string') {
    return replaceDomain(cookie, domain);
  } else {
    return cookie.map((c) => replaceDomain(c, domain))
  }
};

var http = require('http');
var url = require('url');
var path = require('path');
var requestInstance = require('request');
var request_host_offline = 'http://offline.baidu.com';
var request_host_online = 'http://baidu.com';
var request_host = request_host_online;
var base_param = {
  xxxx: 111
};
var authInfo = {
  'SID3082451377': 'eyJpdiI6IjNPNXNXNlwvS3FNTXFiMXhtME15cXVBPT0iLCJ2YWx1ZSI6IldmbEJKdjYyaWhEUFppTXoyQWhCaCtnZDhCY2JIMUU5cmpMZ3BmMCt5WUxtdlhcL0ZTcVMzYU55ZlgrZXBKbENaRVwvMUhEcmdSNkk2QmRpZk9CUElESFE9PSIsIm1hYyI6ImQyODgxZDE1ZDQ2ODk5MDM0Njc4Mjc0ZjYxN2Y1OGJmZTFmNjQ1MWQ5ODU1ODcyNjI3Y2EwZGJkYTJlNWNhNzEifQ'
};
var setParams = function(url, params) {
  var str = '';
  for (var i in params) {
    str += ('&' + i + '=' + encodeURIComponent(params[i]));
  }
  return url + (url.indexOf('?') > 0
    ? str
    : ('?' + str.slice(1)));
};
var getRequestJar = function() {
  var jar = requestInstance.jar();
  var authStr = '';
  for (var i in authInfo) {
    authStr += i + '=' + authInfo[i] + '; '
  }
  var cookie = requestInstance.cookie(authStr);
  jar.setCookie(cookie, request_host);
  return jar;
};
var index = 0;
var generatorId = function() {
  return++ index;
};
module.exports = {
  '/api/*' (request, response) {
    var urlParse = url.parse(request.url);
    var request_url = setParams(request_host + urlParse.path, base_param);
    var index = generatorId();
    console.log('【' + index + '， request：】' + request_url);
    requestInstance({
      method: 'POST',
      url: request_url,
      jar: getRequestJar(),
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    }, function(error, res, body) {
      console.log('【' + index + '，response：】' + res.statusCode);
      if (res.statusCode === 200) {
        response.json(JSON.parse(body));
      } else {
        response.json({statusCode: r.statusCode, responseBody: body});
      }
    });
  }
};

'use strict';
/**
   mock 代码太累，直接代理线上或线下的数据
   相关问题：https://github.com/dvajs/dva/issues/110
   
   依赖：
      npm install request
   剩余问题：
      表单相关未测试，如有麻烦自行修改发送的参数
*/
var http = require('http');
var url = require('url');
var path = require('path');
var requestInstance = require('request');

var request_host_offline = 'http://offline.baidu.com';
var request_host_online = 'http://baidu.com';

var request_host = request_host_online;

var base_param = {
  app_id: 10001
};

var authInfo = {
  'xxxx': 'xxxxx'
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

var getRequestHeaders = function(request) {
  var headers = Object.assign(request.headers);
  headers.host = url.parse(request_host).host;
  headers.referer = request_host;
  headers['X-Requested-With'] = 'XMLHttpRequest';
  return headers;
};

var generatorId = function() {
  var index = 0;
  return function() {
    return++ index;
  }
}();

module.exports = {
  '/api/*' (request, response) {
    var urlParse = url.parse(request.url);
    var request_url = setParams(request_host + urlParse.path, base_param);

    var index = generatorId();
    console.log('【' + index + '， request：】' + request_url);

    requestInstance({
      method: request.method,
      url: request_url,
      body: request.body,
      formData: request.formData,
      jar: getRequestJar(),
      headers: getRequestHeaders(request)
    }, function(error, resp, body) {
      console.log('【' + index + '，response：】' + resp.statusCode);
      if (resp.statusCode === 200) {
        var result;
        try {
          result = JSON.parse(body);
        } catch (ex) {
          result = {
            statusCode: resp.statusCode,
            responseBody: body
          };
        }
        response.json(result);
      } else {
        response.json({statusCode: resp.statusCode, responseBody: body});
      }
    });
  }
};

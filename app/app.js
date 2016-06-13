
(function(){
  'use strict';
  
  angular.module('zion', [
    'module.advert',
    'ui.router'
  ]).config(config);
  
  config.$inject = ['$locationProvider', '$urlRouterProvider', '$stateProvider'];
  function config($locationProvider, $urlRouterProvider, $stateProvider)
  {
    $locationProvider.hashPrefix('!');
    $urlRouterProvider.otherwise("/advert/index");
    if(!localStorage.adverts || JSON.parse(localStorage.adverts).length === 0 ) localStorage.adverts = JSON.stringify([
      {
        "name":"PHP Developer",
        "contact":{"tel":"011 222 5000","email":"recruit@mail.co.za"},
        "description":"LAMP Developer",
        "start":"2016-06-12T22:00:00.000Z",
        "end":"2016-06-29T22:00:00.000Z"
      }]);
  }
  
})();

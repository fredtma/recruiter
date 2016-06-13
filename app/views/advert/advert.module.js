(function(){
  'use strict';

  angular.module('module.advert', [
    'ui.router',
    'ngAnimate',
    'ui.bootstrap'
  ])
  .config(config);
  
  config.$inject = ['$stateProvider'];
  function config($stateProvider) {
    $stateProvider
    .state('advert',{
      url : "/advert/",
      abstract : true,
      template : '<div ui-view></div>'
    })
    .state('advert.index', {
      url: 'index',
      templateUrl: 'views/advert/advert.index.html',
      controller: 'advertIndexController'
    })
    .state('advert.create', {
      url: 'create',
      templateUrl: 'views/advert/advert.create.html',
      controller: 'advertCreateController'
    });
  }
})();
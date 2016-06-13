(function(){
  'use strict';
  
  angular.module('module.advert')
  .controller('advertIndexController', indexController)
  .controller('advertCreateController', createController);
  
  indexController.$inject = ['$scope'];
  function indexController($scope)
  {
    $scope.models = JSON.parse(localStorage.adverts || '[]');
    $scope.call   = {
      remove : remove
    }
    
    function remove(index)
    {
      if(!confirm("You are about to delete a record")) return;
      $scope.models.splice(index, 1);
      localStorage.adverts = JSON.stringify($scope.models);
    }
  }
  
  createController.$inject = ['$scope', '$state'];
  function createController($scope, $state)
  {
    $scope.property = {calendar: {}, errors: []};
    $scope.model    = {};
    $scope.call     = {
      open : open,
      submit: submit
    };
    
    
    function open(name)
    {
      $scope.property.calendar[name] = true;
    }
    
    function submit(form)
    {
      if(form.$invalid) return $scope.property.errors = [{detail: "Form is not valid"}];
      var models = JSON.parse(localStorage.adverts || '[]');
      models.push($scope.model);
      localStorage.adverts = JSON.stringify(models);
      $state.go('advert.index');
    }
  }
})();
'use strict';

angular.module('angularDjangoRegistrationAuthApp')
  .controller('LoginCtrl', function ($scope, $location, djangoAuth, Validate, Facebook) {

    $scope.loginBK = function (backend) {
        Facebook.login(function(response){
            var token = response.authResponse.accessToken;
            djangoAuth.socialLogin(token).then(function(){
                window.location.href='/';
            })
        }, {scope: 'email'});


    };


    $scope.model = {'username':'','password':''};
  	$scope.complete = false;
    $scope.login = function(formData){
      $scope.errors = [];
      Validate.form_validation(formData,$scope.errors);
      if(!formData.$invalid){
        djangoAuth.login($scope.model.username, $scope.model.password)
        .then(function(data){
        	// success case
//        	$location.path("/");
            window.location.href= '/';
        },function(data){
        	// error case
        	$scope.errors = data;
        });
      }
    }
  });

'use strict';

angular.module('angularDjangoRegistrationAuthApp')
  .controller('RegisterCtrl', function ($scope, djangoAuth, Validate) {
  	$scope.model = {'username':'','password':'','email':''};
  	$scope.complete = false;
    $scope.loginBK = function (backend) {

        if (backend == 'facebook') {
            OAuth.popup('facebook', function(error, success) {
                if (error) {

                }
                else {
                    var token = success.access_token;
                    djangoAuth.socialLogin(token).then(function(){
                        window.location.href='/';
                    })

                }
            });
        }

    };

    // oauth.io initilization
    OAuth.initialize('BVSX3xZ03scpoQwpKi5eeap1o8o');

    $scope.register = function(formData){
      $scope.errors = [];
      Validate.form_validation(formData,$scope.errors);
      if(!formData.$invalid){
        djangoAuth.register($scope.model.username,$scope.model.password1,$scope.model.password2,$scope.model.email)
        .then(function(data){
        	// success case
//        	$scope.complete = true;
                djangoAuth.login($scope.model.username, $scope.model.password1)
                    .then(function(data) {
                        // success case
                        window.location.href = '/';
                    });
        },function(data){
        	// error case
        	$scope.errors = data;
        });
      }
    }
  });

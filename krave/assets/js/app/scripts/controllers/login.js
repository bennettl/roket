'use strict';

angular.module('angularDjangoRegistrationAuthApp')
  .controller('LoginCtrl', function ($scope, $location, djangoAuth, Validate) {

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

    $scope.model = {'username':'','password':''};
  	$scope.complete = false;
    $scope.login = function(formData){
      $scope.errors = [];
      Validate.form_validation(formData,$scope.errors);
      if(!formData.$invalid){
        djangoAuth.login($scope.model.username, $scope.model.password)
        .then(function(data){
        	// success case
        	$location.path("/");
//            window.location.href= '/';
        },function(data){
        	// error case
        	$scope.errors = data;
        });
      }
    }
  });

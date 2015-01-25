(function () {
    'use strict';

    angular
        .module('application.auth.services')
        .factory('Users', Users);

    Users.$inject = ['$http', '$injector'];

    function Users($http, $injector) {
        var Users = {
            all: all
        };

        var Auth = $injector.get('Auth');
        var token = Auth.getToken();
        return Users;

        function all() {
            $http.defaults.headers.common['Authorization'] = 'JWT ' + token;
            return $http.get('/api/v1/users/');
        }
        function me() {
            $http.defaults.headers.common['Authorization'] = 'JWT ' + token;
            return $http.get('/api/v1/users/');
        }
    }
})();
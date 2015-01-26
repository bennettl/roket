(function() {
  var app;
    app = angular.module('krave.app.static', ['checklist-model', 'ui.bootstrap', 'ngCookies', 'ngSanitize', 'ngRoute', 'restangular', 'angular.filter', 'LocalStorageModule', 'angularDjangoRegistrationAuthApp']);
    var TEMPLATES_DIR = '/static/js/templates/';

    app.config(['$locationProvider', '$routeProvider', '$sceDelegateProvider', 'RestangularProvider',
        function($locationProvider, $routeProvider, $sceDelegateProvider, RestangularProvider) {
            $sceDelegateProvider.resourceUrlWhitelist([
                // Allow same origin resource loads.
                'self'

            ]);
            // Restangular
            RestangularProvider.setBaseUrl('/api/v1');
            RestangularProvider.setRequestSuffix('/');

            // Routing
            $routeProvider.
                when('/', {
                    controller: 'AppController',
                    templateUrl: TEMPLATES_DIR + 'post.html'
                }).
                when('/comments/:post_id', {
                    controller: 'CommentController',
                    templateUrl: TEMPLATES_DIR + 'comments.html'
                }).
                when('/category/:category_id/:category_name', {
                    controller: 'AppController',
                    templateUrl: TEMPLATES_DIR + 'post.html'
                }).
                when('/profile/:user_id', {
                    controller: 'AppController',
                    templateUrl: TEMPLATES_DIR + 'profile_posts.html'
                }).
                when('/about', {
                    controller: 'AppController',
                    templateUrl: TEMPLATES_DIR + 'about.html'
                }).
                when('/editProfile', {
                    controller: 'EditProfileCtrl',
                    templateUrl: TEMPLATES_DIR + 'edit_profile.html'
                });
            $locationProvider.html5Mode(true);
        }]);

    app.factory('PostFactory', function($http, $routeParams) {
        var postFactory = {};

        postFactory.getPosts = function(id){
            return $http.get('/api/v1/posts/').then(function(result) {
                return result.data;
            });
        };
        postFactory.getPostsByCategory = function(category_id){
            return $http.get('/api/v1/category/' + category_id).then(function(result) {
                return result.data;
            });
        };
        postFactory.getPostsByUser = function(user_id){
            return $http.get('/api/v1/user/' + user_id).then(function(result) {
                return result.data;
            });
        };
        postFactory.getPost = function(){
            return $http.get('/api/v1/posts/' + $routeParams.post_id).then(function(result) {
                return result.data;
            });
        };
        postFactory.getCategories = function(){
            return $http.get('/api/v1/categories/').then(function(result) {
                return result.data;
            });
        };
        postFactory.getUsers = function(){
            return $http.get('/api/v1/users/').then(function(result) {
                return result.data;
            });
        };
        postFactory.getUser = function(id){
            return $http.get('/api/v1/user/' + id).then(function(result) {
                return result.data;
            });
        };
        postFactory.getUrlData = function(url){
            return $http({method:"GET", url:'http://api.embed.ly/1/extract?key=1f4c7a2056794e52b0124e733778f0f1&url='+url+'&maxwidth=500'}).then(function(result){
                return result.data;
            })
        };
        postFactory.getEmbedData = function(url){
            return $http({method:"GET", url:'http://api.embed.ly/1/oembed?key=1f4c7a2056794e52b0124e733778f0f1&width=854&url='+url}).then(function(result){
                return result.data;
            })
        };

     
        return postFactory;
    });
    app.filter('isTodayCheck', function(){
        return function(input){
            var today = new Date();
            var date_string = today.getFullYear()+"-"+today.getMonth() + 1 + "-" + today.getDate();
            if(date_string == input) {
                return "Today";
            } else {
                return input;
            }
        }
    });
    app.controller('AuthModalCtrl', function($scope, $modal){
        $scope.signIn = function(){
            $modal.open({
                templateUrl: TEMPLATES_DIR + 'login_modal.html',
                controller: function($scope){
                    $scope.authSection = "login";

                    $scope.forgotPassword = function(){
                        $scope.authSection = "forgotPassword";
                    }
                }
            });
        }
        $scope.signUp = function(){
            $modal.open({
                templateUrl: TEMPLATES_DIR + 'register_modal.html'
            });
        }
    });
    app.controller('DropdownCtrl', function ($scope, $log, djangoAuth) {
        djangoAuth.profile().then(function (data) {
            $scope.user = data;

            $scope.status = {
                isopen: false
            };

            $scope.toggled = function (open) {
                $log.log('Dropdown is now: ', open);
            };

            $scope.toggleDropdown = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.status.isopen = !$scope.status.isopen;
            };
        });
    });

    app.controller('HeaderCtrl', function($scope, djangoAuth, $modal, PostFactory, Restangular) {
        djangoAuth.profile().then(function(data) {
            console.log(data);
            $scope.user = data;
        });
        $scope.open = function () {

            var modalInstance = $modal.open({
                controller: ModalInstanceCtrl,
                templateUrl: TEMPLATES_DIR + 'new_post_modal.html'

            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
            });
        };
        var ModalInstanceCtrl = function ($scope, $modalInstance) {
            djangoAuth.profile().then(function(data) {
                $scope.user = data;

                $scope.newPost = {
                    url: "",
                    title: "",
                    category: ""
                };

                $scope.parseVideoUrl = function (url) {
                    var original_url = url;
                    url = url.toLowerCase();

                    if (url.indexOf('youtube.com') > -1 || url.indexOf('vimeo.com') > -1) {

                        PostFactory.getUrlData(original_url).then(function (data) {
                            $scope.newPost.title = data.title;
                        });
                        return true;
                    }
                    return false;

                };
                $scope.submitNewPost = function () {
                    if (!$scope.parseVideoUrl($scope.newPost.url)) {
                        alert("Please enter a valid YouTube or Vimeo link.");
                    } else {
                        //post
                        var base_post = Restangular.all('post');
                        var new_post = {
                            url: $scope.newPost.url,
                            post_title: $scope.newPost.title,
                            author: $scope.user.id

                        };
                        base_post.post(new_post, "", {'X-CSRFToken': window.CSRF}, {'X-CSRFToken': window.CSRF}).then(function(newPost){
                            angular.forEach($scope.newPost.category, function(category) {
                                var category_assignment = Restangular.all('post/' + newPost.id +'/new_post_to_category');
                                var new_category_assignment = {
                                    category: category.id,
                                    post: newPost.id
                                };
                                category_assignment.post(new_category_assignment, '', {'X-CSRFToken': window.CSRF}, {'X-CSRFToken': window.CSRF}).then(function(){
                                    window.location.href='/';
                                })

                            });
                        });
                    }

                }
            });

            PostFactory.getCategories().then(function(data) {
                $scope.categories = data;

            });

            $scope.ok = function () {
                $modalInstance.dismiss('cancel');
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };


    });
    app.controller('EditProfileCtrl', ['$scope', '$http','$modal', 'PostFactory', '$filter', 'Restangular', 'djangoAuth', '$routeParams', function($scope, $http, $modal, PostFactory, $filter, Restangular, djangoAuth, $routeParams) {
        djangoAuth.profile().then(function(data){
            $scope.user = data;

            $scope.editProfile = function(){
                if($scope.user.old_password && $scope.user.password) {

                    $http.post("/rest-auth/password/change/", { new_password1: $scope.user.old_password, new_password2: $scope.user.password},
                        {headers: {'X-CSRFToken': window.CSRF}}).success(function (data) {
                            console.log(data);
                        })
                }
                var base_user = Restangular.all('user/'+$scope.user.id+'/edit');
                base_user.patch({email: $scope.user.email}, "", {'X-CSRFToken': window.CSRF}, {'X-CSRFToken': window.CSRF}).then(function(data){
                    $scope.success = true;
                });
            }
        });
    }]);

    app.controller('AppController', ['$scope', '$http','$modal', 'PostFactory', '$filter', 'Restangular', 'djangoAuth', '$routeParams', '$route',
        function($scope, $http, $modal, PostFactory, $filter, Restangular, djangoAuth, $routeParams, $route) {
        djangoAuth.profile().then(function(data) {
            $scope.user = data;
        });
        $scope.now = $filter('date')(new Date(), 'MMM dd yyyy');
        if($routeParams.user_id) {
            PostFactory.getUser($routeParams.user_id).then(function(data){
                $scope.profile_user = data.username;
            })

        }
            $scope.deletePost = function(post) {
                Restangular.setDefaultHeaders({'X-CSRFToken': window.CSRF}); //CSRF_TOKEN gathered elsewhere
                Restangular.one('post', post.id).remove().then(function(){
                    $route.reload();
                })
            };
            $scope.editPost = function (post) {
            var modalInstance = $modal.open({
                controller: ModalInstanceCtrl,
                templateUrl: TEMPLATES_DIR + 'new_post_modal.html',
                resolve: {
                    post: function(){
                        return post;
                    }
                }

            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
            });
        };
        var ModalInstanceCtrl = function ($scope, $modalInstance, post) {
            djangoAuth.profile().then(function(data) {

                $scope.user = data;
                if(post) {
                    $scope.newPost = {
                        url: post.url,
                        title: post.post_title,
                        categories: post.categories
                    };
                    $scope.editing = true;
                } else {
                    $scope.newPost = {
                        url: "",
                        title: "",
                        category: ""
                    };
                }

                $scope.parseVideoUrl = function (url) {
                    var original_url = url;
                    url = url.toLowerCase();

                    if (url.indexOf('youtube.com') > -1 || url.indexOf('vimeo.com') > -1) {

                        PostFactory.getUrlData(original_url).then(function (data) {
                            $scope.newPost.title = data.title;
                        });
                        return true;
                    }
                    return false;

                };
                $scope.submitNewPost = function () {
                    if (!$scope.parseVideoUrl($scope.newPost.url)) {
                        alert("Please enter a valid YouTube or Vimeo link.");
                    } else {
                        //post
                        var base_post = Restangular.all('post');
                        var new_post = {
                            url: $scope.newPost.url,
                            post_title: $scope.newPost.title,
                            category: $scope.newPost.category,
                            author: $scope.user.id

                        };
                        base_post.post(new_post, "", {'X-CSRFToken': window.CSRF}, {'X-CSRFToken': window.CSRF}).then(function(){
                            window.location.href='/';
                        })
                    }

                }
                $scope.editPost = function(){
                    if (!$scope.parseVideoUrl($scope.newPost.url)) {
                        alert("Please enter a valid YouTube or Vimeo link.");
                    } else {
                        var base_post = Restangular.all('post/' + post.id);
                        var new_post = {
                            url: $scope.newPost.url,
                            post_title: $scope.newPost.title,
                            category: $scope.newPost.category,
                            author: $scope.user.id

                        };
                        base_post.patch(new_post, "", {'X-CSRFToken': window.CSRF}, {'X-CSRFToken': window.CSRF}).then(function(){
                            window.location.href='/';
                        })
                    }
                }
            });

            PostFactory.getCategories().then(function(data) {
                $scope.categories = data;

            });


            $scope.ok = function () {
                $modalInstance.dismiss('cancel');
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };



        $scope.viewVideo = function (video) {
            PostFactory.getEmbedData(video).then(function(data){
                $modal.open({
                    template: data.html

                });
            });

        };


        $scope.hasVoted = function(post){
            if($scope.user) {
                var hasVoted = false;
                angular.forEach(post.votes, function (vote) {
                    if (vote.user == $scope.user.id) {
                        hasVoted = true;
                    }
                });
                if (hasVoted) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        };


        $scope.vote = function(post) {

            var base_vote = Restangular.all('vote/'+post.id+'/handle_vote');
            var new_vote = {
                user: $scope.user.id,
                post: post.id
            };

            base_vote.post(new_vote, "", {'X-CSRFToken': window.CSRF}, {'X-CSRFToken': window.CSRF}).then(function(data){
                $route.reload();
            });
        };
        if($routeParams.category_id) {
            PostFactory.getPostsByCategory($routeParams.category_id).then(function(data) {
                $scope.posts = data.posts;

                angular.forEach($scope.posts, function (post) {
                    //Todo
                PostFactory.getUrlData(post.url).then(function(result){
                    post.thumbnail = result.images[0].url;
                })
                });
            });
        }
        else if($routeParams.user_id) {
            PostFactory.getPostsByUser($routeParams.user_id).then(function(data) {
                $scope.posts = data.posts;

                angular.forEach($scope.posts, function (post) {
                    //Todo
                    PostFactory.getUrlData(post.url).then(function(result){
                        post.thumbnail = result.images[0].url;
                    })
                });
            });
        }
        else {
            PostFactory.getPosts().then(function (data) {
                console.log(data);
                $scope.posts = data;
                angular.forEach($scope.posts, function (post) {
                    //Todo
                PostFactory.getUrlData(post.url).then(function(result){
                    post.thumbnail = result.images[0].url;
                })
                });


            });
        }

    }]);

    app.directive('sidebar', ['$http', 'PostFactory', 'Restangular', 'djangoAuth', '$routeParams', '$modal',
        function($scope,$http,PostFactory,Restangular,djangoAuth,$routeParams,$modal) {
            return {
                restrict: 'E',
                templateUrl: TEMPLATES_DIR + 'sidebar.html',
                controller: function($scope, PostFactory, $routeParams){

                    $scope.isActive = function(section){
                        if($routeParams.category_id == section || (section == 'home' && !$routeParams.category_id)) {
                            return true;
                        }
                        return false;
                    };
                    PostFactory.getCategories().then(function(data) {
                        $scope.categories = data;

                    });
                    $scope.setActive = function(section) {
                        $scope.active_link = section;
                    }

                }
            }
        }]);

    app.controller('CommentController', ['$scope', '$http', 'PostFactory', 'Restangular', 'djangoAuth', '$routeParams', '$modal', '$route',
        function($scope,$http,PostFactory,Restangular,djangoAuth,$routeParams,$modal,$route){
            djangoAuth.profile().then(function(data) {
                $scope.user = data;
            });
            PostFactory.getPost().then(function (data) {
                $scope.post = data;
                PostFactory.getUrlData($scope.post.url).then(function(result){
                    $scope.post.thumbnail = result.images[0].url;




                    $scope.hasVoted = function(post){
                        if($scope.user) {
                            var hasVoted = false;
                            angular.forEach(post.votes, function (vote) {
                                if (vote.user == $scope.user.id) {
                                    hasVoted = true;
                                }
                            });
                            if (hasVoted) {
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    };


                    $scope.vote = function(post) {

                        var base_vote = Restangular.all('vote/'+post.id+'/handle_vote');
                        var new_vote = {
                            user: $scope.user.id,
                            post: post.id
                        };

                        base_vote.post(new_vote, "", {'X-CSRFToken': window.CSRF}, {'X-CSRFToken': window.CSRF}).then(function(data){
                            $route.reload();
                        });
                    };
                })
            });

            PostFactory.getCategories().then(function(data) {
                $scope.categories = data;

            });
            $scope.deleteComment = function(comment) {
                Restangular.setDefaultHeaders({'X-CSRFToken': window.CSRF}); //CSRF_TOKEN gathered elsewhere
                Restangular.one('comment', comment).remove().then(function(){
                    $route.reload();
                })
            };





            $scope.submitComment = function () {
                //post
                var base_comment = Restangular.all('comments');
                var new_comment = {
                    comment: $scope.comment,
                    user: $scope.user.id,
                    post: $routeParams.post_id

                };
                base_comment.post(new_comment, "", {'X-CSRFToken': window.CSRF}, {'X-CSRFToken': window.CSRF}).then(function(result){
                    $route.reload();

                })

            };
            $scope.replyToComment = function(comment) {
                $scope.replyTo = comment.id;

            };
            $scope.parent_comments = function(p){
                if (p.parent_comment === null){
                    return true;
                } else{
                    return;
                }
            };

            $scope.submitReply = function(comment){
                if(comment.reply) {
                    var base_reply = Restangular.all('replies');
                    var reply = {
                        post: comment.post,
                        user: $scope.user.id,
                        comment: comment.reply,
                        parent: comment.id
                    };
                    base_reply.post(reply, "", {'X-CSRFToken': window.CSRF}, {'X-CSRFToken': window.CSRF}).then(function(result){
                        comment.replies.push({
                            user: $scope.user.id,
                            author: $scope.user.username,
                            comment: comment.reply
                        })
                    })

                }
            };

            $scope.viewVideo = function (video) {
                PostFactory.getEmbedData(video).then(function(data){
                    $modal.open({
                        template: data.html

                    });
                });

            };
        }]);




}).call(this);
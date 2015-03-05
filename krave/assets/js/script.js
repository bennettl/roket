(function() {

    /**** MODULE ****/
    var app;
    app = angular.module('roket.app.static', ['checklist-model', 'ngAnimate', 'ui.bootstrap', 'ngCookies', 'ngSanitize', 'ngRoute', 'restangular', 'angular.filter', 'LocalStorageModule', 'angularDjangoRegistrationAuthApp', 'slugifier', 'angulartics', 'angulartics.google.analytics']);
    var TEMPLATES_DIR = '/static/js/templates/';
    
    /**** CONFIGURATION ****/
    app.config(['$locationProvider', '$routeProvider', '$sceDelegateProvider', 'RestangularProvider', '$analyticsProvider',
        function($locationProvider, $routeProvider, $sceDelegateProvider, RestangularProvider, $analyticsProvider) {
           
            $sceDelegateProvider.resourceUrlWhitelist([
                // Allow same origin resource loads.
                'self'
            ]);
            // Restangular
            RestangularProvider.setBaseUrl('/api/v1');
            RestangularProvider.setRequestSuffix('/');
            RestangularProvider.setDefaultHttpFields({cache: true});

            // Google Analytics
            $analyticsProvider.firstPageview(true); /* Records pages that don't use $state or $route */
            $analyticsProvider.withAutoBase(true);  /* Records full path */

            // Routing
            $routeProvider.
                when('/', {
                    controller: 'AppController',
                    templateUrl: TEMPLATES_DIR + 'post.html'
                }).
                when('/posts/:post_id', {
                    controller: 'CommentController',
                    templateUrl: TEMPLATES_DIR + 'comments.html'
                }).
                when('/category/:category_id/:category_name', {
                    controller: 'AppController',
                    templateUrl: TEMPLATES_DIR + 'post.html'
                }).
                when('/profile/:user_id/:user_name', {
                    controller: 'AppController',
                    templateUrl: TEMPLATES_DIR + 'profile_posts.html'
                }).
                when('/about', {
                    templateUrl: TEMPLATES_DIR + 'about.html'
                }).
                when('/terms', {
                    templateUrl: TEMPLATES_DIR + 'about.html'
                }).
                when('/privacy', {
                    templateUrl: TEMPLATES_DIR + 'about.html'
                }).
                when('/faq', {
                    templateUrl: TEMPLATES_DIR + 'about.html'
                }).
                when('/editProfile', {
                    controller: 'EditProfileCtrl',
                    templateUrl: TEMPLATES_DIR + 'edit_profile.html'
                });
                //    when('/comments/:post_id', {
                //     controller: 'CommentController',
                //     templateUrl: TEMPLATES_DIR + 'comments.html'
                // }).
            $locationProvider.html5Mode(true);
        }]);



    /**** SERVICES ****/

    app.factory('PostFactory', function($http, $routeParams) {
        var postFactory = {};

        // Returns a list of posts
        postFactory.getPosts = function(id){
            return $http.get('/api/v1/posts/').then(function(result) {
                return result.data;
            });
        };

        // Returns a list of posts by category
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
            url = encodeURIComponent(url);
            return $http({method:"GET", url:'http://api.embed.ly/1/oembed?key=1f4c7a2056794e52b0124e733778f0f1&url='+url+'&maxwidth=500'}).then(function(result){
                return result.data;
            })
        };
        postFactory.getEmbedData = function(url){
            url = encodeURIComponent(url);
            return $http({method:"GET", url:'http://api.embed.ly/1/oembed?autoplay=true&key=1f4c7a2056794e52b0124e733778f0f1&width=854&url='+url}).then(function(result){
                return result.data;
            })
        };
     
        return postFactory;
    });


    /**** FILTERS ****/

    app.filter('isTodayCheck', function(){
        return function(input){
            var today = new Date();
            var date_string = today.getFullYear()+"-"+today.getMonth() + 1 + "-" + today.getDate();
            if(date_string == input) {
                return "Today";
            } else {
                return input;
            }
        };
    });
    
    app.filter('firstCharacter', function(){
        return function(input){
            if(input) {
                return (input.charAt(0)).toUpperCase();
            }
        };
    });

    /**** CONTROLLERS ****/

    // Controller shows and hides alert messages
    app.controller('AlertCtrl', ['$scope', '$timeout', function($scope, $timeout){
        
        // Initially hide alert
        $scope.alert = false;
        $scope.status = "success";
        $scope.alertMessage = "";

        // Listen for DisplayAlertEvent
        $scope.$on('DisplayAlertEvent', function(event, status, message){
            
            // Show the alert
            $scope.show(status, message);

            // Hide the alert after 10 seconds
            $timeout(function(){
                $scope.hide();
            }, 10000);
        });
        
        // Show the alert
        $scope.show = function(status, message){
            $scope.status       = status;
            $scope.alertMessage = message;
            $scope.alert        = true;
        };

        // Hide the alert
        $scope.hide = function(){
            $scope.alert = false;
        };
    }]);

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
        
        // Load the user
        djangoAuth.profile().then(function (data) {
            $scope.user = data;
        });

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

    app.controller('HeaderCtrl', function($scope, djangoAuth, $modal, PostFactory, Restangular) {
        
        // Load user
        djangoAuth.profile().then(function(data) {
            $scope.user = data;
        });
        
        // Load categories
        PostFactory.getCategories().then(function(data) {
            $scope.categories = data;
        });

        $scope.open = function () {

            var modalInstance = $modal.open({
                controller: NewPostModalCtrl,
                templateUrl: TEMPLATES_DIR + 'new_post_modal.html'

            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
            });
        };
        
        var PostSubmissionCtrl = function ($scope, $modalInstance) {
            $scope.ok = function () {
                $modalInstance.dismiss('cancel');
            };
        };

        var NewPostModalCtrl = function ($rootScope, $scope, $modalInstance) {
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

                    // Only parse if the video is from youtube or vimeo
                    if (url.indexOf('youtube.com') > -1 || url.indexOf('vimeo.com') > -1) {

                        PostFactory.getUrlData(original_url).then(function (data) {
                            $scope.newPost.title = data.title;
                            $scope.newPost.thumbnail = data.thumbnail_url;
                        });
                        return true;
                    }
                    return false;

                };
                $scope.submitNewPost = function () {
                    
                    if (!$scope.parseVideoUrl($scope.newPost.url)) {

                        // Display an alert
                        $rootScope.$broadcast('DisplayAlertEvent', 'error', 'Please enter a valid YouTube or Vimeo link.');

                    } else {
                        //post
                        var base_post = Restangular.all('post');
                        var new_post = {
                            url: $scope.newPost.url,
                            thumbnail: $scope.newPost.thumbnail,
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

                                // When post is sucessful, hide the modal instance
                                category_assignment.post(new_category_assignment, '', {'X-CSRFToken': window.CSRF}, {'X-CSRFToken': window.CSRF}).then(function(){
                                    
                                    // Hide post modal modal
                                    $scope.ok();

                                    // show post submission modal
                                    $modal.open({
                                        controller: PostSubmissionCtrl,
                                        templateUrl: '/static/js/templates/post_submission_modal.html',
                                    });


                                    // Sent DisplayAlertEvent to view controller
                                    // $rootScope.$broadcast('DisplayAlertEvent', 'success' ,'Thank you for submitting…');

                                    //window.location.href='/';
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
                base_user.patch({email: $scope.user.email, display_name: $scope.user.display_name}, "", {'X-CSRFToken': window.CSRF}, {'X-CSRFToken': window.CSRF}).then(function(data){
                    $scope.success = true;
                });
            }
        });
    }]);

    app.controller('AppController', ['$rootScope', '$scope', '$http','$modal', 'PostFactory', '$filter', 'Restangular', 'djangoAuth', '$routeParams', '$route', '$filter',
        function($rootScope, $scope, $http, $modal, PostFactory, $filter, Restangular, djangoAuth, $routeParams, $route, $filter) {
        
        // Tell sidebar to show itself
        $rootScope.$broadcast('ShowSideBar');

        djangoAuth.profile().then(function(data) {
            $scope.user = data;

        });

        $scope.hideNewsletter = function() {
            $scope.newsletter = "hidden";
        };
        
        $scope.now = $filter('date')(new Date(), 'MMM dd yyyy');
        
        // If $routeParams contain user id, we're seeing a user
        if ($routeParams.user_id) {
            
            PostFactory.getUser($routeParams.user_id).then(function(data){
            
                if (data.display_name) {
                    $scope.profile_user = data.display_name;
                } else if (data.first_name) {
                    $scope.profile_user = data.first_name;
                } else {
                    $scope.profile_user = (data.username).charAt(0).toUpperCase() + (data.username).slice(1);
                }
                document.title = "Roket | " + $scope.profile_user;
            });
        }

        $scope.deletePost = function(post) {
            Restangular.setDefaultHeaders({'X-CSRFToken': window.CSRF}); //CSRF_TOKEN gathered elsewhere
            Restangular.one('post', post.id).remove().then(function(){
                $route.reload();
            });
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
                    template: data.html,
                    size: 'lg'

                });
            });
        };


        // Determine if a user vote relationship exists
        $scope.hasVoted = function(post){
            var hasVoted = false;
            if($scope.user) {
                angular.forEach(post.votes, function (vote) {
                    if (vote.user == $scope.user.id) {
                        hasVoted = true;
                    }
                });
            }
            return hasVoted;
        };

        $scope.getAuthorDisplay = function(author) {
            
            if (author.display_name) {
                return author.display_name;
            } else if (author.first_name) {
                return author.first_name;
            } else {
                return (author.username).charAt(0).toUpperCase() + (author.username).slice(1);
            }
        };

        // When the user clicks the upvote button
        $scope.vote = function(post) {

            var vote    = Restangular.all('vote/'+post.id+'/handle_vote');
            var params  = { user: $scope.user.id, post: post.id };

            // Creates a post to handle_vote, then update the current post with the information recieved from updatedPost that was returned
            vote.post(params, "", {'X-CSRFToken': window.CSRF}, {'X-CSRFToken': window.CSRF}).then(function(updatedPost){
                post.get_num_votes  = updatedPost.get_num_votes;
                post.votes          = updatedPost.votes;
            });
        };

        function compare(a,b) {
            if (a.get_num_votes > b.get_num_votes)
                return -1;
            if (a.get_num_votes < b.get_num_votes)
                return 1;
            return 0;
        }

        // If $routeParams has category_id, we're in a category section
        if ($routeParams.category_id) {
            PostFactory.getPostsByCategory($routeParams.category_id).then(function(data) {
                
                document.title = "Roket | " + data.name;

                $scope.posts = data.posts;

                $scope.posts = $filter('groupBy')($scope.posts, 'date_posted');
                $scope.posts = $filter('toArray')($scope.posts, true);

                angular.forEach($scope.posts, function(post) {
                    post.pageSize = 5;
                    post.i = 0;
                });

                angular.forEach($scope.posts, function (post) {
                    post.sort(compare);
                    angular.forEach(post, function(p){
                        if(post.i < post.pageSize) {
                            PostFactory.getUrlData(p.url).then(function (result) {
                                p.thumbnail = result.thumbnail_url;
                            })
                        }
                        post.i++;
                    })

                });

                $scope.loadThumbnails = function(scope, pageSize) {
                    angular.forEach(scope, function (post) {
                        PostFactory.getUrlData(post.url).then(function (result) {
                            post.thumbnail = result.thumbnail_url;
                        })

                    });

                }
                $scope.loadMore = function(posts){

                    $scope.loadThumbnails(posts, posts.pageSize+=5);
                };

            });
        } else if ($routeParams.user_id) {
            PostFactory.getPostsByUser($routeParams.user_id).then(function(data) {
                $scope.posts = data.posts;

                angular.forEach($scope.posts, function (post) {
                    //Todo
                    PostFactory.getUrlData(post.url).then(function(result){
                        post.thumbnail = result.thumbnail_url;
                    })
                });
            });
        } else {

            document.title = "Roket";

            PostFactory.getPosts().then(function (data) {


                $scope.posts = data;
                $scope.posts = $filter('groupBy')($scope.posts, 'date_posted');
                $scope.posts = $filter('toArray')($scope.posts, true);

                angular.forEach($scope.posts, function(post) {
                    post.pageSize = 5;
                    post.i = 0;
                });

                angular.forEach($scope.posts, function (post) {
                    post.sort(compare);
                    angular.forEach(post, function(p){
                        if(post.i < post.pageSize) {
                            //console.log(p);
                            PostFactory.getUrlData(p.url).then(function (result) {
                                p.thumbnail = result.thumbnail_url;
                            })
                        }
                        post.i++;
                    });
                });

                $scope.loadThumbnails = function(scope, pageSize) {
                    angular.forEach(scope, function (post) {
                        PostFactory.getUrlData(post.url).then(function (result) {
                            post.thumbnail = result.thumbnail_url;
                        });
                    });
                };

                $scope.loadMore = function(posts){
                    $scope.loadThumbnails(posts, posts.pageSize+=5);
                };

            });
        }

    }]);

    app.directive('sidebar', ['$http', 'PostFactory', 'Restangular', 'djangoAuth', '$routeParams', '$modal',
        function($scope,$http,PostFactory,Restangular,djangoAuth,$routeParams,$modal) {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: TEMPLATES_DIR + 'sidebar.html',
                controller: function($scope, PostFactory, $routeParams){
                    
                    // Initially sidebar is hidden
                    $scope.visible = false;

                    // On 'HideSideBar' event, hide the side bar
                    $scope.$on('HideSideBar', function(){
                        $scope.visible = false;

                    });

                     // On 'ShowSideBar' event, show the side bar
                    $scope.$on('ShowSideBar', function(){
                        $scope.visible = true;
                    });

                    $scope.isActive = function(section){
                        if($routeParams.category_id == section || (section == 'home' && !$routeParams.category_id && window.location.pathname == '/')) {
                            return true;
                        }
                        return false;
                    };

                    PostFactory.getCategories().then(function(data) {
                        $scope.categories = data;

                    });

                    $scope.setActive = function(section) {
                        $scope.active_link = section;
                    };
                }
            };
        }]);

    app.controller('CommentController', ['$scope', '$http', 'PostFactory', 'Restangular', 'djangoAuth', '$routeParams', '$modal', '$route',
        function($scope, $http, PostFactory, Restangular, djangoAuth, $routeParams, $modal, $route){
            
            djangoAuth.profile().then(function(data) {
                $scope.user = data;
            });

            PostFactory.getPost().then(function (data) {
                
                $scope.post = data;

                document.title = "Roket | " + $scope.post.post_title;

                PostFactory.getUrlData($scope.post.url).then(function(result){
                    $scope.post.thumbnail = result.thumbnail_url


                    $scope.getAuthorDisplay = function(author) {
                        if(author.display_name) {
                            return author.display_name;
                        }
                        else if(author.first_name) {
                            return author.first_name;
                        }
                        else {
                            return (author.username).charAt(0).toUpperCase() + (author.username).slice(1);
                        }
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
                if($scope.comment) {
                    base_comment.post(new_comment, "", {'X-CSRFToken': window.CSRF}, {'X-CSRFToken': window.CSRF}).then(function (result) {
                        $route.reload();

                    })
                }

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
                        });
                    });

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
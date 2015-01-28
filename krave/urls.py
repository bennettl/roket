from django.conf.urls import patterns, include, url
from django.conf import settings
from rest_framework.routers import DefaultRouter
from api.views import CategoryViewSet, PostViewSet, PostsViewSet, VoteViewSet, CommentsViewSet, CommentViewSet, \
    ReplyViewSet,CategoryListViewSet,UserViewSet
# from authentication.views import UserListCreateAPIView
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
from rest_auth.views import (Login, Logout, UserDetails, PasswordChange,
                             PasswordReset, PasswordResetConfirm)
admin.autodiscover()
router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'post', PostViewSet)
router.register(r'posts', PostsViewSet)
router.register(r'vote', VoteViewSet)
router.register(r'comments', CommentsViewSet)
router.register(r'comment', CommentViewSet)
router.register(r'replies', ReplyViewSet)
router.register(r'category', CategoryListViewSet)
router.register(r'user', UserViewSet)



urlpatterns = patterns('',
    url(r'^api/v1/', include(router.urls)),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/', include('allauth.urls')),
    url(r'^$', 'krave.views.public', name='public'),
    (r'^rest-auth/', include('rest_auth.urls')),
    (r'^rest-auth/registration/', include('rest_auth.registration.urls')),
    url(r'^login', 'krave.views.public', name='public'),
    url(r'^logout', 'krave.views.public', name='public'),
    url(r'^register', 'krave.views.public', name='public'),
    url(r'^userProfile', 'krave.views.public', name='public'),
    url(r'^comments', 'krave.views.public', name='public'),
    url(r'^category', 'krave.views.public', name='public'),
    url(r'^editProfile', 'krave.views.public', name='public'),
    url(r'^profile', 'krave.views.public', name='public'),
    url(r'^about', 'krave.views.public', name='public'),
    # url(r'post', UserListCreateAPIView.as_view()),
    # url(r'^register', 'krave.views.public', name='public'),
    # url(r'api/v1/auth/login/', 'rest_framework_jwt.views.obtain_jwt_token'),
    # url(r'api/v1/users/', UserListCreateAPIView.as_view()),

)

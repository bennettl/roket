from django.conf.urls import patterns, include, url
from django.conf import settings
from rest_framework.routers import DefaultRouter
from api.views import CategoryViewSet, PostViewSet, PostsViewSet, VoteViewSet, CommentsViewSet, CommentViewSet, \
    ReplyViewSet,CategoryListViewSet,UserViewSet
# from authentication.views import UserListCreateAPIView
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
from django.views.generic import TemplateView

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

    url(r'^password-reset/$',
        TemplateView.as_view(template_name="password_reset.html"),
        name='password-reset'),
    url(r'^password-reset/confirm/$',
        TemplateView.as_view(template_name="password_reset_confirm.html"),
        name='password-reset-confirm'),

    # this url is used to generate email content
    url(r'^password-reset/confirm/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        TemplateView.as_view(template_name="password_reset_confirm.html"),
        name='password_reset_confirm'),

)

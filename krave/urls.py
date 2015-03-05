from django.conf.urls import patterns, include, url
from django.conf import settings
from rest_framework.routers import DefaultRouter
from api.views import CategoryViewSet, PostViewSet, PostsViewSet, VoteViewSet, CommentsViewSet, CommentViewSet, \
    ReplyViewSet,CategoryListViewSet,UserViewSet
# from authentication.views import UserListCreateAPIView
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
from django.views.generic import TemplateView
import debug_toolbar

from rest_auth.views import (Login, Logout, UserDetails, PasswordChange,
                             PasswordReset, PasswordResetConfirm)
admin.autodiscover()

# Routes for /api/v1
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
    # User
    url(r'^login', 'krave.views.public', name='public'),
    url(r'^logout', 'krave.views.public', name='public'),
    url(r'^register', 'krave.views.public', name='public'),
    url(r'^userProfile', 'krave.views.public', name='public'),
    url(r'^editProfile', 'krave.views.public', name='public'),
    url(r'^profile', 'krave.views.public', name='public'),
    # Posts
    url(r'^posts$', 'krave.views.public', name='public'),
    url(r'^posts/(?P<pk>\d+)', 'krave.views.postDetail', name='post-detail'),
    url(r'^comments$', 'krave.views.public', name='public'),
    url(r'^category', 'krave.views.public', name='public'),
    # Misc pages
    url(r'^about', 'krave.views.public', name='public'),
    url(r'^terms', 'krave.views.public', name='public'),
    url(r'^privacy', 'krave.views.public', name='public'),
    url(r'^faq', 'krave.views.public', name='public'),
    url(r'^passwordReset', 'krave.views.public', name='public'),
    url(r'^callback', 'krave.views.public', name='public'),
    url(r'^__debug__/', include(debug_toolbar.urls)),


    # url(r'^passwordResetConfirm', 'krave.views.public', name='public'),

    # this url is used to generate email content
    url(r'^passwordResetConfirm/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        TemplateView.as_view(template_name="password_reset_confirm.html"),
        name='password_reset_confirm'),


)

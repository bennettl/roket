from rest_framework import generics, permissions


from .serializers import PostSerializer
from .models import Post

from .permissions import PostAuthorCanEditPermission



# class UserDetail(generics.RetrieveAPIView):
#     model = Account
#     serializer_class = UserSerializer
#     lookup_field = 'username'


# class PostMixin(object):
#     model = Post
#     serializer_class = PostSerializer
#     permission_classes = [
#         PostAuthorCanEditPermission
#     ]


class UserPostList(generics.ListAPIView):
    model = Post
    serializer_class = PostSerializer

    def get_queryset(self):
        queryset = super(UserPostList, self).get_queryset()
        return queryset.filter(author__username=self.kwargs.get('username'))



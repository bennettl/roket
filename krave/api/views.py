from rest_framework import viewsets
from rest_framework import permissions
from rest_framework import status
from rest_framework.decorators import list_route, detail_route
from .models import Post, Category, Votes, Comments, Replies, User, CategoryToPost, UserProfile
from .serializers import CategorySerializer, PostSerializer, PostsSerializer, VoteSerializer, CommentsSerializer,\
    CommentSerializer, ReplySerializer, CategoryListSerializer, CustomUserSerializer
from django.http import HttpResponse
from rest_framework.response import Response
from mixins.api import viewsets as test
from pprint import pprint



class UserViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    queryset = User.objects.all()
    serializer_class = CustomUserSerializer

    @detail_route(methods=['patch', 'post'])
    def edit(self, request, pk=None):
        user = self.request.user
        user.email = request.data.get('email', '')
        profile = UserProfile.objects.get(user=user)
        profile.display_name = request.data.get('display_name', '')
        profile.save()
        user.save()
        return HttpResponse(status=200)

class PostViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    queryset = Post.objects.all()
    serializer_class = PostSerializer


    @detail_route(methods=['patch', 'post'])
    def new_post_to_category(self, request, pk=None):
        post = Post.objects.get(pk=request.data.get('post', ''))
        category = Category.objects.get(pk=request.data.get('category', ''))
        CategoryToPost.objects.create(
            post=post,
            category=category
        )
        return HttpResponse(status=status.HTTP_200_OK)


class PostsViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    queryset = Post.objects.all()
    serializer_class = PostsSerializer

    def filter_queryset(self, queryset):
        queryset = super(PostsViewSet, self).filter_queryset(queryset)
       # pprint (vars(self.request))

        # If pk kwargs is found, that mean we're in a detail page, show all posts
        try:
            pk = self.kwargs['pk']
            return queryset.order_by('-date_posted')

        # Else, we're in list sets, show only posts which are active
        except KeyError:
            return queryset.filter(active=True).order_by('-date_posted')





class CategoryListViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    queryset = Category.objects.all()
    serializer_class = CategoryListSerializer

    def filter_queryset(self, queryset):
        queryset = super(CategoryListViewSet, self).filter_queryset(queryset)
        return queryset.order_by('-date_posted')


class CategoryViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    queryset = Category.objects.all()
    serializer_class = CategoryListSerializer


class VoteViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    queryset = Votes.objects.all()
    serializer_class = VoteSerializer

    @detail_route(methods=['post','patch'])
    def handle_vote(self, request, pk=None):
        """
        Processes the vote, creates a vote when one doesn't exist, and removes it when it does exit
        """
        post = Post.objects.get(pk=pk)
        vote = Votes.objects.filter(post=post, user=self.request.user)

        # If the Post - Vote connection exists, delete vote
        if vote.count() == 1:
            vote.delete()
            status_code = status.HTTP_200_OK
        # Else, the Post - Vote connection doesn't exist, create the vote
        else:
            Votes.objects.create(post=post, user=self.request.user)
            status_code = status.HTTP_201_CREATED

        # Returns the serialized Post data, and status code
        return Response(PostsSerializer(post).data, status=status_code)

    @detail_route(methods=['delete'])
    def delete_vote(self, request, pk=None):
        vote = Votes.objects.filter(pk=pk)
        vote.delete()
        return HttpResponse(status=200)


class CommentsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    queryset = Comments.objects.all()
    serializer_class = CommentsSerializer

    @detail_route(methods=['delete'])
    def delete_comment(self, request, pk=None):
        comment = Comments.objects.filter(pk=pk)
        comment.delete()
        return HttpResponse(status=200)


class CommentViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    queryset = Comments.objects.all()
    serializer_class = CommentSerializer


class ReplyViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    queryset = Replies.objects.all()
    serializer_class = ReplySerializer

    #
    # @list_route(methods=['get'])
    # def get_replies(self, request, pk=None, *arks, **kwargs):
    #     replies = Comments.objects.filter(parent_comment=pk)
    #     return CommentViewSet().respond(dispatcher=self, queryset=replies.all())

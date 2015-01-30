from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.decorators import detail_route


from .models import Post, Category, Votes, Comments, Replies


class UserSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()
    # display_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'profile_image',  )

    def get_profile_image(self, obj):
        return obj.profile.profile_image_url()
    #
    # def get_display_name(self, obj):
    #     return obj.profile.display_name


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = ('id', 'name', 'ordering_index', )


class PostSerializer(serializers.ModelSerializer):

    class Meta:
        model = Post
        fields = ('id', 'author', 'url', 'post_title', 'date_posted', )


class VoteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Votes
        fields = ('id', 'user', 'post', )


class CommentsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Comments
        fields = ('user', 'comment', 'post',)


class ReplySerializer(serializers.ModelSerializer):

    author = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()
    # display_name = serializers.SerializerMethodField()

    class Meta:
        model = Replies
        fields = ('id', 'user', 'date_posted', 'comment', 'parent', 'author', 'profile_image', )

    def get_author(self, obj):
        return obj.user.username
    def get_profile_image(self, obj):
        return obj.user.profile.profile_image_url()

    # def get_display_name(self, obj):
    #     return obj.profile.display_name


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    replies = ReplySerializer(source="replies_set.all", many=True)

    class Meta:
        model = Comments
        fields = ('id', 'user', 'date_posted', 'comment', 'post', 'replies', )


class PostsSerializer(serializers.ModelSerializer):
    author = UserSerializer()
    votes = VoteSerializer(source='votes_set.all', many=True)
    comments = CommentSerializer(source='comments_set.all', many=True)
    categories = CategorySerializer(many=True)

    class Meta:
        model = Post
        fields = ('id', 'author', 'url', 'post_title', 'date_posted', 'get_num_votes', 'votes', 'comments',
                  'get_num_replies', 'categories', )


class CategoryListSerializer(serializers.ModelSerializer):

    posts = PostsSerializer(source="post_set.all", many=True)

    class Meta:
        model = Category
        fields = ('id', 'name', 'posts', )



class CustomUserSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()
    posts = PostsSerializer(source="post_set.all", many=True)
    # display_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'posts', 'profile_image', )

    def get_profile_image(self, obj):
        return obj.profile.profile_image_url()

    # def get_display_name(self, obj):
    #     return obj.profile.display_name

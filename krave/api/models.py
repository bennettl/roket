from django.db import models
from django.contrib.auth.models import User
import hashlib
from allauth.socialaccount.models import SocialAccount

class UserProfile(models.Model):
    user = models.OneToOneField(User, related_name='profile')
    display_name = models.CharField(max_length=300, null=True, blank=True)

    def __unicode__(self):
        return "{}'s profile".format(self.user.username)

    def get_display_name(self):
        return self.display_name

    def profile_image_url(self):
        fb_uid = SocialAccount.objects.filter(user_id=self.user.id, provider='facebook')

        if len(fb_uid):
            return "http://graph.facebook.com/{}/picture?width=40&height=40".format(fb_uid[0].uid)

        # return "http://www.gravatar.com/avatar/{}?s=40".format(hashlib.md5(self.user.email).hexdigest())
        #return "http://www.gravatar.com/avatar/00000000000000000000000000000000?d=mm&f=y"
        return False

    class Meta:
        db_table = 'user_profile'

User.profile = property(lambda u: UserProfile.objects.get_or_create(user=u, display_name=u)[0])


class Category(models.Model):
    name = models.CharField(max_length=300, null=True, blank=True)
    ordering_index = models.IntegerField(default=1, null=True, blank=True)


class Post(models.Model):
    author = models.ForeignKey(User, null=True, blank=True)
    post_title = models.CharField(max_length=300, null=True, blank=True)
    date_posted = models.DateField(db_index=True, auto_now_add=True, null=True, blank=True, verbose_name='Date Posted')
    url = models.CharField(max_length=300, null=True, blank=True)
    categories = models.ManyToManyField(Category, blank=True, null=True, through='CategoryToPost')
    active = models.BooleanField(default=True, db_index=True)

    def get_num_votes(self):
        votes = self.votes_set.filter(post=self)
        return votes.count()

    def get_num_replies(self):
        total = 0

        comments = self.comments_set.all()
        for comment in comments:
            total += 1
            for reply in comment.replies_set.all():
                total += 1
        return total


class CategoryToPost(models.Model):
    post = models.ForeignKey(Post)
    category = models.ForeignKey(Category)


class Votes(models.Model):
    post = models.ForeignKey(Post, null=True, blank=True)
    user = models.ForeignKey(User, null=True, blank=True)
    date_posted = models.DateField(db_index=True, auto_now_add=True, null=True, blank=True, verbose_name='Date Voted')

    class Meta:
        unique_together = ('post', 'user')


class Comments(models.Model):
    post = models.ForeignKey(Post, null=True, blank=True)
    user = models.ForeignKey(User, null=True, blank=True)
    comment = models.TextField(max_length=1000, null=True, blank=True)
    date_posted = models.DateTimeField(null=True, blank=True, auto_now_add=True)


class Replies(models.Model):
    parent = models.ForeignKey(Comments, null=True, blank=True)
    user = models.ForeignKey(User, null=True, blank=True)
    comment = models.TextField(max_length=1000, null=True, blank=True)
    date_posted = models.DateTimeField(null=True, blank=True, auto_now_add=True)


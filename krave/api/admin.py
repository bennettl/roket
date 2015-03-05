from django.contrib import admin
from .models import Post, Category, CategoryToPost
from django.core.urlresolvers import reverse

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug' )

class CategoryToPostInline(admin.TabularInline):
    model = CategoryToPost
    extra = 1

class PostAdmin(admin.ModelAdmin):
    list_display = ('post_title','get_num_votes', 'vote_boost', 'author', 'date_posted', 'active', 'view_link')
    fields = ['post_title', 'author', 'url' ,'vote_boost', 'active']
    inlines = [CategoryToPostInline]


    # Return link to post
    def view_link(self, obj):
        return u"<a href='/posts/%d'>View</a>" % obj.id
    view_link.short_description = ''
    view_link.allow_tags = True


    def save_model(self, request, obj, form, change):
        obj.author = request.user
        obj.save()

admin.site.register(Post, PostAdmin)
admin.site.register(Category, CategoryAdmin)

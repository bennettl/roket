from django.contrib import admin
from .models import Post, Category, CategoryToPost, UserProfile

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', )

class CategoryToPostInline(admin.TabularInline):
    model = CategoryToPost
    extra = 1

class PostAdmin(admin.ModelAdmin):
    inlines = [CategoryToPostInline]

    def save_model(self, request, obj, form, change):
        obj.author = request.user
        obj.save()

admin.site.register(Post, PostAdmin)
admin.site.register(UserProfile, UserProfile)
admin.site.register(Category, CategoryAdmin)

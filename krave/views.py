from django.shortcuts import render, get_object_or_404
from django.template import RequestContext
from krave.api.models import Post

# All public views will route to this
def public(request):
    meta = {
            'title': 'Roket',
            'description': 'Roket.tv brings you the best new videos, every day.',

            'url': request.build_absolute_uri(request.get_full_path()),
            'thumbnail': 'http://roket.tv/static/js/images/logo.png'
    }
    return render(request, 'base.html', { 'meta' : meta })
    #return render_to_response('base.html', context_instance=RequestContext(request))

# Post detail, render base template with information for meta tags
def postDetail(request, pk):
    post = get_object_or_404(Post, pk=pk)
    meta = {
            'title' : "Roket | %s" % post.post_title,
            'description': 'Check out "%s" on Roket.tv! We bring you the best new videos, every day.' % post.post_title,
            'url': request.build_absolute_uri(request.get_full_path()),
            'thumbnail': post.thumbnail
    }
    return render(request, 'base.html', { 'meta' : meta })

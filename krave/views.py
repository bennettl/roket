from django.shortcuts import render_to_response
from django.template import RequestContext


def public(request):
    return render_to_response('base.html', context_instance=RequestContext(request))

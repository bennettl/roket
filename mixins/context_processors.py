from django.conf import settings


def expose_settings(request):
    exposed = {}
    if hasattr(settings, 'SETTINGS_PASSED_TO_TEMPLATE'):
        for s in settings.SETTINGS_PASSED_TO_TEMPLATE:
            exposed[s] = getattr(settings, s)
    return exposed

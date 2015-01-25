from django import forms


class NamedErrorMessagesMixin(object):
    ''' Gives more descript error messages.  Useful for sending as an API response '''

    def __init__(self, *args, **kwargs):
        super(NamedErrorMessagesMixin, self).__init__(*args, **kwargs)
        for name, field in self.fields.items():
            clean_name = field.label
            if type(clean_name) != str:
                clean_name = (name[0].upper() + name[1:]).replace('_', ' ')
            if clean_name:
                field.error_messages['required'] = "%s is required" % (clean_name)


class InstanceDoesNotRequireFieldsMixin(object):
    ''' Mixin that will only validate form fields that are being saved '''

    def _clean_fields(self):
        if self.instance:
            for name, field in self.fields.items():
                if not name in self.data:
                    attr = getattr(self.instance, name)
                    if attr:
                        self.data[name] = attr

        return super(InstanceDoesNotRequireFieldsMixin, self)._clean_fields()

    def clean(self):
        if self.instance:
            for name, field in self.fields.items():
                if not name in self.cleaned_data:
                    attr = getattr(self.instance, name)
                    if attr:
                        self.cleaned_data[name] = attr

        return super(InstanceDoesNotRequireFieldsMixin, self).clean()

from django.db import models
from django.conf import settings

import logging
import reversion

from . import extract


class DateMixin(models.Model):
    ''' Adds tracking for the times when an object was created and last updated '''

    class Meta:
        abstract = True
        ordering = ['-date_created']

    date_created = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    date_updated = models.DateTimeField(auto_now=True, null=True, blank=True)


class CreatedByMixin(models.Model):
    ''' Useful for having a generic way to track the user who created an object '''

    class Meta:
        abstract = True

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, default=None, null=True, blank=True)


class DictionaryAsObject(object):
    def __init__(self, dic):
        self.dic = dic
        for k, v in dic.items():
            setattr(self, k, v)


class DefaultValuesMixin(models.Model):
    ''' Adds was and started_as properties to an object which allow you to track previous states '''

    NOT_FOUND_ON_CACHE = 'NOT_FOUND_ON_CACHE'

    class Meta:
        abstract = True

    @classmethod
    def reset_state(cls, sender, instance, **kwargs):
        instance.reset()

    def reset(self):
        self.was = DictionaryAsObject(self._as_dict())
        self.started_as = DictionaryAsObject(self._as_dict())

    def __init__(self, *args, **kwargs):
        super(DefaultValuesMixin, self).__init__(*args, **kwargs)
        models.signals.post_save.connect(DefaultValuesMixin.reset_state, sender=self.__class__,
                                         dispatch_uid='%s-DefaultValues-sweeper' % self.__class__.__name__)
        DefaultValuesMixin.reset_state(sender=self.__class__, instance=self)

    def _as_dict(self):
        dic = {}
        for f in self._meta.local_fields:
            if not f.rel:
                val = getattr(self, f.name, DefaultValuesMixin.NOT_FOUND_ON_CACHE)
                if val != DefaultValuesMixin.NOT_FOUND_ON_CACHE:
                    dic[f.name] = val
            else:
                val =getattr(self, f.name+'_id', DefaultValuesMixin.NOT_FOUND_ON_CACHE)
                if val != DefaultValuesMixin.NOT_FOUND_ON_CACHE:
                    dic[f.name+'_id'] = val
        return dic

    def get_dirty_fields(self, filter=True):
        new_state = self._as_dict()
        dirty = dict([(key, value) for key, value in self.was.dic.iteritems() if value != new_state[key]])
        if filter:
            dirty = self.filter(dirty)
        return dirty

    def is_dirty(self):
        # in order to be dirty we need to have been saved at least once, so we
        # check for a primary key and we need our dirty fields to not be empty
        if not self.pk:
            return True
        return {} != self.get_dirty_fields()

    def filter(self, to_filter):
        if self.__class__.TRACK_DIRTY_FIELDS:
            return extract(to_filter, self.__class__.TRACK_DIRTY_FIELDS)

        logging.warn('You specified to filter dirty fields on %s but you did not specify TRACK_DIRTY_FIELDS' % (self.__class__))
        return to_filter

    def get_changed_fields(self, filter=True):
        new_state = self._as_dict()
        changed = dict([(key, value) for key, value in self.started_as.dic.iteritems() if value != new_state[key]])
        if filter:
            changed = self.filter(changed)

        final_state = {}
        for key in changed.keys():
            if '_id' in key:
                final_state[key[:-3]] = changed[key]
            else:
                final_state[key] = changed[key]
        return changed

    def get_changed_field_names(self):
        def field_map(key):
            if '_id' in key:
                key = key[:-3]
            return self._meta.get_field_by_name(key)[0].help_text

        changed_field_names = map(field_map, self.get_changed_fields().keys())
        if not all(changed_field_names):
            # Should be caught by a test case
            logging.warn('There is a field in the set %s that does not have help text and you are referencing it.' % (', '.join(self.get_changed_fields().keys())))
        return changed_field_names


class DeletingMixin(object):
    ''' Sets is_deleting to True if the object is being deleted '''

    def __init__(self, *args, **kwargs):
        self.is_deleting = False
        super(DeletingMixin, self).__init__(*args, **kwargs)

    def delete(self, *args, **kwargs):
        self.is_deleting = True
        super(DeletingMixin, self).delete(*args, **kwargs)


class ReversionMixin(object):
    ''' Uses django-reversion to track the state of the object on every save'''
    def save(self, reversion_user_and_comment=None, *args, **kwargs):
        with reversion.create_revision():
            super(ReversionMixin, self).save(*args, **kwargs)
            if reversion_user_and_comment:
                try:
                    user, comment = reversion_user_and_comment
                    reversion.set_user(user)
                    reversion.set_comment(comment)
                except ValueError:
                    raise ValueError("Reversion was expecting user and comment tuple")

    def delete(self, reversion_user_and_comment=None, *args, **kwargs):
        with reversion.create_revision():
            super(ReversionMixin, self).delete(*args, **kwargs)
            if reversion_user_and_comment:
                try:
                    user, comment = reversion_user_and_comment
                    reversion.set_user(user)
                    reversion.set_comment(comment)
                except ValueError:
                    raise ValueError("Reversion was expecting user and comment tuple")


class BasicNonCachedMixin(DefaultValuesMixin, DeletingMixin, DateMixin):
    ''' Convient way to add a full set of mixins '''

    class Meta:
        abstract = True



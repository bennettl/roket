import string
import logging
import random

from django.db import models


class RandomField(models.CharField):
    MAX_LOOPS = 10

    def __init__(self, seed=string.ascii_lowercase + string.digits, *args, **kwargs):
        self.seed = seed
        super(RandomField, self).__init__(*args, **kwargs)

    def contribute_to_class(self, class_, key):
        super(RandomField, self).contribute_to_class(class_, key)
        models.signals.pre_save.connect(self.generate_unique, sender=class_)

    def generate_unique(self, sender, instance, *args, **kwargs):
        if not getattr(instance, self.attname):
            value = None
            for i in range(0, RandomField.MAX_LOOPS):
                value = ''.join(random.choice(self.seed) for x in range(self.max_length))
                if sender.objects.filter(**{self.name: value}).count() > 0:
                    value = None
                else:
                    break

            if i == RandomField.MAX_LOOPS:
                error = "Could not generate a unique field for field %s.%s!" % (sender._meta.module_name, self.name)
                logging.error(error)
                return
            elif i >= RandomField.MAX_LOOPS * 2/3:
                logging.warning("Looped 2/3 the max allowable loops for unique field on %s.%s consider upping the length of the keys" % (sender._meta.module_name, self.name))

            setattr(instance, self.attname, value)

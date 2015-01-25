from rest_framework import mixins, status

class List(mixins.ListModelMixin):
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        return self.respond(queryset=queryset)


class Detail(mixins.RetrieveModelMixin):
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return self.respond(obj=instance)   # Assumes we are using GenericApiView


class Create(mixins.CreateModelMixin):
    def create(self, request, *args, **kwargs):
        return super(request, *args, **kwargs)


class Update(mixins.UpdateModelMixin):
    pass


class Destroy(mixins.DestroyModelMixin):
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return self.respond(status=status.HTTP_204_NO_CONTENT)

    def perform_destroy(self, instance):
        instance.delete()


def CreatedByFilterMixin(created_by='created_by'):
    class CreatedByFilterMixin(object):
        def get_queryset(self):
            """
            This view should return a list of all the purchases
            for the currently authenticated user.
            """
            query = {}
            query[created_by] = self.request.user
            return self.queryset.filter(**query)
    return CreatedByFilterMixin


def FilterByMixin(**query):
    class FilterBy(object):
        def get_queryset(self):
            return self.queryset.filter(**query)
    return FilterBy

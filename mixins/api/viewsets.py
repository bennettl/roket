from rest_framework import renderers, status, viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.utils.serializer_helpers import ReturnDict

from .renderers import JSONRenderer
from .serializers import PaginationSerializer

from . import RESULTS_FIELD, ERROR_FIELD


class GenericAPIView(viewsets.GenericViewSet):
    renderer_classes = (JSONRenderer, renderers.BrowsableAPIRenderer)
    pagination_serializer_class = PaginationSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def respond(self, dispatcher=None, obj=None, objs=None, queryset=None, raw=None, error=None, status=status.HTTP_200_OK):
        if dispatcher:
            # another class dispatched this method.  we need to take its args
            self.args = dispatcher.args
            self.kwargs = dispatcher.kwargs
            self.request = dispatcher.request
            self.format_kwarg = dispatcher.format_kwarg

        data = {}

        if not queryset is None:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_pagination_serializer(page)
            else:
                serializer = self.get_serializer(queryset, many=True)
            data = serializer.data
        elif not obj is None:
            serializer = self.get_serializer(obj)
            data[RESULTS_FIELD] = serializer.data
        elif not objs is None:
            results = [self.get_serializer(obj_).data for obj_ in objs]
            data[RESULTS_FIELD] = results
        elif not raw is None:
            data = raw

        if not error is None:
            data[ERROR_FIELD] = error
            # @TODO - Errors are not coming through

        return Response(data, status=status)

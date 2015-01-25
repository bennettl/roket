from rest_framework import serializers, pagination

from . import RESULTS_FIELD


class PaginationSerializer(pagination.BasePaginationSerializer):
    total_count = serializers.ReadOnlyField(source='paginator.count')
    next = pagination.NextPageField(source='*')
    previous = pagination.PreviousPageField(source='*')

    results_field = RESULTS_FIELD


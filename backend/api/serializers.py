from rest_framework import serializers
from . import models

class PhotoSubmissionSerializer(serializers.ModelSerializer):
    source_url = serializers.SerializerMethodField()

    class Meta:
        model = models.PhotoSubmission
        fields = ['id', 'applicant_id', 'source', 'source_url', 'background_removed', 'metadata', 'created_at', 'updated_at']
        read_only_fields = ['id', 'source_url', 'background_removed', 'metadata', 'created_at', 'updated_at']

    def get_source_url(self, obj) -> str | None:
        request = self.context.get('request')
        if obj.source and request:
            return request.build_absolute_uri(obj.source.url)
        return None

class SignatureSubmissionSerializer(serializers.ModelSerializer):
    source_url = serializers.SerializerMethodField()

    class Meta:
        model = models.SignatureSubmission
        fields = ['id', 'applicant_id', 'source', 'source_url', 'extracted', 'metadata', 'created_at', 'updated_at']
        read_only_fields = ['id', 'source_url', 'extracted', 'metadata', 'created_at', 'updated_at']

    def get_source_url(self, obj) -> str | None:
        request = self.context.get('request')
        if obj.source and request:
            return request.build_absolute_uri(obj.source.url)
        return None

class ProcessingResultSerializer(serializers.ModelSerializer):
    photo = PhotoSubmissionSerializer(read_only=True)
    signature = SignatureSubmissionSerializer(read_only=True)

    class Meta:
        model = models.ProcessingResult
        fields = ['id', 'applicant_id', 'photo', 'signature', 'is_valid', 'rules_triggered', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

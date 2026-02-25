from django.db import models

class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class PhotoSubmission(TimestampedModel):
    applicant_id = models.CharField(max_length=64)
    source = models.ImageField(upload_to='uploads/photos/')
    background_removed = models.ImageField(upload_to='processed/photos/', null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    def __str__(self) -> str:
        return f'PhotoSubmission({self.applicant_id})'

class SignatureSubmission(TimestampedModel):
    applicant_id = models.CharField(max_length=64)
    source = models.ImageField(upload_to='uploads/signatures/')
    extracted = models.ImageField(upload_to='processed/signatures/', null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    def __str__(self) -> str:
        return f'SignatureSubmission({self.applicant_id})'

class ProcessingResult(TimestampedModel):
    applicant_id = models.CharField(max_length=64)
    photo = models.ForeignKey(PhotoSubmission, on_delete=models.CASCADE, related_name='results')
    signature = models.ForeignKey(SignatureSubmission, on_delete=models.CASCADE, related_name='results')
    is_valid = models.BooleanField(default=False)
    rules_triggered = models.JSONField(default=list, blank=True)

    def __str__(self) -> str:
        return f'ProcessingResult({self.applicant_id}, valid={self.is_valid})'

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

class SubmissionTests(APITestCase):

    def test_create_photo_submission_rejects_without_file(self):
        url = reverse('photo-submission-list')
        response = self.client.post(url, data={'applicant_id': 'SAMPLE'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_signature_submission_rejects_without_file(self):
        url = reverse('signature-submission-list')
        response = self.client.post(url, data={'applicant_id': 'SAMPLE'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

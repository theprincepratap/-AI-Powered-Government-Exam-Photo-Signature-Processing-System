from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views
router = DefaultRouter()
router.register('photos', views.PhotoSubmissionViewSet, basename='photo-submission')
router.register('signatures', views.SignatureSubmissionViewSet, basename='signature-submission')
router.register('results', views.ProcessingResultViewSet, basename='processing-result')
urlpatterns = router.urls + [path('templates/', views.TemplateListView.as_view(), name='template-list'), path('remove-background/', views.RemoveBackgroundView.as_view(), name='remove-background')]

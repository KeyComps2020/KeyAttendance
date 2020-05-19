"""key_api URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

#Note: This urls file is for the DJANGO PROJECT (key_api), the one in key/urls is specific to the key APP
#In other words, you could run django-admin startapp key2, and it would also have these urls since `key` and `key2`
#would be part of the same django project `key_api`.

from django.contrib import admin
from django.urls import include, path, re_path
from rest_framework_jwt.views import obtain_jwt_token
from key.views import token_auth
from django.views.generic import TemplateView #allows use of html file as path's page
from django.conf.urls.static import static
from django.conf import settings



urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html')),     #homepage
    path('api/', include('key.urls')),                              #include url paths in key/urls
    #path('api2/', include('otherApp.urls')),                       #example of how to add another app's urls
    #Note the separate of urls for the api (line above) from urls that deal with security (below)
    path('admin/', admin.site.urls),
    path('api-token-auth/', token_auth.TokenAuth.as_view()),

    re_path('^((?!media/).).*', TemplateView.as_view(template_name='index.html')), #regex path
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
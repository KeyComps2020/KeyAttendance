from django.core import serializers
from ..models import StudentInfo as StudentInfoModel
from ..models import Students, StudentColumn
from ..serializers import StudentInfoSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser, FileUploadParser
import time


class StudentInfo(APIView):

    parser_classes = (JSONParser, FormParser, MultiPartParser, FileUploadParser)

    def validateGet(self, request):
        if 'student_id' in request.query_params:
            try:
                StudentInfoModel.objects.filter(student_id=int(request.query_params['student_id']))
            except:
                return False
        return True
      
    def validatePatch(self, request):
        try:
            StudentInfoModel.objects.get(pk=request.data['id'])
        except:
            return False
        return True

    def validateInfo(self, info):
        if not 'student_id' in info or not 'info_id' in info:
            return False
        try:
            Students.objects.get(pk=info['student_id'])
            StudentColumn.objects.get(pk=info['info_id'])
        except:
            return False
        return True

    def validatePost(self, request):
        if (isinstance(request.data, list)):
            for item in request.data:
                if (not self.validateInfo(item)):
                    return False
            return True
        else:
            return self.validateInfo(request.data)

    # Get existing student data
    def get(self, request):
        if not request.user.has_perm('key.view_studentinfo'):
            return Response({'error':'You are not authorized to view student profile info.'}, status='401')
        if not self.validateGet(request):
            return Response({'error':'Invalid Parameters'}, status='400')
        
        info = StudentInfoModel.objects.filter(student_id=request.query_params['student_id'])
        serializer = StudentInfoSerializer(info, many=True)
        
        return Response(serializer.data, content_type='application/json')
      
    # Validate input for the DELETE request of this endpoint - should reference a valid key
    def validateDelete(self, request):
        try:
            StudentInfoModel.objects.get(pk=request.data['id'])
        except:
            return False
        return True
      
    def delete(self, request):
        if not self.validateDelete(request):
            return Response({'error':'Invalid Parameters'}, status='400')

        studentItem = StudentInfoModel.objects.get(pk=request.data['id'])
        studentItem.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
      
    # Create a new student
    def post(self, request):
        if not request.user.has_perm('key.add_studentinfo'):
            return Response({'error':'You are not authorized to create student profile info.'}, status='401')
        if not self.validatePost(request):
            return Response({'error':'Invalid Parameters'}, status='400')
        is_many = True if isinstance(request.data, list) else False
      
        if 'file' in request.data:
            photo = request.data['file']
            student_id = request.data['student_id']
            info_id = request.data['info_id']

            data = {
              'student_id': student_id,
              'info_id': info_id,
              'photo_value': photo
            }
            serializer = StudentInfoSerializer(data=data, partial=True, many=is_many)
            if serializer.is_valid():
              model = serializer.save()
              model.photo_url = model.photo_value.url
              model.save()
              returnSerializer = StudentInfoSerializer(model)
            
              return Response(returnSerializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = StudentInfoSerializer(data=request.data, partial=True, many=is_many)
            if serializer.is_valid():
              serializer.save()
              return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    # Update an existing student
    def patch(self, request):
        if not request.user.has_perm('key.change_studentinfo'):
            return Response({'error':'You are not authorized to update student profile info.'}, status='401')
        if not self.validatePatch(request):
            print("CANT VALIDATE PATCH")
            return Response({'error':'Invalid Parameters'}, status='400')

        obj = StudentInfoModel.objects.get(pk=request.data['id'])
        if 'file' in request.data:
            photo = request.data['file']
            student_id = request.data['student_id']
            info_id = request.data['info_id']
            id_ = request.data['id']

            data = {
              'student_id': student_id,
              'info_id': info_id,
              'photo_value': photo,
              'id': id_
            }
            serializer = StudentInfoSerializer(obj, data=data, partial=True)
            if serializer.is_valid():
              model = serializer.save()
              model.photo_url = model.photo_value.url
              model.save()
              returnSerializer = StudentInfoSerializer(model)
            
              return Response(returnSerializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = StudentInfoSerializer(obj, data=request.data, partial=True)
            if serializer.is_valid():
              serializer.save()
              return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

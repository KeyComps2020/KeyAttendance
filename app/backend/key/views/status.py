from django.core import serializers
from ..models import Students, AttendanceItems, StudentStatusParameters
from ..serializers import StudentStatusParametersSerializer as StatusSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..helpers import isValidDateTime, isValidTime
from django.db.models import Count
from django.db import models as models
from django.db.models import Q
from datetime import datetime, timedelta
import json

class Status(APIView):

    # Changes the requirements to be a Frequent User/Attendee 
    # and the time frame that they are measured in. 
    def patch(self, request):
        if not request.user.has_perm('key.change_userstatus'):
            print("401 Unauthorized: PATCH /api/students/")
            return Response({'error':'You are not authorized to update these parameters.'}, status='401')
        if not self.validatePatch(request):
            print("400 Bad Request: PATCH /api/students/ - We caught the error.")
            print(json.dumps(request.data))
            return Response({'error':'Invalid Parameters'}, status='400')

        obj = StudentStatusParameters.objects.get(pk=2)
        serializer = StatusSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            print("SUCCESSFULLY PATCHED USER CHANGE")
            print(json.dumps(request.data))
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        print("400 Bad Request: PATCH /api/user_status/ - Django caught the error.")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Validates that the request has the nessecary parameters
    def validatePatch(self, request):
        if (not 'frequent' in request.data) and (not 'attendee' in request.data) and (not 'time_range' in request.data):
            return False
        if (int(request.data['frequent']) < 0) or (int(request.data['attendee']) < 0) or (int(request.data['time_range']) < 0):
            return False
        return True

    # Allows the user to access the data stored in UserStatus
    def get(self, request):
        if not self.validateGet(request):
            print("400 Bad Request: GET /api/status/")
            return Response({'error':'Invalid Parameters'}, status='400')
        try:
            parameters = StudentStatusParameters.objects.get(id=2)
        except: 
            self.post()
        parameters = StudentStatusParameters.objects.get(id=2)
        # figures out if a user is an attendee or a frequent_user
        if request.query_params['type'] == 'status':
            student_id = request.query_params['student_id']
            frequent = parameters.frequent
            attendee = parameters.attendee
            time_frame = parameters.time_range
            startdate = datetime.now() - timedelta(days=time_frame)
            enddate = datetime.now().today()
            status = ""
            
            inRange = AttendanceItems.objects.filter(student_id=student_id).filter(activity_id=7).filter(date__range=[startdate, enddate])
            if len(inRange) >= frequent:
                status = "Frequent User"
            if len(inRange) >= attendee and attendee >= frequent:
                status = "Attendee"
            if (status == ""):
                if (attendee >= frequent):
                    status = "Less than " + str(frequent) + " Visits"
                else:
                    status = "Less than " + str(attendee) + " Visits"
            
            
            return Response({"status": status}, content_type='application/json')
        # returns the values stored in UserStatus
        elif request.query_params['type'] == 'status_info':
            print("\n", parameters, "\n")
            status = {}
            status['frequent'] = parameters.frequent
            status['attendee'] = parameters.attendee
            status['time_range'] = parameters.time_range
            return Response({"status": status}, content_type='application/json')

        else:
            return Response({'error':'You have not indicated which type of response you want: student_status or status_info'}, status='401')
   
    # Checks for valid input for a get request
    def validateGet(self, request):
        if 'student_id' in request.query_params:
            try:
                Students.objects.get(pk=int(request.query_params['student_id']))
            except Exception as e:
                return False
        if ('status' in request.query_params) and ('student_id' not in request.query_params):
            return False
        return True

    # This should only be used once to put the initial values into the data table
    def post(self):
        serializer = StatusSerializer(data={'frequent': 15, 'attendee': 30, 'time_range': 365})
        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

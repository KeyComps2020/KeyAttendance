from django.core import serializers
from ..models import StudentFlags, Students, StudentInfo
from ..serializers import StudentFlagsSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..helpers import isValidDateTime, isValidTime
from django.db.models import Count
from django.db import models as models
from django.db.models import Q
import datetime
import json

class Flags(APIView):

    #adds flags
    def post(self, request): 
        if not request.user.has_perm('key.change_flags'):
            print("401 Unauthorized: POST /api/flags/")
            return Response({'error':'You are not authorized to update student flags.'}, status='401')
        if not self.validatePost(request):
            print("400 Bad Request: POST /api/flags/")
            print(json.dumps(request.data))
            return Response({'error':'Invalid Parameters'}, status='400')

        serializer = StudentFlagsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # get flags need to fix this tomorrow
    def get(self, request):
        if not request.user.has_perm('key.veiw_flags'):
            print("401 Unauthorized: GET /api/flags/")
            return Response({'error':'You are not authorized to view student flags.'}, status='401')
        if not self.validateGet(request):
            print("400 Bad Request: GET /api/flags/")
            return Response({'error':'Invalid Parameters'}, status='400')

        if (request.query_params['type'] == "oneWeek"):
            enddate = request.query_params['date']
            startdate = request.query_params['startdate']
            inRange = StudentFlags.objects.filter(student_id=request.query_params['student_id']).filter(date__range=[startdate, enddate])
            return self.flags(inRange)
        
        elif (request.query_params['type'] == "allFlags"):
            inRange = StudentFlags.objects.filter(student_id=request.query_params['student_id'])
            return self.flags()
        
        elif (request.query_params['type'] == 'notifications'):
            enddate = request.query_params['date']
            startdate = request.query_params['startdate']
            inRange = StudentFlags.objects.filter(student_id=request.query_params['student_id']).filter(date__range=[startdate, enddate])
            return self.notifications(inRange)
        

    def flags(self, inRange):
        notifications = []
        for item in inRange:
            flag = {}
            flag['id'] = item.id
            flag['date'] = item.date
            flag['time'] = item.time
            flag['note'] = item.notes
            flagList = ""
            if (item.food_insecurity_tag == True):
                flagList = "Food Insecurity"
            if (item.housing_tag == True):
                if (flagList != ""):
                    flagList = flagList + ", Housing Insecurity"
                else:
                    flagList = "Housing Insecurity"
            if (item.acedemics_employment_tag == True):
                if (flagList != ""):
                    flagList = flagList + ", Acedemics/Employment"
                else:
                    flagList = "Acedemics/Employment"
            if (item.mental_health_tag == True):
                if (flagList != ""):
                    flagList = flagList + ", Mental Health"
                else:
                    flagList = "Mental Health"
            flag['flags'] = flagList
            notifications.append(flag)

        return Response({"notifications": notifications}, content_type='application/json')

    def notifications(self, inRange):
        notifications = ""
        food = 0
        edu = 0
        mental = 0
        house = 0
        for item in inRange:
            if (item.food_insecurity_tag == True):
                food += 1
            if (item.housing_tag == True):
                house += 1
            if (item.acedemics_employment_tag == True):
                edu += 1
            if (item.mental_health_tag == True):
                mental += 1
        if (food >= 3):
            notifications = "Food Insecurity"
        if (house >= 3):
            if (notifications != ""):
                notifications = notifications + ", Housing Insecurity"
            else:
                notifications = "Housing Insecurity"
        if (edu >= 3):
            if (notifications != ""):
                notifications = notifications + ", Acedemics/Employment"
            else:
                notifications = "Acedemics/Employment"
        if (mental >= 3):
            if (notifications != ""):
                notifications = notifications + ", Mental Health"
            else:
                notifications = "Mental Health"

        return Response({"notifications": notifications}, content_type='application/json')
   

    #delete flags
    def delete(self, request):
        if not request.user.has_perm('key.delete_flags'):
            print("401 Unauthorized: DELETE /api/flags/")
            return Response({'error':'You are not authorized to delete flags.'}, status='401')
        if not self.validateDelete(request):
            print("400 Bad Request: DELETE /api/flags/")
            return Response({'error':'Invalid Parameters'}, status='400')

        flag = StudentFlags.objects.get(pk=request.query_params['id'])
        flag.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        

    # checks if the request is valid
    def validateGet(self, request):
        if not 'student_id' in request.query_params:
            return False
        try: 
            Students.objects.get(id=request.query_params['student_id'])
        except:
            return False
        try: 
            if 'date' in request.query_params:
                date = request.query_params['date']
            else:
                date = getCurrentDate()
        except: 
            return True

        return True

    def validatePost(self, request):
        if 'date' in request.data and request.data['date'] != '' and not isValidDateTime(request.data['date']):
            return False
        if not 'student_id' in request.data:
            return False
        try:
            Students.objects.get(id=request.data['student_id'])
        except:
            return False
        if not 'housing_tag' in request.data:
            return False
        if not 'acedemics_employment_tag' in request.data:
            return False
        if not 'food_insecurity_tag' in request.data:
            return False
        if not 'mental_health_tag' in request.data:
            return False
        return True

    def validateDelete(self, request):
        if not 'id' in request.query_params:
            return False
        try:
            StudentFlags.objects.get(pk=request.query_params['id'])
        except:
            return False
        return True
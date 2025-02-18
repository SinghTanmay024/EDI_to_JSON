# def verify_loop(segment,tracer):
#     """
#     Verifies if a given segment is a valid loop segment in the current location.
    
#     Returns:
#     1,loop_name,tracer - If loop is valid
#     0,"",tracer - If loop is invalid in current location
#     """
#     seg_name = segment[0]

#     for loop_name in tracer.driver.keys():

#         if seg_name == tracer.driver[loop_name]["segment_name"]:
            
#             if tracer.loopsFound[-1] in tracer.driver[loop_name]["parent"]:

#                 if tracer.driver[loop_name]["identifier_element"] == -1:
#                     tracer.loopsFound.append(loop_name)
#                     return 1,loop_name,tracer
                
#                 elif segment[tracer.driver[loop_name]["identifier_element"]] in tracer.driver[loop_name]["id"]:
#                     tracer.loopsFound.append(loop_name)
#                     return 1,loop_name,tracer
#             else:
#                 return 0,"",tracer
    
#     tracer.errors.append("AK3_04_6:Segment not in defined transaction set")
#     return -1,tracer         

def edi_to_list(edi_file_path):
    """
    Opens edi file,
    Converts it to list of segments,
    Cleans each line
    Splits each segment into its elments
    return complete file
    """
    cleaned_data = []
    with open(edi_file_path, 'rb') as f:
        data = str(f.read())
        data = data.split('~')
        for segment in data:
            if segment == '':
                pass
            else:
                s_data = segment.replace('b','')
                s_data = s_data.replace("'",'')
                s_data = s_data.replace('\\n','')
                s_data = s_data.replace('\\r','')
                s_data = s_data.split('*')
                cleaned_data.append(s_data)
    return cleaned_data

def check_min_max(element,minn,maxx):
    """
    Verifies if element is of the given length
    """

    if element != '':
        try:
            if not (minn == '' or maxx == ''):
                if len(element) > int(maxx):
                    return False,"AK403:5:The data element is too long"
                
                if len(element) < int(minn):
                    return False,"AK403:4:The data element is too short"
        except Exception as e:
            print(f"E:Min Max:{e}")
            print(f"Element is: {element} and min is {minn}")

    return True,""

def verify_json_repetition(temp_json,tracer):
    """
    Function to Verify Json.
    """
    try:
        tracer.load_repetition_checklist()

        for loop_name in temp_json.keys():
            #Adds the count of each loop and segment to the checklist.
            #Format of List ["Requirement","Repeat","Count"]

            if "Error" not in loop_name:
                find_key = "_".join(list(loop_name.split("_"))[:2])
                tracer.checklist[find_key][2] += 1

        for loop_segment in tracer.checklist.keys():
            #checks the count of each segment and loop
            if tracer.checklist[loop_segment][0] == "R":
                
                try:
                    if int(tracer.checklist[loop_segment][2]) == 0:
                        # temp_json["Errors"].append(f"AK304:3:Mandatory segment missing:{loop_segment}")
                        if list(loop_segment.split("_"))[0] in tracer.driver.keys():
                            temp_json["Errors"].append(f"AK304:3:Mandatory loop missing:{loop_segment}")
                        else:
                            temp_json["Errors"].append(f"AK304:3:Mandatory segment missing:{loop_segment}")

                    else:
                        if not('>' in tracer.checklist[loop_segment][1]):#if ">" exists in repeat then this loop/segment can occur any number of times
                            if int(tracer.checklist[loop_segment][1]) < tracer.checklist[loop_segment][2]:
                                if list(loop_segment.split("_"))[0] in tracer.driver.keys():
                                    temp_json["Errors"].append(f"AK304:4:A loop occurs over maximum times:{loop_segment}:{tracer.checklist[loop_segment][2]}")
                                else:
                                    temp_json["Errors"].append(f"AK304:5:Segment exceeds maximum use:{loop_segment}:{tracer.tracer.checklist[loop_segment][2]}")

                except Exception as e:
                    print(f"E:verify_json_required:{e}")
            
            else:
                try:
                    if not('>' in tracer.checklist[loop_segment][1]):
                        if int(tracer.checklist[loop_segment][1]) < tracer.checklist[loop_segment][2]:
                            if list(loop_segment.split("_"))[0] in tracer.driver.keys():
                                temp_json["Errors"].append(f"AK304:4:A loop occurs over maximum times:{loop_segment}:{tracer.checklist[loop_segment][2]}")
                            else:
                                temp_json["Errors"].append(f"AK304:5:Segment exceeds maximum use:{loop_segment}:{tracer.checklist[loop_segment][2]}")

                except Exception as e:
                    print(f"E:verify_json_not_required:{e}")
           
        
        tracer.clear_checklist()
    except Exception as e:
        print(f"E:verify_json:{e}")

    return temp_json,tracer
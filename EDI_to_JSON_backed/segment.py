#It forms a dict of a segment.
#Module starts execution from main function.
import edi_datatype
import utils
import verify_requirment

def form_element_dict(element_spec,error,tracer,element=False):
    """
    Create a dict of an elment according to the output
    if output == 0 then dict is brief
    if output == 1 then dict is detailed
    """
    #Why detailed and brief is required
    if tracer.output == 0:

        temp_dict = {}
        temp_dict["element_name"] = element_spec["element_name"]
        temp_dict["element_desc"] = element_spec["element_desc"]
        if element:
            temp_dict["data"] = element
        else:
            temp_dict["data"] = ""
        temp_dict["error"] = error
        return temp_dict
    
    else:
        if element:
            temp_dict["data"] = element
        else:
            temp_dict["data"] = ""
        element_spec["error"] = error
        return element_spec


def process_segment(segment,segment_spec,tracer):

    temp_element_list = []
    seg_name = segment[0]
    segment = segment[1:]

    len_of_segment = len(segment) #No of elements in EDI file
    len_of_specs = len(segment_spec) #No of elements according to driver

    element_position = 0
    while element_position < len_of_specs:

        if element_position < len_of_segment:

            if segment[element_position] != "":

                if "sub-elements" in segment_spec[element_position].keys():

                    sub_elements = [seg_name] + segment[element_position].split(":")
                    sub_elements_list,tracer = process_segment(sub_elements,segment_spec[element_position]["sub-elements"],tracer)

                    for sub_element in sub_elements_list:
                        temp_element_list.append(sub_element)

                no_error = True

                try:
                    if no_error:
                        no_error,error = verify_requirment.main(segment,element_position,segment_spec[element_position])

                        if not(no_error):
                            temp_element_list.append(form_element_dict(segment_spec[element_position],error,tracer,segment[element_position]))
                except Exception as e:
                    print(f"E:Element Requirment:{e}")

                try:
                    if no_error:
                        no_error,error = edi_datatype.main(segment,element_position,segment_spec[element_position])

                        if not(no_error):
                            temp_element_list.append(form_element_dict(segment_spec[element_position],error,tracer,segment[element_position]))
                except Exception as e:
                    print(f"E:DataType:{e}")

                try:
                    if no_error:
                        no_error,error = utils.check_min_max(segment[element_position],segment_spec[element_position]["min"],segment_spec[element_position]["max"])
                    
                        if not(no_error):
                            temp_element_list.append(form_element_dict(segment_spec[element_position],error,tracer,segment[element_position]))
                except Exception as e:
                    print(f"E:Element Minimum Maximum:{e}")

                if no_error:
                    temp_element_list.append(form_element_dict(segment_spec[element_position],error,tracer,segment[element_position]))

        else:

            try:
                if no_error:
                    no_error,error = verify_requirment.main(segment,element_position,segment_spec[element_position])
                    if (segment_spec[element_position]['requirment'] == 'M'):
                        temp_element_list.append(form_element_dict(segment_spec[element_position],error,tracer))
            except Exception as e:
                print(f"E:Element Requirment:{e}")


        element_position += 1

    return temp_element_list,tracer

def match_specs(segment,tracer):
    """
    Matches the segment to its specifications from the driver


    """
    seg_name = segment[0]

    if len(tracer.loopsFound) == 0:
        current_loop = "ISA"
    else:
        current_loop = tracer.loopsFound[-1]
        
    if seg_name in ["ISA","IEA","GS","ST","SE","GE"]:
        
        return tracer.headerDriver[seg_name]["elements"],tracer.headerDriver[seg_name]["segment_desc"]
        
    else:
        loop_segments = tracer.driver[current_loop]["segments"]

        for driver_segment in loop_segments:

            if driver_segment["segement_name"] == seg_name:

                if not(driver_segment["identifier_element"] == -1):
                    if segment[driver_segment["identifier_element"]] in driver_segment["elements"][driver_segment["identifier_element"]-1]["possible_values"]:
                        return driver_segment["elements"],driver_segment["segment_desc"]
                
                else:
                    return driver_segment["elements"],driver_segment["segment_desc"]
        
        for loop in reversed(tracer.loopsFound):
            if loop in ["ISA","GS"]:
                pass
            else:
                loop_segments = tracer.driver[loop]["segments"]

                for driver_segment in loop_segments:

                    if seg_name == driver_segment["segement_name"]:
                        if not(driver_segment["identifier_element"] == -1):
                            if segment[driver_segment["identifier_element"]] in driver_segment["elements"][driver_segment["identifier_element"]-1]["possible_values"]:
                                return 1,1
                        else:
                            return 1,1

    return False,False
    
def main(segment,tracer):
    """
    Returns
    1,1,tracer = if segment specs 
    """
    #matches the segment to its specifications from the driver
    segment_spec,segment_desc = match_specs(segment,tracer)

    if segment_spec == 1:
        return 1,1,tracer

    else:

        if segment_spec:
            
            if len(segment_spec) < len(segment[1:]):
                error = f"AK403:3:Too many data elements:{segment[0]}"
                return 'E',error,tracer

            else:
                seg_list,tracer = process_segment(segment,segment_spec,tracer)
        else:
            error = f"AK304:2:Unexpected segment:{segment[0]}"
            return 'E',error,tracer
    
    return seg_list,segment_desc,tracer
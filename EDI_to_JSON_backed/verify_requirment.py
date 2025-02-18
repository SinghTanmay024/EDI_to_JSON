def mandatory(element):
    
    if element != "":
        return True,""
    
    else:
        return False,"AK403:1:Mandatory data element missing"


def main(segment,element_position,element_spec):
    mandatory_check = True
    error = ""
    try:
        if element_spec["requirment"] == 'M':
            mandatory_check,error = mandatory(segment[element_position])

        return mandatory_check,error
    
    except:
        return True,""
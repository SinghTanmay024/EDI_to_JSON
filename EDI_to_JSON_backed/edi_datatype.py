"""
Implementation of Datatypes.

All functions are called from main function

Return Format for all functions:
True,"" - if no errors exist
False,"Error Code" - Incase of any error
"""

from datetime import datetime
ALPHANUMERIC_CHARACTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
                         'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 
                         'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 
                         'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', 
                         '&', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '?', '=', ' ', "'", '%', 
                         '@', '[', ']', '_', '{', '}', '\\', '|', '<', '>', '~', '#', '$']

def AN(element,min=False,max=False):
    """
    Checks for alphanumeric variables.
    """
    
    check_passed = True
    error = ""

    for char in element:
        if not(char in ALPHANUMERIC_CHARACTERS):
            check_passed = False

    if check_passed:
        error = ""
    else:
        return False,"AK403:6:Invalid character in data element"
    
    if max and len(element) > int(max):
        return False,"AK403:5:The data element is too long"
    
    if min and len(element) < int(min):
        return False,"AK403:4:The data element is too short"
    
    return True,""
    
def DTP(element,format_qualifier=False):
    """
    Format Qualifier specifics the type of Date Format
    """
    if format_qualifier == "D8":
        format = "%Y%m%d"
    else:
        format = "%Y%m%d"

    try:
        res = bool(datetime.strptime(element, format))
        return True,""
    except ValueError:
        return False,"AK403:8:Invalid Date"

def TM(variable,code):
    if code == 1:
        if len(variable) == 6 and variable.isdigit():
            return True
    elif code == 0:
        if len(variable) == 4 and variable.isdigit():
            return True

def ID(element,possible_values):

    if len(possible_values) > 0:
        if element in possible_values:
            return True,""
        
        else:
            return False,"AK403:7:Invalid code value"
    
    else:
        return True,""

def main(segment,element_position,element_spec):
    check_passed = True
    error = ""
    
    if "DTP" in element_spec["element_name"] and element_position == 2:
        check_passed,error = DTP(segment[element_position],segment[1])

    elif element_spec["data_type"] == "ID":
        check_passed,error = ID(segment[element_position],element_spec["possible_values"])

    elif element_spec["data_type"] == "AN":
        check_passed,error = AN(segment[element_position],element_spec["min"],element_spec["max"])

    elif element_spec["data_type"] == "DT":
            check_passed,error = DTP(segment[element_position])
    
    return check_passed,error
    
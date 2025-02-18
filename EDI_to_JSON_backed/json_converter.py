'''
To convert json to EDI
'''
import json

def json_file_loader(path):
    with open(path) as f:
        data = json.load(f)
    return data

def edi_file_creator(path, data):
    with open(path, 'w') as f:
        f.write(data)
        

def convert_json_to_edi(input_json):
    temp_edi_data = ""

    if type(input_json) == list:
        segment_string = ""
        element_counter = 0

        for element in range(len(input_json)):
            element_counter += 1

            if '-' in input_json[element]['element_name']:
                element_counter -=1
                continue  

            elif not int(input_json[element]['element_name'][-2:]) == element_counter: #matching element number from json and counter
                for empty in range(element_counter, (int(input_json[element]['element_name'][-2:]))):
                    segment_string = segment_string + "*"
                    element_counter +=1
            segment_string = segment_string + input_json[element]['data'] + "*"
        segment_string = segment_string[:-1]
        segment_string = segment_string + "~\n"
        return segment_string

    elif type(input_json) == dict: 
        
        for loop in input_json.keys():
            splitted_loop = loop.split("_")
            if (loop == "Errors") or (splitted_loop[1] == "Error"):
                continue

            name = splitted_loop[0]
            edi_temp_string = convert_json_to_edi(input_json[loop])
            if (type(input_json[loop]) == dict):
                temp_edi_data = temp_edi_data + edi_temp_string
            else:
                temp_edi_data = temp_edi_data + name + "*" + edi_temp_string
    return temp_edi_data
        
def main(data, file_name):
    # start_time = datetime.now()
    # data = json_file_loader('test_data/json/837.json')
    file_name = file_name.split('.')[0] + ".edi"
    edi_data_string= convert_json_to_edi(data)
    edi_file_creator(f'api_test_data/generated_edi/{file_name}', edi_data_string)
    # end_time = datetime.now()
    # print(f"Total time = {(end_time - start_time)}")



# main(data= json_file_loader('test_data/json/837.json'), file_name='temp.edi')
# test()


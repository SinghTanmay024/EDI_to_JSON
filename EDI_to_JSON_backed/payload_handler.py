import json
import re

JSON_PATH = "./api_test_data/json"


def find_matching_strings(loop_name, array):
    pattern = rf"^{loop_name}_(.+)$"
    matching_strings = []
    for string in array:
        match = re.search(pattern, string)
        if match:
            matching_strings.append(string)
    return matching_strings

def json_file_loader(file_path):
    final_payload = {}
    with open(file_path) as f:
        data = json.load(f)
        # print(f"\n\nThis is file name: {file}")
        final_payload = generate_payload(data)
    
    print(final_payload)
    return final_payload
    with open('./api_test_data/payloads/payload.json', 'w') as output_file:
        output_file.write(json.dumps(final_payload))

def element_list(intermediate_json):
    final_element_list = []

    gs_segments = find_matching_strings('GS', intermediate_json.keys())
    for gs_segment in gs_segments:
        gs_segment = intermediate_json[gs_segment]
        st_segments = find_matching_strings('ST', gs_segment)
        for st_segment in st_segments: 
            st_segment = gs_segment[st_segment]
            file_type = st_segment[find_matching_strings('ST', st_segment)[0]][0]['data']
            if file_type == '834':
                member_loops = find_matching_strings('2000', st_segment)
            elif file_type == '837':
                provider_loops = find_matching_strings('2000A', st_segment)
                subscriber_loops = find_matching_strings('2000B', st_segment)
                member_loops = provider_loops + subscriber_loops

            for member_loop in member_loops:
                member_loop = st_segment[member_loop]
                for elements in member_loop.keys():
                    if 'Error' in elements:
                        continue
                    element = elements.split('_')[1]
                    if element in final_element_list:
                        continue
                    else:
                        final_element_list.append(element)

    return final_element_list


def data_elements_genertator(file_path):
    with open(file_path) as f:
        data = json.load(f)
        final_element_list = element_list(data)
        return final_element_list

def generate_834_payload(payload_data, st_segment):
    loops_2000 = find_matching_strings('2000', st_segment)
            
    for current_member in loops_2000:
        line_number = current_member.split('_')[2]
        current_member = st_segment[current_member]
        member_info = {}
                
        member_info = insert_data_from_json(current_member, member_info)

        member_name = current_member[find_matching_strings('2100A', current_member)[0]]
        member_info = insert_data_from_json(member_name, member_info)

        health_coverage = current_member[find_matching_strings('2300', current_member)[0]]
        member_info = insert_data_from_json(health_coverage, member_info)


        if current_member[find_matching_strings('INS', current_member)[0]][0]['data'] == 'Y':
            #Subscriber logic
            member_info['dependents'] = []
            payload_data['subscribers'].append(member_info)
        else: #depenedent logic
            sub_num = current_member[find_matching_strings('REF_Subscriber Identifier', current_member)[0]][1]['data']
            for subscriber in payload_data['subscribers']:
                for key in subscriber.keys():
                    breakdown_key = key.split('_')
                    if key == 'dependents':
                        continue
                    if (breakdown_key[1] == "Subscriber Identifier") and (breakdown_key[-1] == 'Reference Identification'):
                        if subscriber[key] == sub_num:
                            subscriber['dependents'].append(member_info)
                   
    return payload_data

def generate_837_payload(payload_data, st_segment):
    providers = find_matching_strings('2000A', st_segment)
    for current_provider in providers:
        current_provider = st_segment[current_provider]
        provider_info = {}

        provider_name_loop = find_matching_strings('2010AA', current_provider)[0]
        provider_name_loop = current_provider[provider_name_loop]
        prov_id = -1

        for elements in provider_name_loop[find_matching_strings('NM1', provider_name_loop)[0]]:
            if elements['element_name'] == 'NM109':
                prov_id = elements['data']

        providerAlreadyExists = 0
        
        for provider in payload_data['providers']:
            for element in provider.keys():
                if element.endswith("NM109_Identification Code") and (prov_id == provider[element]):
                    providerAlreadyExists = 1

        if providerAlreadyExists == 0:
            provider_info = insert_data_from_json(current_provider, provider_info)

            billing_provider_name = current_provider[find_matching_strings('2010AA', current_provider)[0]]
            provider_info = insert_data_from_json(billing_provider_name, provider_info)
            provider_info['subscribers'] = []
            payload_data['providers'].append(provider_info)
    
    subscribers = find_matching_strings('2000B', st_segment)
    for current_subscriber in subscribers:
        current_subscriber = st_segment[current_subscriber]
        subscriber_info = {}

        sub_name_loop = find_matching_strings('2010BA', current_subscriber)[0]
        sub_name_loop = current_subscriber[sub_name_loop]
        sub_id = -1
        for elements in sub_name_loop[find_matching_strings('NM1', sub_name_loop)[0]]: 
            if elements['element_name'] == 'NM109':
                sub_id = elements['data']
        
        subscriberAlreadyExists = 0
        providerNum = -1
        subscriberNum = -1

        for provider in payload_data['providers']:
            for subscriber in provider['subscribers']:
                elements = subscriber.keys()
                for element in elements:
                    if element.endswith("NM109_Identification Code") and sub_id == subscriber[element]:
                        subscriberAlreadyExists = 1
                        providerNum = payload_data['providers'].index(provider)
                        subscriberNum = payload_data['providers'][providerNum]['subscribers'].index(subscriber)            




        if subscriberAlreadyExists == 0:
            subscriber_info['patients'] = []
            hl_info = find_matching_strings('HL', current_subscriber)[0] 
            hl_info = current_subscriber[hl_info]
            parent = hl_info[1]['data']
            child_code = hl_info[3]['data']
            subscriber_info = insert_data_from_json(current_subscriber, subscriber_info)

            subscriber_name = current_subscriber[find_matching_strings('2010BA', current_subscriber)[0]]
            subscriber_info = insert_data_from_json(subscriber_name, subscriber_info)

            payer_name = current_subscriber[find_matching_strings('2010BB', current_subscriber)[0]]
            subscriber_info = insert_data_from_json(payer_name, subscriber_info)
            subscriber_info['isPatient'] = False
            if child_code == '0':
                subscriber_info['isPatient'] = True
                claim_info = current_subscriber[find_matching_strings('2300', current_subscriber)[0]]
                subscriber_info = insert_data_from_json(claim_info, subscriber_info)            

            else:
                patient_info = {}
                patient_details = find_matching_strings('2000C', current_subscriber)[0]
                patient_info = insert_data_from_json(current_subscriber[patient_details], patient_info)
                
                patient_name = find_matching_strings('2010CA', current_subscriber[patient_details])[0]
                patient_info = insert_data_from_json(current_subscriber[patient_details][patient_name], patient_info)

                claim_info = find_matching_strings('2300', current_subscriber[patient_details])[0]
                patient_info = insert_data_from_json(current_subscriber[patient_details][claim_info], patient_info)
                subscriber_info['patients'].append(patient_info)

                
            for provider in payload_data['providers']:
                for key in provider.keys():
                    key_breakdown = key.split('_')
                    if((key_breakdown[-1] == "Hierarchical ID Number") and (parent == provider[key])):
                        provider['subscribers'].append(subscriber_info)
        else:
            # if sub_id == "AKHO48W05996":
            patient_info = {}
            # if len(find_matching_strings('2000C', current_subscriber)) == 0:
            #     print(current_subscriber)
            if not payload_data['providers'][providerNum]['subscribers'][subscriberNum]['isPatient']:
                patient_details = find_matching_strings('2000C', current_subscriber)[0]
                patient_info = insert_data_from_json(current_subscriber[patient_details], patient_info)
                    
                patient_name = find_matching_strings('2010CA', current_subscriber[patient_details])[0]
                patient_info = insert_data_from_json(current_subscriber[patient_details][patient_name], patient_info)

                claim_info = find_matching_strings('2300', current_subscriber[patient_details])[0]
                patient_info = insert_data_from_json(current_subscriber[patient_details][claim_info], patient_info)
                payload_data['providers'][providerNum]['subscribers'][subscriberNum]['patients'].append(patient_info)
        

    return payload_data
        





def generate_payload(json_file):
    gs_segments = find_matching_strings('GS', json_file)
    for gs_segment in gs_segments:
        gs_segment = json_file[gs_segment]
        st_segments = find_matching_strings('ST', gs_segment)


        for st_segment in st_segments:
            st_segment = gs_segment[st_segment]
            st_type = st_segment[find_matching_strings('ST', st_segment)[0]][0]['data']
            if st_type == '834':
                payload_data = {
                    'subscribers':[
                    ]
                }
                payload_data = generate_834_payload(payload_data, st_segment)
            elif st_type == '837':
                payload_data = {
                    'providers':[

                    ]
                }
                payload_data = generate_837_payload(payload_data, st_segment)
             
    return payload_data


def insert_data_from_json(input_element, member_info):
    fields = input_element.keys()
    for field in fields:
        if 'Error' in field:
            continue
        if type(input_element[field]) == dict:
            continue
        for element in input_element[field]:
            member_info[f"{field}_{element['element_name']}_{element['element_desc']}"] = element['data']

    return member_info


def update_json_data(json_data, loop, element_name, data):
    if(type(json_data) == dict):
        for loop_name in json_data.keys():
            if loop_name == "Errors":
                continue
            if(loop_name.startswith("ISA") or loop_name.startswith("IEA") or loop_name.startswith("GE") or loop_name.startswith("SE")):
                continue
            
            if (type(json_data[loop_name]) == list) and (loop_name == loop):
                for element in json_data[loop_name]:
                    if element['element_name'] == element_name:
                        element['data'] = data
            else:
                update_json_data(json_data[loop_name], loop, element_name, data)
        return json_data

def payload_mapper(input_json, json_data):
    if type(input_json) == list:
        for element in input_json:
            if type(element) == dict:
                json_data = payload_mapper(input_json[input_json.index(element)], json_data)

    elif type(input_json) == dict:
        for key in input_json.keys():
            if not (type(input_json[key]) == str):
                json_data = payload_mapper(input_json[key], json_data)
            else:
                splitted = key.split('_')
                loop_name = f"{splitted[0]}_{splitted[1]}_{splitted[2]}"
                element_name = splitted[3]
                json_data = update_json_data(json_data, loop_name, element_name, input_json[key])

    return json_data
            
#not used now, use payload_mapper instead, it uses recursion and is slightly faster
def payload_mapper2(input_json):
    json_data = input_json['data']
    keys = list(input_json['payload'].keys())
    payload_subsribers = input_json['payload'][keys[0]]
    for subscriber in payload_subsribers:
        elements = subscriber.keys()
        for element in elements:
            if type(subscriber[element]) == list:
                secondkey = element
                for dependent in subscriber[secondkey]:
                    for dependent_element in dependent.keys():
                        if type(dependent[dependent_element]) == list:
                            thirdkey = dependent_element
                            for patient in dependent[thirdkey]:
                                for patient_element in patient.keys():
                                    splitted = patient_element.split('_')
                                    loop_name = f"{splitted[0]}_{splitted[1]}_{splitted[2]}"
                                    element_name = splitted[3]

                                    json_data = update_json_data(json_data, loop_name, element_name, patient[patient_element]) 
                        else:
                            splitted = dependent_element.split('_')
                            if len(splitted) < 5:
                                continue
                            loop_name = f"{splitted[0]}_{splitted[1]}_{splitted[2]}"
                            element_name = splitted[3]

                            json_data = update_json_data(json_data, loop_name, element_name, dependent[dependent_element])
            else:
                splitted = element.split('_')
                loop_name = f"{splitted[0]}_{splitted[1]}_{splitted[2]}"
                element_name = splitted[3]
                json_data = update_json_data(json_data, loop_name, element_name, subscriber[element])
    
    
    return json_data



# def main(file_path):
#     return json_file_loader(file_path)

# main(f"{JSON_PATH}/834_all_examples.json")
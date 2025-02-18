import re
import json
import os
# import Splitter
import utils
import segment
import verify_loops
from tracer import Tracer
import multiprocessing
import json_converter
# import cProfile   #package for profiling
# from datetime import datetime

# FILES = "./FILES/834.edi"
FILES = "./834_multiple_members.edi"
# PATH_EDI = "./TEST/output"
PATH_EDI = "api_test_data/edi/"



def main(tracer):
    # tracer = Tracer()
    tracer.process_control_segments()
    files = os.listdir(PATH_EDI)
    new_edi_files = []
    for edi_file in files: 
        new_edi_files.append((edi_file, tracer))
    
    # print(multiprocessing.cpu_count())
    # start_time = datetime.now()
    with multiprocessing.Pool() as pool: 
        pool.starmap(processing, new_edi_files)
        
    
    # end_time = datetime.now()
    # print(f"FINAL TIME = {(end_time - start_time)}")

def processing(file_name, tracer):
    # tracer = tracer.tracer()

    #to check multiprocessing
    # while 1:
    #     a=50 

    #Profiling start
    # pr = cProfile.Profile()
    # pr.enable()


    file = utils.edi_to_list(f"{PATH_EDI}/{file_name}")
    tracer.lenOfLine = len(file) - 1 #sets the lenOfLine as the number of lines in the EDI file
    tracer.lastLoopFound = 0 #initialise lastLoopFound 
    tracer.output = 0


    edi_json,tracer = process_edi(file,tracer) #recursive
    
    
    # pr.disable()
    # pr.print_stats(sort='cumtime')
    #Profiling end
    # print(edi_json)
        
    dump_json = open(f"./api_test_data/json/{list(file_name.split('.'))[0]}.json","w")
    json.dump(edi_json,dump_json,indent=2)
    # print(f"--DONE-{file_name.split('.')[0]}--")
    # json_converter.main(edi_json, file_name)


    #This code is to process a single file
    # file = utils.edi_list(FILES)
    # tracer.lenOfLine = len(file) - 1

    # # edi_json,tracer = process_edi(file,tracer)

    # edi_json,tracer = process_edi(file,tracer)

    # print(edi_json)
    # dump_json = open("test.json","w")
    # json.dump(edi_json,dump_json,indent=2)


def process_edi(edi_data,tracer):
    temp_json = {} # a temp json for this recursive call of the loop
    current_line = tracer.lastLoopFound
    if current_line < tracer.lenOfLine:

        seg_dict, seg_name, tracer = segment.main(edi_data[current_line],tracer)
        temp_json[f"{edi_data[current_line][0]}_{seg_name}_{current_line}"] = seg_dict
        if edi_data[current_line][0] == 'ISA':
            tracer.loopsFound.append('ISA')
        current_line += 1

    while current_line < tracer.lenOfLine:

        if 'Errors' not in list(temp_json.keys()):
            temp_json['Errors'] = []

        if edi_data[current_line][0] in tracer.segments:
            
            if edi_data[current_line][0] in tracer.headerSegments or edi_data[current_line][0] in tracer.loopSegments: #If it starts a header or a normal loop

                loop_found,loop_name,loop_desc,tracer = verify_loops.main(edi_data[current_line],tracer)
                
                if loop_found == 1: #loop found
                    tracer.lastLoopFound = current_line
                    temp_json[f"{loop_name}_{loop_desc}_{current_line}"],tracer = process_edi(edi_data,tracer)
                    current_line = tracer.lastLoopFound - 1
                
                elif loop_found == 0: #no loop found

                    if 'Errors' not in list(temp_json.keys()):
                        temp_json['Errors'] = []

                    if tracer.loopsFound[-1] not in tracer.headerSegments:
                        
                        temp_json,tracer = utils.verify_json_repetition(temp_json,tracer)
                        tracer.loopsFound = tracer.loopsFound[:-1]
                        tracer.lastLoopFound = current_line

                        return temp_json,tracer
                    
                    elif edi_data[current_line][0] in tracer.headerSegments or edi_data[current_line][0] in tracer.tralierSegments:

                        temp_json,tracer = utils.verify_json_repetition(temp_json,tracer)
                        tracer.loopsFound = tracer.loopsFound[:-1]
                        tracer.lastLoopFound = current_line
                        return temp_json,tracer

                elif loop_found == 2: #trailer found
                    seg_dict, seg_name, tracer = segment.main(edi_data[current_line],tracer)
                    temp_json[f"{edi_data[current_line][0]}_{seg_name}_{current_line}"] = seg_dict
            
            else: #if it is not starting any loop
                seg_dict, seg_desc, tracer = segment.main(edi_data[current_line],tracer) #returns the segment
                if seg_dict == 1:
                    
                    # if tracer.loopsFound[-1] == 'ST':

                    if not(edi_data[current_line][0] in tracer.headerSegments or edi_data[current_line][0] in tracer.tralierSegments):

                        temp_json,tracer = utils.verify_json_repetition(temp_json,tracer)
                        tracer.loopsFound = tracer.loopsFound[:-1]
                        tracer.lastLoopFound = current_line
                        return temp_json,tracer
                    else:
                        temp_json["Errors"] = f"AK304:1:Unrecognized segment ID:{edi_data[current_line][0]}:{current_line}"

                elif seg_dict == 'E':
                    temp_json["Errors"].append(f"{seg_desc}:{current_line}")
                    temp_json[f"{edi_data[current_line][0]}_Error_{current_line}"] = edi_data[current_line]

                else: #stores the segment.qa
                    temp_json[f"{edi_data[current_line][0]}_{seg_desc}_{current_line}"] = seg_dict
        
        else:
            temp_json[f"{edi_data[current_line][0]}_Error_{current_line}"] = []
            temp_json["Errors"].append(f"AK304:6:Segment not in a defined transaction set:{edi_data[current_line][0]}:{current_line}")

        current_line += 1

    temp_json,tracer = utils.verify_json_repetition(temp_json,tracer)
    return temp_json,tracer

# process_edi(FILES)

if __name__ == "__main__":
    # pr = cProfile.Profile()
    # pr.enable()
    tracer = Tracer()

    main(tracer)

    # pr.disable()
    # pr.print_stats(sort='cumtime')
# Splitter.main("./TEST/input")
    # cProfile.run('main()', sort='cumtime')


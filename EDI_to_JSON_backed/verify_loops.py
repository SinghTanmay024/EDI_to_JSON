def hl_loop(segment,tracer):
    seg_name = segment[0]

    if len(tracer.hl) != 0:
        if segment[2] == tracer.hl[-1]:
            for loop_name in tracer.driver.keys():
                if segment[tracer.driver[loop_name]["identifier_element"]] in tracer.driver[loop_name]["possible_values"]:
                    if tracer.loopsFound[-1] in tracer.driver[loop_name]["parent"]:
                        tracer.loopsFound.append(loop_name)
                        tracer.hl.append(segment[1])
                        return 1,loop_name,tracer.driver[loop_name]["loop_desc"],tracer
                    else:
                        tracer.hl = tracer.hl[:-1]
                        return 0,"","",tracer
            
        else:
            tracer.hl = tracer.hl[:-1]
            return 0,"","",tracer

    else:
        for loop_name in tracer.driver.keys():
            if seg_name == tracer.driver[loop_name]["segment_name"]:
                if segment[tracer.driver[loop_name]["identifier_element"]] in tracer.driver[loop_name]["possible_values"]:
                    if tracer.loopsFound[-1] in tracer.driver[loop_name]["parent"]:
                        tracer.loopsFound.append(loop_name)
                        tracer.hl.append(segment[1])
                        return 1,loop_name,tracer.driver[loop_name]["loop_desc"],tracer
                    else:
                        return 0,"","",tracer
                    
    return 0,"","",tracer

def sbr_loop(segment,tracer):
    
    if tracer.loopsFound[-1] == '2000B' and tracer.implementationReference == "005010X224A2":
        return 2,"","",tracer
    
    else:

        seg_name = segment[0]
        for loop_name in tracer.driver.keys():
            if seg_name == tracer.driver[loop_name]["segment_name"]:

                if tracer.loopsFound[-1] in tracer.driver[loop_name]["parent"]:

                    if tracer.driver[loop_name]["identifier_element"] == -1:
                        tracer.loopsFound.append(loop_name)
                        return 1,loop_name,tracer.driver[loop_name]["loop_desc"],tracer
                    
                    elif segment[tracer.driver[loop_name]["identifier_element"]] in tracer.driver[loop_name]["possible_values"]:
                        tracer.loopsFound.append(loop_name)
                        loop_desc = tracer.driver[loop_name]["loop_desc"]
                        return 1,loop_name,tracer.driver[loop_name]["loop_desc"],tracer

        return 0,"","",tracer

def misc_loop(segment,tracer):
    seg_name = segment[0]

    for loop_name in tracer.driver.keys():

        if seg_name == tracer.driver[loop_name]["segment_name"]:
            
            if tracer.loopsFound[-1] in tracer.driver[loop_name]["parent"]:

                if tracer.driver[loop_name]["identifier_element"] == -1:
                    tracer.loopsFound.append(loop_name)
                    return 1,loop_name,tracer.driver[loop_name]["loop_desc"],tracer
                
                elif segment[tracer.driver[loop_name]["identifier_element"]] in tracer.driver[loop_name]["possible_values"]:
                    tracer.loopsFound.append(loop_name)
                    loop_desc = tracer.driver[loop_name]["loop_desc"]
                    return 1,loop_name,tracer.driver[loop_name]["loop_desc"],tracer
                
    return 0,"","",tracer

def traliers(segment,tracer):
    seg_name = segment[0]
    
    for header in tracer.headerDriver.keys():

        if seg_name == tracer.headerDriver[header]["segment_name"]:

            if tracer.loopsFound[-1] in tracer.headerDriver[header]["parent"]:

                return 2,header,tracer.headerDriver[header]["segment_desc"],tracer
    
    return 0,"","",tracer

def headers(segment,tracer):
    seg_name = segment[0]

    if seg_name == "ISA":
            if len(tracer.loopsFound) == 0:
                tracer.loopsFound.append(tracer.headerDriver["ISA"]["segment_name"])
                return 1,"ISA",tracer.headerDriver["ISA"]["segment_desc"],tracer

    for header in tracer.headerDriver.keys():

        if seg_name == tracer.headerDriver[header]["segment_name"]:

            if tracer.loopsFound[-1] in tracer.headerDriver[header]["parent"]:
                if seg_name == "ST":
                    implementation_ref_found = tracer.process_driver(segment[3])
                    if not(implementation_ref_found):
                        pass

                tracer.loopsFound.append(tracer.headerDriver[header]["segment_name"])
                return 1,header,tracer.headerDriver[header]["segment_desc"],tracer
    
    return 0,"","",tracer

def main(segment,tracer):

    if segment[0] == "HL":
        loop_status,loop_name,loop_desc,tracer = hl_loop(segment,tracer)
    
    elif segment[0] == "SBR":
        loop_status,loop_name,loop_desc,tracer = sbr_loop(segment,tracer)

    elif segment[0] in ["SE","GE","IEA"]:
        loop_status,loop_name,loop_desc,tracer = traliers(segment,tracer)
    
    elif segment[0] in ["ST","GS","ISA"]:
        loop_status,loop_name,loop_desc,tracer = headers(segment,tracer)

    else:
        loop_status,loop_name,loop_desc,tracer = misc_loop(segment,tracer)
    
    return loop_status,loop_name,loop_desc,tracer

import json
import os

class Tracer:
    def __init__(self):
        self.lineOne = 0
        self.hl = []
        self.ls = 0
        self.loopsFound = []
        self.lenOfLine = 0
        self.implementationReference = ""
        self.loopSegments = []
        self.headerSegments = ['ST','ISA','GS']
        self.tralierSegments = ['SE','IEA','GE']
        self.segments = []
        self.driver = {}
        self.headerDriver = {}
        self.lastLoopFound = 0
        self.start = 0
        self.errors = []
        self.output = 0 #0 = short, 1 = detailed
        self.checklist = {}


    def process_driver(self,implentation_reference):

        isSupported = 0
        
        if implentation_reference == self.implementationReference:
            pass

        for driver in os.listdir("drivers"):
            if implentation_reference in driver:
                self.implementationReference = implentation_reference
                isSupported = 1

        if isSupported == 0:
            return "AK502:1:The transaction set not supported"


        DRIVER_PATH = f"drivers/{self.implementationReference}.json"
        self.segments = ['ST','ISA','GS',"SE","IEA","GE"]

        driver_f = open(DRIVER_PATH,"rb")
        driver_json = json.load(driver_f)

        for loop in driver_json.keys():
            if driver_json[loop]["segment_name"] not in self.loopSegments:
                self.loopSegments.append(driver_json[loop]["segment_name"])
            
            for segment in driver_json[loop]["segments"]:
                if segment["segement_name"] not in self.segments:
                    self.segments.append(segment["segement_name"])

        self.driver = driver_json

        return False

    def process_control_segments(self):
        CONTROL_SEGMENT_PATH = "./drivers/control_segments.json"
        control_segment_f = open(CONTROL_SEGMENT_PATH,"rb")
        control_segment_json = json.load(control_segment_f)

        for header in control_segment_json.keys():
            if control_segment_json[header]["segment_name"] not in self.loopSegments:
                self.loopSegments.append(control_segment_json[header]["segment_name"])
        
            if control_segment_json[header]["segment_name"] not in self.segments:
                self.segments.append(control_segment_json[header]["segment_name"])

        self.headerDriver = control_segment_json

    def load_repetition_checklist(self):
        """
        "segment_name": "GE",
        "segment_desc": "Functional Group Tralier",
        """
        current_loop = self.loopsFound[-1]

        if current_loop == '2710':
            a = True

        if current_loop in ['ISA','GS']:
            loops = [current_loop] + self.headerDriver[current_loop]["child"]

            for loop in loops:

                self.checklist[f"{loop}_{self.headerDriver[loop]['segment_desc']}"] = [self.headerDriver[loop]['usage'],self.headerDriver[loop]['repeat'],0]

                
        else:
            
            loops = [loop for loop in self.driver[current_loop]['child'] if loop != ""]

            if current_loop == 'ST':
                self.checklist[f"SE_{self.headerDriver['SE']['segment_desc']}"] = [self.headerDriver['SE']['usage'],self.headerDriver['SE']['repeat'],0]

            for loop in loops:

                self.checklist[f"{loop}_{self.driver[loop]['loop_desc']}"] = [self.driver[loop]['usage'],self.driver[loop]['repeat'],0]

                
            for segment in self.driver[current_loop]["segments"]:
                    self.checklist[f"{segment['segement_name']}_{segment['segment_desc']}"] = [segment["usage"],segment["repeat"],0]


    def clear_checklist(self):
        self.checklist = {}







        

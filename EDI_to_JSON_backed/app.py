from flask import Flask, request, jsonify
import os
import json
from tracer import Tracer
import edi_json_converter
import payload_handler
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

UPLOAD_PATH = "./api_test_data/edi"
JSON_PATH = "./api_test_data/json"

@app.route("/upload", methods=["POST"])
def uploading():

    if len(request.files.keys()) == 0:
        return jsonify("Please provide a file"), 400
    
    files = os.listdir(UPLOAD_PATH)
    for file in files:
        os.remove(f"{UPLOAD_PATH}/{file}")

    files = os.listdir(JSON_PATH)
    for file in files:
        os.remove(f"{JSON_PATH}/{file}")
    
    for file_name in request.files.keys():
        edi_file = request.files[file_name]
        if not edi_file.name.split('.')[1] == 'edi':
            return jsonify("Please give an edi file with extension .edi"), 400
        edi_file.save(f"./api_test_data/edi/{edi_file.name}")

    edi_tracer = Tracer()
    edi_json_converter.main(edi_tracer)
    file_name = edi_file.name.split('.')[0] + ".json"

    json_files = os.listdir(JSON_PATH)
    intermediate_json = {}

    for file_name in json_files:
        file_json = {}
        payload = payload_handler.json_file_loader(f"{JSON_PATH}/{file_name}")
        data_elements = payload_handler.data_elements_genertator(f"{JSON_PATH}/{file_name}")
        with open(f"{JSON_PATH}/{file_name}") as f:
            file_json['data'] = json.load(f)
            file_json['payload'] = payload
            file_json['elements'] = data_elements
            intermediate_json[f'{file_name}'] = file_json

    return intermediate_json

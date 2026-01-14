# -*- coding: utf-8 -*-
"""Excel Module Routes"""
from flask import Blueprint, request, jsonify
from .services import process_excel_dataframe

excel_bp = Blueprint('excel', __name__)

@excel_bp.route('/', methods=['GET'])
def index():
    return {"message": "Excel Module Ready"}

@excel_bp.route('/process', methods=['POST'])
def process_excel():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if not (file.filename.endswith('.xlsx') or file.filename.endswith('.xls')):
        return jsonify({"error": "Invalid file type. Only .xlsx or .xls allowed."}), 400

    try:
        # Process the file stream directly
        result = process_excel_dataframe(file.stream)
        return jsonify(result), 200
        
    except ValueError as ve:
        # Expected business logic error (e.g. missing columns)
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        # Unexpected error
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

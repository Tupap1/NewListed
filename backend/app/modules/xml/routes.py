# -*- coding: utf-8 -*-
"""XML Module Routes"""
from flask import Blueprint, request, jsonify, send_file
from .services import process_and_save_xml, export_invoices_to_excel
from .models import Invoice

xml_bp = Blueprint('xml', __name__)

@xml_bp.route('/', methods=['GET'])
def index():
    return {"message": "XML Module Ready"}

@xml_bp.route('/upload', methods=['POST'])
def upload_xmls():
    if 'files' not in request.files:
        return jsonify({"error": "No files part"}), 400
        
    files = request.files.getlist('files')
    
    if not files or files[0].filename == '':
         return jsonify({"error": "No selected files"}), 400

    results = {
        "uploaded": 0,
        "skipped": 0,
        "errors": 0,
        "details": []
    }

    for file in files:
        if not file.filename.lower().endswith('.xml'):
            results["errors"] += 1
            results["details"].append({"filename": file.filename, "status": "error", "msg": "Not an XML file"})
            continue
            
        # Process
        res = process_and_save_xml(file)
        
        if res['status'] == 'success':
            results["uploaded"] += 1
        elif res['status'] == 'skipped':
            results["skipped"] += 1
        else:
            results["errors"] += 1
            
        results["details"].append({"filename": file.filename, "status": res['status'], "msg": res['msg']})

    return jsonify(results), 200

@xml_bp.route('/list', methods=['GET'])
def list_invoices():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Sort by created_at desc
    pagination = Invoice.query.order_by(Invoice.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    data = [item.to_dict() for item in pagination.items]
    
    return jsonify({
        "items": data,
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": page
    }), 200

@xml_bp.route('/export', methods=['GET'])
def export_excel():
    """
    Export all invoices from database to Excel file
    """
    try:
        file_buffer = export_invoices_to_excel()
        return send_file(
            file_buffer,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name='invoices_export.xlsx'
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

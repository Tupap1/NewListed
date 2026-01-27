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
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        if 'files' not in request.files:
            logger.error("No 'files' field in request.files")
            return jsonify({"error": "No files part"}), 400
            
        files = request.files.getlist('files')
        logger.info(f"Received {len(files)} file(s) for upload")
        
        if not files or files[0].filename == '':
            logger.error("Empty files list or no filename")
            return jsonify({"error": "No selected files"}), 400

        results = {
            "uploaded": 0,
            "skipped": 0,
            "errors": 0,
            "details": []
        }

        for file in files:
            logger.info(f"Processing file: {file.filename}")
            
            if not file.filename.lower().endswith('.xml'):
                logger.warning(f"File {file.filename} is not an XML file")
                results["errors"] += 1
                results["details"].append({"filename": file.filename, "status": "error", "msg": "Not an XML file"})
                continue
                
            # Process
            try:
                res = process_and_save_xml(file)
                logger.info(f"File {file.filename} processed: {res['status']}")
                
                if res['status'] == 'success':
                    results["uploaded"] += 1
                elif res['status'] == 'skipped':
                    results["skipped"] += 1
                else:
                    results["errors"] += 1
                    
                results["details"].append({"filename": file.filename, "status": res['status'], "msg": res['msg']})
                
            except Exception as file_error:
                logger.error(f"Error processing file {file.filename}: {str(file_error)}", exc_info=True)
                results["errors"] += 1
                results["details"].append({
                    "filename": file.filename, 
                    "status": "error", 
                    "msg": f"Processing error: {str(file_error)}"
                })

        logger.info(f"Upload complete: {results['uploaded']} uploaded, {results['skipped']} skipped, {results['errors']} errors")
        return jsonify(results), 200
        
    except Exception as e:
        logger.error(f"Unexpected error in upload_xmls: {str(e)}", exc_info=True)
        return jsonify({"error": f"Server error: {str(e)}"}), 500

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

@xml_bp.route('/<int:invoice_id>', methods=['DELETE'])
def delete_invoice(invoice_id):
    """
    Delete an invoice by ID
    """
    import logging
    from app.extensions import db
    
    logger = logging.getLogger(__name__)
    
    try:
        invoice = Invoice.query.get(invoice_id)
        
        if not invoice:
            logger.warning(f"Invoice with ID {invoice_id} not found")
            return jsonify({"error": "Factura no encontrada"}), 404
        
        logger.info(f"Deleting invoice ID {invoice_id} (UUID: {invoice.uuid[:12]}...)")
        
        # Delete invoice (cascade will delete related items automatically)
        db.session.delete(invoice)
        db.session.commit()
        
        logger.info(f"Invoice {invoice_id} deleted successfully")
        return jsonify({"message": "Factura eliminada exitosamente"}), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting invoice {invoice_id}: {str(e)}", exc_info=True)
        return jsonify({"error": f"Error al eliminar: {str(e)}"}), 500

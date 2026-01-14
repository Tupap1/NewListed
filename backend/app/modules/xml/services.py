# -*- coding: utf-8 -*-
"""XML Module Services - DIAN Parser"""
import logging
import io
import json
from lxml import etree
from datetime import datetime
import pandas as pd
from app.extensions import db
from .models import Invoice, InvoiceItem

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Namespaces typically used in UBL 2.1 / DIAN
NAMESPACES = {
    'cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
    'cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
    'ext': 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
    'ad': 'urn:oasis:names:specification:ubl:schema:xsd:AttachedDocument-2',
}

# Mapping for payment form codes
PAYMENT_FORM_MAP = {
    '1': 'Contado',
    '2': 'Crédito'
}

def parse_xml_invoice(file_content):
    """
    Parses a DIAN XML (Invoice or AttachedDocument) and returns a dictionary of fields.
    Now includes payment methods, tax breakdown, and line items.
    Returns None if parsing fails or valid data isn't found.
    """
    try:
        parser = etree.XMLParser(recover=True, huge_tree=True)
        tree = etree.fromstring(file_content, parser)
        
        # 1. Handle AttachedDocument (The "Trap")
        root_tag = etree.QName(tree).localname
        
        if root_tag == 'AttachedDocument':
            logger.info("AttachedDocument detected. Extracting inner XML...")
            xpath_expr = ".//cac:Attachment/cac:ExternalReference/cbc:Description"
            description_nodes = tree.xpath(xpath_expr, namespaces=NAMESPACES)
            
            if not description_nodes:
                logger.warning("AttachedDocument found but no Description node with CDATA.")
                return None
            
            inner_xml_str = description_nodes[0].text
            if not inner_xml_str: 
                return None
                
            tree = etree.fromstring(inner_xml_str.encode('utf-8'), parser)
        
        # 2. Helper function for text extraction
        def get_text(xpath, node=tree):
            res = node.xpath(xpath, namespaces=NAMESPACES)
            return res[0].text if res else None

        # 3. Basic Invoice Data
        # Extract UUID (CUFE - technical identifier)
        uuid = get_text(".//cbc:UUID")
        if not uuid:
            logger.warning("No UUID found in XML.")
            return None
        
        # NEW: Extract Invoice Number (human-readable ID like "BRZ2975")
        # This is cbc:ID at the root level of Invoice (same level as cbc:IssueDate)
        invoice_number = get_text("./cbc:ID")  # Direct child of Invoice root
        if not invoice_number:
            # Fallback: try with namespace prefix explicitly
            invoice_number = get_text(".//cbc:ID")
        
        logger.info(f"Extracted Invoice Number: {invoice_number}, UUID: {uuid[:12]}...")
            
        issue_date_str = get_text(".//cbc:IssueDate")
        issue_date = None
        if issue_date_str:
            try:
                issue_date = datetime.strptime(issue_date_str, '%Y-%m-%d').date()
            except ValueError:
                pass

        total_amount = float(get_text(".//cac:LegalMonetaryTotal/cbc:PayableAmount") or 0)
        tax_amount = float(get_text(".//cac:TaxTotal/cbc:TaxAmount") or 0)
        base_amount = float(get_text(".//cac:LegalMonetaryTotal/cbc:LineExtensionAmount") or 0)

        # 4. Parties (Issuer & Receiver)
        issuer_nit_xpath = ".//cac:AccountingSupplierParty/cac:Party/cac:PartyTaxScheme/cbc:CompanyID"
        issuer_name_xpath = ".//cac:AccountingSupplierParty/cac:Party/cac:PartyTaxScheme/cbc:RegistrationName"
        
        issuer_nit = get_text(issuer_nit_xpath)
        issuer_name = get_text(issuer_name_xpath)
        if not issuer_name:
             issuer_name = get_text(".//cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name")

        receiver_nit_xpath = ".//cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cbc:CompanyID"
        receiver_name_xpath = ".//cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cbc:RegistrationName"
        
        receiver_nit = get_text(receiver_nit_xpath)
        receiver_name = get_text(receiver_name_xpath)
        if not receiver_name:
             receiver_name = get_text(".//cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name")

        # 5. NEW: Payment Information
        payment_form_code = get_text(".//cac:PaymentMeans/cbc:ID")
        payment_form = PAYMENT_FORM_MAP.get(payment_form_code, payment_form_code) if payment_form_code else None
        payment_method = get_text(".//cac:PaymentMeans/cbc:PaymentMeansCode")

        # 6. NEW: Tax Breakdown (Discriminated)
        taxes_dict = {}
        tax_subtotals = tree.xpath(".//cac:TaxTotal/cac:TaxSubtotal", namespaces=NAMESPACES)
        for subtotal in tax_subtotals:
            tax_name = get_text(".//cac:TaxCategory/cac:TaxScheme/cbc:Name", node=subtotal)
            tax_percent = get_text(".//cac:TaxCategory/cbc:Percent", node=subtotal)
            tax_value = get_text(".//cbc:TaxAmount", node=subtotal)
            
            if tax_name and tax_value:
                # Create key like "IVA 19%" or just "IVA" if no percent
                key = f"{tax_name} {tax_percent}%" if tax_percent else tax_name
                taxes_dict[key] = float(tax_value)
        
        json_taxes = json.dumps(taxes_dict) if taxes_dict else None

        # 7. NEW: Line Items (Invoice Lines)
        items = []
        invoice_lines = tree.xpath(".//cac:InvoiceLine", namespaces=NAMESPACES)
        for line in invoice_lines:
            description = get_text(".//cac:Item/cbc:Description", node=line)
            quantity = get_text(".//cbc:InvoicedQuantity", node=line)
            unit_price = get_text(".//cac:Price/cbc:PriceAmount", node=line)
            total_line = get_text(".//cbc:LineExtensionAmount", node=line)
            
            items.append({
                "description": description or "Sin descripción",
                "quantity": float(quantity) if quantity else 0,
                "unit_price": float(unit_price) if unit_price else 0,
                "total_line": float(total_line) if total_line else 0
            })

        return {
            "uuid": uuid,
            "invoice_number": invoice_number,  # NEW: Human-readable ID
            "issue_date": issue_date,
            "total_amount": total_amount,
            "tax_amount": tax_amount,
            "base_amount": base_amount,
            "issuer_nit": issuer_nit,
            "issuer_name": issuer_name,
            "receiver_nit": receiver_nit,
            "receiver_name": receiver_name,
            "payment_form": payment_form,
            "payment_method": payment_method,
            "json_taxes": json_taxes,
            "items": items  # Array of line items
        }

    except Exception as e:
        logger.error(f"Error parsing XML: {e}")
        return None

def process_and_save_xml(file_storage):
    """
    Orchestrator: Reads content, calls parser, db save.
    Now also saves line items and detailed payment/tax info.
    Returns status dict: {'status': 'success'|'skipped'|'error', 'msg': ...}
    """
    try:
        logger.info(f"Reading file content for {file_storage.filename if hasattr(file_storage, 'filename') else 'unknown'}")
        
        # Reset file pointer to beginning (in case it was read before)
        if hasattr(file_storage, 'seek'):
            file_storage.seek(0)
            
        content = file_storage.read()
        
        if not content:
            logger.error("File content is empty")
            return {'status': 'error', 'msg': 'Empty file'}
        
        logger.info(f"Parsing XML content ({len(content)} bytes)")
        data = parse_xml_invoice(content)
        
        if not data:
            logger.error("Failed to parse XML - parse_xml_invoice returned None")
            return {'status': 'error', 'msg': 'Invalid XML structure or missing critical fields'}
        
        logger.info(f"XML parsed successfully, UUID: {data.get('uuid', 'N/A')[:12]}...")
            
        existing = Invoice.query.filter_by(uuid=data['uuid']).first()
        if existing:
            logger.info(f"Invoice with UUID {data['uuid'][:12]}... already exists, skipping")
            return {'status': 'skipped', 'msg': 'UUID already exists'}
        
        # Create Invoice with new fields
        logger.info("Creating new Invoice record")
        new_invoice = Invoice(
            uuid=data['uuid'],
            invoice_number=data.get('invoice_number'),  # NEW: Human-readable ID
            issue_date=data['issue_date'],
            total_amount=data['total_amount'],
            tax_amount=data['tax_amount'],
            base_amount=data['base_amount'],
            issuer_nit=data['issuer_nit'],
            issuer_name=data['issuer_name'],
            receiver_nit=data['receiver_nit'],
            receiver_name=data['receiver_name'],
            payment_form=data.get('payment_form'),
            payment_method=data.get('payment_method'),
            json_taxes=data.get('json_taxes')
        )
        
        db.session.add(new_invoice)
        logger.info("Invoice added to session, flushing to get ID")
        db.session.flush()  # Flush to get the invoice.id
        
        # Create InvoiceItem children
        items_data = data.get('items', [])
        logger.info(f"Creating {len(items_data)} invoice items")
        for idx, item_dict in enumerate(items_data):
            try:
                new_item = InvoiceItem(
                    invoice_id=new_invoice.id,
                    description=item_dict['description'],
                    quantity=item_dict['quantity'],
                    unit_price=item_dict['unit_price'],
                    total_line=item_dict['total_line']
                )
                db.session.add(new_item)
            except Exception as item_error:
                logger.error(f"Error creating item {idx}: {str(item_error)}")
                raise
        
        logger.info("Committing transaction to database")
        db.session.commit()
        logger.info(f"Invoice saved successfully with {len(items_data)} items")
        
        return {'status': 'success', 'msg': f"Saved with {len(items_data)} items"}

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error saving invoice: {str(e)}", exc_info=True)
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"Full traceback: {error_details}")
        return {'status': 'error', 'msg': str(e)}

def export_invoices_to_excel():
    """
    Export all invoices from database to Excel file using pandas.
    FLATTENED FORMAT: Each row represents a LINE ITEM (not an invoice).
    Invoice header fields are repeated for each item.
    Returns a BytesIO buffer with the Excel file.
    """
    try:
        # Fetch all invoices with their items (eager loading)
        invoices = Invoice.query.order_by(Invoice.issue_date.desc()).all()
        
        data_list = []
        
        for inv in invoices:
            # Parse taxes from JSON
            taxes_str = ""
            if inv.json_taxes:
                try:
                    taxes_dict = json.loads(inv.json_taxes)
                    taxes_str = ", ".join([f"{k}: {v}" for k, v in taxes_dict.items()])
                except:
                    taxes_str = inv.json_taxes
            
            # If invoice has items, create one row per item
            if inv.items:
                for item in inv.items:
                    data_list.append({
                        'Número Factura': inv.invoice_number or inv.uuid[:12],  # Invoice Number first (fallback to short UUID)
                        'Fecha': inv.issue_date.isoformat() if inv.issue_date else '',
                        'Emisor NIT': inv.issuer_nit or '',
                        'Emisor Nombre': inv.issuer_name or '',
                        'Receptor NIT': inv.receiver_nit or '',
                        'Receptor Nombre': inv.receiver_name or '',
                        'Forma Pago': inv.payment_form or '',
                        'Medio Pago': inv.payment_method or '',
                        'Impuestos (Desglose)': taxes_str,
                        'Total Factura': float(inv.total_amount) if inv.total_amount else 0,
                        # Line item details
                        'Descripción Ítem': item.description or '',
                        'Cantidad': float(item.quantity) if item.quantity else 0,
                        'Precio Unitario': float(item.unit_price) if item.unit_price else 0,
                        'Total Línea': float(item.total_line) if item.total_line else 0,
                        'UUID (CUFE)': inv.uuid  # UUID moved to last column
                    })
            else:
                # Invoice without items: create one row with empty item fields
                data_list.append({
                    'Número Factura': inv.invoice_number or inv.uuid[:12],
                    'Fecha': inv.issue_date.isoformat() if inv.issue_date else '',
                    'Emisor NIT': inv.issuer_nit or '',
                    'Emisor Nombre': inv.issuer_name or '',
                    'Receptor NIT': inv.receiver_nit or '',
                    'Receptor Nombre': inv.receiver_name or '',
                    'Forma Pago': inv.payment_form or '',
                    'Medio Pago': inv.payment_method or '',
                    'Impuestos (Desglose)': taxes_str,
                    'Total Factura': float(inv.total_amount) if inv.total_amount else 0,
                    'Descripción Ítem': '',
                    'Cantidad': 0,
                    'Precio Unitario': 0,
                    'Total Línea': 0,
                    'UUID (CUFE)': inv.uuid
                })
        
        if not data_list:
            # Empty dataframe if no data
            df = pd.DataFrame(columns=[
                'Número Factura', 'Fecha', 'Emisor NIT', 'Emisor Nombre', 
                'Receptor NIT', 'Receptor Nombre', 'Forma Pago', 'Medio Pago',
                'Impuestos (Desglose)', 'Total Factura',
                'Descripción Ítem', 'Cantidad', 'Precio Unitario', 'Total Línea',
                'UUID (CUFE)'
            ])
        else:
            df = pd.DataFrame(data_list)
        
        # Create Excel file in memory
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Detalle Facturas', index=False)
        
        output.seek(0)
        return output
        
    except Exception as e:
        logger.error(f"Error exporting to Excel: {e}")
        raise


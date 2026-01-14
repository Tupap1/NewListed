# -*- coding: utf-8 -*-
"""XML Module Data Models"""
from app.extensions import db
from datetime import datetime
import json

class Invoice(db.Model):
    __tablename__ = 'invoices'

    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(255), unique=True, nullable=False)  # CUFE (UUID técnico)
    invoice_number = db.Column(db.String(100), index=True, nullable=True)  # Número legible (ej: "BRZ2975")
    
    issuer_nit = db.Column(db.String(50), nullable=True)
    issuer_name = db.Column(db.String(255), nullable=True)
    
    receiver_nit = db.Column(db.String(50), nullable=True)
    receiver_name = db.Column(db.String(255), nullable=True)
    
    total_amount = db.Column(db.Numeric(18, 2), default=0.0)
    tax_amount = db.Column(db.Numeric(18, 2), default=0.0)
    base_amount = db.Column(db.Numeric(18, 2), default=0.0)
    
    issue_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # New fields for detailed invoice data
    payment_form = db.Column(db.String(50), nullable=True)  # "Contado", "Crédito"
    payment_method = db.Column(db.String(50), nullable=True)  # Code: "48", "10", etc.
    json_taxes = db.Column(db.Text, nullable=True)  # JSON: {"IVA 19%": 1000, "INC": 50}
    
    xml_content = db.Column(db.Text, nullable=True)
    
    # Relationship: One Invoice -> Many Items
    items = db.relationship('InvoiceItem', backref='invoice', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        taxes_dict = {}
        if self.json_taxes:
            try:
                taxes_dict = json.loads(self.json_taxes)
            except:
                pass
                
        return {
            'id': self.id,
            'uuid': self.uuid,
            'invoice_number': self.invoice_number,  # NEW: Human-readable ID
            'issuer_nit': self.issuer_nit,
            'issuer_name': self.issuer_name,
            'receiver_nit': self.receiver_nit,
            'receiver_name': self.receiver_name,
            'total_amount': float(self.total_amount) if self.total_amount else 0,
            'tax_amount': float(self.tax_amount) if self.tax_amount else 0,
            'issue_date': self.issue_date.isoformat() if self.issue_date else None,
            'payment_form': self.payment_form,
            'payment_method': self.payment_method,
            'taxes': taxes_dict,
            'created_at': self.created_at.isoformat()
        }


class InvoiceItem(db.Model):
    __tablename__ = 'invoice_items'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'), nullable=False)
    
    description = db.Column(db.String(500), nullable=True)
    quantity = db.Column(db.Numeric(18, 4), default=0.0)
    unit_price = db.Column(db.Numeric(18, 2), default=0.0)
    total_line = db.Column(db.Numeric(18, 2), default=0.0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'invoice_id': self.invoice_id,
            'description': self.description,
            'quantity': float(self.quantity) if self.quantity else 0,
            'unit_price': float(self.unit_price) if self.unit_price else 0,
            'total_line': float(self.total_line) if self.total_line else 0
        }

import os
from flask import Flask
from flask_cors import CORS
from .extensions import db

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        'DATABASE_URL', 
        'mysql+pymysql://user:password@db:3306/newlisted_db'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize Extensions
    db.init_app(app)
    CORS(app)
    
    # Register Blueprints
    from .modules.xml.routes import xml_bp
    from .modules.excel.routes import excel_bp
    
    app.register_blueprint(xml_bp, url_prefix='/api/xml')
    app.register_blueprint(excel_bp, url_prefix='/api/excel')
    
    # Create DB Tables (Simple approach for step 1)
    with app.app_context():
        # Import models to ensure they are registered
        from .modules.xml.models import Invoice, InvoiceItem
        from .modules.excel.models import ExcelReport
        db.create_all()
        
    return app

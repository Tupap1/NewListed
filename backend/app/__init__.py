import os
from flask import Flask
from flask_cors import CORS
from .extensions import db

def create_app():
    app = Flask(__name__)
    
    # Configuration
    # 1. Obtiene la URL de Railway (DATABASE_URL).
    # 2. Si no existe (estamos en local), usa la conexión a 'db' por defecto.
    database_url = os.getenv("DATABASE_URL", "mysql+pymysql://root:password@db:3306/pv")
    
    # FIX PARA SQLALCHEMY 1.4+ / 2.0
    # Railway entrega la URL con el protocolo "mysql://", pero SQLAlchemy requiere el driver explícito "mysql+pymysql://"
    if database_url and database_url.startswith("mysql://"):
        database_url = database_url.replace("mysql://", "mysql+pymysql://", 1)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
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

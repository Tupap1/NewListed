from app.extensions import db
from datetime import datetime

class ExcelReport(db.Model):
    __tablename__ = 'excel_reports'

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    report_type = db.Column(db.String(50), default='general')
    row_count = db.Column(db.Integer, default=0)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Path inside the container/volume
    file_path = db.Column(db.String(500), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'report_type': self.report_type,
            'row_count': self.row_count,
            'generated_at': self.generated_at.isoformat(),
            'file_path': self.file_path
        }

import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from src.infrastructure.db.repository import SqliteFacturaRepository, init_db, SessionLocal
from src.infrastructure.xml_parser import UBL21Parser
from src.application.use_cases import ProcesarFacturasXML

app = FastAPI(title="CCNsoft Core API")

# Initialize DB
init_db()

class ImportResponse(BaseModel):
    message: str
    processed_files: int

@app.post("/facturas/importar", response_model=ImportResponse)
async def importar_facturas(file: UploadFile = File(...)):
    if not file.filename.endswith(".xml"):
        raise HTTPException(status_code=400, detail="File must be an XML")

    content = await file.read()
    
    session = SessionLocal()
    try:
        repository = SqliteFacturaRepository(session)
        parser = UBL21Parser()
        use_case = ProcesarFacturasXML(repository, parser)
        use_case.execute([content])
        return ImportResponse(message="Factura processed successfully", processed_files=1)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()

# SPA / Static Files Serving
# Determine path to static files
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

if os.path.exists(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Serve index.html for any unknown path (SPA router) unless it's an API call
        # API calls should match above routes. 
        # But "full_path" acts as catch-all. 
        # Check if file exists in static root (favicon, etc)
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # Default to index.html
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
else:
    @app.get("/")
    def root():
        return {"message": "Backend API is running. Frontend static files not found (Development Mode)."}

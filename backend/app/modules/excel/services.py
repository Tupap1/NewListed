import pandas as pd
import numpy as np
import re
from datetime import datetime

REQUIRED_COLUMNS = ['Fecha', 'Folio', 'Tipo', 'Total', 'Impuesto']

def extract_numeric_folio(folio_val):
    """
    Extracts the numeric part of a Folio string.
    Example: 'SETT123' -> 123, '1001' -> 1001
    """
    if pd.isna(folio_val):
        return 0
    s_val = str(folio_val)
    # Find all digits
    digits = re.findall(r'\d+', s_val)
    if digits:
        # Join in case there are split numbers, though usually we take the last group or the main group.
        # Taking the joined digits is a safe-ish heuristic for "SETT-123" -> 123
        try:
            return int("".join(digits))
        except ValueError:
            return 0
    return 0

def process_excel_dataframe(file_stream):
    """
    Reads an Excel file stream/buffer and applies business logic.
    Returns a dictionary with summary and data.
    """
    try:
        # 1. Read Excel
        df = pd.read_excel(file_stream)
        
        # 2. Check Columns
        missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Missing required columns: {', '.join(missing_cols)}")
            
        # 3. Data Cleaning & Filtering
        # Remove rows where crucial data is completely NaN (optional, but good practice)
        df.dropna(how='all', inplace=True)
        
        # Ensure numeric types
        for col in ['Total', 'Impuesto']:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

        # A. Logical Segregation (Emitidos vs Recibidos)
        # Assuming 'Tipo' column dictates this. For now, we normalize it if needed.
        # We perform the operations on the whole set, but the frontend might display them separated.
        
        # B. Calculation of "Base"
        # Logic: Base = Total - Impuesto
        df['Base'] = df['Total'] - df['Impuesto']
        
        # C. Validation Column "Verif" (Tax Audit)
        # Logic: Impuesto / Base. If 0.19 -> OK.
        # Avoid division by zero
        def calculate_verif(row):
            base = row['Base']
            tax = row['Impuesto']
            
            if base == 0:
                if tax == 0: return "OK" # 0/0 is technically OK for this audit context (exempt)
                return "CHECK" # Tax with no base is suspicious
            
            ratio = tax / base
            # Round to 2 decimals for comparison or check close strictness? 
            # 19% can be slightly off due to float math, so we use np.isclose or round.
            if 0.18 <= ratio <= 0.20: # Loosened slightly for rounding errors, usually it's exact math but floating point safety.
                # If specifically looking for exactly 0.19 as per requirements:
                if abs(ratio - 0.19) < 0.001:
                    return "OK"
            
            return "CHECK"

        df['Verif'] = df.apply(calculate_verif, axis=1)

        # D. "COMCON" (Consecutive Control)
        # 1. Extract numeric folio for sorting/diffing
        df['Folio_Num'] = df['Folio'].apply(extract_numeric_folio)
        
        # 2. Sort by Fecha (ensure custom date parsing if needed) and Folio_Num
        # Ensure Fecha is datetime
        df['Fecha'] = pd.to_datetime(df['Fecha'], errors='coerce')
        df.sort_values(by=['Tipo', 'Fecha', 'Folio_Num'], inplace=True)
        
        # 3. Group by 'Tipo' and calculate Diff
        # We need to perform this distinct per group
        df['Diff'] = df.groupby('Tipo')['Folio_Num'].diff()
        
        def calculate_comcon(diff_val):
            if pd.isna(diff_val):
                return "START" # First item in the group
            if diff_val == 1:
                return "OK"
            if diff_val == 0:
                return "DUPLICATE"
            if diff_val > 1:
                return "JUMP DETECTED"
            return "ERROR" # Negative diff? Out of order? (Should be covered by sort but data might be weird)

        df['COMCON'] = df['Diff'].apply(calculate_comcon)
        
        # Cleanup temporary columns if not needed for display
        # keeping Folio_Num might be useful for debugging, but let's drop it from final JSON if cleaner
        # df.drop(columns=['Folio_Num', 'Diff'], inplace=True) 
        # Actually, let's keep them or just 'Diff' for debug in frontend if needed. Let's keep data rich.
        
        # Replace NaNs/NaT with None/Str for JSON serialization
        df = df.where(pd.notnull(df), None)
        
        # Format Date strings
        df['Fecha'] = df['Fecha'].apply(lambda x: x.isoformat() if x else None)

        records = df.to_dict(orient='records')
        
        summary = {
            "processed_rows": len(records),
            "errors": 0 # Placeholder if we track specific row errors later
        }

        return {
            "summary": summary,
            "data": records
        }

    except Exception as e:
        raise e

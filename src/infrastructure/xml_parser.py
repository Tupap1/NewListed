from decimal import Decimal
import xml.etree.ElementTree as ET
from datetime import datetime

from src.domain.ports import ParserFiscal
from src.domain.entities import Factura, ItemFactura
from src.domain.value_objects import Moneda

class UBL21Parser(ParserFiscal):
    def parse(self, content: bytes) -> Factura:
        """
        Parses a dummy/simplified XML structure resembling UBL.
        Expected structure for this demo:
        <Invoice>
           <IssueDate>2023-10-01</IssueDate>
           <InvoiceLine>
              <Description>Item 1</Description>
              <InvoicedQuantity>2</InvoicedQuantity>
              <PriceAmount currencyID="COP">100.00</PriceAmount>
              <TaxPercent>0.19</TaxPercent>
           </InvoiceLine>
           ...
        </Invoice>
        """
        root = ET.fromstring(content)
        
        # Read Date
        date_str = root.findtext("IssueDate", default=datetime.today().strftime('%Y-%m-%d'))
        fecha_emision = datetime.strptime(date_str, '%Y-%m-%d').date()

        factura = Factura(fecha_emision=fecha_emision)

        # Read Items
        for line in root.findall("InvoiceLine"):
            desc = line.findtext("Description", "Unknown Item")
            qty = Decimal(line.findtext("InvoicedQuantity", "0"))
            
            price_node = line.find("PriceAmount")
            price_val = Decimal(price_node.text) if price_node is not None else Decimal("0")
            currency = price_node.attrib.get("currencyID", "COP") if price_node is not None else "COP"
            
            tax_val = Decimal(line.findtext("TaxPercent", "0.00"))

            item = ItemFactura(
                descripcion=desc,
                cantidad=qty,
                precio_unitario=Moneda(price_val, currency),
                tasa_impuesto=tax_val
            )
            factura.agregar_item(item)
            
        return factura

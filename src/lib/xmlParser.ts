
import { Invoice, Supplier, InvoiceItem } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export interface ParsedXMLData {
  supplier: Supplier;
  danfeNumber: string;
  issueDate: Date;
  totalValue: number;
  items: InvoiceItem[];
}

export function parseXMLToInvoice(xmlContent: string): ParsedXMLData {
  // Parse XML content using DOMParser
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
  
  // Check for parsing errors
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    throw new Error("Erro ao processar XML: Formato inválido");
  }

  try {
    // Extract supplier information
    const emit = xmlDoc.querySelector("emit");
    if (!emit) {
      throw new Error("Dados do emitente não encontrados no XML");
    }

    const supplierCNPJ = emit.querySelector("CNPJ")?.textContent || "";
    const supplierName = emit.querySelector("xNome")?.textContent || "";
    const supplierAddress = [
      emit.querySelector("xLgr")?.textContent,
      emit.querySelector("nro")?.textContent,
      emit.querySelector("xBairro")?.textContent,
      emit.querySelector("xMun")?.textContent,
      emit.querySelector("UF")?.textContent
    ].filter(Boolean).join(", ");
    
    const supplierPhone = emit.querySelector("fone")?.textContent || "";

    const supplier: Supplier = {
      id: uuidv4(),
      name: supplierName,
      cnpj: supplierCNPJ,
      address: supplierAddress,
      phone: supplierPhone
    };

    // Extract invoice information
    const ide = xmlDoc.querySelector("ide");
    if (!ide) {
      throw new Error("Dados de identificação da nota não encontrados no XML");
    }

    const danfeNumber = ide.querySelector("nNF")?.textContent || "";
    const issueDateStr = ide.querySelector("dhEmi")?.textContent || ide.querySelector("dEmi")?.textContent || "";
    
    let issueDate: Date;
    if (issueDateStr) {
      issueDate = new Date(issueDateStr);
    } else {
      throw new Error("Data de emissão não encontrada no XML");
    }

    // Extract total value
    const icmsTot = xmlDoc.querySelector("ICMSTot");
    const totalValueStr = icmsTot?.querySelector("vNF")?.textContent || "0";
    const totalValue = parseFloat(totalValueStr);

    // Extract items
    const detNodes = xmlDoc.querySelectorAll("det");
    const items: InvoiceItem[] = [];
    
    detNodes.forEach((det) => {
      const prod = det.querySelector("prod");
      if (prod) {
        const description = prod.querySelector("xProd")?.textContent || "";
        const quantityStr = prod.querySelector("qCom")?.textContent || "0";
        const unitPriceStr = prod.querySelector("vUnCom")?.textContent || "0";
        const unitOfMeasure = prod.querySelector("uCom")?.textContent || "Un";
        
        const quantity = parseFloat(quantityStr);
        const unitPrice = parseFloat(unitPriceStr);
        const totalPrice = quantity * unitPrice;

        if (description && quantity > 0) {
          items.push({
            id: uuidv4(),
            description,
            quantity,
            unitPrice,
            totalPrice,
            unitOfMeasure,
            invoiceId: "" // Will be set later
          });
        }
      }
    });

    if (items.length === 0) {
      throw new Error("Nenhum item encontrado no XML");
    }

    return {
      supplier,
      danfeNumber,
      issueDate,
      totalValue,
      items
    };

  } catch (error) {
    console.error("Erro ao processar XML:", error);
    throw new Error(`Erro ao processar XML: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

// Função para validar se o XML é uma NFe válida
export function validateNFeXML(xmlContent: string): boolean {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
    
    // Verificar se é uma NFe
    const nfeProc = xmlDoc.querySelector("nfeProc");
    const nfe = xmlDoc.querySelector("NFe");
    
    return !!(nfeProc || nfe);
  } catch {
    return false;
  }
}


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
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
  
  // Check for parsing errors
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    throw new Error("Erro ao processar XML: Formato inválido");
  }

  try {
    // NFe namespace
    const NFE_NAMESPACE = 'http://www.portalfiscal.inf.br/nfe';
    
    // Helper function to get element by tag name with namespace support
    const getElementByTagName = (tagName: string, context: Document | Element = xmlDoc): Element | null => {
      // Try with namespace first
      let element = context.querySelector(`[xmlns="${NFE_NAMESPACE}"] ${tagName}`);
      if (!element) {
        // Try without namespace (fallback)
        element = context.querySelector(tagName);
      }
      if (!element) {
        // Try with different namespace prefixes
        element = context.querySelector(`nfe\\:${tagName}`) || 
                 context.querySelector(`ns2\\:${tagName}`) ||
                 context.querySelector(`*[localName="${tagName}"]`);
      }
      return element;
    };

    // Helper function to get text content safely
    const getTextContent = (tagName: string, context: Document | Element = xmlDoc): string => {
      const element = getElementByTagName(tagName, context);
      return element?.textContent?.trim() || "";
    };

    // Extract supplier information (emit)
    const emitElement = getElementByTagName('emit');
    if (!emitElement) {
      throw new Error("Dados do emitente (fornecedor) não encontrados no XML");
    }

    const supplierName = getTextContent('xNome', emitElement);
    const supplierCNPJ = getTextContent('CNPJ', emitElement);

    if (!supplierName || !supplierCNPJ) {
      throw new Error("Nome ou CNPJ do fornecedor não encontrados no XML");
    }

    // Build supplier address
    const enderEmitElement = getElementByTagName('enderEmit', emitElement);
    let supplierAddress = "";
    let supplierPhone = "";
    
    if (enderEmitElement) {
      const addressParts = [
        getTextContent('xLgr', enderEmitElement),
        getTextContent('nro', enderEmitElement),
        getTextContent('xBairro', enderEmitElement),
        getTextContent('xMun', enderEmitElement),
        getTextContent('UF', enderEmitElement)
      ].filter(Boolean);
      
      supplierAddress = addressParts.join(", ");
      supplierPhone = getTextContent('fone', enderEmitElement);
    }

    const supplier: Supplier = {
      id: uuidv4(),
      name: supplierName,
      cnpj: supplierCNPJ,
      address: supplierAddress,
      phone: supplierPhone
    };

    // Extract invoice identification (ide)
    const ideElement = getElementByTagName('ide');
    if (!ideElement) {
      throw new Error("Dados de identificação da nota não encontrados no XML");
    }

    const danfeNumber = getTextContent('nNF', ideElement);
    const issueDateStr = getTextContent('dhEmi', ideElement) || getTextContent('dEmi', ideElement);

    if (!danfeNumber) {
      throw new Error("Número da DANFE não encontrado no XML");
    }

    let issueDate: Date;
    if (issueDateStr) {
      issueDate = new Date(issueDateStr);
      if (isNaN(issueDate.getTime())) {
        throw new Error("Data de emissão inválida no XML");
      }
    } else {
      throw new Error("Data de emissão não encontrada no XML");
    }

    // Extract total value (total > ICMSTot > vNF)
    const totalElement = getElementByTagName('total');
    const icmsTotElement = totalElement ? getElementByTagName('ICMSTot', totalElement) : null;
    const totalValueStr = icmsTotElement ? getTextContent('vNF', icmsTotElement) : "";
    
    if (!totalValueStr) {
      throw new Error("Valor total da nota não encontrado no XML");
    }

    const totalValue = parseFloat(totalValueStr.replace(',', '.'));
    if (isNaN(totalValue)) {
      throw new Error("Valor total da nota inválido");
    }

    // Extract ALL items (det elements)
    const detElements = xmlDoc.querySelectorAll('det');
    const items: InvoiceItem[] = [];
    
    console.log(`Processando ${detElements.length} itens encontrados no XML da NF-e`);
    
    if (detElements.length === 0) {
      throw new Error("Nenhum item encontrado no XML da NF-e");
    }

    detElements.forEach((detElement, index) => {
      // Get prod element within each det
      const prodElement = getElementByTagName('prod', detElement);
      
      if (!prodElement) {
        console.warn(`Item ${index + 1}: elemento 'prod' não encontrado`);
        return;
      }

      // Extract product information from prod element
      const description = getTextContent('xProd', prodElement);
      const quantityStr = getTextContent('qCom', prodElement); // Quantidade comercial
      const unitPriceStr = getTextContent('vUnCom', prodElement); // Valor unitário comercial
      const totalPriceStr = getTextContent('vProd', prodElement); // Valor total do produto
      const unitOfMeasure = getTextContent('uCom', prodElement) || "Un"; // Unidade comercial

      // Convert values, handling Brazilian decimal format
      const quantity = parseFloat(quantityStr.replace(',', '.')) || 0;
      const unitPrice = parseFloat(unitPriceStr.replace(',', '.')) || 0;
      const totalPrice = parseFloat(totalPriceStr.replace(',', '.')) || 0;

      console.log(`Item ${index + 1}: ${description} - Qtd: ${quantity} - Preço Unit: ${unitPrice} - Total: ${totalPrice}`);

      // Only add items with valid description and quantity
      if (description && quantity > 0) {
        items.push({
          id: uuidv4(),
          description: description.trim(),
          quantity,
          unitPrice,
          totalPrice,
          unitOfMeasure: unitOfMeasure.trim(),
          invoiceId: "" // Will be set later when creating the invoice
        });
      } else {
        console.warn(`Item ${index + 1} ignorado por dados inválidos: descrição="${description}", quantidade=${quantity}`);
      }
    });

    if (items.length === 0) {
      throw new Error("Nenhum item válido encontrado no XML da NF-e");
    }

    console.log(`Total de ${items.length} itens processados com sucesso da NF-e`);

    return {
      supplier,
      danfeNumber,
      issueDate,
      totalValue,
      items
    };

  } catch (error) {
    console.error("Erro ao processar XML da NF-e:", error);
    throw new Error(`Erro ao processar XML da NF-e: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

// Function to validate if XML is a valid NF-e
export function validateNFeXML(xmlContent: string): boolean {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
    
    // Check for NF-e structure
    const nfeProc = xmlDoc.querySelector("nfeProc");
    const nfe = xmlDoc.querySelector("NFe");
    const nfeWithNamespace = xmlDoc.querySelector("nfe\\:NFe, NFe");
    
    // Check for required elements that indicate it's a NF-e
    const hasEmit = xmlDoc.querySelector("emit") || xmlDoc.querySelector("nfe\\:emit");
    const hasIde = xmlDoc.querySelector("ide") || xmlDoc.querySelector("nfe\\:ide");
    const hasDet = xmlDoc.querySelector("det") || xmlDoc.querySelector("nfe\\:det");
    
    return !!(nfeProc || nfe || nfeWithNamespace) && !!(hasEmit && hasIde && hasDet);
  } catch {
    return false;
  }
}

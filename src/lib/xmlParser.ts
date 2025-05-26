
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
    // Define namespace resolver for NF-e XML
    const nsResolver = (prefix: string) => {
      const namespaces: { [key: string]: string } = {
        'nfe': 'http://www.portalfiscal.inf.br/nfe'
      };
      return namespaces[prefix] || null;
    };

    // Function to get text content using XPath with namespace
    const getXPathValue = (xpath: string, context: Node = xmlDoc): string => {
      const result = xmlDoc.evaluate(xpath, context, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      return result.singleNodeValue?.textContent?.trim() || "";
    };

    // Function to get all nodes using XPath
    const getXPathNodes = (xpath: string, context: Node = xmlDoc): Node[] => {
      const result = xmlDoc.evaluate(xpath, context, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      const nodes: Node[] = [];
      for (let i = 0; i < result.snapshotLength; i++) {
        const node = result.snapshotItem(i);
        if (node) nodes.push(node);
      }
      return nodes;
    };

    // Extract supplier information (emitente)
    const supplierName = getXPathValue("//nfe:emit/nfe:xNome") || 
                        getXPathValue("//emit/xNome");
    
    const supplierCNPJ = getXPathValue("//nfe:emit/nfe:CNPJ") || 
                        getXPathValue("//emit/CNPJ");

    // Build supplier address
    const addressParts = [
      getXPathValue("//nfe:emit/nfe:enderEmit/nfe:xLgr") || getXPathValue("//emit/enderEmit/xLgr"),
      getXPathValue("//nfe:emit/nfe:enderEmit/nfe:nro") || getXPathValue("//emit/enderEmit/nro"),
      getXPathValue("//nfe:emit/nfe:enderEmit/nfe:xBairro") || getXPathValue("//emit/enderEmit/xBairro"),
      getXPathValue("//nfe:emit/nfe:enderEmit/nfe:xMun") || getXPathValue("//emit/enderEmit/xMun"),
      getXPathValue("//nfe:emit/nfe:enderEmit/nfe:UF") || getXPathValue("//emit/enderEmit/UF")
    ].filter(Boolean);

    const supplierAddress = addressParts.join(", ");
    const supplierPhone = getXPathValue("//nfe:emit/nfe:enderEmit/nfe:fone") || 
                         getXPathValue("//emit/enderEmit/fone");

    if (!supplierName || !supplierCNPJ) {
      throw new Error("Dados do emitente não encontrados ou incompletos no XML");
    }

    const supplier: Supplier = {
      id: uuidv4(),
      name: supplierName,
      cnpj: supplierCNPJ,
      address: supplierAddress,
      phone: supplierPhone
    };

    // Extract invoice identification (identificação da nota)
    const danfeNumber = getXPathValue("//nfe:ide/nfe:nNF") || 
                       getXPathValue("//ide/nNF");
    
    const issueDateStr = getXPathValue("//nfe:ide/nfe:dhEmi") || 
                        getXPathValue("//ide/dhEmi") ||
                        getXPathValue("//nfe:ide/nfe:dEmi") || 
                        getXPathValue("//ide/dEmi");

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

    // Extract total value (valor total da NF-e)
    const totalValueStr = getXPathValue("//nfe:total/nfe:ICMSTot/nfe:vNF") || 
                         getXPathValue("//total/ICMSTot/vNF");
    
    if (!totalValueStr) {
      throw new Error("Valor total da nota não encontrado no XML");
    }

    const totalValue = parseFloat(totalValueStr.replace(',', '.'));
    if (isNaN(totalValue)) {
      throw new Error("Valor total da nota inválido");
    }

    // Extract ALL items (detalhes dos produtos/serviços)
    const detailNodes = getXPathNodes("//nfe:det") || getXPathNodes("//det");
    const items: InvoiceItem[] = [];
    
    console.log(`Processando ${detailNodes.length} itens encontrados no XML da NF-e`);
    
    detailNodes.forEach((detNode, index) => {
      // Extract product information from each detail node
      const description = getXPathValue(".//nfe:prod/nfe:xProd", detNode) || 
                         getXPathValue(".//prod/xProd", detNode);
      
      const quantityStr = getXPathValue(".//nfe:prod/nfe:qCom", detNode) || 
                         getXPathValue(".//prod/qCom", detNode);
      
      const unitPriceStr = getXPathValue(".//nfe:prod/nfe:vUnCom", detNode) || 
                          getXPathValue(".//prod/vUnCom", detNode);
      
      const unitOfMeasure = getXPathValue(".//nfe:prod/nfe:uCom", detNode) || 
                           getXPathValue(".//prod/uCom", detNode) || "Un";
      
      const totalPriceStr = getXPathValue(".//nfe:prod/nfe:vProd", detNode) || 
                           getXPathValue(".//prod/vProd", detNode);

      // Convert values, handling Brazilian decimal format (comma as decimal separator)
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

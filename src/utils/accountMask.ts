
export const formatAccountMask = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara: 0.0.00.00.0000
  let formatted = '';
  
  for (let i = 0; i < numbers.length && i < 10; i++) {
    // Adiciona pontos nas posições corretas
    if (i === 1 || i === 2 || i === 4 || i === 6) {
      formatted += '.';
    }
    formatted += numbers[i];
  }
  
  return formatted;
};

export const validateAccountCode = (code: string): boolean => {
  // Remove pontos para validação
  const numbers = code.replace(/\./g, '');
  
  if (numbers.length !== 10) return false;
  
  // Valida cada segmento
  const segment1 = parseInt(numbers.substring(0, 1)); // 1-9
  const segment2 = parseInt(numbers.substring(1, 2)); // 1-9
  const segment3 = parseInt(numbers.substring(2, 4)); // 01-99
  const segment4 = parseInt(numbers.substring(4, 6)); // 01-99
  const segment5 = parseInt(numbers.substring(6, 10)); // 0001-9999
  
  return (
    segment1 >= 1 && segment1 <= 9 &&
    segment2 >= 1 && segment2 <= 9 &&
    segment3 >= 1 && segment3 <= 99 &&
    segment4 >= 1 && segment4 <= 99 &&
    segment5 >= 1 && segment5 <= 9999
  );
};

export const isValidAccountFormat = (code: string): boolean => {
  const regex = /^\d\.\d\.\d{2}\.\d{2}\.\d{4}$/;
  return regex.test(code);
};

export const applyAccountMask = (value: string): string => {
  // Remove tudo que não é número
  let numbers = value.replace(/\D/g, '');
  
  // Limita a 10 dígitos
  numbers = numbers.substring(0, 10);
  
  // Aplica a máscara progressivamente
  let result = '';
  
  if (numbers.length > 0) {
    result += numbers[0]; // Primeiro dígito
  }
  if (numbers.length > 1) {
    result += '.' + numbers[1]; // Segundo dígito com ponto
  }
  if (numbers.length > 2) {
    result += '.' + numbers.substring(2, 4); // Terceiro e quarto dígitos
  }
  if (numbers.length > 4) {
    result += '.' + numbers.substring(4, 6); // Quinto e sexto dígitos
  }
  if (numbers.length > 6) {
    result += '.' + numbers.substring(6, 10); // Últimos quatro dígitos
  }
  
  return result;
};

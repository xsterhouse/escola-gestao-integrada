
// Utility functions for safe date handling across the application

export const safeFormatDate = (dateInput: Date | string | null | undefined): string => {
  if (!dateInput) return '';
  
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('pt-BR').format(date);
  } catch {
    return '';
  }
};

export const safeDateToISOString = (dateInput: Date | string | null | undefined): string => {
  if (!dateInput) return new Date().toISOString();
  
  try {
    if (typeof dateInput === 'string') {
      return dateInput.includes('T') ? dateInput : new Date(dateInput).toISOString();
    }
    return dateInput.toISOString();
  } catch {
    return new Date().toISOString();
  }
};

export const safeStringToDate = (dateString: string): Date => {
  try {
    return new Date(dateString);
  } catch {
    return new Date();
  }
};

export const ensureDateString = (dateInput: Date | string): string => {
  if (typeof dateInput === 'string') return dateInput;
  return dateInput.toISOString();
};

export const ensureDate = (dateInput: Date | string): Date => {
  if (typeof dateInput === 'string') return new Date(dateInput);
  return dateInput;
};

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  status: boolean;
  error: string;
  message: string;
  details?: ValidationError[];
}

export const handleApiError = (error: any): string => {
  if (error.response?.data) {
    const apiError: ApiError = error.response.data;
    
    // Handle validation errors
    if (apiError.details && Array.isArray(apiError.details)) {
      const validationMessages = apiError.details.map(detail => 
        `${detail.field}: ${detail.message}`
      ).join('\n');
      return validationMessages;
    }
    
    // Handle general API errors
    if (apiError.message) {
      return apiError.message;
    }
    
    if (apiError.error) {
      return apiError.error;
    }
  }
  
  // Handle network errors
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const showErrorMessage = (error: any): void => {
  const message = handleApiError(error);
  alert(message);
};
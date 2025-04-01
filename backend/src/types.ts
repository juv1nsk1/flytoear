export interface TravelRequestBody {
    confirmationCode: string;
    date: string;
    destination: string;
  };
  
 export  interface TravelDataResponse {
    uri: string;
    customer: string;
    error: string | null;
  };
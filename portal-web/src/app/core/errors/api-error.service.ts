import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface UserFacingError {
  code: string;
  message: string;
}

const MSG_NETWORK =
  'Não foi possível conectar ao servidor. Verifique sua rede ou tente novamente.';
const MSG_SESSION = 'Sua sessão expirou. Faça login novamente.';
const MSG_FORBIDDEN = 'Você não tem permissão para esta ação.';
const MSG_NOT_FOUND =
  'Recurso não encontrado. O BFF pode ainda não estar disponível.';
const MSG_SERVER =
  'Erro interno no servidor. Tente novamente em alguns minutos.';
const MSG_GENERIC = 'Ocorreu um erro inesperado. Tente novamente.';

@Injectable({ providedIn: 'root' })
export class ApiErrorService {
  mapHttpError(error: HttpErrorResponse): UserFacingError {
    if (error.status === 0) {
      return { code: 'NETWORK', message: MSG_NETWORK };
    }
    if (error.status === 401) {
      return { code: 'UNAUTHORIZED', message: MSG_SESSION };
    }
    if (error.status === 403) {
      return { code: 'FORBIDDEN', message: MSG_FORBIDDEN };
    }
    if (error.status === 404) {
      return { code: 'NOT_FOUND', message: MSG_NOT_FOUND };
    }
    if (error.status >= 500) {
      return { code: 'SERVER', message: MSG_SERVER };
    }
    return { code: 'UNKNOWN', message: MSG_GENERIC };
  }
}

export const API_ERROR_MESSAGES = {
  NETWORK: MSG_NETWORK,
  SESSION: MSG_SESSION,
  FORBIDDEN: MSG_FORBIDDEN,
  NOT_FOUND: MSG_NOT_FOUND,
  SERVER: MSG_SERVER,
  GENERIC: MSG_GENERIC,
} as const;

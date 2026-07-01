import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { InsumosListResponse } from './models/insumo.model';

@Injectable({ providedIn: 'root' })
export class InsumosApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl.replace(/\/$/, '')}/insumos`;

  getInsumos(): Observable<InsumosListResponse> {
    return this.http.get<InsumosListResponse>(this.url);
  }
}

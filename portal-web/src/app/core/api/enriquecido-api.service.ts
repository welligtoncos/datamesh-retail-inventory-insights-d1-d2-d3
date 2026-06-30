import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { EnriquecidoKpis, PartitionListResponse } from './models/enriquecido.model';

@Injectable({ providedIn: 'root' })
export class EnriquecidoApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl.replace(/\/$/, '');

  getPartitions(): Observable<PartitionListResponse> {
    return this.http.get<PartitionListResponse>(`${this.base}/enriquecido/partitions`);
  }

  getKpis(dt: string): Observable<EnriquecidoKpis> {
    return this.http.get<EnriquecidoKpis>(`${this.base}/enriquecido/${dt}/kpis`);
  }
}

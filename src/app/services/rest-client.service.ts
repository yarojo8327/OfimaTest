import { Injectable } from '@angular/core';
import { HttpEventType, HttpClient } from '@angular/common/http';
import { Subscriber } from 'rxjs';
import { environment } from '../../environments/environment';

const baseUrl = `${environment.baseUrl}`;

@Injectable({
  providedIn: 'root'
})
export class RestClientService {

  constructor(private http: HttpClient) { }

  getById(method: string, id: any) {
    return this.http.get(`${baseUrl}/${method}/${id}`);
  }

  getAll(method: string) {
    return this.http.get(`${baseUrl}/${method}`);
  }

  post(method: string, params: any) {
    return this.http.post(`${baseUrl}/${method}`, params);
  }

  put(method: string, params: any) {
    return this.http.put(`${baseUrl}/${method}`, params);
  }
}

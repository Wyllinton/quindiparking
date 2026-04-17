import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { MembershipDTO, MembershipActiveCheckDTO, DiscountDTO, AdminCreateMembershipDTO } from '../models/membership.model';
import { MembershipPlanDTO, UpdateRecordStatusDTO } from '../models/membership-plan.model';
import { MembershipStatus } from '../../../shared/models/enums.model';
import { CountDTO, ExistsDTO } from '../../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class MembershipService extends ApiService {

  // ════════════════════════════════════════════
  //  MEMBERSHIPS
  // ════════════════════════════════════════════

  createMembership(membership: MembershipDTO): Observable<MembershipDTO> {
    return this.post<MembershipDTO>('/memberships', membership);
  }

  createMembershipAdmin(dto: AdminCreateMembershipDTO): Observable<MembershipDTO> {
    return this.post<MembershipDTO>('/memberships/admin', dto);
  }

  getAllMemberships(status?: MembershipStatus): Observable<MembershipDTO[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.get<MembershipDTO[]>('/memberships', params);
  }

  getMembershipById(id: number): Observable<MembershipDTO> {
    return this.get<MembershipDTO>(`/memberships/${id}`);
  }

  updateMembership(id: number, membership: MembershipDTO): Observable<MembershipDTO> {
    return this.put<MembershipDTO>(`/memberships/${id}`, membership);
  }

  deleteMembership(id: number): Observable<void> {
    return this.delete<void>(`/memberships/${id}`);
  }

  getMembershipsByUserId(userId: number): Observable<MembershipDTO[]> {
    return this.get<MembershipDTO[]>(`/memberships/user/${userId}`);
  }

  getActiveMembershipByUserId(userId: number): Observable<MembershipDTO> {
    return this.get<MembershipDTO>(`/memberships/user/${userId}/active`);
  }

  hasActiveMembershipAtDate(userId: number, date: string): Observable<MembershipActiveCheckDTO> {
    const params = new HttpParams().set('date', date);
    return this.get<MembershipActiveCheckDTO>(`/memberships/user/${userId}/active-at-date`, params);
  }

  getDiscountPercentageByUserId(userId: number): Observable<DiscountDTO> {
    return this.get<DiscountDTO>(`/memberships/user/${userId}/discount`);
  }

  activateMembership(id: number): Observable<MembershipDTO> {
    return this.patch<MembershipDTO>(`/memberships/${id}/activate`);
  }

  cancelMembership(id: number): Observable<MembershipDTO> {
    return this.patch<MembershipDTO>(`/memberships/${id}/cancel`);
  }

  renewMembership(id: number): Observable<MembershipDTO> {
    return this.patch<MembershipDTO>(`/memberships/${id}/renew`);
  }

  countActiveMemberships(): Observable<CountDTO> {
    return this.get<CountDTO>('/memberships/stats/active-count');
  }

  // ════════════════════════════════════════════
  //  MEMBERSHIP PLANS
  // ════════════════════════════════════════════

  createMembershipPlan(plan: MembershipPlanDTO): Observable<MembershipPlanDTO> {
    return this.post<MembershipPlanDTO>('/membership-plans', plan);
  }

  getAllMembershipPlans(): Observable<MembershipPlanDTO[]> {
    return this.get<MembershipPlanDTO[]>('/membership-plans');
  }

  getMembershipPlanById(id: number): Observable<MembershipPlanDTO> {
    return this.get<MembershipPlanDTO>(`/membership-plans/${id}`);
  }

  updateMembershipPlan(id: number, plan: MembershipPlanDTO): Observable<MembershipPlanDTO> {
    return this.put<MembershipPlanDTO>(`/membership-plans/${id}`, plan);
  }

  deleteMembershipPlan(id: number): Observable<void> {
    return this.delete<void>(`/membership-plans/${id}`);
  }

  getMembershipPlanByName(name: string): Observable<MembershipPlanDTO> {
    return this.get<MembershipPlanDTO>(`/membership-plans/name/${name}`);
  }

  getActiveMembershipPlans(): Observable<MembershipPlanDTO[]> {
    return this.get<MembershipPlanDTO[]>('/membership-plans/active');
  }

  getPlansWithDiscount(): Observable<MembershipPlanDTO[]> {
    return this.get<MembershipPlanDTO[]>('/membership-plans/with-discount');
  }

  updateMembershipPlanStatus(id: number, dto: UpdateRecordStatusDTO): Observable<MembershipPlanDTO> {
    return this.patch<MembershipPlanDTO>(`/membership-plans/${id}/status`, dto);
  }

  existsMembershipPlanByName(name: string): Observable<ExistsDTO> {
    return this.get<ExistsDTO>(`/membership-plans/check-name/${name}`);
  }
}

'use client'

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Building2, User, Mail, Phone, MapPin, Search, Trash2, AlertTriangle, ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { formatPhoneNumber, formatBusinessNumber, formatFaxNumber } from '@/lib/formatters';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

interface Customer {
  id: string;
  company_name: string;
  representative_name: string;
  contact_person: string | null | undefined;
  business_registration_number: string | null | undefined;
  email: string;
  phone: string;
  address: string | null | undefined;
  fax?: string | null;
  business_type?: string | null;
  business_category?: string | null;
  created_at: string;
  updated_at?: string;
}

interface CustomerFormData {
  company_name: string;
  representative_name: string;
  contact_person: string;
  business_registration_number: string;
  email: string;
  phone: string;
  address: string;
  fax: string;
  business_type: string;
  business_category: string;
}

export default function CustomersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    company_name: '',
    representative_name: '',
    contact_person: '',
    business_registration_number: '',
    email: '',
    phone: '',
    address: '',
    fax: '',
    business_type: '',
    business_category: ''
  });
  const [errors, setErrors] = useState<Partial<CustomerFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editFormData, setEditFormData] = useState<CustomerFormData>({
    company_name: '',
    representative_name: '',
    contact_person: '',
    business_registration_number: '',
    email: '',
    phone: '',
    address: '',
    fax: '',
    business_type: '',
    business_category: ''
  });
  const [editErrors, setEditErrors] = useState<Partial<CustomerFormData>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [expandedCards, setExpandedCards] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchCustomers();
    }
  }, [user, authLoading]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      // 먼저 localStorage에서 고객 데이터 가져오기
      const localCustomers = JSON.parse(localStorage.getItem('talksign_customers') || '[]');

      // 서버에서도 고객 데이터 가져오기 시도
      try {
        const response = await apiClient.get('/api/customers');
        if (response.ok) {
          const serverCustomers = await response.json();

          // localStorage와 서버 데이터 병합 (중복 제거)
          const allCustomers = [...localCustomers];
          serverCustomers.forEach((serverCustomer: Customer) => {
            const existsInLocal = localCustomers.some((local: Customer) =>
              local.email === serverCustomer.email || local.id === serverCustomer.id
            );
            if (!existsInLocal) {
              allCustomers.push(serverCustomer);
            }
          });

          // 생성일 기준으로 정렬
          const sortedCustomers = allCustomers.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          setCustomers(sortedCustomers);
        } else {
          // 서버 실패 시 localStorage 데이터만 사용
          console.log('Server failed, using localStorage data only');
          setCustomers(localCustomers);
        }
      } catch (serverError) {
        console.log('Server error, using localStorage data only:', serverError);
        setCustomers(localCustomers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Partial<CustomerFormData> = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = '회사명은 필수 입력 항목입니다.';
    }
    if (!formData.representative_name.trim()) {
      newErrors.representative_name = '대표자는 필수 입력 항목입니다.';
    }
    if (!formData.email.trim()) {
      newErrors.email = '이메일은 필수 입력 항목입니다.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = '연락처는 필수 입력 항목입니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // 먼저 localStorage에 저장 (즉시 지속성 보장)
      const newCustomer = {
        id: `customer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        company_name: formData.company_name.trim(),
        representative_name: formData.representative_name.trim(),
        contact_person: formData.contact_person.trim() || null,
        business_registration_number: formData.business_registration_number.trim() || null,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim() || null,
        fax: formData.fax.trim() || null,
        business_type: formData.business_type.trim() || null,
        business_category: formData.business_category.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // localStorage에 저장
      const existingCustomers = JSON.parse(localStorage.getItem('talksign_customers') || '[]');
      const updatedCustomers = [newCustomer, ...existingCustomers];
      localStorage.setItem('talksign_customers', JSON.stringify(updatedCustomers));

      // 즉시 UI 업데이트
      setCustomers([newCustomer, ...customers]);

      // 백그라운드에서 서버에도 저장 시도 (실패해도 무시)
      try {
        // API 스키마에 맞게 필드명 변환
        const apiPayload = {
          name: formData.representative_name.trim(),  // representative_name → name
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          company: formData.company_name.trim() || undefined,  // company_name → company
          businessRegistrationNumber: formData.business_registration_number.trim() || undefined,
          address: formData.address.trim() || undefined,
          fax: formData.fax.trim() || undefined,
          businessType: formData.business_type.trim() || undefined,
          businessCategory: formData.business_category.trim() || undefined,
          notes: formData.contact_person.trim() || undefined  // contact_person을 notes에 저장
        };

        const response = await apiClient.post('/api/customers', apiPayload);
        if (response.ok) {
          const serverCustomer = await response.json();
          console.log('✅ Customer also saved to server:', serverCustomer);
        } else {
          const errorText = await response.text();
          console.error('❌ Server save failed with status:', response.status);
          console.error('❌ Error response:', errorText);
        }
      } catch (serverError) {
        console.error('❌ Server save failed, but localStorage save succeeded:', serverError);
      }

      setFormData({
        company_name: '',
        representative_name: '',
        contact_person: '',
        business_registration_number: '',
        email: '',
        phone: '',
        address: '',
        fax: '',
        business_type: '',
        business_category: ''
      });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error creating customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    let formattedValue = value;
    
    if (field === 'phone') {
      formattedValue = formatPhoneNumber(value);
    } else if (field === 'business_registration_number') {
      formattedValue = formatBusinessNumber(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(customer => customer.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedCustomers.length === 0) return;

    try {
      setIsDeleting(true);

      // 먼저 서버에서 삭제 시도
      const response = await apiClient.delete('/api/customers', { customerIds: selectedCustomers });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Server deletion failed:', errorData);
        throw new Error(errorData.error || 'Failed to delete customers from server');
      }

      console.log('Customers deleted from server successfully');

      // 서버 삭제 성공 후 localStorage에서도 삭제
      const existingCustomers = JSON.parse(localStorage.getItem('talksign_customers') || '[]');
      const updatedCustomers = existingCustomers.filter((customer: Customer) => !selectedCustomers.includes(customer.id));
      localStorage.setItem('talksign_customers', JSON.stringify(updatedCustomers));

      // UI에서 제거
      setCustomers(prev => prev.filter(customer => !selectedCustomers.includes(customer.id)));
      setSelectedCustomers([]);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting customers:', error);
      alert('고객 삭제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditFormData({
      company_name: customer.company_name,
      representative_name: customer.representative_name,
      contact_person: customer.contact_person || '',
      business_registration_number: customer.business_registration_number || '',
      email: customer.email,
      phone: customer.phone,
      address: customer.address || '',
      fax: (customer as any).fax || '',
      business_type: (customer as any).business_type || '',
      business_category: (customer as any).business_category || ''
    });
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  const toggleCardExpansion = (customerId: string) => {
    setExpandedCards(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleEditInputChange = (field: keyof CustomerFormData, value: string) => {
    let formattedValue = value;
    
    if (field === 'phone') {
      formattedValue = formatPhoneNumber(value);
    } else if (field === 'business_registration_number') {
      formattedValue = formatBusinessNumber(value);
    }
    
    setEditFormData(prev => ({ ...prev, [field]: formattedValue }));
    if (editErrors[field]) {
      setEditErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateEditForm = () => {
    const newErrors: Partial<CustomerFormData> = {};

    if (!editFormData.company_name.trim()) {
      newErrors.company_name = '회사명은 필수 입력 항목입니다.';
    }
    if (!editFormData.representative_name.trim()) {
      newErrors.representative_name = '대표자는 필수 입력 항목입니다.';
    }
    if (!editFormData.email.trim()) {
      newErrors.email = '이메일은 필수 입력 항목입니다.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }
    if (!editFormData.phone.trim()) {
      newErrors.phone = '연락처는 필수 입력 항목입니다.';
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEditForm() || !editingCustomer) return;

    try {
      setIsUpdating(true);

      // localStorage에서 업데이트
      const existingCustomers = JSON.parse(localStorage.getItem('talksign_customers') || '[]');
      const updatedCustomer = {
        ...editingCustomer,
        company_name: editFormData.company_name.trim(),
        representative_name: editFormData.representative_name.trim(),
        contact_person: editFormData.contact_person.trim() || null,
        business_registration_number: editFormData.business_registration_number.trim() || null,
        email: editFormData.email.trim(),
        phone: editFormData.phone.trim(),
        address: editFormData.address.trim() || null,
        fax: editFormData.fax.trim() || null,
        business_type: editFormData.business_type.trim() || null,
        business_category: editFormData.business_category.trim() || null,
        updated_at: new Date().toISOString()
      };

      const updatedCustomers = existingCustomers.map((customer: Customer) =>
        customer.id === editingCustomer.id ? updatedCustomer : customer
      );
      localStorage.setItem('talksign_customers', JSON.stringify(updatedCustomers));

      // 즉시 UI 업데이트
      setCustomers(prev =>
        prev.map(customer =>
          customer.id === editingCustomer.id ? updatedCustomer : customer
        )
      );

      setIsEditModalOpen(false);
      setEditingCustomer(null);

      // 백그라운드에서 서버에도 저장 시도 (실패해도 무시)
      try {
        const response = await apiClient.put(`/api/customers/${editingCustomer.id}`, editFormData);
        if (response.ok) {
          console.log('Customer also updated on server');
        }
      } catch (serverError) {
        console.log('Server update failed, but localStorage update succeeded:', serverError);
      }
    } catch (error) {
      console.error('Error updating customer:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.representative_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  // 인증 로딩 중이거나 로그인하지 않은 경우
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>로그인 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">로그인이 필요합니다</h2>
          <p className="text-muted-foreground mb-4">고객 관리를 이용하려면 로그인해주세요.</p>
          <Button onClick={() => window.location.href = '/auth/signin'}>
            로그인하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-medium text-foreground">고객 관리</h2>
          <p className="text-sm text-muted-foreground">고객 정보를 등록하고 관리할 수 있습니다.</p>
          
        </div>
        
        <div className="flex items-center gap-2">
          {/* 데스크톱/태블릿에서만 선택 삭제 버튼 표시 */}
          <div className="hidden sm:flex">
            {selectedCustomers.length > 0 && (
              <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    선택 삭제 ({selectedCustomers.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      고객 삭제 확인
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      선택한 {selectedCustomers.length}개의 고객을 삭제하시겠습니까?
                    </p>
                    <p className="text-sm text-destructive">
                      이 작업은 되돌릴 수 없습니다.
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteModalOpen(false)}
                      disabled={isDeleting}
                    >
                      취소
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteSelected}
                      disabled={isDeleting}
                    >
                      {isDeleting ? '삭제 중...' : '삭제'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              추가
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>새 고객 추가</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company_name" className="text-sm font-medium">회사명 *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="회사명을 입력하세요"
                  className={errors.company_name ? 'border-red-500' : ''}
                />
                {errors.company_name && (
                  <p className="text-sm text-red-500 mt-1">{errors.company_name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="representative_name" className="text-sm font-medium">대표자 *</Label>
                <Input
                  id="representative_name"
                  value={formData.representative_name}
                  onChange={(e) => handleInputChange('representative_name', e.target.value)}
                  placeholder="대표자명을 입력하세요"
                  className={errors.representative_name ? 'border-red-500' : ''}
                />
                {errors.representative_name && (
                  <p className="text-sm text-red-500 mt-1">{errors.representative_name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_person" className="text-sm font-medium">담당자</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange('contact_person', e.target.value)}
                  placeholder="담당자명을 입력하세요"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="business_registration_number" className="text-sm font-medium">사업자등록번호</Label>
                <Input
                  id="business_registration_number"
                  value={formData.business_registration_number}
                  onChange={(e) => handleInputChange('business_registration_number', e.target.value)}
                  placeholder="123-45-67890"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">이메일 *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="이메일을 입력하세요"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">연락처 *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="연락처를 입력하세요"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">소재지</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="주소를 입력하세요"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fax" className="text-sm font-medium">팩스</Label>
                <Input
                  id="fax"
                  type="tel"
                  value={formData.fax}
                  onChange={(e) => {
                    const formatted = formatFaxNumber(e.target.value);
                    handleInputChange('fax', formatted);
                  }}
                  placeholder="02-1234-5678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_type" className="text-sm font-medium">업태</Label>
                <Input
                  id="business_type"
                  type="text"
                  value={formData.business_type}
                  onChange={(e) => handleInputChange('business_type', e.target.value)}
                  placeholder="예: 제조업, 도소매업, 서비스업"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_category" className="text-sm font-medium">업종</Label>
                <Input
                  id="business_category"
                  type="text"
                  value={formData.business_category}
                  onChange={(e) => handleInputChange('business_category', e.target.value)}
                  placeholder="예: IT 컨설팅, 웹개발"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '저장 중...' : '저장'}
                </Button>
              </div>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Customer Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>고객 정보 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateCustomer} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit_company_name" className="text-sm font-medium">회사명 *</Label>
              <Input
                id="edit_company_name"
                value={editFormData.company_name}
                onChange={(e) => handleEditInputChange('company_name', e.target.value)}
                placeholder="회사명을 입력하세요"
                className={editErrors.company_name ? 'border-red-500' : ''}
              />
              {editErrors.company_name && (
                <p className="text-sm text-red-500 mt-1">{editErrors.company_name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_representative_name" className="text-sm font-medium">대표자 *</Label>
              <Input
                id="edit_representative_name"
                value={editFormData.representative_name}
                onChange={(e) => handleEditInputChange('representative_name', e.target.value)}
                placeholder="대표자명을 입력하세요"
                className={editErrors.representative_name ? 'border-red-500' : ''}
              />
              {editErrors.representative_name && (
                <p className="text-sm text-red-500 mt-1">{editErrors.representative_name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_contact_person" className="text-sm font-medium">담당자</Label>
              <Input
                id="edit_contact_person"
                value={editFormData.contact_person}
                onChange={(e) => handleEditInputChange('contact_person', e.target.value)}
                placeholder="담당자명을 입력하세요"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_business_registration_number" className="text-sm font-medium">사업자등록번호</Label>
              <Input
                id="edit_business_registration_number"
                value={editFormData.business_registration_number}
                onChange={(e) => handleEditInputChange('business_registration_number', e.target.value)}
                placeholder="123-45-67890"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_email" className="text-sm font-medium">이메일 *</Label>
              <Input
                id="edit_email"
                type="email"
                value={editFormData.email}
                onChange={(e) => handleEditInputChange('email', e.target.value)}
                placeholder="이메일을 입력하세요"
                className={editErrors.email ? 'border-red-500' : ''}
              />
              {editErrors.email && (
                <p className="text-sm text-red-500 mt-1">{editErrors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_phone" className="text-sm font-medium">연락처 *</Label>
              <Input
                id="edit_phone"
                value={editFormData.phone}
                onChange={(e) => handleEditInputChange('phone', e.target.value)}
                placeholder="연락처를 입력하세요"
                className={editErrors.phone ? 'border-red-500' : ''}
              />
              {editErrors.phone && (
                <p className="text-sm text-red-500 mt-1">{editErrors.phone}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_address" className="text-sm font-medium">소재지</Label>
              <Textarea
                id="edit_address"
                value={editFormData.address}
                onChange={(e) => handleEditInputChange('address', e.target.value)}
                placeholder="주소를 입력하세요"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_fax" className="text-sm font-medium">팩스</Label>
              <Input
                id="edit_fax"
                type="tel"
                value={editFormData.fax}
                onChange={(e) => {
                  const formatted = formatFaxNumber(e.target.value);
                  handleEditInputChange('fax', formatted);
                }}
                placeholder="02-1234-5678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_business_type" className="text-sm font-medium">업태</Label>
              <Input
                id="edit_business_type"
                type="text"
                value={editFormData.business_type}
                onChange={(e) => handleEditInputChange('business_type', e.target.value)}
                placeholder="예: 제조업, 도소매업, 서비스업"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_business_category" className="text-sm font-medium">업종</Label>
              <Input
                id="edit_business_category"
                type="text"
                value={editFormData.business_category}
                onChange={(e) => handleEditInputChange('business_category', e.target.value)}
                placeholder="예: IT 컨설팅, 웹개발"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isUpdating}
              >
                취소
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? '수정 중...' : '수정'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
        <Input
          placeholder="회사명, 대표자, 이메일, 연락처로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customers Table - Desktop/Tablet */}
      <div className="hidden sm:block">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="w-12 p-3 md:p-4">
                    <Checkbox
                      checked={
                        selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0 
                          ? true
                          : selectedCustomers.length > 0 && selectedCustomers.length < filteredCustomers.length
                          ? "indeterminate"
                          : false
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left p-3 md:p-4 font-medium text-muted-foreground">회사명</th>
                  <th className="text-left p-3 md:p-4 font-medium text-muted-foreground">대표자</th>
                  <th className="text-left p-3 md:p-4 font-medium text-muted-foreground">담당자</th>
                  <th className="text-left p-3 md:p-4 font-medium text-muted-foreground">사업자등록번호</th>
                  <th className="text-left p-3 md:p-4 font-medium text-muted-foreground">연락처</th>
                  <th className="text-left p-3 md:p-4 font-medium text-muted-foreground">이메일</th>
                  <th className="text-left p-3 md:p-4 font-medium text-muted-foreground">등록일</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr 
                      key={customer.id} 
                      className="border-b border-border hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleEditCustomer(customer)}
                    >
                      <td 
                        className="p-3 md:p-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedCustomers.includes(customer.id)}
                          onCheckedChange={() => handleSelectCustomer(customer.id)}
                        />
                      </td>
                      <td className="p-3 md:p-4">
                        <span className="font-medium text-foreground">
                          {customer.company_name}
                        </span>
                      </td>
                      <td className="p-3 md:p-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{customer.representative_name}</span>
                        </div>
                      </td>
                      <td className="p-3 md:p-4">
                        <span className="text-muted-foreground">
                          {customer.contact_person || '-'}
                        </span>
                      </td>
                      <td className="p-3 md:p-4">
                        <span className="text-muted-foreground">
                          {customer.business_registration_number || '-'}
                        </span>
                      </td>
                      <td className="p-3 md:p-4">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{customer.phone}</span>
                        </div>
                      </td>
                      <td className="p-3 md:p-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{customer.email}</span>
                        </div>
                      </td>
                      <td className="p-3 md:p-4">
                        <span className="text-muted-foreground text-sm">
                          {new Date(customer.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      {searchTerm ? '검색 결과가 없습니다.' : '등록된 고객이 없습니다.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Customer Cards - Mobile */}
      <div className="sm:hidden space-y-3">
        {/* Mobile Select All */}
        <Card className="p-3">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={
                selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0 
                  ? true
                  : selectedCustomers.length > 0 && selectedCustomers.length < filteredCustomers.length
                  ? "indeterminate"
                  : false
              }
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium text-foreground">
              전체 선택 ({selectedCustomers.length}/{filteredCustomers.length})
            </span>
          </div>
        </Card>

        {/* Mobile Customer Cards */}
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => {
            const isExpanded = expandedCards.includes(customer.id);
            return (
              <Card key={customer.id} className="overflow-hidden">
                {/* Collapsed Header - Always Visible */}
                <div 
                  className="p-4 hover:bg-muted/20 cursor-pointer"
                  onClick={() => toggleCardExpansion(customer.id)}
                >
                  <div className="flex items-center gap-3">
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedCustomers.includes(customer.id)}
                        onCheckedChange={() => handleSelectCustomer(customer.id)}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-sm leading-tight">
                          회사명: {customer.company_name}
                        </span>
                        <span className="text-muted-foreground text-sm">|</span>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-foreground">{customer.phone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border bg-muted/20">
                    <div className="space-y-2 text-sm pt-3">
                      {/* 대표자 */}
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground font-medium">대표자:</span>
                        <span className="text-foreground">{customer.representative_name}</span>
                      </div>
                      
                      {/* 담당자 */}
                      {customer.contact_person && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground font-medium">담당자:</span>
                          <span className="text-foreground">{customer.contact_person}</span>
                        </div>
                      )}
                      
                      {/* 이메일 */}
                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-foreground font-medium flex-shrink-0">이메일:</span>
                        <span className="text-foreground break-all">{customer.email}</span>
                      </div>
                      
                      {/* 연락처 (이미 위에 표시되었지만 상세 정보로 다시 표시) */}
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground font-medium">연락처:</span>
                        <span className="text-foreground">{customer.phone}</span>
                      </div>
                      
                      {/* 사업자번호 */}
                      {customer.business_registration_number && (
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 text-muted-foreground flex-shrink-0 text-center text-xs font-bold">사</span>
                          <span className="text-foreground font-medium">사업자번호:</span>
                          <span className="text-foreground">{customer.business_registration_number}</span>
                        </div>
                      )}
                      
                      {/* 등록일 및 수정 버튼 */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>등록일: {new Date(customer.created_at).toLocaleDateString('ko-KR')}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs px-3 py-1 h-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCustomer(customer);
                          }}
                        >
                          수정
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              {searchTerm ? '검색 결과가 없습니다.' : '등록된 고객이 없습니다.'}
            </div>
          </Card>
        )}
      </div>

      {/* Mobile Floating Delete Button */}
      <div className="sm:hidden">
        {selectedCustomers.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              variant="destructive"
              className="px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 scale-100 hover:scale-105 flex items-center gap-2"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">선택 삭제 ({selectedCustomers.length})</span>
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              고객 삭제 확인
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              선택한 {selectedCustomers.length}개의 고객을 삭제하시겠습니까?
            </p>
            <p className="text-sm text-destructive">
              이 작업은 되돌릴 수 없습니다.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
              disabled={isDeleting}
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
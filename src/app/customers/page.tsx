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
import { Plus, Building2, User, Mail, Phone, MapPin, Search, Trash2, AlertTriangle } from 'lucide-react';
import { formatPhoneNumber, formatBusinessNumber } from '@/lib/formatters';

interface Customer {
  id: string;
  company_name: string;
  representative_name: string;
  contact_person?: string;
  business_registration_number?: string;
  email: string;
  phone: string;
  address?: string;
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
}

export default function CustomersPage() {
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
    address: ''
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
    address: ''
  });
  const [editErrors, setEditErrors] = useState<Partial<CustomerFormData>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
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
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newCustomer = await response.json();
        setCustomers([newCustomer, ...customers]);
        setFormData({
          company_name: '',
          representative_name: '',
          contact_person: '',
          business_registration_number: '',
          email: '',
          phone: '',
          address: ''
        });
        setIsAddModalOpen(false);
      } else {
        console.error('Failed to create customer');
      }
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
      
      const response = await fetch('/api/customers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerIds: selectedCustomers }),
      });

      if (response.ok) {
        // Remove deleted customers from the local state
        setCustomers(prev => prev.filter(customer => !selectedCustomers.includes(customer.id)));
        setSelectedCustomers([]);
        setIsDeleteModalOpen(false);
      } else {
        console.error('Failed to delete customers');
      }
    } catch (error) {
      console.error('Error deleting customers:', error);
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
      address: customer.address || ''
    });
    setEditErrors({});
    setIsEditModalOpen(true);
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
      const response = await fetch(`/api/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const updatedCustomer = await response.json();
        setCustomers(prev => 
          prev.map(customer => 
            customer.id === editingCustomer.id ? updatedCustomer : customer
          )
        );
        setIsEditModalOpen(false);
        setEditingCustomer(null);
      } else {
        console.error('Failed to update customer');
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

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-medium text-foreground">고객 관리</h2>
          <p className="text-sm text-muted-foreground">고객 정보를 등록하고 관리할 수 있습니다.</p>
        </div>
        
        <div className="flex items-center gap-2">
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
        <DialogContent className="sm:max-w-[425px]">
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
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="회사명, 대표자, 이메일, 연락처로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Customers Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="w-12 p-3 md:p-4">
                  <Checkbox
                    checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                    onCheckedChange={handleSelectAll}
                    {...(selectedCustomers.length > 0 && selectedCustomers.length < filteredCustomers.length && { indeterminate: true })}
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

      {/* Summary */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            총 {filteredCustomers.length}개의 고객
          </span>
        </div>
      </Card>
    </div>
  );
}
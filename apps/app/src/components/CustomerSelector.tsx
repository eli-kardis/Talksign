'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, User, Mail, Phone, MapPin, Download, Building } from 'lucide-react';
import { AuthenticatedApiClient } from '@/lib/api-client';

interface Customer {
  id: string;
  company?: string | null;
  name?: string | null;
  business_registration_number?: string | null;
  email?: string | null;
  phone?: string | null;
  fax?: string | null;
  address?: string | null;
  business_type?: string | null;
  business_category?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
  user_id: string;
}

interface CustomerSelectorProps {
  onCustomerSelect: (customer: Customer) => void;
  triggerText?: string;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  triggerSize?: "default" | "sm" | "lg";
}

export function CustomerSelector({ 
  onCustomerSelect, 
  triggerText = "불러오기",
  triggerVariant = "outline",
  triggerSize = "sm"
}: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await AuthenticatedApiClient.get('/api/customers');

      if (response.ok) {
        const result = await response.json();
        // API returns { data: [...], pagination: {...} }
        setCustomers(result.data || []);
      } else {
        console.error('Failed to fetch customers:', response.status);
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  const filteredCustomers = customers.filter(customer =>
    customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  const handleCustomerSelect = (customer: Customer) => {
    onCustomerSelect(customer);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize}>
          <Download className="w-4 h-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>고객 정보 불러오기</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="회사명, 대표자, 이메일, 연락처로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Customer List */}
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">고객 정보를 불러오는 중...</div>
              </div>
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <Card
                  key={customer.id}
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-foreground">{customer.company || '-'}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {new Date(customer.created_at).toLocaleDateString('ko-KR')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span><strong>대표자:</strong> {customer.name || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span><strong>연락처:</strong> {customer.phone || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                        <Mail className="w-3 h-3" />
                        <span><strong>이메일:</strong> {customer.email || '-'}</span>
                      </div>
                      {customer.business_registration_number && (
                        <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                          <Building className="w-3 h-3" />
                          <span className="text-xs"><strong>사업자번호:</strong> {customer.business_registration_number}</span>
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs"><strong>주소:</strong> {customer.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">
                  {searchTerm ? '검색 결과가 없습니다.' : '등록된 고객이 없습니다.'}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            취소
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
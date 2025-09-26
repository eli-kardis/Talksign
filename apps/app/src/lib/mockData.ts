// Mock 데이터 관리용 모듈
// 실제 환경에서는 데이터베이스를 사용하지만, 개발 중에는 localStorage 기반 mock 데이터 사용

export interface Customer {
  id: string;
  company_name: string;
  representative_name: string;
  contact_person: string | null;
  business_registration_number: string | null;
  email: string;
  phone: string;
  address: string | null;
  created_at: string;
  updated_at: string;
}

// localStorage key
const CUSTOMERS_STORAGE_KEY = 'talksign_customers';

// localStorage 헬퍼 함수들
const loadCustomersFromStorage = (): Customer[] => {
  if (typeof window === 'undefined') return defaultCustomers; // 서버사이드에서는 기본 데이터 반환

  try {
    const stored = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
    if (stored) {
      const parsedCustomers = JSON.parse(stored);
      // localStorage에 저장된 고객과 기본 고객을 병합 (중복 제거)
      const existingIds = new Set(parsedCustomers.map((c: Customer) => c.id));
      const uniqueDefaults = defaultCustomers.filter(c => !existingIds.has(c.id));
      return [...parsedCustomers, ...uniqueDefaults];
    }
  } catch (error) {
    console.warn('Failed to load customers from localStorage:', error);
  }
  return defaultCustomers;
};

const saveCustomersToStorage = (customers: Customer[]) => {
  if (typeof window === 'undefined') return; // 서버사이드에서는 실행하지 않음

  try {
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
  } catch (error) {
    console.warn('Failed to save customers to localStorage:', error);
  }
};

// 기본 Mock 데이터
const defaultCustomers: Customer[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    company_name: '(주)스타트업에이',
    representative_name: '김사장',
    contact_person: '이담당',
    business_registration_number: '123-45-67890',
    email: 'contact@startup-a.com',
    phone: '02-1234-5678',
    address: '서울시 강남구 테헤란로 123, 스타트업타워 5층',
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T09:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    company_name: '테크솔루션즈',
    representative_name: '박대표',
    contact_person: '최매니저',
    business_registration_number: '234-56-78901',
    email: 'info@techsolutions.com',
    phone: '02-9876-5432',
    address: '서울시 서초구 강남대로 456, 테크빌딩 10층',
    created_at: '2024-02-01T10:30:00Z',
    updated_at: '2024-02-01T10:30:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    company_name: '디자인스튜디오',
    representative_name: '정실장',
    contact_person: null,
    business_registration_number: null,
    email: 'hello@designstudio.co.kr',
    phone: '010-1111-2222',
    address: '서울시 마포구 홍대입구로 789, 크리에이티브센터 3층',
    created_at: '2024-02-10T14:15:00Z',
    updated_at: '2024-02-10T14:15:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    company_name: '글로벌인더스트리',
    representative_name: '송회장',
    contact_person: '윤과장',
    business_registration_number: '345-67-89012',
    email: 'business@global-industry.com',
    phone: '02-5555-6666',
    address: '부산시 해운대구 센텀중앙로 100, 글로벌타워 20층',
    created_at: '2024-02-15T16:45:00Z',
    updated_at: '2024-02-15T16:45:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    company_name: '스마트솔루션',
    representative_name: '한이사',
    contact_person: '신차장',
    business_registration_number: '456-78-90123',
    email: 'contact@smart-sol.kr',
    phone: '031-7777-8888',
    address: '경기도 성남시 분당구 판교로 200, 스마트빌딩 7층',
    created_at: '2024-02-20T11:20:00Z',
    updated_at: '2024-02-20T11:20:00Z'
  }
];

// 고객 데이터를 메모리와 localStorage에서 가져오기
const getCustomers = (): Customer[] => {
  return loadCustomersFromStorage();
};

let mockCustomers: Customer[] = getCustomers();

// Mock 데이터 조작 함수들
export const MockCustomerService = {
  // 모든 고객 조회
  getAll(): Customer[] {
    mockCustomers = getCustomers(); // localStorage에서 최신 데이터 로드
    return [...mockCustomers].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  // ID로 고객 조회
  getById(id: string): Customer | undefined {
    mockCustomers = getCustomers(); // localStorage에서 최신 데이터 로드
    return mockCustomers.find(customer => customer.id === id);
  },

  // 새 고객 추가
  create(customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Customer {
    mockCustomers = getCustomers(); // localStorage에서 최신 데이터 로드
    const newCustomer: Customer = {
      ...customerData,
      id: `550e8400-e29b-41d4-a716-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockCustomers.unshift(newCustomer);
    saveCustomersToStorage(mockCustomers); // localStorage에 저장
    return newCustomer;
  },

  // 고객 정보 업데이트
  update(id: string, customerData: Partial<Omit<Customer, 'id' | 'created_at'>>): Customer | null {
    mockCustomers = getCustomers(); // localStorage에서 최신 데이터 로드
    const customerIndex = mockCustomers.findIndex(customer => customer.id === id);
    if (customerIndex === -1) {
      return null;
    }

    const updatedCustomer: Customer = {
      ...mockCustomers[customerIndex],
      ...customerData,
      updated_at: new Date().toISOString()
    };

    mockCustomers[customerIndex] = updatedCustomer;
    saveCustomersToStorage(mockCustomers); // localStorage에 저장
    return updatedCustomer;
  },

  // 고객 삭제
  delete(ids: string[]): number {
    mockCustomers = getCustomers(); // localStorage에서 최신 데이터 로드
    const initialLength = mockCustomers.length;
    mockCustomers = mockCustomers.filter(customer => !ids.includes(customer.id));
    saveCustomersToStorage(mockCustomers); // localStorage에 저장
    return initialLength - mockCustomers.length;
  }
};
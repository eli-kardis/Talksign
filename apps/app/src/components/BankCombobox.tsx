'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { BANKS_BY_GROUP, type BankOption } from '@/lib/constants/banks';

interface BankComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function BankCombobox({
  value,
  onChange,
  placeholder = '은행을 선택하세요',
  className,
}: BankComboboxProps) {
  const [open, setOpen] = React.useState(false);

  // value에 해당하는 은행 찾기
  const selectedBank = React.useMemo(() => {
    const allBanks = [
      ...BANKS_BY_GROUP.은행,
      ...BANKS_BY_GROUP.지방은행,
      ...BANKS_BY_GROUP.기타,
      ...BANKS_BY_GROUP.증권사,
    ];
    return allBanks.find((bank) => bank.label === value);
  }, [value]);

  const handleSelect = (bank: BankOption) => {
    onChange(bank.label);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between bg-input-background border-border',
            !value && 'text-muted-foreground',
            className
          )}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="은행 검색..." />
          <CommandList>
            <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>

            {/* 은행 그룹 */}
            <CommandGroup heading="은행">
              {BANKS_BY_GROUP.은행.map((bank) => (
                <CommandItem
                  key={bank.value}
                  value={bank.label}
                  onSelect={() => handleSelect(bank)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedBank?.value === bank.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {bank.label}
                </CommandItem>
              ))}
            </CommandGroup>

            {/* 지방은행 그룹 */}
            <CommandGroup heading="지방은행">
              {BANKS_BY_GROUP.지방은행.map((bank) => (
                <CommandItem
                  key={bank.value}
                  value={bank.label}
                  onSelect={() => handleSelect(bank)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedBank?.value === bank.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {bank.label}
                </CommandItem>
              ))}
            </CommandGroup>

            {/* 기타 그룹 */}
            <CommandGroup heading="기타">
              {BANKS_BY_GROUP.기타.map((bank) => (
                <CommandItem
                  key={bank.value}
                  value={bank.label}
                  onSelect={() => handleSelect(bank)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedBank?.value === bank.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {bank.label}
                </CommandItem>
              ))}
            </CommandGroup>

            {/* 증권사 그룹 */}
            <CommandGroup heading="증권사">
              {BANKS_BY_GROUP.증권사.map((bank) => (
                <CommandItem
                  key={bank.value}
                  value={bank.label}
                  onSelect={() => handleSelect(bank)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedBank?.value === bank.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {bank.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

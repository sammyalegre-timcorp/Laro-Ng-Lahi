import React, { useState, useRef, useEffect } from 'react';
import { Building, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { DEPARTMENT_DETAILS, DepartmentItem } from '../types';

interface DepartmentDropdownProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
}

export const DepartmentDropdown: React.FC<DepartmentDropdownProps> = ({
  value,
  onChange,
  required = false,
  placeholder = '-- Pumili ng Departamento (Select Department) --',
  className = '',
  id = 'department-dropdown'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const handleSelect = (deptName: string) => {
    onChange(deptName);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const selectedItem = DEPARTMENT_DETAILS.find(d => d.name === value);

  return (
    <div className={`relative ${className}`} ref={containerRef} id={id}>
      {/* Hidden input to satisfy native form required validation */}
      <input
        type="text"
        tabIndex={-1}
        aria-hidden="true"
        required={required}
        value={value}
        onChange={() => {}}
        className="opacity-0 w-0 h-0 absolute pointer-events-none"
      />

      {/* Trigger Button (Look and feel matches standard input) */}
      <div className="relative">
        <Building className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`w-full pl-11 pr-10 py-4 bg-slate-50 border-2 rounded-xl text-left transition-colors font-medium text-sm flex items-center justify-between cursor-pointer ${
            isOpen
              ? 'border-[#0038A8] bg-white ring-2 ring-blue-100'
              : 'border-slate-100 hover:border-slate-200'
          }`}
        >
          <span className={value ? 'text-slate-900 font-semibold truncate' : 'text-slate-400 font-normal truncate'}>
            {value ? selectedItem?.name || value : placeholder}
          </span>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            {isOpen ? <ChevronUp className="w-4 h-4 text-[#0038A8]" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>
      </div>

      {/* Dropdown Options List exactly matching screenshot layout */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border-2 border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header Placeholder Option (as shown in user's image) */}
          <div
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className="px-4 py-2.5 bg-slate-100/90 text-slate-500 font-semibold text-xs border-b border-slate-200 cursor-pointer hover:bg-slate-200/80 transition-colors"
          >
            {placeholder}
          </div>

          {/* Department options with 2-line layout: Title + smaller font description */}
          <div className="divide-y divide-slate-100">
            {DEPARTMENT_DETAILS.map((dept: DepartmentItem) => {
              const isSelected = value === dept.name;
              return (
                <button
                  key={dept.name}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(dept.name)}
                  className={`w-full text-left px-4 py-2.5 transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-blue-50/90 border-l-4 border-[#0038A8] pl-3'
                      : 'hover:bg-blue-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-slate-900 text-sm leading-tight group-hover:text-[#0038A8]">
                      {dept.name}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#0038A8] shrink-0 mt-0.5" />
                    )}
                  </div>
                  {/* Smaller font description under the department name */}
                  <div className="text-[11px] text-slate-500 font-normal mt-0.5 leading-snug pl-2 sm:pl-3">
                    {dept.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

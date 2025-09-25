import * as React from "react";
import { useDebounce } from "@/src/hooks/use-debounce";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface UseComboboxProps {
  value?: string;
  onValueChange?: (value: string | undefined) => void;
  onSearchChange?: (search: string) => void;
  options: ComboboxOption[];
  allowClear?: boolean;
}

export function useCombobox({
  value,
  onValueChange,
  onSearchChange,
  options,
  allowClear = true,
}: UseComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const debouncedSearchValue = useDebounce(searchValue, 500);

  const handleSearchChange = (search: string) => {
    setSearchValue(search);
  };

  React.useEffect(() => {
    onSearchChange?.(debouncedSearchValue);
  }, [debouncedSearchValue, onSearchChange]);

  const filteredOptions = React.useMemo(() => {
    if (!searchValue.trim()) {
      return options;
    }
    
    return options.filter(option =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [options, searchValue]);

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === value && allowClear) {
      onValueChange?.(undefined);
    } else {
      onValueChange?.(selectedValue);
    }
    setSearchValue("");
    setOpen(false);
  };

  const displayValue = React.useMemo(() => {
    if (value) {
      const option = options.find((option) => option.value === value);
      return option?.label;
    }
    return null;
  }, [value, options]);

  return {
    open,
    setOpen,
    searchValue,
    handleSearchChange,
    handleSelect,
    displayValue,
    filteredOptions,
  };
}
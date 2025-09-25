import * as React from "react";

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

  const handleSearchChange = (search: string) => {
    setSearchValue(search);
    onSearchChange?.(search);
  };

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === value && allowClear) {
      onValueChange?.(undefined);
    } else {
      onValueChange?.(selectedValue);
    }
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
  };
}
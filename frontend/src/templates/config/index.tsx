import React, { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Plus, Search} from 'lucide-react';
import { useSuppliers } from './hooks/useSuppliers';
import { SuppliersTable } from './components/SuppliersTable';
import { SupplierForm } from './components/SupplierForm';
import { Supplier, SupplierFormData } from './types';
import { SearchInput } from '@/src/global/search/components/search-input';

export const ConfigTemplate: React.FC = () => {
  const {
    suppliers,
    categories,
    loading,
    pagination,
    handleCreateSupplier,
    handleUpdateSupplier,
    handleDeleteSupplier,
    handleSearch,
    updateFilters
  } = useSuppliers();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenForm = (supplier?: Supplier) => {
    setSelectedSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedSupplier(undefined);
    setIsFormOpen(false);
  };

  const handleSubmitForm = async (data: SupplierFormData) => {
    let success = false;
    
    if (selectedSupplier) {
      success = await handleUpdateSupplier(selectedSupplier.id, data);
    } else {
      success = await handleCreateSupplier(data);
    }

    if (success) {
      handleCloseForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      await handleDeleteSupplier(id);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    updateFilters({ [key]: value === 'all' ? undefined : value });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fornecedores</h1>
          <p className="text-gray-600">Gerencie fornecedores e unidades</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center justify-between">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Pesquisar fornecedores..."
                className="max-w-sm"
              />
            </div>
            
            <Select onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="supplier">Fornecedores</SelectItem>
                <SelectItem value="unit">Unidades</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Fornecedores</CardTitle>
          <CardDescription>
            {pagination.totalItems} fornecedor(es) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SuppliersTable
            suppliers={suppliers}
            loading={loading}
            onEdit={handleOpenForm}
            onDelete={handleDelete}
            onView={handleOpenForm}
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </DialogTitle>
          </DialogHeader>
          <SupplierForm
            supplier={selectedSupplier}
            onSubmit={handleSubmitForm}
            onCancel={handleCloseForm}
            loading={loading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConfigTemplate;

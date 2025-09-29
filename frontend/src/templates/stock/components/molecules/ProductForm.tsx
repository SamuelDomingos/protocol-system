import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { useProductForm } from "../../hooks/organelles/forms/useProductForm";
import { Product } from "../../types";
import { Switch } from "@/src/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Combobox } from "@/src/global/combobox/components/combobox";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";

interface ProductFormProps {
  initialData?: Product;
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductForm({
  initialData,
  onSuccess,
  onCancel,
  isOpen,
  onOpenChange,
}: ProductFormProps) {
  const { formData, handleChange, handleSubmit, isEditing } = useProductForm({
    initialData,
    onSuccess,
  });
  
  const unitOptions = [
    { value: "frasco", label: "FRASCO" },
    { value: "tubo", label: "TUBO" },
    { value: "sache", label: "SACHÊ" },
    { value: "envelope", label: "ENVELOPE" },
    { value: "conjunto", label: "CONJUNTO" },
    { value: "pacote", label: "PACOTE" },
    { value: "galão", label: "GALÃO" },
    { value: "litro", label: "LITRO" },
    { value: "quilograma", label: "QUILOGRAMA" },
    { value: "grama", label: "GRAMA" },
    { value: "miligrama", label: "MILIGRAMA" },
    { value: "unidade", label: "UNIDADE" },
    { value: "peça", label: "PEÇA" },
    { value: "caixa", label: "CAIXA" },
    { value: "ampola", label: "AMPOLA" },
  ];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Produto" : "Criar Produto"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="category" className="mb-2 block">
                Categoria
              </Label>
              <RadioGroup
                onValueChange={(value) => handleChange("category", value)}
                defaultValue={formData.category}
                className="flex items-center space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medicamento" id="medicamento" />
                  <Label htmlFor="medicamento">Medicamento</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="material" id="material" />
                  <Label htmlFor="material">Material</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-44">
                <Label htmlFor="minimumStock">Estoque Mínimo</Label>
                <Input
                  id="minimumStock"
                  type="number"
                  value={formData.minimumStock}
                  onChange={(e) =>
                    handleChange("minimumStock", Number(e.target.value))
                  }
                  required
                />
              </div>
              <div className="w-60">
                <Label htmlFor="unit">Valor Unitário</Label>
                <Combobox
                  options={unitOptions}
                  value={formData.unit}
                  onValueChange={(value) => handleChange("unit", value)}
                  placeholder="Selecione o tipo de unidade..."
                />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={formData.status === "active"}
              onCheckedChange={(checked) =>
                handleChange("status", checked ? "active" : "inactive")
              }
            />
            <Label htmlFor="status">Ativo</Label>
          </div>
          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit">
              {isEditing ? "Atualizar Produto" : "Criar Produto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash,
  Loader2,
  FileText,
  Calculator,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  type Protocol,
  type ProtocolStage,
  protocolsService,
} from "@/services/protocols-api";
import { ClientCombobox } from "@/components/client-combobox";
import { ProtocolCombobox } from "@/components/protocol-combobox";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ProtocolFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  isEditing?: boolean;
  isCreatingModel?: boolean;
  currentProtocol?: Protocol;
}

interface StageWithId extends Omit<ProtocolStage, "id" | "order"> {
  id: string;
}

interface ProtocolToCreate {
  id: string;
  clientId: string;
  title: string;
  stages: StageWithId[];
}

// Função para gerar ID temporário
const generateTempId = () => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export function ProtocolFormDialog({
  isOpen,
  onOpenChange,
  onSuccess,
  isEditing = false,
  isCreatingModel = false,
  currentProtocol,
}: ProtocolFormDialogProps) {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState("");
  const [protocolTitle, setProtocolTitle] = useState("");
  const [stages, setStages] = useState<StageWithId[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProtocolTemplate, setIsLoadingProtocolTemplate] =
    useState(false);
  const [templateProtocols, setTemplateProtocols] = useState<Protocol[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [protocolsToCreate, setProtocolsToCreate] = useState<
    ProtocolToCreate[]
  >([]);
  const [currentProtocolIndex, setCurrentProtocolIndex] = useState(-1);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Carregar protocolos modelo e dados do protocolo atual quando o diálogo abrir
  useEffect(() => {
    if (isOpen) {
      loadTemplateProtocols();
      if (currentProtocol) {
        setProtocolTitle(currentProtocol.title);
        if (!isCreatingModel) {
          setSelectedClient(String(currentProtocol.clientId));
        }
        setStages(
          currentProtocol.stages.map((stage) => ({
            id: String(stage.id),
            name: stage.name,
            value: stage.value,
            intervalDays: stage.intervalDays,
          }))
        );
      }
    }
  }, [isOpen, currentProtocol, isCreatingModel]);

  // Função para carregar protocolos modelo
  const loadTemplateProtocols = async () => {
    try {
      setIsLoading(true);
      const protocols = await protocolsService.listProtocols();
      const templates = protocols.filter((protocol) => protocol.isTemplate);
      setTemplateProtocols(templates);
    } catch (error) {
      console.error("Erro ao carregar protocolos modelo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os protocolos modelo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  // Reset form
  const resetForm = () => {
    setSelectedClient("");
    setProtocolTitle("");
    setStages([]);
    setCurrentProtocolIndex(-1);
    setProtocolsToCreate([]);
    setSelectedTemplateId("");
  };

  // Handle stage changes
  const handleStageChange = (
    index: number,
    field: keyof Omit<ProtocolStage, "id" | "order">,
    value: any
  ) => {
    const updatedStages = [...stages];
    updatedStages[index] = { ...updatedStages[index], [field]: value };
    setStages(updatedStages);
  };

  // Add new stage
  const handleAddStage = () => {
    const newStage: StageWithId = {
      id: generateTempId(),
      name: "",
      value: 0,
      intervalDays: 0,
    };
    setStages([...stages, newStage]);
  };

  // Remove stage
  const handleRemoveStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };



  // 1. Adicionar estado para armazenar o título do template selecionado
  const [selectedTemplateTitle, setSelectedTemplateTitle] = useState("");

  // 2. Modificar a função handleLoadProtocolTemplate para receber o título, não o ID
  const handleLoadProtocolTemplate = async (title: string) => {
    // Encontrar o template pelo título
    const template = templateProtocols.find(p => p.title === title);
    
    if (!template) {

      console.error("Template não encontrado:", title);
      return;
    }

    try {
      setIsLoadingProtocolTemplate(true);

      setSelectedTemplateTitle(title);
      
      // Definir o título do protocolo com base no modelo
      setProtocolTitle(template.title);
      
      // Formatar os estágios do modelo com todos os dados necessários
      const formattedStages = template.stages.map(stage => ({
        id: generateTempId(),
        name: stage.name,
        value: stage.value,
        intervalDays: stage.intervalDays || 0,
      }));
      
      console.log("Estágios carregados do template:", formattedStages);
      
      // Limpar estágios existentes e definir os novos imediatamente
      setStages(formattedStages);
      
      toast({
        title: "Modelo carregado",
        description: `Modelo "${template.title}" carregado com ${formattedStages.length} estágios.`,
      });
    } catch (error) {
      console.error("Erro ao carregar modelo de protocolo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o modelo do protocolo.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProtocolTemplate(false);
    }
  };

  // Função para adicionar um novo protocolo à lista
  const handleAddProtocolToList = () => {
    if (!selectedClient || !protocolTitle || stages.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione um cliente e um modelo de protocolo, e verifique se há estágios.",
        variant: "destructive",
      });
      return;
    }

    const newProtocol: ProtocolToCreate = {
      id: generateTempId(),
      clientId: selectedClient,
      title: protocolTitle,
      stages: [...stages],
    };

    setProtocolsToCreate([...protocolsToCreate, newProtocol]);
    
    // Manter o cliente selecionado para facilitar a criação de múltiplos protocolos
    // para o mesmo cliente, mas limpar o título e estágios
    // para o mesmo cliente, mas limpar o título e estágios
    setProtocolTitle("");
    setStages([]);
    setSelectedTemplateId("");
  };

  // Função para remover um protocolo da lista
  const handleRemoveProtocolFromList = (id: string) => {
    setProtocolsToCreate(protocolsToCreate.filter((p) => p.id !== id));
  };

  // Função para editar um protocolo da lista
  const handleEditProtocolInList = (id: string) => {
    const protocol = protocolsToCreate.find((p) => p.id === id);
    if (protocol) {
      setSelectedClient(protocol.clientId);
      setProtocolTitle(protocol.title);
      setStages(protocol.stages);
      setCurrentProtocolIndex(protocolsToCreate.findIndex((p) => p.id === id));
    }
  };

  // Função para atualizar um protocolo na lista
  const handleUpdateProtocolInList = () => {
    if (!selectedClient || !protocolTitle || stages.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione um cliente, um modelo de protocolo e verifique se há estágios.",
        variant: "destructive",
      });
      return;
    }

    const updatedProtocols = [...protocolsToCreate];
    updatedProtocols[currentProtocolIndex] = {
      id: updatedProtocols[currentProtocolIndex].id,
      clientId: selectedClient,
      title: protocolTitle,
      stages: [...stages],
    };

    setProtocolsToCreate(updatedProtocols);
    setProtocolTitle("");
    setStages([]);
    setCurrentProtocolIndex(-1);
    setSelectedTemplateId("");
  };

  // Função para salvar um único protocolo (usado para edição e modelos)
  const handleSaveProtocol = async () => {
    if (!protocolTitle || stages.length === 0) {
      toast({
        title: "Erro ao salvar",
        description:
          "Preencha todos os campos obrigatórios e adicione pelo menos um estágio.",
        variant: "destructive",
      });
      return;
    }

    if (!isCreatingModel && !selectedClient) {
      toast({
        title: "Erro ao salvar",
        description: "Selecione um cliente para o protocolo.",
        variant: "destructive",
      });
      return;
    }

    const invalidStages = stages.some(
      (stage) => !stage.name || stage.value < 0
    );
    if (invalidStages) {
      toast({
        title: "Erro ao salvar",
        description: "Preencha todos os campos de cada estágio corretamente.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const protocolData = {
        clientId: isCreatingModel ? null : String(selectedClient),
        title: protocolTitle,
        stages: stages.map((stage) => ({
          name: stage.name,
          value: Number(stage.value),
          intervalDays: Number(stage.intervalDays),
        })),
        isTemplate: isCreatingModel,
      };

      if (isEditing && currentProtocol?.id) {
        await protocolsService.updateProtocol(currentProtocol.id, protocolData);
        toast({
          title: "Protocolo atualizado",
          description: "O protocolo foi atualizado com sucesso.",
        });
      } else {
        await protocolsService.createProtocol(protocolData);
        toast({
          title: isCreatingModel ? "Modelo criado" : "Protocolo criado",
          description: isCreatingModel
            ? "O modelo de protocolo foi criado com sucesso."
            : "O protocolo foi criado com sucesso.",
        });
      }

      onSuccess();
      handleOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar protocolo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o protocolo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para salvar todos os protocolos
  const handleSaveAllProtocols = async () => {
    if (protocolsToCreate.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um protocolo à lista.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const promises = protocolsToCreate.map((protocol) =>
        protocolsService.createProtocol({
          clientId: protocol.clientId,
          title: protocol.title,
          stages: protocol.stages.map((stage) => ({
            name: stage.name,
            value: Number(stage.value),
            intervalDays: Number(stage.intervalDays),
          })),
          isTemplate: false,
        })
      );

      await Promise.all(promises);

      toast({
        title: "Protocolos criados",
        description: `${protocolsToCreate.length} protocolos foram criados com sucesso.`,
      });

      onSuccess();
      handleOpenChange(false);
    } catch (error) {
      console.error("Erro ao criar protocolos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar os protocolos.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = stages.findIndex((stage) => stage.id === active.id);
      const newIndex = stages.findIndex((stage) => stage.id === over.id);

      setStages((items) => arrayMove(items, oldIndex, newIndex));
    }
  };
  
  // Componente expandível para cada protocolo na lista
  function ExpandableProtocolItem({ protocol, index, onEdit, onRemove }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Calcular valor total do protocolo
    const totalValue = protocol.stages.reduce(
      (total, stage) => total + Number(stage.value || 0),
      0
    );

    return (
      <div className="border rounded-md overflow-hidden">
        <div
          className="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">
                {index + 1}
              </span>
              <div>
                <p className="font-medium">{protocol.title}</p>
                <p className="text-sm text-muted-foreground">
                  Cliente: {protocol.clientId}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">
              {formatCurrency(totalValue)}
            </div>
            <div>
              {isExpanded ? (
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronUp className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="p-3 border-t bg-background">
            <div className="mb-2 flex justify-between items-center">
              <h4 className="font-medium">Detalhes do Protocolo</h4>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="hover:bg-background"
                >
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2 text-sm font-medium bg-muted/30 p-2 rounded-md">
                <div>Estágio</div>
                <div>Nome</div>
                <div>Intervalo (dias)</div>
                <div>Valor</div>
              </div>

              {protocol.stages.map((stage, stageIndex) => (
                <div
                  key={stage.id}
                  className="grid grid-cols-4 gap-2 text-sm p-2 border-b last:border-0"
                >
                  <div>{stageIndex + 1}</div>
                  <div>{stage.name}</div>
                  <div>{stage.intervalDays} dias</div>
                  <div>{formatCurrency(stage.value)}</div>
                </div>
              ))}

              <div className="flex justify-end pt-2 font-medium">
                <span>Total: {formatCurrency(totalValue)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? isCreatingModel
                ? "Editar Modelo de Protocolo"
                : "Editar Protocolo para Cliente"
              : isCreatingModel
              ? "Novo Modelo de Protocolo"
              : "Novo Protocolo para Cliente"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto pr-6 -mr-6">
          {!isCreatingModel && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">Cliente</Label>
                <ClientCombobox
                  id="client"
                  value={selectedClient}
                  onChange={setSelectedClient}
                  disabled={isEditing && !isCreatingModel}
                />
              </div>
              <div>
                <Label>Modelo de Protocolo</Label>
                <ProtocolCombobox
                  protocols={templateProtocols.map(p => ({
                    id: p.id!,
                    title: p.title,
                    clientName: undefined
                  }))}
                  value={selectedTemplateTitle}
                  onChange={handleLoadProtocolTemplate}
                  disabled={isLoadingProtocolTemplate}
                />
              </div>
            </div>
          )}
          
          {isCreatingModel && (
            <div>
              <Label htmlFor="protocol-title">Nome do Modelo</Label>
              <Input
                id="protocol-title"
                value={protocolTitle}
                onChange={(e) => setProtocolTitle(e.target.value)}
                placeholder="Nome do modelo de protocolo"
              />
            </div>
          )}

          {/* Seção de estágios - mantida antes da lista de protocolos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Estágios</h3>
              <Button variant="outline" size="sm" onClick={handleAddStage}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Estágio
              </Button>
            </div>

            {isLoadingProtocolTemplate ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Carregando modelo...</span>
              </div>
            ) : stages.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={stages.map((stage) => stage.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {stages.map((stage, index) => (
                      <SortableStage
                        key={stage.id}
                        stage={stage}
                        index={index}
                        onRemove={handleRemoveStage}
                        onChange={handleStageChange}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="rounded-md border border-dashed p-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum estágio adicionado. Clique em "Adicionar Estágio"
                    para começar.
                  </p>
                  {templateProtocols.length > 0 && !isEditing && (
                    <p className="text-xs text-muted-foreground">
                      Ou selecione um protocolo modelo para usar como base.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {stages.length > 0 && (
            <div className="flex justify-end">
              <div className="bg-muted p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Valor Total:</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(
                      stages.reduce(
                        (total, stage) => total + Number(stage.value || 0),
                        0
                      )
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Lista de protocolos a serem criados - movida para depois dos estágios */}
          {!isCreatingModel && !isEditing && (
            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <Button
                  onClick={handleAddProtocolToList}
                  variant="outline"
                  disabled={
                    !selectedClient || !protocolTitle || stages.length === 0
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Protocolo à Lista
                </Button>
                {currentProtocolIndex !== -1 && (
                  <Button
                    onClick={handleUpdateProtocolInList}
                    variant="outline"
                  >
                    Atualizar Protocolo
                  </Button>
                )}
              </div>

              {protocolsToCreate.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-md p-2">
                  {protocolsToCreate.map((protocol, index) => (
                    <ExpandableProtocolItem
                      key={protocol.id}
                      protocol={protocol}
                      index={index}
                      onEdit={() => handleEditProtocolInList(protocol.id)}
                      onRemove={() => handleRemoveProtocolFromList(protocol.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Configure o protocolo acima e clique em "Adicionar Protocolo à Lista".
                  </p>
                </div>
              )}

              {protocolsToCreate.length > 0 && (
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {protocolsToCreate.length} protocolo(s) na lista
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          {!isEditing && !isCreatingModel && protocolsToCreate.length > 0 && (
            <Button onClick={handleSaveAllProtocols} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                `Criar ${protocolsToCreate.length} Protocolo${
                  protocolsToCreate.length > 1 ? "s" : ""
                }`
              )}
            </Button>
          )}
          {(isEditing || isCreatingModel) && (
            <Button onClick={handleSaveProtocol} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Atualizando..." : "Salvando..."}
                </>
              ) : isEditing ? (
                isCreatingModel ? (
                  "Atualizar Modelo"
                ) : (
                  "Atualizar Protocolo"
                )
              ) : isCreatingModel ? (
                "Salvar Modelo"
              ) : (
                "Salvar Protocolo"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SortableStage({
  stage,
  index,
  onRemove,
  onChange,
}: {
  stage: StageWithId;
  index: number;
  onRemove: (index: number) => void;
  onChange: (
    index: number,
    field: keyof Omit<ProtocolStage, "id" | "order">,
    value: any
  ) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-12 gap-4 items-center border p-3 rounded-md"
    >
      <div className="col-span-12 flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab p-1 hover:bg-muted rounded-md"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <h4 className="font-medium">Estágio {index + 1}</h4>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(index)}
            className="h-8 px-2 text-destructive hover:text-destructive"
          >
            <Trash className="h-4 w-4 mr-1" /> Excluir
          </Button>
        </div>
      </div>
      <div className="col-span-4">
        <Label htmlFor={`stage-name-${index}`}>Nome do Estágio</Label>
        <Input
          id={`stage-name-${index}`}
          value={stage.name}
          onChange={(e) => onChange(index, "name", e.target.value)}
          placeholder="Nome do estágio"
        />
      </div>
      <div className="col-span-3">
        <Label htmlFor={`stage-value-${index}`}>Valor (R$)</Label>
        <Input
          id={`stage-value-${index}`}
          value={stage.value}
          onChange={(e) => onChange(index, "value", e.target.value)}
          placeholder="Valor (R$)"
          type="number"
          min="0"
          step="0.01"
        />
      </div>
      <div className="col-span-4">
        <Label htmlFor={`stage-interval-${index}`}>Intervalo (dias)</Label>
        <Input
          id={`stage-interval-${index}`}
          value={stage.intervalDays}
          onChange={(e) => onChange(index, "intervalDays", e.target.value)}
          placeholder="Intervalo (dias)"
          type="number"
          min="0"
        />
      </div>
    </div>
  );
}

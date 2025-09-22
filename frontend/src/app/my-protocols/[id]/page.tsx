"use client";

import { useState, useRef, useEffect } from "react";
import { use } from "react"; // Adicione esta importação
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Camera,
  Calendar,
  Clock,
  Loader2,
  Trash,
  User,
  FileText,
} from "lucide-react";
import { useToast } from "@/src/components/ui/use-toast";
import {
  protocolsService,
  type Protocol,
  type ProtocolStage,
} from "@/services/protocols-api";
import { applicationsService } from "@/services/applications-api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/auth-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";

type StageStatus = "pending" | "applied";

interface Client {
  id: string | number;
  name: string;
  phone?: string;
  cpf?: string;
}

export default function ProtocolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const protocolId = unwrappedParams.id;

  const [protocol, setProtocol] = useState<Protocol | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<ProtocolStage | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [step, setStep] = useState<
    "facial" | "client-signature" | "nurse-signature" | "confirm-force-complete"
  >("facial");
  const [isFacialRecognized, setIsFacialRecognized] = useState(false);
  const [isClientSigned, setIsClientSigned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientPhoto, setClientPhoto] = useState<string | null>(null);
  const [clientSignature, setClientSignature] = useState<string | null>(null);
  const [nurseSignature, setNurseSignature] = useState<string | null>(null);
  const [applications, setApplications] = useState<
    Record<string | number, any[]>
  >({});
  const [isViewingApplications, setIsViewingApplications] = useState(false);
  const [selectedStageApplications, setSelectedStageApplications] = useState<
    any[]
  >([]);
  const [calculatedStageDates, setCalculatedStageDates] = useState<
    Record<string | number, Date>
  >({});

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<
    string | number | null
  >(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const nurseCanvasRef = useRef<HTMLCanvasElement>(null);
  const photoCanvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { user, hasPermission } = useAuth();

  const handleGoBack = () => {
    stopWebcam();
    router.back();
  };

  // Adicionar useEffect para limpar a câmera quando o componente é desmontado
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  // Verificar permissões
  const canViewProtocols = hasPermission("applications", "canRead");
  const canCreateProtocols = hasPermission("applications", "canCreate");
  const canUpdateProtocols = hasPermission("applications", "canUpdate");
  const canDeleteProtocols = hasPermission("applications", "canDelete");

  // Adicionar estes estados no início do componente, logo após os outros estados
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCameraError, setIsCameraError] = useState(false);
  const [isCameraErrorMessage, setIsCameraErrorMessage] = useState("");
  const [isForceComplete, setIsForceComplete] = useState(false);

  // Função para calcular as datas previstas para cada estágio
  const calculateStageDates = (protocol: Protocol) => {
    if (!protocol.createdAt) return {};

    const creationDate = new Date(protocol.createdAt);
    const dates: Record<string | number, Date> = {};
    let accumulatedDays = 0;
    let lastAppliedDate: Date | null = null;

    // Ordenar os estágios por ordem (se disponível) ou pelo ID
    const sortedStages = [...protocol.stages].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return String(a.id || "").localeCompare(String(b.id || ""));
    });

    // Primeiro, identificar quais estágios já foram aplicados e suas datas
    const appliedStages = new Map<string | number, Date>();
    sortedStages.forEach((stage) => {
      if (stage.id && stage.status === "applied" && stage.date) {
        appliedStages.set(stage.id, new Date(stage.date));
      }
    });

    // Calcular a data prevista para cada estágio
    sortedStages.forEach((stage) => {
      if (stage.id) {
        // Se o estágio já tem uma data agendada, usar essa data
        if (stage.scheduledDate) {
          dates[stage.id] = new Date(stage.scheduledDate);
        }
        // Se o estágio já foi aplicado, usar a data de aplicação
        else if (appliedStages.has(stage.id)) {
          dates[stage.id] = appliedStages.get(stage.id)!;
          lastAppliedDate = appliedStages.get(stage.id)!;
        }
        // Caso contrário, calcular com base na data da última aplicação ou data de criação
        else {
          const baseDate = lastAppliedDate || creationDate;
          const stageDate = new Date(baseDate);
          stageDate.setDate(baseDate.getDate() + (stage.intervalDays || 0));
          dates[stage.id] = stageDate;
        }

        // Acumular os dias de intervalo para o próximo estágio
        accumulatedDays += stage.intervalDays || 0;
      }
    });

    return dates;
  };

  // Atualizar a função que marca os estágios
  const updateStageStatus = (
    stage: ProtocolStage,
    status: StageStatus,
    date: string | null
  ): ProtocolStage => {
    return {
      ...stage,
      status,
      date,
    };
  };

  // Atualizar a função que carrega o protocolo
  useEffect(() => {
    const fetchProtocol = async () => {
      try {
        setIsLoading(true);
        const data = await protocolsService.getProtocol(protocolId);
        setProtocol(data);

        // Calcular datas previstas para cada estágio
        const stageDates = calculateStageDates(data);
        setCalculatedStageDates(stageDates);

        // carrega aplicações por estágio
        const applicationsData: Record<number, any[]> = {};
        for (const stage of data.stages) {
          if (stage.id) {
            const apps = await applicationsService.listStageApplications(
              stage.id
            );
            applicationsData[stage.id] = apps;
          }
        }

        // agora "marca" cada stage se tiver aplicação
        const stagesWithStatus = data.stages.map((stage) => {
          const apps = stage.id ? applicationsData[stage.id] || [] : [];
          if (apps.length > 0) {
            // usa o appliedAt da última aplicação
            const latest = apps[apps.length - 1];
            return updateStageStatus(
              stage,
              "applied" as StageStatus,
              latest.appliedAt
            );
          }
          return updateStageStatus(stage, "pending" as StageStatus, null);
        });

        // salva tudo no state
        setApplications(applicationsData);
        setProtocol({ ...data, stages: stagesWithStatus });
      } catch (error) {
        console.error("Erro ao carregar protocolo:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes do protocolo.",
          variant: "destructive",
        });
        router.push("/dashboard/my-protocols");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProtocol();
  }, [protocolId, toast, router]);

  // Start webcam when facial recognition step is active
  useEffect(() => {
    if (step === "facial" && isDialogOpen) {
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => {
      stopWebcam();
    };
  }, [step, isDialogOpen]);

  // Inicializar canvas para assinaturas
  useEffect(() => {
    let cleanupFunction: (() => void) | undefined;

    if (step === "client-signature" && clientCanvasRef.current) {
      cleanupFunction = initializeCanvas(
        clientCanvasRef.current,
        setClientSignature
      );
    } else if (step === "nurse-signature" && nurseCanvasRef.current) {
      cleanupFunction = initializeCanvas(
        nurseCanvasRef.current,
        setNurseSignature
      );
    }

    return () => {
      if (cleanupFunction) cleanupFunction();
    };
  }, [step]);

  // Função para inicializar o canvas de assinatura
  const initializeCanvas = (
    canvas: HTMLCanvasElement,
    setSignature: (signature: string | null) => void
  ) => {
    let drawing = false;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("Não foi possível obter o contexto 2D do canvas.");
      return;
    }

    // Ajustar o tamanho do canvas para corresponder ao tamanho exibido
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Restaurar configurações após redimensionamento
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
    };

    // Configurações iniciais
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Função para limpar o canvas
    const clearCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignature(null);
    };

    // Função para começar a desenhar
    const startDrawing = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      drawing = true;

      const pos = getPosition(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    // Função para desenhar
    const draw = (e: MouseEvent | TouchEvent) => {
      if (!drawing) return;
      e.preventDefault();

      const pos = getPosition(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    // Função para obter a posição do mouse/toque
    const getPosition = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (e instanceof MouseEvent) {
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      } else {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
      }
    };

    // Função para finalizar o desenho
    const stopDrawing = () => {
      if (drawing) {
        drawing = false;
        ctx.closePath();
        // Salvar a assinatura como base64
        setSignature(canvas.toDataURL());
      }
    };

    // Adicionar event listeners
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);

    // Event listeners para dispositivos touch
    canvas.addEventListener("touchstart", startDrawing, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDrawing);

    // Função de limpeza para remover event listeners
    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseout", stopDrawing);
      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDrawing);
      window.removeEventListener("resize", resizeCanvas);
    };
  };

  // Vamos melhorar a função startWebcam para lidar melhor com permissões e erros de câmera
  const startWebcam = async () => {
    try {
      setIsCameraLoading(true);
      setIsCameraError(false);

      // Verificar se o navegador suporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Seu navegador não suporta acesso à câmera");
      }

      // Solicitar permissão com configurações específicas para dispositivos móveis
      const constraints = {
        audio: false,
        video: {
          facingMode: "user", // Usar câmera frontal
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      // Forçar uma nova solicitação de permissão
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Garantir que o vídeo seja carregado antes de permitir a captura
        videoRef.current.onloadedmetadata = () => {
          setIsCameraLoading(false);
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      setIsCameraError(true);
      setIsCameraErrorMessage(
        err instanceof Error
          ? err.message
          : "Não foi possível acessar a câmera. Verifique as permissões do seu navegador."
      );
      setIsCameraLoading(false);

      toast({
        title: "Erro na câmera",
        description:
          "Não foi possível acessar a câmera. Verifique as permissões do seu navegador.",
        variant: "destructive",
      });
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleStartApplication = (
    stage: ProtocolStage,
    options?: { forceComplete?: boolean }
  ) => {
    const forceComplete = options?.forceComplete || false;
    if (!canCreateProtocols) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para aplicar protocolos.",
        variant: "destructive",
      });
      return;
    }

    setSelectedStage(stage);
    setIsForceComplete(forceComplete);
    setStep(forceComplete ? "confirm-force-complete" : "facial"); // Alterado aqui
    setIsDialogOpen(true);

    if (!forceComplete) {
      startWebcam();
    }
    setIsFacialRecognized(false);
    setIsClientSigned(false);
    setClientPhoto(null);
    setClientSignature(null);
    setNurseSignature(null);
    setIsCameraReady(false);
    setIsCameraError(false);
  };

  const handleCaptureImage = () => {
    if (!videoRef.current || !photoCanvasRef.current) return;

    const video = videoRef.current;
    const canvas = photoCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Garantir que a foto seja quadrada
    const size = Math.min(video.videoWidth, video.videoHeight);
    const offsetX = (video.videoWidth - size) / 2;
    const offsetY = (video.videoHeight - size) / 2;

    // Configurar o canvas para ser quadrado
    canvas.width = size;
    canvas.height = size;

    // Desenhar apenas a parte central quadrada do vídeo no canvas
    ctx.drawImage(
      video,
      offsetX,
      offsetY,
      size,
      size, // Recortar uma área quadrada do centro
      0,
      0,
      size,
      size // Desenhar no canvas inteiro
    );

    // Converter para base64
    const photoBase64 = canvas.toDataURL("image/jpeg");
    setClientPhoto(photoBase64);
    setIsFacialRecognized(true);

    // Desligar a câmera após a captura
    stopWebcam();

    // Ir para a próxima etapa
    setStep("client-signature");
  };

  const handleClientSignature = () => {
    if (!clientSignature) {
      toast({
        title: "Assinatura necessária",
        description:
          "Por favor, solicite ao cliente que assine no espaço indicado.",
        variant: "destructive",
      });
      return;
    }

    setIsClientSigned(true);
    setStep("nurse-signature");
  };

  const handleNurseSignature = async () => {
    if (!nurseSignature) {
      toast({
        title: "Assinatura necessária",
        description:
          "Por favor, assine no espaço indicado para confirmar a aplicação.",
        variant: "destructive",
      });
      return;
    }

    if (!protocol || !selectedStage || !selectedStage.id) return;

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("stageId", String(selectedStage.id));
      formData.append("appliedAt", new Date().toISOString());

      if (clientPhoto) {
        const blob = await fetch(clientPhoto).then((res) => res.blob());
        formData.append("clientPhoto", blob, "client-photo.jpg");
      }

      if (clientSignature) {
        formData.append("clientSignature", clientSignature);
      }
      if (nurseSignature) {
        formData.append("nurseSignature", nurseSignature);
      }

      // Enviar para a API
      await applicationsService.createApplication(formData);

      // Atualizar o protocolo localmente
      const updatedStages = protocol.stages.map((stage) =>
        stage.id === selectedStage.id
          ? {
              ...stage,
              status: "applied" as StageStatus,
              date: new Date().toISOString(),
            }
          : stage
      );

      setProtocol({ ...protocol, stages: updatedStages });

      // Atualizar a lista de aplicações
      if (selectedStage.id) {
        const stageApplications =
          await applicationsService.listStageApplications(selectedStage.id);
        setApplications({
          ...applications,
          [selectedStage.id]: stageApplications,
        });
      }

      setIsDialogOpen(false);

      toast({
        title: "Aplicação concluída",
        description: "O estágio do protocolo foi aplicado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao aplicar estágio:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aplicar o estágio do protocolo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForceCompleteSubmit = async () => {
    if (!protocol || !selectedStage || !selectedStage.id) return;

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("protocolStageId", String(selectedStage.id));
      formData.append("bypassBiometry", "true"); // Indica que a biometria foi ignorada
      formData.append("appliedAt", new Date().toISOString());

      // Você pode adicionar outras informações necessárias aqui, como a assinatura do enfermeiro, se ainda for relevante para o registro.
      // Por exemplo, se a assinatura do enfermeiro for sempre necessária, mesmo na conclusão forçada:
      // if (nurseSignature) {
      //   formData.append("nurseSignature", nurseSignature);
      // }

      await applicationsService.createApplication(formData);

      // Atualizar o protocolo localmente
      const updatedStages = protocol.stages.map((stage) =>
        stage.id === selectedStage.id
          ? {
              ...stage,
              status: "applied" as StageStatus,
              date: new Date().toISOString(),
            }
          : stage
      );

      setProtocol({ ...protocol, stages: updatedStages });

      // Atualizar a lista de aplicações
      if (selectedStage.id) {
        const stageApplications =
          await applicationsService.listStageApplications(selectedStage.id);
        setApplications({
          ...applications,
          [selectedStage.id]: stageApplications,
        });
      }

      setIsDialogOpen(false);

      toast({
        title: "Conclusão Forçada",
        description: "O estágio foi concluído forçadamente com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao forçar conclusão do estágio:", error);
      toast({
        title: "Erro",
        description: "Não foi possível forçar a conclusão do estágio.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewApplications = async (stage: ProtocolStage) => {
    if (!stage.id) return;

    try {
      setIsLoading(true);
      const stageApplications = await applicationsService.listStageApplications(
        stage.id
      );
      setSelectedStageApplications(stageApplications);
      setIsViewingApplications(true);
    } catch (error) {
      console.error("Erro ao carregar aplicações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as aplicações deste estágio.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteApplication = async (id: string | number) => {
    if (!canDeleteProtocols) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para excluir aplicações.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se o protocolo está finalizado
    const isProtocolCompleted = protocol?.stages.every(
      (stage) => stage.status === "applied"
    );
    if (isProtocolCompleted) {
      toast({
        title: "Operação não permitida",
        description:
          "Não é possível excluir aplicações de um protocolo finalizado.",
        variant: "destructive",
      });
      return;
    }

    setApplicationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteApplication = async () => {
    if (!applicationToDelete || !selectedStage?.id) return;

    try {
      setIsSubmitting(true);
      await applicationsService.deleteApplication(applicationToDelete);

      // Atualizar a lista de aplicações
      const updatedApplications = selectedStageApplications.filter(
        (app) => app.id !== applicationToDelete
      );
      setSelectedStageApplications(updatedApplications);
      setApplications({
        ...applications,
        [selectedStage.id]: updatedApplications,
      });

      // Se não houver mais aplicações, atualizar o status do estágio
      if (updatedApplications.length === 0 && protocol) {
        const updatedStages = protocol.stages.map((stage) =>
          stage.id === selectedStage.id
            ? { ...stage, status: "pending", date: null }
            : stage
        );
        setProtocol({ ...protocol, stages: updatedStages });
      }

      toast({
        title: "Aplicação excluída",
        description: "A aplicação foi excluída com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir aplicação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a aplicação.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setDeleteDialogOpen(false);
      setApplicationToDelete(null);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Pendente";

    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatStageScheduledDate = (stage: ProtocolStage) => {
    if (!protocol || !protocol.createdAt)
      return (
        <span className="text-muted-foreground text-sm">Não agendado</span>
      );

    // Ordenar os estágios por ordem
    const sortedStages = [...protocol.stages].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return String(a.id || "").localeCompare(String(b.id || ""));
    });

    // Encontrar o índice do estágio atual
    const currentStageIndex = sortedStages.findIndex((s) => s.id === stage.id);
    if (currentStageIndex === -1)
      return (
        <span className="text-muted-foreground text-sm">Não agendado</span>
      );

    // Começar com a data de criação do protocolo
    let scheduledDate = new Date(protocol.createdAt);

    // Somar os intervalos de todos os estágios até o atual
    for (let i = 0; i <= currentStageIndex; i++) {
      const currentStage = sortedStages[i];
      if (currentStage.intervalDays) {
        const interval = Math.floor(Number(currentStage.intervalDays));
        scheduledDate = new Date(
          scheduledDate.getTime() + interval * 24 * 60 * 60 * 1000
        );
      }
    }

    // Verificar se a data é válida
    if (isNaN(scheduledDate.getTime())) {
      return (
        <span className="text-muted-foreground text-sm">Data inválida</span>
      );
    }

    // Formatar e retornar a data
    const formattedDate = formatDate(scheduledDate.toISOString());
    return <span>{formattedDate}</span>;
  };

  // Encontrar o próximo estágio pendente
  const getNextPendingStage = () => {
    return protocol?.stages.find((stage) => stage.status !== "applied");
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Carregando detalhes do protocolo...
          </p>
        </div>
      </div>
    );
  }

  if (!protocol) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Protocolo não encontrado.</p>
      </div>
    );
  }

  const nextPendingStage = getNextPendingStage();

  if (isViewingApplications) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Histórico de Aplicações
            </h1>
            <p className="text-muted-foreground">
              Estágio:{" "}
              {selectedStageApplications[0]?.Stage?.name ||
                "Estágio não encontrado"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsViewingApplications(false)}
          >
            Voltar ao Protocolo
          </Button>
        </div>

        {selectedStageApplications.length > 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {selectedStageApplications.map((application) => (
                  <div
                    key={application.id}
                    className="border rounded-md p-4 space-y-1"
                  >
                    {/* Cabeçalho com nome do técnico e data */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          Aplicado por:{" "}
                          {application.nurse?.name ||
                            "Técnico não identificado"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Data: {formatDate(application.appliedAt)}
                        </p>
                      </div>

                      {canDeleteProtocols && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() =>
                            handleDeleteApplication(application.id)
                          }
                        >
                          <Trash className="h-4 w-4 mr-1" /> Excluir
                        </Button>
                      )}
                    </div>

                    {/* Conteúdo principal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                      {/* Foto do Cliente */}
                      {application.clientPhoto && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Foto do Cliente
                          </h4>
                          <div className="mx-auto w-48 aspect-square overflow-hidden rounded-xl border bg-black">
                            <img
                              src={`data:image/jpeg;base64,${application.clientPhoto}`}
                              alt="Foto do Cliente"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                      )}

                      {/* Assinaturas */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Assinaturas
                        </h4>
                        <div className="space-y-3">
                          {/* Assinatura do Cliente */}
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Cliente:
                            </p>
                            <div className="border rounded-md p-2 bg-white">
                              <img
                                src={
                                  application.clientSignature ||
                                  "/placeholder.svg"
                                }
                                alt="Assinatura do Cliente"
                                className="max-h-16 w-auto"
                              />
                            </div>
                          </div>

                          {/* Assinatura do Técnico */}
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Técnico:
                            </p>
                            <div className="border rounded-md p-2 bg-white">
                              <img
                                src={
                                  application.nurseSignature ||
                                  "/placeholder.svg"
                                }
                                alt="Assinatura do Técnico"
                                className="max-h-16 w-auto"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-md border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              Nenhuma aplicação encontrada para este estágio.
            </p>
          </div>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Aplicação</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta aplicação? Esta ação não
                pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteApplication}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  "Excluir"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="outline" size="sm" onClick={handleGoBack}>
              ← Voltar
            </Button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {protocol.title}
          </h1>
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-muted-foreground">
              Cliente: {protocol.Client?.name}
            </p>
            {protocol.Client?.cpf && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span className="font-mono">CPF: {protocol.Client.cpf}</span>
              </div>
            )}

            {protocol.Client?.phone && (
              <p className="text-sm text-muted-foreground">
                Telefone: {protocol.Client.phone}
              </p>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estágios do Protocolo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {protocol.stages.map((stage) => (
              <div
                key={stage.id}
                className={`flex items-center justify-between rounded-md border p-4 ${
                  stage.status === "applied" ? "bg-muted" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {stage.status === "applied" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-300" />
                  )}
                  <div>
                    <p className="font-medium">{stage.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Agendado para: {formatStageScheduledDate(stage)}
                      </span>
                    </div>
                    {stage.status === "applied" && stage.date && (
                      <div className="flex items-center gap-2 text-sm text-green-600 mt-1">
                        <Clock className="h-4 w-4" />
                        <span>Aplicado em: {formatDate(stage.date)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {stage.status === "applied" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewApplications(stage)}
                      disabled={!canViewProtocols}
                    >
                      Ver Histórico
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => handleStartApplication(stage)}
                      disabled={!canCreateProtocols}
                    >
                      Iniciar Aplicação
                    </Button>
                  )}

                  {canUpdateProtocols && (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        handleStartApplication(stage, { forceComplete: true })
                      }
                    >
                      Forçar Conclusão
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open && isSubmitting) return; // Evitar fechar durante o envio
          setIsDialogOpen(open);
          if (!open) {
            stopWebcam();
            setIsCameraReady(false);
            setIsCameraError(false);
          }
        }}
      >
        <DialogContent className="max-h-[98vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isForceComplete
                ? "Forçar Conclusão de Estágio"
                : "Aplicação de Protocolo"}
            </DialogTitle>
            <DialogDescription>
              {isForceComplete
                ? "Você está prestes a forçar a conclusão de um estágio sem seguir o processo regular."
                : "Complete as etapas abaixo para aplicar o estágio do protocolo."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {step === "facial" && (
              <div className="space-y-4">
                <h3 className="text-center font-medium">
                  Reconhecimento Facial
                </h3>

                <div className="mx-auto w-full max-w-sm aspect-square overflow-hidden rounded-xl border bg-muted relative">
                  {isCameraLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                      <span className="ml-2 text-white font-medium">
                        Iniciando câmera...
                      </span>
                    </div>
                  )}

                  {isCameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/5">
                      <div className="bg-white p-4 rounded-lg shadow-lg text-center max-w-xs">
                        <XCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
                        <h4 className="font-medium mb-2">Erro na câmera</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          {isCameraErrorMessage}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsCameraError(false);
                            startWebcam();
                          }}
                        >
                          Tentar novamente
                        </Button>
                      </div>
                    </div>
                  )}

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-col gap-2 items-center">
                  <Button
                    onClick={handleCaptureImage}
                    disabled={
                      !isCameraReady || isCameraLoading || isCameraError
                    }
                    className="w-full max-w-sm"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {isCameraLoading ? "Preparando câmera..." : "Capturar foto"}
                  </Button>

                  {!isCameraError && (
                    <p className="text-xs text-center text-muted-foreground px-4">
                      Posicione o rosto do cliente no centro da câmera e clique
                      em "Capturar foto"
                    </p>
                  )}
                </div>

                <canvas ref={photoCanvasRef} className="hidden" />
              </div>
            )}

            {step === "client-signature" && (
              <div className="space-y-4">
                <h3 className="text-center font-medium">
                  Assinatura do Cliente
                </h3>

                {clientPhoto && (
                  <div className="mx-auto w-24 h-24 rounded-full overflow-hidden border-2 border-primary mb-2">
                    <img
                      src={clientPhoto || "/placeholder.svg"}
                      alt="Foto capturada"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="relative mx-auto w-full max-w-sm rounded-md border bg-white">
                  <div className="absolute inset-x-0 top-0 -mt-6 text-center">
                    <span className="text-xs text-muted-foreground bg-white px-2 py-1 rounded-full border">
                      Assinatura do Cliente
                    </span>
                  </div>
                  <canvas
                    ref={clientCanvasRef}
                    className="h-32 w-full touch-none"
                  />
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Solicite ao cliente que assine no espaço acima.
                </p>

                <div className="flex flex-col gap-2">
                  <Button onClick={handleClientSignature} className="w-full">
                    Confirmar Assinatura
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Limpar a assinatura
                      const canvas = clientCanvasRef.current;
                      if (canvas) {
                        const ctx = canvas.getContext("2d");
                        if (ctx)
                          ctx.clearRect(0, 0, canvas.width, canvas.height);
                      }
                      setClientSignature(null);
                    }}
                  >
                    Limpar Assinatura
                  </Button>
                </div>
              </div>
            )}

            {step === "nurse-signature" && (
              <div className="space-y-4">
                <h3 className="text-center font-medium">
                  Assinatura do Técnico
                </h3>

                <div className="flex flex-wrap justify-center gap-4 mb-2">
                  {clientPhoto && (
                    <div className="w-20 h-20 rounded-full overflow-hidden border">
                      <img
                        src={clientPhoto || "/placeholder.svg"}
                        alt="Foto do cliente"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {clientSignature && (
                    <div className="w-40 h-20 border rounded-md bg-white p-1 flex items-center justify-center">
                      <img
                        src={clientSignature || "/placeholder.svg"}
                        alt="Assinatura do cliente"
                        className="max-h-full max-w-full"
                      />
                    </div>
                  )}
                </div>

                <div className="relative mx-auto w-full max-w-sm rounded-md border bg-white">
                  <div className="absolute inset-x-0 top-0 -mt-6 text-center">
                    <span className="text-xs text-muted-foreground bg-white px-2 py-1 rounded-full border">
                      Sua Assinatura
                    </span>
                  </div>
                  <canvas
                    ref={nurseCanvasRef}
                    className="h-32 w-full touch-none"
                  />
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Assine para confirmar a aplicação do protocolo.
                </p>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleNurseSignature}
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      "Concluir Aplicação"
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Limpar a assinatura
                      const canvas = nurseCanvasRef.current;
                      if (canvas) {
                        const ctx = canvas.getContext("2d");
                        if (ctx)
                          ctx.clearRect(0, 0, canvas.width, canvas.height);
                      }
                      setNurseSignature(null);
                    }}
                    disabled={isSubmitting}
                  >
                    Limpar Assinatura
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                {/* Remova ou ajuste os Badges conforme a necessidade para o fluxo de conclusão forçada */}
                {!isForceComplete && (
                  <Badge
                    variant={isFacialRecognized ? "default" : "outline"}
                    className="whitespace-nowrap"
                  >
                    <Camera className="h-3 w-3 mr-1" /> Foto
                  </Badge>
                )}
                {!isForceComplete && (
                  <Badge
                    variant={
                      isClientSigned || step === "nurse-signature"
                        ? "default"
                        : "outline"
                    }
                    className="whitespace-nowrap"
                  >
                    <FileText className="h-3 w-3 mr-1" /> Assinatura Cliente
                  </Badge>
                )}
                <Badge
                  variant={step === "nurse-signature" ? "default" : "outline"}
                  className="whitespace-nowrap"
                >
                  <FileText className="h-3 w-3 mr-1" /> Assinatura Técnico
                </Badge>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client"

import { User } from "@/contexts/auth-context"
import { authService } from "@/services/api"
import { messagesService } from "@/services/messages"
import { useEffect, useState } from "react"

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import {
  Badge
} from "@/components/ui/badge"
import { Button } from "./ui/button"
import { HelpCircle, Send } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

const messageTypes = [
  { value: "melhoria", label: "Sugestão de Melhoria" },
  { value: "adicao", label: "Adicionar Algo" },
  { value: "duvida", label: "Dúvida" },
]

interface Message {
  id: number | string
  senderId: number | string
  receiverId: number | string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
  updatedAt: string
  sender: {
    id: number | string
    name: string
    role: string
  }
}

interface MessageBoxProps {
  className?: string;
  isOpen?: boolean; // Add isOpen prop to match sidebar state
}

export function MessageBox({ className, isOpen = true }: MessageBoxProps) {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([])
  const [receiverId, setReceiverId] = useState<string | number>("")
  const [type, setType] = useState<string>(messageTypes[0].value)
  const [messageText, setMessageText] = useState<string>("")
  const [sending, setSending] = useState(false)
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [messages, setMessages] = useState<Message[]>([])
  const [activeTab, setActiveTab] = useState("send")

  useEffect(() => {
    authService.listUsers().then((data) => setUsers(data as User[])).catch(console.error)
    fetchInboxStatus()
    
    // Set up polling to check for new messages every minute
    const intervalId = setInterval(fetchInboxStatus, 60000);
    return () => clearInterval(intervalId);
  }, [])

  const fetchInboxStatus = async () => {
    try {
      const msgs = await messagesService.getInbox();
      
      const typedMessages: Message[] = msgs.map((msg: any) => ({
        id: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        subject: msg.subject,
        message: msg.message,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
        sender: {
          id: msg.sender.id,
          name: msg.sender.name,
          role: msg.sender.role
        }
      }));
      
      setMessages(typedMessages);
      setHasNewMessages(typedMessages.some((m) => !m.isRead));
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (messageId: string | number) => {
    if (!messageId) return;

    try {
      await messagesService.markAsRead(messageId);
      
      setMessages(prev => {
        const updatedMessages = prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        );
        
        setHasNewMessages(updatedMessages.some(m => !m.isRead));
        
        return updatedMessages;
      });
      
    } catch (err) {
      console.error('Erro ao marcar como lida:', err);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: false } : msg
      ));
    }
  };

  const handleSend = async () => {
    if (!receiverId || !messageText) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSending(true);
      const subject = `${messageTypes.find((t) => t.value === type)?.label}`;
      await messagesService.sendMessage(receiverId, subject, messageText);
      
      setMessageText("");
      setType(messageTypes[0].value);
      setReceiverId("");
      setIsDialogOpen(false);
      
      fetchInboxStatus();
      
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso! 🎉",
        variant: "default"
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Erro ao enviar",
        description: "Erro ao enviar mensagem. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={cn("mt-auto pt-4 border-t border-sidebar-border", className)}>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <div className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer",
            !isOpen && "justify-center px-2"
          )}>
            <div className="relative">
              <HelpCircle className="h-5 w-5" />
              {hasNewMessages && (
                <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-red-500" />
              )}
            </div>
            {isOpen && <span>Precisa de Ajuda?</span>}
            {isOpen && hasNewMessages && (
              <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1 flex items-center justify-center">
                {messages.filter(m => !m.isRead).length}
              </Badge>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Central de Ajuda</DialogTitle>
            <DialogDescription>
              Envie e visualize suas mensagens no sistema.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="send" value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="send">Enviar Mensagem</TabsTrigger>
              <TabsTrigger value="inbox" className="relative">
                Caixa de Entrada
                {hasNewMessages && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                    {messages.filter(m => !m.isRead).length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="send" className="space-y-4 mt-4">
              <Select 
                onValueChange={(val) => setReceiverId(val)}
                value={String(receiverId)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Para quem deseja enviar?" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.name} ({u.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                onValueChange={setType} 
                value={type}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipo de mensagem" />
                </SelectTrigger>
                <SelectContent>
                  {messageTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Descreva sua mensagem aqui..."
                className="min-h-[120px]"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              
              <div className="flex justify-end pt-2">
                <Button
                  disabled={sending}
                  onClick={handleSend}
                >
                  {sending ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Enviar
                    </span>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="inbox" className="mt-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Sua caixa de entrada está vazia.
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${msg.isRead ? 'bg-muted/30' : 'bg-accent'}`}
                      onClick={() => msg.id && markAsRead(msg.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">
                          De: {msg.sender?.name || 'Remetente desconhecido'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : 'Data desconhecida'}
                        </span>
                      </div>
                      <div className="font-medium">{msg.subject}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {msg.message}
                      </div>
                      {!msg.isRead && (
                        <Badge variant="secondary" className="mt-2">Nova</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

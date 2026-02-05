import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { z } from "zod";
import { 
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LayoutShell from "@/components/layout-shell";
import { projectCategoryEnum, montadorLevelEnum } from "@shared/schema";
import { Loader2, Upload, X } from "lucide-react";
import { useState } from "react";

const serviceSchema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  description: z.string().min(20, "Descrição deve ser detalhada"),
  category: z.enum(projectCategoryEnum.enumValues),
  minQualification: z.enum(montadorLevelEnum.enumValues),
  addressFull: z.string().min(10, "Endereço completo é obrigatório"),
  clientName: z.string().min(3, "Nome do cliente é obrigatório"),
  clientPhone: z.string().optional(),
  price: z.coerce.number().min(1, "Valor deve ser maior que zero"),
  isUrgent: z.boolean().default(false),
  documents: z.array(z.string()).default([]),
  videos: z.array(z.string()).default([]),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function CreateService() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "montagem_geral",
      minQualification: "iniciante",
      addressFull: "",
      clientName: "",
      clientPhone: "",
      price: 0,
      isUrgent: false,
      documents: [],
      videos: [],
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormValues) => {
      // Convert price to cents if needed, but schema says integer price. 
      // Assuming input is in reais, let's store as is or cents? 
      // User didn't specify, but usually money is cents. 
      // Let's assume input is raw number for now.
      const res = await apiRequest("POST", "/api/services", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Serviço publicado!",
        description: "Os montadores qualificados poderão visualizar seu serviço.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao publicar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "documents" | "videos") => {
    if (!e.target.files?.length) return;

    const formData = new FormData();
    Array.from(e.target.files).forEach((file) => {
      formData.append("files", file);
    });

    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const currentFiles = form.getValues(fieldName) || [];
      form.setValue(fieldName, [...currentFiles, ...data.urls]);
      
      toast({
        title: "Arquivos enviados",
        description: `${data.urls.length} arquivos adicionados com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar os arquivos.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fieldName: "documents" | "videos", index: number) => {
    const currentFiles = form.getValues(fieldName);
    const newFiles = currentFiles.filter((_, i) => i !== index);
    form.setValue(fieldName, newFiles);
  };

  const onSubmit = (data: ServiceFormValues) => {
    createServiceMutation.mutate(data);
  };

  return (
    <LayoutShell>
      <div className="max-w-4xl mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Publicar Novo Serviço</CardTitle>
            <CardDescription>
              Preencha os detalhes do serviço para encontrar os melhores montadores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Título do Serviço</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Montagem de Guarda-Roupa Casal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projectCategoryEnum.enumValues.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category.replace(/_/g, " ").toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minQualification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualificação Mínima</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o nível" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {montadorLevelEnum.enumValues.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level.toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Apenas montadores com este nível ou superior verão o serviço.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição Detalhada</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva os itens a serem montados, condições do local, ferramentas necessárias..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Cliente</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clientPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone do Cliente</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="addressFull"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Endereço da Montagem</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, Número, Bairro, Cidade - UF" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor do Serviço (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isUrgent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-8">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Urgente
                          </FormLabel>
                          <FormDescription>
                            Marque se este serviço precisa de prioridade alta.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <FormLabel>Projetos / Manuais (PDF)</FormLabel>
                    <div className="mt-2 flex items-center gap-4">
                      <Input
                        type="file"
                        accept=".pdf"
                        multiple
                        onChange={(e) => handleFileUpload(e, "documents")}
                        disabled={uploading}
                      />
                      {uploading && <Loader2 className="animate-spin h-5 w-5" />}
                    </div>
                    <div className="mt-2 space-y-2">
                      {form.watch("documents").map((url, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded border">
                          <span className="text-sm truncate max-w-[300px]">{url.split('/').pop()}</span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeFile("documents", idx)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <FormLabel>Vídeos Explicativos</FormLabel>
                    <div className="mt-2 flex items-center gap-4">
                      <Input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={(e) => handleFileUpload(e, "videos")}
                        disabled={uploading}
                      />
                      {uploading && <Loader2 className="animate-spin h-5 w-5" />}
                    </div>
                    <div className="mt-2 space-y-2">
                      {form.watch("videos").map((url, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded border">
                          <span className="text-sm truncate max-w-[300px]">{url.split('/').pop()}</span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeFile("videos", idx)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => setLocation("/")}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createServiceMutation.isPending || uploading}>
                    {createServiceMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publicando...
                      </>
                    ) : (
                      "Publicar Serviço"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </LayoutShell>
  );
}

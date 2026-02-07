import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertServiceSchema, serviceStatusEnum, complexityLevelEnum, montadorLevelEnum } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, MapPin, Upload, X, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Extend schema for frontend validation if needed
const formSchema = insertServiceSchema.extend({
  addressFull: z.string().min(5, "Endereço completo é obrigatório"),
  clientName: z.string().min(2, "Nome do cliente é obrigatório"),
  title: z.string().min(5, "Título do serviço é obrigatório"),
  price: z.coerce.number().min(0, "O valor deve ser positivo"),
});

type ServiceFormValues = z.infer<typeof formSchema> & { files?: FileList };

interface ServiceFormProps {
  defaultValues?: Partial<ServiceFormValues>;
  onSubmit: (data: ServiceFormValues) => Promise<void>;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

// Nominatim OpenStreetMap Search
async function searchAddress(query: string) {
  if (query.length < 3) return [];
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&countrycodes=br&limit=5`);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export function ServiceForm({ defaultValues, onSubmit, isSubmitting = false, isEditing = false }: ServiceFormProps) {
  const [mapOpen, setMapOpen] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [addressQuery, setAddressQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      clientName: "",
      clientPhone: "",
      addressFull: "",
      price: 0,
      complexity: "medium",
      minQualification: "iniciante",
      durationHours: 1,
      isUrgent: false,
      status: "draft",
      ...defaultValues,
    },
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (addressQuery.length >= 3) {
        searchAddress(addressQuery).then(setAddressSuggestions);
      } else {
        setAddressSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [addressQuery]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: ServiceFormValues) => {
    // Inject files into data specifically for our parent handler to see
    // We cast to any because files is not in schema but needed for upload
    const submitData = { ...data, files: files as any };
    await onSubmit(submitData);
  };

  const currentAddress = form.watch("addressFull");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Serviço</CardTitle>
            <CardDescription>Informações principais sobre a montagem.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Serviço</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Montagem Guarda-Roupa Casal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Detalhada</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o que precisa ser feito, ferramentas necessárias, etc." 
                      className="min-h-[100px]"
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="complexity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complexidade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "medium"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="expert">Especialista</SelectItem>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value || "iniciante"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="iniciante">Iniciante</SelectItem>
                        <SelectItem value="intermediario">Intermediário</SelectItem>
                        <SelectItem value="avancado">Avançado</SelectItem>
                        <SelectItem value="especialista">Especialista</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-500">R$</span>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0,00" 
                          className="pl-9"
                          value={field.value ? (field.value / 100).toFixed(2) : ""} 
                          onChange={e => {
                             // Convert input value (dollars) to cents
                             const val = parseFloat(e.target.value);
                             field.onChange(Math.round(val * 100));
                          }}
                        />
                      </div>
                    </FormControl>
                    <p className="text-xs text-slate-500 mt-1">Valor total do serviço.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Project Files Upload */}
            <div className="space-y-2">
               <FormLabel>Projeto / Manuais (PDF ou Imagem)</FormLabel>
               <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-600">Clique para selecionar arquivos</p>
                  <p className="text-xs text-slate-400">PDF, PNG, JPG (Max 5MB)</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    accept=".pdf,image/*,.doc,.docx" 
                    onChange={handleFileChange}
                  />
               </div>
               
               {files.length > 0 && (
                 <div className="space-y-2 mt-2">
                   {files.map((file, i) => (
                     <div key={i} className="flex items-center justify-between p-2 bg-white border rounded text-sm">
                       <span className="truncate max-w-[200px]">{file.name}</span>
                       <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={(e) => { e.stopPropagation(); removeFile(i); }}>
                         <X className="w-4 h-4" />
                       </Button>
                     </div>
                   ))}
                 </div>
               )}
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cliente e Localização</CardTitle>
            <CardDescription>Dados para contato e execução do serviço.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Input placeholder="(00) 00000-0000" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address with Autocomplete */}
            <FormField
              control={form.control}
              name="addressFull"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Endereço Completo</FormLabel>
                  <div className="flex gap-2 relative">
                     <Popover open={suggestionsOpen && addressSuggestions.length > 0} onOpenChange={setSuggestionsOpen}>
                      <PopoverTrigger asChild>
                         <FormControl>
                          <div className="relative w-full">
                            <Input 
                              placeholder="Digite para buscar..." 
                              value={addressQuery || field.value}
                              onChange={(e) => {
                                setAddressQuery(e.target.value);
                                if (!suggestionsOpen) setSuggestionsOpen(true);
                                // If user types manually, update field too, but search runs on debounced query
                                field.onChange(e.target.value);
                              }}
                              className="pr-10"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                          </div>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-[400px]" align="start">
                        <Command>
                          <CommandList>
                            <CommandGroup heading="Sugestões">
                              {addressSuggestions.map((suggestion, index) => (
                                <CommandItem
                                  key={index}
                                  value={suggestion.display_name} // Unique value for command list
                                  onSelect={() => {
                                    const fullAddress = suggestion.display_name;
                                    form.setValue("addressFull", fullAddress);
                                    setAddressQuery(fullAddress);
                                    setSuggestionsOpen(false);
                                  }}
                                >
                                  <MapPin className="mr-2 h-4 w-4 opacity-50" />
                                  {suggestion.display_name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                     </Popover>

                    <Dialog open={mapOpen} onOpenChange={setMapOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="icon" title="Ver no Mapa">
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>Localização</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 w-full h-full bg-slate-100 rounded-md overflow-hidden relative">
                           {/* Google Maps Embed (No Key required for basic search embed) or OSM */}
                           {currentAddress ? (
                             <iframe
                               width="100%"
                               height="100%"
                               frameBorder="0"
                               style={{ border: 0 }}
                               src={`https://maps.google.com/maps?q=${encodeURIComponent(currentAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                               allowFullScreen
                             ></iframe>
                           ) : (
                             <div className="flex items-center justify-center h-full text-slate-500">
                               <p>Digite um endereço para visualizar no mapa</p>
                             </div>
                           )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pb-10">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Salvar Alterações" : "Criar Ordem de Serviço"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

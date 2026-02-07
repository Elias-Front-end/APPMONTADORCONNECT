import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertReviewSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { StarRating } from "@/components/star-rating";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const reviewFormSchema = z.object({
  ratingQuality: z.number().min(1, "Avaliação obrigatória"),
  ratingPunctuality: z.number().min(1, "Avaliação obrigatória"),
  ratingCleanliness: z.number().min(1, "Avaliação obrigatória"),
  ratingProfessionalism: z.number().min(1, "Avaliação obrigatória"),
  comment: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: number;
  montadorId: string;
  montadorName?: string;
}

export function ReviewModal({ isOpen, onClose, serviceId, montadorId, montadorName }: ReviewModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      ratingQuality: 0,
      ratingPunctuality: 0,
      ratingCleanliness: 0,
      ratingProfessionalism: 0,
      comment: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      await apiRequest("POST", `/api/services/${serviceId}/reviews`, {
        ...data,
        revieweeId: montadorId,
        serviceId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/services/${serviceId}`] }); // Refresh service to maybe hide button or show reviewed status
      toast({ title: "Avaliação enviada!", description: "Obrigado pelo seu feedback." });
      onClose();
    },
    onError: (error: any) => {
      toast({ title: "Erro ao avaliar", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Avaliar Montador</DialogTitle>
          <DialogDescription>
            Como foi o serviço realizado por {montadorName || "o parceiro"}?
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => submitMutation.mutate(data))} className="space-y-6 py-4">
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="ratingQuality"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <FormLabel className="text-base font-normal">Qualidade do Serviço</FormLabel>
                    <FormControl>
                      <StarRating rating={field.value} onRatingChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ratingPunctuality"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <FormLabel className="text-base font-normal">Pontualidade</FormLabel>
                    <FormControl>
                      <StarRating rating={field.value} onRatingChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ratingCleanliness"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <FormLabel className="text-base font-normal">Limpeza e Organização</FormLabel>
                    <FormControl>
                      <StarRating rating={field.value} onRatingChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ratingProfessionalism"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <FormLabel className="text-base font-normal">Profissionalismo</FormLabel>
                    <FormControl>
                      <StarRating rating={field.value} onRatingChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentário (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Deixe um elogio ou sugestão..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={submitMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Avaliação
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

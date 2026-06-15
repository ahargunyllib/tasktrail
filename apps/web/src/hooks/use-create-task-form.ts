import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { createTaskMutationOptions } from "@/lib/queries";

const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
});

export function useCreateTaskForm(actor: string) {
  const mutation = useMutation(createTaskMutationOptions(actor));

  const form = useForm({
    defaultValues: { title: "" },
    validators: {
      onSubmit: createTaskSchema,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value.title.trim());
      form.reset();
    },
  });

  return { form, isLoading: mutation.isPending };
}

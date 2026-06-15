import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateTaskForm } from "@/hooks/use-create-task-form";

interface CreateTaskFormProps {
  actor: string;
}

export function CreateTaskForm({ actor }: CreateTaskFormProps) {
  const { form, isLoading } = useCreateTaskForm(actor);

  return (
    <form
      className="flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await form.handleSubmit();
      }}
    >
      <form.Field name="title">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field className="flex-1" data-invalid={isInvalid}>
              <Input
                aria-invalid={isInvalid}
                disabled={isLoading}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="New task title…"
                value={field.state.value}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>
      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button disabled={isSubmitting || isLoading} type="submit">
            Create
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

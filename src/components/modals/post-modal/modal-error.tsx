type ModalErrorProps = {
  message?: string | null;
};

export function ModalError({ message }: ModalErrorProps) {
  if (!message) return null;
  return (
    <div className='bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded'>
      {message}
    </div>
  );
}

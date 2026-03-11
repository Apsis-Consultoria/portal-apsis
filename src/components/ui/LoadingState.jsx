export default function LoadingState({ message = "Carregando dados..." }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-[#F4F6F4]" />
        <div className="absolute inset-0 rounded-full border-4 border-[#F47920] border-t-transparent animate-spin" />
      </div>
      <p className="text-sm text-[#5C7060] font-medium tracking-wide animate-pulse">
        {message}
      </p>
    </div>
  );
}
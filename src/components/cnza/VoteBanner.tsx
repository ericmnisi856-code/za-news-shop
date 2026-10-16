export function VoteBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-red-600 animate-pulse-red">
      <div className="bg-red-600 py-6 px-6 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2 animate-pulse-slow">
          Vote For SHOSH!!
        </h2>
        <p className="font-serif text-2xl md:text-3xl font-semibold text-white animate-pulse-slow">
          Shosholoza Progressive Party
        </p>
      </div>
      <style>{`
        @keyframes pulse-red {
          0%, 100% {
            background-color: rgb(220, 38, 38);
            box-shadow: 0 0 20px rgba(220, 38, 38, 0.8);
          }
          50% {
            background-color: rgb(239, 68, 68);
            box-shadow: 0 0 40px rgba(239, 68, 68, 1);
          }
        }
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.85;
          }
        }
        .animate-pulse-red {
          animation: pulse-red 1.5s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

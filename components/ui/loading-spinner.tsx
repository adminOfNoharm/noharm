export const LoadingSpinner = () => {
  return (
    <div className="relative flex items-center justify-center">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Spinning and Pulsing Logo with Leaf Animation */}
        <img
          src="/images/logo.svg"
          alt="Loading Logo"
          className="w-16 h-20 animate-spin-slow bounce-spin leaf-motion"
        />
      </div>

      <div className="absolute mt-20 text-gray-800 text-sm">Loading</div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-bounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes leaf-move {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(5deg) scale(1.05);
          }
          50% {
            transform: rotate(0deg) scale(1.1);
          }
          75% {
            transform: rotate(-5deg) scale(1.05);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 2.5s linear infinite;
        }

        .bounce-spin {
          animation: spin-slow 2.5s linear infinite, pulse-bounce 1.8s ease-in-out infinite;
        }

        .leaf-motion {
          animation: spin-slow 2.5s linear infinite, pulse-bounce 1.8s ease-in-out infinite, leaf-move 2.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}; 
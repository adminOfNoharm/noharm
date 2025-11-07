export function GridBackground() {
    return (
      <div className="absolute inset-0 -z-10 h-full w-full">
        <div 
          className="absolute h-full w-full bg-white"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-full bg-gradient-to-r from-[#2CD3C1] via-[#4169E1] to-[#6B4DE6] opacity-20 blur-[100px]" />
      </div>
    )
  }
  
  
function AuraBackdrop() {
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute top-[-18rem] left-[-14rem] h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(127,44,203,0.8),transparent_72%)] opacity-[0.14] blur-[150px]" />
      <div className="absolute bottom-[-18rem] right-[-14rem] h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(221,184,255,0.4),transparent_72%)] opacity-[0.14] blur-[150px]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:6px_6px] opacity-[0.025]" />
    </div>
  );
}

export default AuraBackdrop;

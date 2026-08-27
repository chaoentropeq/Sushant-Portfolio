export function BackgroundBlobs() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-22vh",
          left: "-12vw",
          width: "62vw",
          height: "62vw",
          borderRadius: "50%",
          background: "var(--g1)",
          filter: "blur(90px)",
          opacity: 0.62,
          animation: "drift 26s ease-in-out infinite",
          transition: "background 1.4s ease",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-28vh",
          right: "-14vw",
          width: "58vw",
          height: "58vw",
          borderRadius: "50%",
          background: "var(--g2)",
          filter: "blur(100px)",
          opacity: 0.55,
          animation: "drift2 32s ease-in-out infinite",
          transition: "background 1.4s ease",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "34vh",
          right: "22vw",
          width: "34vw",
          height: "34vw",
          borderRadius: "50%",
          background: "var(--g3)",
          filter: "blur(90px)",
          opacity: 0.4,
          animation: "drift 40s ease-in-out infinite",
          transition: "background 1.4s ease",
        }}
      />
    </div>
  );
}

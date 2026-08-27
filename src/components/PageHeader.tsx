export function PageHeader({
  eyebrow,
  title,
  maxWidth,
}: {
  eyebrow: string;
  title: string;
  maxWidth?: string;
}) {
  return (
    <>
      <p
        style={{
          margin: "0 0 10px",
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 11,
          letterSpacing: ".16em",
          textTransform: "uppercase",
          color: "var(--fg2)",
        }}
      >
        {eyebrow}
      </p>
      <h1
        style={{
          margin: "0 0 30px",
          fontSize: "clamp(2.125rem,2vw + 1.5rem,3.375rem)",
          lineHeight: 1.02,
          letterSpacing: "-.035em",
          fontWeight: 600,
          maxWidth,
        }}
      >
        {title}
      </h1>
    </>
  );
}

export default function CocoMascot({
  size = 40,
  walking = false,
}: {
  size?: number;
  walking?: boolean;
}) {
  const body = "#c9963d";
  const shade = "#b9852e";
  const outline = "#1a1a1a";

  return (
    <svg
      viewBox="0 0 300 190"
      width={size}
      height={(size * 190) / 300}
      xmlns="http://www.w3.org/2000/svg"
      overflow="visible"
    >
      <style>{`
        @keyframes coco-bob {
          0%, 50%, 100% { transform: translateY(0); }
          25%, 75% { transform: translateY(-4px); }
        }
        @keyframes coco-shadow {
          0%, 50%, 100% { transform: scaleX(1); opacity: 0.24; }
          25%, 75% { transform: scaleX(0.85); opacity: 0.14; }
        }
        @keyframes coco-leg-a {
          0%, 100% { transform: rotate(-20deg); }
          50% { transform: rotate(20deg); }
        }
        @keyframes coco-leg-b {
          0%, 100% { transform: rotate(20deg); }
          50% { transform: rotate(-20deg); }
        }
        @keyframes coco-ear {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(7deg); }
        }
        @keyframes coco-tail {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(4deg); }
        }
        .coco-group { animation: ${walking ? "coco-bob 0.7s ease-in-out infinite" : "none"}; transform-origin: 150px 100px; }
        .coco-shadow { animation: ${walking ? "coco-shadow 0.7s ease-in-out infinite" : "none"}; transform-origin: 180px 183px; }
        .coco-leg-a1 { animation: ${walking ? "coco-leg-a 0.7s ease-in-out infinite" : "none"}; transform-origin: 128px 132px; }
        .coco-leg-b1 { animation: ${walking ? "coco-leg-b 0.7s ease-in-out infinite" : "none"}; transform-origin: 152px 132px; }
        .coco-leg-b2 { animation: ${walking ? "coco-leg-b 0.7s ease-in-out infinite" : "none"}; transform-origin: 208px 132px; }
        .coco-leg-a2 { animation: ${walking ? "coco-leg-a 0.7s ease-in-out infinite" : "none"}; transform-origin: 232px 132px; }
        .coco-ear { animation: ${walking ? "coco-ear 0.7s ease-in-out infinite" : "none"}; transform-origin: 100px 60px; }
        .coco-tail { animation: ${walking ? "coco-tail 0.7s ease-in-out infinite" : "none"}; transform-origin: 252px 82px; }
      `}</style>

      <ellipse className="coco-shadow" cx="180" cy="183" rx="150" ry="7" fill="#000000" opacity="0.2" />

      <g className="coco-group">
        <path
          className="coco-leg-a1"
          d="M128,132 L108,175"
          stroke={outline}
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          className="coco-leg-a1"
          d="M128,132 L108,175"
          stroke={body}
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          className="coco-leg-b1"
          d="M152,132 L146,173"
          stroke={outline}
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          className="coco-leg-b1"
          d="M152,132 L146,173"
          stroke={body}
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          className="coco-leg-b2"
          d="M208,132 L202,173"
          stroke={outline}
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          className="coco-leg-b2"
          d="M208,132 L202,173"
          stroke={body}
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          className="coco-leg-a2"
          d="M232,132 L252,175"
          stroke={outline}
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          className="coco-leg-a2"
          d="M232,132 L252,175"
          stroke={body}
          strokeWidth="9"
          strokeLinecap="round"
        />

        <path
          className="coco-ear"
          d="M100,58 C80,58 55,72 42,98 C34,114 32,130 42,140 C50,146 62,138 70,120 C78,102 88,80 100,65 Z"
          fill={shade}
          stroke={outline}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        <circle cx="75" cy="88" r="38" fill={body} stroke={outline} strokeWidth="3" />

        <path
          d="M55,78 C30,82 12,98 8,112 C7,118 10,124 14,126 C20,122 24,112 32,102 C40,94 48,88 52,82 Z"
          fill={body}
          stroke={outline}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        <ellipse cx="182" cy="100" rx="80" ry="34" fill={body} stroke={outline} strokeWidth="3" />

        <path
          className="coco-tail"
          d="M252,82 C272,58 296,44 298,20 C299,10 291,7 284,15 C277,28 264,48 244,68 C239,76 243,84 252,82 Z"
          fill={body}
          stroke={outline}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        <ellipse cx="12" cy="119" rx="5" ry="4" fill={outline} />
        <circle cx="68" cy="76" r="3.5" fill={outline} />
      </g>
    </svg>
  );
}

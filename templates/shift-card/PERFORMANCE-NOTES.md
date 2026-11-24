# SHIFT performance and accessibility gates
- Native WebGL, no external runtime or imagery. Single 1,632-vertex interleaved mesh, two 1024² RGBA textures with mipmaps. Reported texture allocation is an estimate excluding driver overhead.
- Buffer size is floored and bounded to 2.5 million pixels on desktop and 1.25 million on compact devices (DPR <=2 / <=1.5). A new frame is submitted only when scroll/finish/geometry changes, or after visibility/resize/restoration; no perpetual loop. CPU submission duration is diagnostic only, not GPU time or FPS.
- Keep original SVG artwork until first successful frame; preserve finish selection on manual still, system reduced motion, WebGL unavailable and context loss. On restoration re-create resources. Motion buttons are present in the mast, material chapter and footer with consistent accessible state.
- Dedicated regression covers code gzip size, actual requested resource bytes, drawing-buffer and resource estimates, no offscreen/hidden submission in a simulated visibility change, keyboard activation, focus outlines, native disclosures, text-spacing/reflow, reduced motion and context loss/restore via WEBGL_lose_context. Physical GPU/mobile FPS, Safari/iOS and full manual WCAG acceptance remain separate, unverified.

## P5 measured browser evidence (7616d64)
Dedicated workflow 45385995315 passed all four suites. Lifecycle report: 7,753 bytes gzip JavaScript, 48,477 bytes initial requested transfer at each of five tested viewport/DPR cases; 58,752-byte geometry buffer; 11,184,811-byte estimated texture allocation; observed drawing buffers 532,800 to 2,500,000 pixels. CPU command-submission times 0–0.4ms are not GPU frame rates. Real context loss and restoration, keyboard, text spacing and unavailable GPU passed. These numbers apply to the tested revision; P6 retest pending.

## P6 evidence (f5e8486)
Workflow 45386440340 passed all four suites. Report: 54,076 bytes initial transfer, 8,231 bytes gzip JS, buffer counts 532,800–2,500,000. Physical GPU FPS and Safari remain unverified. P7 retest pending.

import { useEffect, useRef } from 'react';
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force';
import type { Simulation, ForceLink, SimulationLinkDatum } from 'd3-force';
import { useOnosTopology } from '../../hooks/useOnosTopology';
import type { TopoNode } from '../../hooks/useOnosTopology';

function truncateLabel(label: string, max = 14) {
  const s = String(label ?? '');
  if (s.length <= max) return s;
  return s.slice(0, Math.max(0, max - 1)) + '…';
}

function TopologyCanvas() {
  const { nodes, links } = useOnosTopology(8000);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simRef = useRef<Simulation<TopoNode, SimulationLinkDatum<TopoNode>> | null>(null);
  const hoveredRef = useRef<string | null>(null);
  const draggedRef = useRef<TopoNode | null>(null);
  const imagesRef = useRef<{
    device: HTMLImageElement;
    host: HTMLImageElement;
    deviceLoaded: boolean;
    hostLoaded: boolean;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;

    // preload icons from public/
    imagesRef.current = {
      device: new Image(),
      host: new Image(),
      deviceLoaded: false,
      hostLoaded: false,
    };
    imagesRef.current.device.onload = () => {
      imagesRef.current!.deviceLoaded = true;
      draw();
    };
    imagesRef.current.host.onload = () => {
      imagesRef.current!.hostLoaded = true;
      draw();
    };
    imagesRef.current.device.src = '/icons/switch.svg';
    imagesRef.current.host.src = '/icons/pc.svg';

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function linkIsHost(l: SimulationLinkDatum<TopoNode>) {
      const s = l.source as TopoNode;
      const t = l.target as TopoNode;
      return s.kind === 'host' || t.kind === 'host';
    }

    simRef.current = forceSimulation<TopoNode>([])
      .force('charge', forceManyBody().strength(-80))
      .force(
        'link',
        forceLink<TopoNode, SimulationLinkDatum<TopoNode>>([])
          .id((d: any) => (d as TopoNode).id)
          .distance((l: SimulationLinkDatum<TopoNode>) => (linkIsHost(l) ? 50 : 90))
          .strength(0.2)
      )
      .force('collide', forceCollide<TopoNode>().radius((n: TopoNode) => (n.kind === 'device' ? 18 : 12)).iterations(2))
      .force('center', forceCenter(0, 0))
      .alphaDecay(0.02)
      .on('tick', draw);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const linkForce = simRef.current!.force('link') as ForceLink<TopoNode, SimulationLinkDatum<TopoNode>>;
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = '#94a3b8';
      for (const l of linkForce.links()) {
        const s = l.source as TopoNode;
        const t = l.target as TopoNode;
        if (s.x == null || t.x == null) continue;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y!);
        ctx.lineTo(t.x, t.y!);
        ctx.stroke();
      }

      const imgs = imagesRef.current!;
      for (const n of simRef.current!.nodes()) {
        const size = n.kind === 'device' ? 28 : 22; // icon size in px
        const r = size / 2;

        // hover ring
        if (hoveredRef.current === n.id) {
          ctx.beginPath();
          ctx.arc(n.x!, n.y!, r + 3, 0, Math.PI * 2);
          ctx.strokeStyle = '#0ea5e9';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // icon or fallback circle
        const canDrawDevice = n.kind === 'device' && imgs?.deviceLoaded;
        const canDrawHost = n.kind === 'host' && imgs?.hostLoaded;
        if (canDrawDevice) {
          ctx.drawImage(imgs.device, n.x! - r, n.y! - r, size, size);
        } else if (canDrawHost) {
          ctx.drawImage(imgs.host, n.x! - r, n.y! - r, size, size);
        } else {
          ctx.beginPath();
          ctx.arc(n.x!, n.y!, r, 0, Math.PI * 2);
          ctx.fillStyle = n.kind === 'device' ? '#2563eb' : '#22c55e';
          ctx.fill();
        }

        // label
        ctx.fillStyle = '#111827';
        ctx.font = '13px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(truncateLabel(n.label), n.x!, n.y! + r + 4);
      }

      raf = requestAnimationFrame(() => {});
    }

    function centerForceToCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      (simRef.current!.force('center') as any).x(w / 2).y(h / 2);
      simRef.current!.alpha(0.2).restart();
    }
    centerForceToCanvas();

    function findNodeAt(x: number, y: number) {
      const nodes = simRef.current!.nodes();
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        const size = n.kind === 'device' ? 28 : 22;
        const r = size / 2 + 4; // include some padding
        const dx = x - (n.x || 0);
        const dy = y - (n.y || 0);
        if (dx * dx + dy * dy <= r * r) return n;
      }
      return null;
    }

    function toLocal(evt: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
    }

    function onPointerMove(e: PointerEvent) {
      const { x, y } = toLocal(e);
      const n = findNodeAt(x, y);
      hoveredRef.current = n?.id ?? null;
      if (draggedRef.current) {
        draggedRef.current.fx = x;
        draggedRef.current.fy = y;
        simRef.current!.alpha(0.2).restart();
      }
    }
    function onPointerDown(e: PointerEvent) {
      const { x, y } = toLocal(e);
      const n = findNodeAt(x, y);
      if (n) {
        draggedRef.current = n;
        n.fx = x; n.fy = y;
        simRef.current!.alphaTarget(0.3).restart();
      }
    }
    function onPointerUp() {
      if (draggedRef.current) {
        draggedRef.current.fx = undefined;
        draggedRef.current.fy = undefined;
        draggedRef.current = null;
        simRef.current!.alphaTarget(0);
      }
    }

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    const ro2 = new ResizeObserver(() => centerForceToCanvas());
    ro2.observe(canvas);

    return () => {
      ro.disconnect();
      ro2.disconnect();
      cancelAnimationFrame(raf);
      simRef.current?.stop();
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  useEffect(() => {
    if (!simRef.current) return;
    const sim = simRef.current;
    const linkForce = sim.force('link') as ForceLink<TopoNode, SimulationLinkDatum<TopoNode>>;

    const current = new Map(sim.nodes().map((n: TopoNode) => [n.id, n] as const));
    const nextNodes = nodes.map(n => Object.assign(current.get(n.id) ?? {}, n));
    sim.nodes(nextNodes);
    linkForce.links(links.map(l => ({ ...l })));

    sim.alpha(0.6).restart();
  }, [nodes, links]);

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 p-2 h-96 relative overflow-hidden">

      <canvas ref={canvasRef} className="w-full h-full" />
      <Legend />
    </div>
  );
}

function Legend() {
  return (
    <div className="absolute top-2 left-2 bg-white/80 dark:bg-gray-800/80 px-3 py-2 rounded text-base md:text-lg shadow font-medium">
      <div className="flex items-center gap-3">
        <span className="inline-block w-3.5 h-3.5 rounded-full" style={{ background: '#2563eb' }} /> Device
        <span className="inline-block w-3.5 h-3.5 rounded-full ml-4" style={{ background: '#22c55e' }} /> Host
      </div>
    </div>
  );
}

export default TopologyCanvas;

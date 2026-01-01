import { useEffect, useRef, useState } from 'react';
import { getDevices, getHosts } from '../utils/devicesApi';
import { onosApi } from '../utils/onosApi';

export type TopoNode = {
  id: string;
  label: string;
  kind: 'device' | 'host';
  x?: number; y?: number; vx?: number; vy?: number; fx?: number; fy?: number;
};

export type TopoLink = { id: string; source: string; target: string };

export function useOnosTopology(pollMs = 5000) {
  const [nodes, setNodes] = useState<TopoNode[]>([]);
  const [links, setLinks] = useState<TopoLink[]>([]);
  const prevRef = useRef<TopoNode[]>([]);
  const timer = useRef<number | null>(null);

  function mergeNodesPreservePos(prev: TopoNode[], next: TopoNode[]) {
    const prevMap = new Map(prev.map(n => [n.id, n]));
    return next.map(n => {
      const p = prevMap.get(n.id);
      return p ? { ...n, x: p.x, y: p.y, vx: p.vx, vy: p.vy, fx: p.fx, fy: p.fy } : n;
    });
  }

  async function load() {
    const [devices, hosts, linksJson] = await Promise.all([
      getDevices(),
      getHosts(),
      onosApi.getLinks(),
    ]);

    const deviceNodes: TopoNode[] = (devices?.devices ?? []).map((d: any) => ({
      id: d.id,
      label: d.friendly_name ?? d.id.replace(/^of:/, ''),
      kind: 'device',
    }));

    const hostNodes: TopoNode[] = (hosts?.hosts ?? []).map((h: any) => ({
      id: h.id,
      label: h.friendly_name ?? h.ipAddresses?.[0] ?? h.mac ?? h.id,
      kind: 'host',
    }));

    const deviceLinks: TopoLink[] = (linksJson?.links ?? []).map((l: any, i: number) => ({
      id: `dev-${i}-${l.src.device}-${l.dst.device}-${l.src.port}-${l.dst.port}`,
      source: l.src.device,
      target: l.dst.device,
    }));

    const hostLinks: TopoLink[] = (hosts?.hosts ?? [])
      .filter((h: any) => Array.isArray(h.locations) && h.locations.length)
      .map((h: any, i: number) => ({
        id: `host-${i}-${h.id}-${h.locations[0].elementId}`,
        source: h.id,
        target: h.locations[0].elementId,
      }));

    const nextNodes = [...deviceNodes, ...hostNodes];
    setNodes(mergeNodesPreservePos(prevRef.current ?? [], nextNodes));
    setLinks([...deviceLinks, ...hostLinks]);
    prevRef.current = nextNodes;
  }

  useEffect(() => {
    load();
    timer.current = window.setInterval(load, pollMs);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [pollMs]);

  return { nodes, links, reload: load };
}
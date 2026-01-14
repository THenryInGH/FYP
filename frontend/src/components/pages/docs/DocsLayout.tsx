import { NavLink, Outlet } from "react-router-dom";

type NavItem = { to: string; label: string };

const NAV: NavItem[] = [
  { to: "/docs", label: "Home" },
  { to: "/docs/introduction", label: "Introduction" },
  { to: "/docs/features", label: "Features" },
  { to: "/docs/getting-started", label: "Getting Started" },
  { to: "/docs/topology", label: "Topology & Controller" },
  { to: "/docs/troubleshooting", label: "Troubleshooting" },
  { to: "/docs/evaluation", label: "Evaluation" },
];

function SideLink({ to, label }: NavItem) {
  return (
    <NavLink
      to={to}
      end={to === "/docs"}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-lg text-sm ${
          isActive ? "bg-[#0a1128] text-white" : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function DocsLayout() {
  return (
    <div className="p-6">
      <div className="flex gap-6">
        {/* Left nav */}
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="sticky top-6 space-y-1">
            <div className="text-xs font-semibold text-gray-500 px-3 pb-2">
              Documentation
            </div>
            {NAV.map((i) => (
              <SideLink key={i.to} {...i} />
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


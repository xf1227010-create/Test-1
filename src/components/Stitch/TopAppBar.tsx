/**
 * Stitch 顶部应用栏
 *  - 左: 项目标题 + 主导航
 *  - 右: Run Clash Detection 按钮 + 通知/项目树/帮助 图标
 */
export function TopAppBar() {
  const navItems = [
    { label: 'Dashboard', active: true },
    { label: 'Project Manager', active: false },
    { label: 'Exports', active: false },
    { label: 'Settings', active: false },
  ];
  return (
    <header className="flex justify-between items-center h-[56px] px-6 w-full border-b border-outline-variant bg-background z-50 fixed top-0 left-0 right-0">
      <div className="flex items-center gap-6">
        <h1 className="text-headline-md font-display font-bold tracking-tight text-on-surface">
          REBAR DIGITAL TWIN
        </h1>
        <nav className="hidden md:flex gap-6">
          {navItems.map((it) => (
            <a
              key={it.label}
              href="#"
              className={
                'pb-1 font-mono text-label-caps transition-colors ' +
                (it.active
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-outline hover:text-on-surface-variant')
              }
            >
              {it.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button className="bg-primary-container text-on-primary-container px-4 py-1.5 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all text-sm">
          Run Clash Detection
        </button>
        <div className="flex gap-3 text-outline">
          <span className="material-symbols-outlined cursor-pointer hover:text-on-surface">
            notifications
          </span>
          <span className="material-symbols-outlined cursor-pointer hover:text-on-surface">
            account_tree
          </span>
          <span className="material-symbols-outlined cursor-pointer hover:text-on-surface">
            help
          </span>
        </div>
      </div>
    </header>
  );
}

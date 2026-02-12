import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

// Simple stroke icons (24x24)
const Icons = {
  folder: () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  plus: () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
  box: () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
    </svg>
  ),
  cart: () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  key: () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  ),
  chart: () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 3v18h18" />
      <path d="M18 17V9M13 17V5M8 17v-3" />
    </svg>
  ),
  users: () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  yen: () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  cog: () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  arrow: () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  ),
};

const FLOW_COLORS = ['#9ACFC0', '#8B5A2B', '#F0A05A'] as const;

const FLOW_STEPS = [
  { key: 'flowStep2', hint: 'flowStep2Hint', path: '/records', icon: 'plus' as const, goToNavKey: 'nav.records' },
  { key: 'flowStep3', hint: 'flowStep3Hint', path: '/items', icon: 'box' as const, goToNavKey: 'nav.items' },
  { key: 'flowStep4', hint: 'flowStep4Hint', path: '/records', icon: 'cart' as const, goToNavKey: 'nav.records' },
] as const;

const THEN_LINKS = [
  { key: 'thenWhat1', path: '/records', navKey: 'nav.records' },
  { key: 'thenWhat2', path: '/records', navKey: 'nav.records' },
  { key: 'thenWhat3', path: '/', navKey: 'nav.dashboard' },
  { key: 'thenWhat4', path: '/items', navKey: 'nav.items' },
] as const;

const ICON_BG: Record<string, { bg: string; fg: string }> = {
  orange: { bg: '#D88E4B20', fg: '#D88E4B' },
  mint: { bg: '#9ACFC020', fg: '#7AB8A8' },
  brown: { bg: '#8B5A2B20', fg: '#8B5A2B' },
  brownLight: { bg: '#A67C5220', fg: '#A67C52' },
  mintDark: { bg: '#7AB8A820', fg: '#7AB8A8' },
  orangeLight: { bg: '#F0A05A20', fg: '#D88E4B' },
};

const ALL_FUNCTIONS: { path: string; navKey: string; titleKey: string; bodyKey: string; icon: keyof typeof Icons; colorKey: keyof typeof ICON_BG }[] = [
  { path: '/', navKey: 'nav.dashboard', titleKey: 'dashboardTitle', bodyKey: 'dashboardBody', icon: 'chart', colorKey: 'orange' },
  { path: '/records', navKey: 'nav.records', titleKey: 'recordsTitle', bodyKey: 'recordsBody', icon: 'plus', colorKey: 'mint' },
  { path: '/items', navKey: 'nav.items', titleKey: 'itemsTitle', bodyKey: 'itemsBody', icon: 'box', colorKey: 'brown' },
  { path: '/customers', navKey: 'nav.customers', titleKey: 'customersTitle', bodyKey: 'customersBody', icon: 'users', colorKey: 'brownLight' },
  { path: '/rentals', navKey: 'nav.rentals', titleKey: 'rentalsTitle', bodyKey: 'rentalsBody', icon: 'key', colorKey: 'mintDark' },
  { path: '/sales', navKey: 'nav.sales', titleKey: 'salesTitle', bodyKey: 'salesBody', icon: 'yen', colorKey: 'orange' },
  { path: '/categories', navKey: 'nav.categories', titleKey: 'categoriesTitle', bodyKey: 'categoriesBody', icon: 'folder', colorKey: 'orangeLight' },
  { path: '/users', navKey: 'nav.users', titleKey: 'usersTitle', bodyKey: 'usersBody', icon: 'cog', colorKey: 'brownLight' },
];

const STATUS_GUIDE_ORDER = ['overdue', 'in_stock', 'listed', 'reserved', 'rented', 'sold', 'disposed'] as const;
const STATUS_CARD_COLORS: Record<string, { border: string; bg: string }> = {
  overdue: { border: '#ea580c', bg: '#fff7ed' },
  in_stock: { border: '#059669', bg: '#ecfdf5' },
  listed: { border: '#ca8a04', bg: '#fefce8' },
  reserved: { border: '#d97706', bg: '#fffbeb' },
  rented: { border: '#D88E4B', bg: '#FCE8DE' },
  sold: { border: '#64748b', bg: '#f1f5f9' },
  disposed: { border: '#dc2626', bg: '#fef2f2' },
};

function IconWrap({ name, className }: { name: keyof typeof Icons; className?: string }) {
  const Icon = Icons[name];
  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${className ?? 'w-10 h-10'}`} aria-hidden>
      <Icon />
    </span>
  );
}

export default function Manual() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 w-full max-w-3xl min-w-0">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-roomi-orange/10 via-roomi-peach/30 to-roomi-mint/10 p-6 border border-roomi-orange/20">
        <h1 className="text-2xl sm:text-3xl font-bold text-roomi-brown tracking-tight mb-2">
          {t('manual.title')}
        </h1>
        <p className="text-roomi-brownLight text-base">
          {t('manual.intro')}
        </p>
      </div>

      {/* Start here — 3 steps with colors & icons */}
      <section className="card p-5 sm:p-6 border-l-4 border-roomi-orange bg-roomi-orange/5">
        <h2 className="text-lg font-semibold text-roomi-brown mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-roomi-orange text-white text-sm font-bold">1</span>
          {t('manual.startHere')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FLOW_STEPS.map((step, i) => (
            <Link
              key={step.key}
              to={step.path}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 bg-white hover:shadow-roomiMd hover:border-roomi-orange transition-all touch-manipulation"
              style={{ borderColor: `${FLOW_COLORS[i]}60` }}
            >
              <span
                className="flex items-center justify-center w-12 h-12 rounded-full text-white shrink-0"
                style={{ backgroundColor: FLOW_COLORS[i] }}
              >
                <IconWrap name={step.icon} className="w-6 h-6 text-white" />
              </span>
              <span className="text-sm font-bold text-roomi-brown text-center">
                {i + 1}. {t(`manual.${step.key}`)}
              </span>
              <span className="text-xs text-roomi-brownLight text-center">
                {t(`manual.${step.hint}`)}
              </span>
              <span className="text-xs font-semibold text-roomi-orange underline underline-offset-2 mt-1">
                {t('manual.goTo', { page: t(step.goToNavKey) })}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Then what? — 4 links with arrows */}
      <section className="card p-5 sm:p-6 border-l-4 border-roomi-mint bg-roomi-mint/10">
        <h2 className="text-lg font-semibold text-roomi-brown mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-roomi-mint text-roomi-brown text-sm font-bold">2</span>
          {t('manual.thenWhat')}
        </h2>
        <ul className="space-y-3">
          {THEN_LINKS.map((item) => (
            <li key={item.key}>
              <Link
                to={item.path}
                className="flex items-center gap-2 text-roomi-brown font-medium hover:text-roomi-orange"
              >
                <span className="text-roomi-orange shrink-0 w-5 h-5 flex items-center justify-center">
                  <Icons.arrow />
                </span>
                {t(`manual.${item.key}`)}
                <span className="text-roomi-brownLight text-sm font-normal no-underline">
                  ({t(item.navKey)})
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* All functions — grid with icon, title, body, underlined link */}
      <section className="card p-5 sm:p-6 border-l-4 border-roomi-brownLight/50 bg-roomi-cream/50">
        <h2 className="text-lg font-semibold text-roomi-brown mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-roomi-brownLight/30 text-roomi-brown text-sm font-bold">3</span>
          {t('manual.allFunctions')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ALL_FUNCTIONS.map((fn) => (
            <Link
              key={fn.path}
              to={fn.path}
              className="flex gap-3 p-4 rounded-xl bg-white border border-roomi-peach/60 hover:border-roomi-orange/40 hover:shadow-roomi transition-all text-left touch-manipulation group"
            >
              <span
                className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
                style={{ backgroundColor: ICON_BG[fn.colorKey].bg, color: ICON_BG[fn.colorKey].fg }}
              >
                <IconWrap name={fn.icon} className="w-6 h-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-roomi-brown group-hover:text-roomi-orange transition-colors">
                  {t(`manual.${fn.titleKey}`)}
                </h3>
                <p className="text-sm text-roomi-brownLight mt-0.5 leading-snug">
                  {t(`manual.${fn.bodyKey}`)}
                </p>
                <span className="inline-block mt-2 text-sm font-semibold text-roomi-orange underline underline-offset-2 decoration-2">
                  {t('manual.goTo', { page: t(fn.navKey) })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Status guide — what each status means and what to do */}
      <section className="card p-5 sm:p-6 border-l-4 border-roomi-mint bg-roomi-mint/10">
        <h2 className="text-lg font-semibold text-roomi-brown mb-2 flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-roomi-mint text-roomi-brown text-sm font-bold">4</span>
          {t('manual.statusGuideTitle')}
        </h2>
        <p className="text-roomi-brownLight text-sm mb-5">
          {t('manual.statusGuideIntro')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STATUS_GUIDE_ORDER.map((statusId) => {
            const colors = STATUS_CARD_COLORS[statusId] ?? { border: '#A67C52', bg: '#FBF2EB' };
            return (
              <div
                key={statusId}
                className="rounded-xl border-2 overflow-hidden bg-white hover:shadow-roomi transition-all"
                style={{ borderColor: colors.border }}
              >
                <div
                  className="px-4 py-2 text-sm font-bold text-white"
                  style={{ backgroundColor: colors.border }}
                >
                  {t(`status.${statusId}`)}
                </div>
                <div className="p-4 bg-white">
                  <p className="text-xs font-semibold text-roomi-brownLight uppercase tracking-wide mb-1">
                    {t('manual.statusGuideMeaning')}
                  </p>
                  <p className="text-sm text-roomi-brown mb-3 leading-snug">
                    {t(`manual.statusGuide.${statusId}.meaning`)}
                  </p>
                  <p className="text-xs font-semibold text-roomi-brownLight uppercase tracking-wide mb-1">
                    {t('manual.statusGuideDo')}
                  </p>
                  <p className="text-sm text-roomi-brown mb-3 leading-snug">
                    {t(`manual.statusGuide.${statusId}.do`)}
                  </p>
                  <Link
                    to={`/items?status=${statusId}`}
                    className="text-sm font-semibold text-roomi-orange hover:text-roomi-orangeLight"
                  >
                    {t('manual.statusGuideView', { status: t(`status.${statusId}`) })}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

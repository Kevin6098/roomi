import { useTranslation } from 'react-i18next';

const SECTIONS: (keyof typeof sectionKeys)[] = [
  'overview',
  'flow',
  'dashboard',
  'records',
  'items',
  'customers',
  'rentals',
  'sales',
  'categories',
  'users',
];

const sectionKeys = {
  overview: { title: 'overviewTitle', body: 'overviewBody' },
  flow: { title: 'flowTitle', body: 'flowBody' },
  dashboard: { title: 'dashboardTitle', body: 'dashboardBody' },
  records: { title: 'recordsTitle', body: 'recordsBody' },
  items: { title: 'itemsTitle', body: 'itemsBody' },
  customers: { title: 'customersTitle', body: 'customersBody' },
  rentals: { title: 'rentalsTitle', body: 'rentalsBody' },
  sales: { title: 'salesTitle', body: 'salesBody' },
  categories: { title: 'categoriesTitle', body: 'categoriesBody' },
  users: { title: 'usersTitle', body: 'usersBody' },
} as const;

export default function Manual() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 w-full max-w-3xl min-w-0">
      <h1 className="text-2xl sm:text-3xl font-bold text-roomi-brown tracking-tight">
        {t('manual.title')}
      </h1>
      <p className="text-roomi-brownLight text-base leading-relaxed">
        {t('manual.intro')}
      </p>

      <div className="space-y-8">
        {SECTIONS.map((key) => {
          const { title, body } = sectionKeys[key];
          return (
            <section key={key} className="card p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-roomi-brown mb-3">
                {t(`manual.${title}`)}
              </h2>
              <p className="text-roomi-brownLight text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {t(`manual.${body}`)}
              </p>
            </section>
          );
        })}
      </div>
    </div>
  );
}

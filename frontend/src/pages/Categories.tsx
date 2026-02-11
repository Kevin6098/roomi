import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type MainCategory, type SubCategory } from '../api/client';

export default function Categories() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [mainForm, setMainForm] = useState<{ id?: string; name_en: string; name_ja: string } | null>(null);
  const [subForm, setSubForm] = useState<{ id?: string; main_category_id: string; name_en: string; name_ja: string } | null>(null);
  const [deleteMainId, setDeleteMainId] = useState<string | null>(null);
  const [deleteSubId, setDeleteSubId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data: mains = [] } = useQuery({
    queryKey: ['categories', 'main'],
    queryFn: () => api.categories.getMain(),
  });
  const { data: subs = [] } = useQuery({
    queryKey: ['categories', 'sub'],
    queryFn: () => api.categories.getAllSubs(),
  });

  const createMainMutation = useMutation({
    mutationFn: (body: { name_en: string; name_ja?: string | null }) => api.categories.createMain(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setMainForm(null);
      setError('');
    },
    onError: (e) => setError((e as Error).message),
  });
  const updateMainMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { name_en?: string; name_ja?: string | null } }) =>
      api.categories.updateMain(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setMainForm(null);
      setError('');
    },
    onError: (e) => setError((e as Error).message),
  });
  const deleteMainMutation = useMutation({
    mutationFn: (id: string) => api.categories.deleteMain(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteMainId(null);
    },
    onError: (e) => setError((e as Error).message),
  });

  const createSubMutation = useMutation({
    mutationFn: (body: { main_category_id: string; name_en: string; name_ja?: string | null }) =>
      api.categories.createSub(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSubForm(null);
      setError('');
    },
    onError: (e) => setError((e as Error).message),
  });
  const updateSubMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { name_en?: string; name_ja?: string | null } }) =>
      api.categories.updateSub(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSubForm(null);
      setError('');
    },
    onError: (e) => setError((e as Error).message),
  });
  const deleteSubMutation = useMutation({
    mutationFn: (id: string) => api.categories.deleteSub(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteSubId(null);
    },
    onError: (e) => setError((e as Error).message),
  });

  function handleSubmitMain(e: React.FormEvent) {
    e.preventDefault();
    if (!mainForm) return;
    setError('');
    if (mainForm.id) {
      updateMainMutation.mutate({
        id: mainForm.id,
        body: { name_en: mainForm.name_en || undefined, name_ja: mainForm.name_ja || null },
      });
    } else {
      if (!mainForm.name_en.trim()) {
        setError(t('category.nameEn') + ' is required');
        return;
      }
      createMainMutation.mutate({ name_en: mainForm.name_en.trim(), name_ja: mainForm.name_ja || null });
    }
  }

  function handleSubmitSub(e: React.FormEvent) {
    e.preventDefault();
    if (!subForm) return;
    setError('');
    if (subForm.id) {
      updateSubMutation.mutate({
        id: subForm.id,
        body: { name_en: subForm.name_en || undefined, name_ja: subForm.name_ja || null },
      });
    } else {
      if (!subForm.name_en.trim() || !subForm.main_category_id) {
        setError(t('category.mainCategory') + ' and ' + t('category.nameEn') + ' are required');
        return;
      }
      createSubMutation.mutate({
        main_category_id: subForm.main_category_id,
        name_en: subForm.name_en.trim(),
        name_ja: subForm.name_ja || null,
      });
    }
  }

  const displayMainName = (m: MainCategory) => m.nameEn || m.nameJa || m.name;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">{t('nav.categories')}</h1>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-red-700 text-sm" role="alert">
          {error}
        </div>
      )}

      {/* Main categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">{t('category.mainCategory')}</h2>
          <button
            type="button"
            onClick={() => setMainForm({ name_en: '', name_ja: '' })}
            className="rounded bg-gray-900 text-white px-3 py-1.5 text-sm font-medium hover:bg-gray-800"
          >
            {t('category.newMain')}
          </button>
        </div>

        {mainForm && (
          <form onSubmit={handleSubmitMain} className="rounded-lg border border-gray-200 bg-white p-4 mb-4 space-y-3 max-w-md">
            <h3 className="text-sm font-medium text-gray-700">
              {mainForm.id ? t('category.editMain') : t('category.newMain')}
            </h3>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('category.nameEn')} *</label>
              <input
                type="text"
                value={mainForm.name_en}
                onChange={(e) => setMainForm((f) => f && { ...f, name_en: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('category.nameJa')}</label>
              <input
                type="text"
                value={mainForm.name_ja}
                onChange={(e) => setMainForm((f) => f && { ...f, name_ja: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMainMutation.isPending || updateMainMutation.isPending}
                className="rounded bg-gray-900 text-white px-3 py-1.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {t('common.save')}
              </button>
              <button
                type="button"
                onClick={() => setMainForm(null)}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        )}

        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('category.nameEn')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('category.nameJa')}</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('actions.edit')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mains.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900">{m.nameEn || m.name || '—'}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{m.nameJa || '—'}</td>
                  <td className="px-4 py-2 text-right text-sm">
                    {deleteMainId === m.id ? (
                      <span className="flex items-center justify-end gap-2">
                        <span className="text-gray-500">{t('form.confirmDelete')}</span>
                        <button
                          type="button"
                          onClick={() => deleteMainMutation.mutate(m.id)}
                          disabled={deleteMainMutation.isPending}
                          className="text-red-600 hover:underline"
                        >
                          {t('common.yes')}
                        </button>
                        <button type="button" onClick={() => setDeleteMainId(null)} className="text-gray-600 hover:underline">
                          {t('common.cancel')}
                        </button>
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setMainForm({ id: m.id, name_en: m.nameEn || m.name || '', name_ja: m.nameJa || '' })}
                          className="text-blue-600 hover:underline mr-3"
                        >
                          {t('actions.edit')}
                        </button>
                        <button type="button" onClick={() => setDeleteMainId(m.id)} className="text-red-600 hover:underline">
                          {t('actions.delete')}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {mains.length === 0 && !mainForm && (
            <p className="px-4 py-6 text-center text-gray-500 text-sm">{t('category.noMains')}</p>
          )}
        </div>
      </section>

      {/* Subcategories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">{t('category.subcategory')}</h2>
          <button
            type="button"
            onClick={() => setSubForm({ main_category_id: mains[0]?.id || '', name_en: '', name_ja: '' })}
            className="rounded bg-gray-900 text-white px-3 py-1.5 text-sm font-medium hover:bg-gray-800"
          >
            {t('category.newSub')}
          </button>
        </div>

        {subForm && (
          <form onSubmit={handleSubmitSub} className="rounded-lg border border-gray-200 bg-white p-4 mb-4 space-y-3 max-w-md">
            <h3 className="text-sm font-medium text-gray-700">
              {subForm.id ? t('category.editSub') : t('category.newSub')}
            </h3>
            {!subForm.id && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('category.mainCategory')} *</label>
                <select
                  value={subForm.main_category_id}
                  onChange={(e) => setSubForm((f) => f && { ...f, main_category_id: e.target.value })}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  required
                >
                  <option value="">—</option>
                  {mains.map((m) => (
                    <option key={m.id} value={m.id}>{displayMainName(m)}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('category.nameEn')} *</label>
              <input
                type="text"
                value={subForm.name_en}
                onChange={(e) => setSubForm((f) => f && { ...f, name_en: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('category.nameJa')}</label>
              <input
                type="text"
                value={subForm.name_ja}
                onChange={(e) => setSubForm((f) => f && { ...f, name_ja: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createSubMutation.isPending || updateSubMutation.isPending}
                className="rounded bg-gray-900 text-white px-3 py-1.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {t('common.save')}
              </button>
              <button
                type="button"
                onClick={() => setSubForm(null)}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        )}

        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('category.mainCategory')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('category.nameEn')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('category.nameJa')}</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('actions.edit')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subs.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {s.mainCategory ? displayMainName(s.mainCategory) : s.mainCategoryId}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{s.nameEn || s.name || '—'}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{s.nameJa || '—'}</td>
                  <td className="px-4 py-2 text-right text-sm">
                    {deleteSubId === s.id ? (
                      <span className="flex items-center justify-end gap-2">
                        <span className="text-gray-500">{t('form.confirmDelete')}</span>
                        <button
                          type="button"
                          onClick={() => deleteSubMutation.mutate(s.id)}
                          disabled={deleteSubMutation.isPending}
                          className="text-red-600 hover:underline"
                        >
                          {t('common.yes')}
                        </button>
                        <button type="button" onClick={() => setDeleteSubId(null)} className="text-gray-600 hover:underline">
                          {t('common.cancel')}
                        </button>
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setSubForm({
                              id: s.id,
                              main_category_id: s.mainCategoryId,
                              name_en: s.nameEn || s.name || '',
                              name_ja: s.nameJa || '',
                            })
                          }
                          className="text-blue-600 hover:underline mr-3"
                        >
                          {t('actions.edit')}
                        </button>
                        <button type="button" onClick={() => setDeleteSubId(s.id)} className="text-red-600 hover:underline">
                          {t('actions.delete')}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {subs.length === 0 && !subForm && (
            <p className="px-4 py-6 text-center text-gray-500 text-sm">{t('category.noSubs')}</p>
          )}
        </div>
      </section>
    </div>
  );
}

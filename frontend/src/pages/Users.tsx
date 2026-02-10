import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type CreateUserBody, type UpdateUserBody, type AdminUser } from '../api/client';

export default function Users() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateUserBody & { id?: string }>({ email: '', password: '', role: 'STAFF' });
  const [error, setError] = useState('');

  const { data: users, isLoading, error: loadError } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.getMany(),
  });

  const createMutation = useMutation({
    mutationFn: (body: CreateUserBody) => api.users.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setAdding(false);
      setForm({ email: '', password: '', role: 'STAFF' });
    },
    onError: (e) => setError((e as Error).message),
  });
  const updateMutation = useMutation({
    mutationFn: (body: UpdateUserBody) => api.users.update(editing!.id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditing(null);
      setForm({ email: '', password: '', role: 'STAFF' });
    },
    onError: (e) => setError((e as Error).message),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.users.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteId(null);
    },
  });

  function handleSubmitUser(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (editing) {
      const body: UpdateUserBody = {};
      if (form.role) body.role = form.role;
      if (form.password?.trim()) body.password = form.password.trim();
      updateMutation.mutate(body);
    } else {
      if (!form.email || !form.password) {
        setError(t('auth.email') + ' and ' + t('auth.password') + ' required');
        return;
      }
      createMutation.mutate({ email: form.email, password: form.password, role: form.role });
    }
  }

  if (isLoading) return <p className="text-gray-500">{t('dashboard.loading')}</p>;
  if (loadError) return <div className="text-red-600">{(loadError as Error).message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{t('nav.users')}</h1>
        <button
          type="button"
          onClick={() => { setAdding(true); setEditing(null); setForm({ email: '', password: '', role: 'STAFF' }); setError(''); }}
          className="rounded bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800"
        >
          {t('form.newUser')}
        </button>
      </div>

      {(adding || editing) && (
        <form onSubmit={handleSubmitUser} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-4 max-w-xl">
          <h2 className="font-medium text-gray-900">{editing ? t('form.editUser') : t('form.newUser')}</h2>
          {error && <div className="rounded bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')} *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              required={!editing}
              disabled={!!editing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')} {editing && '(leave blank to keep)'}</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              required={!editing}
              minLength={editing ? undefined : 6}
              placeholder={editing ? '••••••••' : ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.role')}</label>
            <select
              value={form.role ?? 'STAFF'}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="OWNER">{t('role.owner')}</option>
              <option value="STAFF">{t('role.staff')}</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {t('common.save')}
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setEditing(null); setError(''); }}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('table.email')}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('form.role')}</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('actions.edit')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(users ?? []).map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{u.email}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{u.role === 'OWNER' ? t('role.owner') : t('role.staff')}</td>
                <td className="px-4 py-2 text-right text-sm">
                  {deleteId === u.id ? (
                    <span className="flex items-center justify-end gap-2">
                      <span className="text-gray-500">{t('form.confirmDelete')}</span>
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(u.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:underline"
                      >
                        {t('common.yes')}
                      </button>
                      <button type="button" onClick={() => setDeleteId(null)} className="text-gray-600 hover:underline">
                        {t('common.cancel')}
                      </button>
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => { setEditing(u); setAdding(false); setForm({ email: u.email, password: '', role: u.role }); setError(''); }}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        {t('actions.edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(u.id)}
                        className="text-red-600 hover:underline"
                      >
                        {t('actions.delete')}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(users?.length ?? 0) === 0 && !adding && (
          <p className="px-4 py-8 text-center text-gray-500">{t('empty.noUsers')}</p>
        )}
      </div>
    </div>
  );
}

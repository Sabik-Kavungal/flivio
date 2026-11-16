import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Upload, ArrowUp, ArrowDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { categoryService } from '../../services/categoryService';
import { saveImageToDb } from '../../db/imageDb';
import { Category } from '../../types';
import { ResolvedImage } from '../../components/common/ResolvedImage';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { slugify } from '../../utils/format';

export const AdminCategoriesPage: React.FC = () => {
  const { categories, products, refreshAll, pushToast } = useStore();
  const [editing, setEditing] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [audience, setAudience] = useState<'women' | 'men' | 'all'>('women');
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const openNew = () => {
    setEditing(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('');
    setAudience('women');
    setOrder(categories.length + 1);
    setIsActive(true);
    setFormOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setImage(cat.image);
    setAudience(cat.audience || 'all');
    setOrder(cat.order);
    setIsActive(cat.isActive);
    setFormOpen(true);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    try {
      const key = await saveImageToDb(files[0]);
      setImage(key);
      pushToast({ title: 'Category image uploaded', type: 'success' });
    } catch (err) {
      pushToast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Invalid file',
        type: 'error',
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      description: description.trim(),
      image,
      audience,
      order: Number(order),
      isActive,
    };
    if (editing) {
      categoryService.update(editing.id, payload);
      pushToast({ title: 'Category updated', type: 'success' });
    } else {
      categoryService.create(payload);
      pushToast({ title: 'Category created', type: 'success' });
    }
    refreshAll();
    setFormOpen(false);
  };

  const moveOrder = (cat: Category, delta: -1 | 1) => {
    categoryService.update(cat.id, { order: Math.max(1, cat.order + delta) });
    refreshAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#1E2022]">Categories</h1>
          <p className="text-xs text-[#5C5E64]">
            Create, edit, reorder, and upload photography for storefront departments.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSave} className="bg-white border border-[#E5E1D8] p-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
            {editing ? `Edit Category: ${editing.name}` : 'New Category'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Category Name *</label>
              <input
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editing) setSlug(slugify(e.target.value));
                }}
                className="w-full px-3 py-2 text-sm border border-[#E5E1D8]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono border border-[#E5E1D8]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#E5E1D8]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Display Order</label>
              <input
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-[#E5E1D8] tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Department Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as 'women' | 'men' | 'all')}
                className="w-full px-3 py-2 text-sm border border-[#E5E1D8] bg-white"
              >
                <option value="women">Women&apos;s Fashion</option>
                <option value="men">Men&apos;s Fashion</option>
                <option value="all">All / Shared</option>
              </select>
            </div>
            <div className="flex items-end gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 border border-[#E5E1D8] bg-[#F7F6F2] text-xs font-medium cursor-pointer hover:border-[#1B2A4A]">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Category Image</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(e) => handleUpload(e.target.files)}
                  className="hidden"
                />
              </label>
              {image && (
                <div className="w-10 h-12 border border-[#E5E1D8] overflow-hidden">
                  <ResolvedImage src={image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="accent-[#1B2A4A]"
              />
              <span>Active on Storefront</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#1E2022] text-white text-xs font-semibold uppercase tracking-wider"
            >
              Save Category
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-5 py-2.5 border border-[#E5E1D8] text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-[#E5E1D8] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F6F2] border-b border-[#E5E1D8] text-[#5C5E64] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 font-semibold">Order</th>
              <th className="py-3 px-4 font-semibold">Category</th>
              <th className="py-3 px-4 font-semibold">Products</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECE9E2]">
            {categories.map((cat) => {
              const prodCount = products.filter((p) => p.categoryId === cat.id).length;
              return (
                <tr key={cat.id} className="hover:bg-[#F7F6F2]">
                  <td className="py-3 px-4 tabular-nums">
                    <div className="flex items-center gap-1">
                      <span className="w-5 font-mono">{cat.order}</span>
                      <button
                        type="button"
                        onClick={() => moveOrder(cat, -1)}
                        className="p-1 border border-[#E5E1D8] bg-white"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveOrder(cat, 1)}
                        className="p-1 border border-[#E5E1D8] bg-white"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-[#F7F6F2] border border-[#E5E1D8] overflow-hidden shrink-0">
                        <ResolvedImage src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1E2022]">
                          {cat.name}{' '}
                          <span className="ml-1.5 text-[10px] uppercase tracking-wider text-[#1B2A4A]">
                            ({cat.audience || 'all'})
                          </span>
                        </p>
                        <p className="font-mono text-[11px] text-[#86888E]">/{cat.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 tabular-nums text-[#5C5E64]">{prodCount}</td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => {
                        categoryService.update(cat.id, { isActive: !cat.isActive });
                        refreshAll();
                      }}
                      className={`font-semibold ${
                        cat.isActive ? 'text-emerald-700' : 'text-[#86888E]'
                      }`}
                    >
                      {cat.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(cat)}
                        className="p-1.5 border border-[#E5E1D8] text-[#1E2022]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(cat)}
                        className="p-1.5 border border-[#E5E1D8] text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Category?"
        description={`Remove "${deleteTarget?.name}" from storefront departments?`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleteTarget) {
            categoryService.remove(deleteTarget.id);
            refreshAll();
            pushToast({ title: 'Category deleted', type: 'info' });
          }
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Eye,
  Upload,
  ArrowLeft,
  ArrowRight,
  Star,
  X,
  Check,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { productService } from '../../services/productService';
import { saveImageToDb } from '../../db/imageDb';
import { Product, ProductImage, ProductVariant } from '../../types';
import { ResolvedImage } from '../../components/common/ResolvedImage';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { calculateDiscountPercentage, formatINR, slugify } from '../../utils/format';

export const AdminProductsPage: React.FC = () => {
  const { products, categories, refreshAll, pushToast } = useStore();
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  // Editor form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [audience, setAudience] = useState<'women' | 'men' | 'unisex'>('women');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [fit, setFit] = useState('');
  const [skuPrefix, setSkuPrefix] = useState('');
  const [sellingPrice, setSellingPrice] = useState(599);
  const [originalPrice, setOriginalPrice] = useState(899);
  const [keywordsText, setKeywordsText] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isTrending, setIsTrending] = useState(false);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const openCreateForm = () => {
    const defaultCat = categories[0];
    setEditingProduct(null);
    setIsCreating(true);
    setName('');
    setSlug('');
    setCategoryId(defaultCat?.id || '');
    setAudience(defaultCat?.audience === 'men' ? 'men' : 'women');
    setDescription('');
    setMaterial('100% Pure Breathable Cotton');
    setCareInstructions('Cold gentle machine wash. Dry in shade.');
    setFit('Regular Comfort Fit');
    setSkuPrefix(`FLV-${Date.now().toString().slice(-4)}`);
    setSellingPrice(599);
    setOriginalPrice(899);
    setKeywordsText('');
    setIsActive(true);
    setIsFeatured(false);
    setIsBestSeller(false);
    setIsNewArrival(true);
    setIsTrending(false);
    setImages([]);
    setVariants([
      {
        id: `var_${Date.now()}_1`,
        productId: '',
        variantName: 'Indigo / M',
        size: 'M',
        colour: 'Indigo',
        colourHex: '#2B4268',
        sku: `FLV-${Date.now().toString().slice(-4)}-IND-M`,
        sellingPrice: 599,
        originalPrice: 899,
        stock: 15,
        images: [],
        isActive: true,
      },
    ]);
  };

  const openEditForm = (p: Product) => {
    setIsCreating(false);
    setEditingProduct(p);
    setName(p.name);
    setSlug(p.slug);
    setCategoryId(p.categoryId);
    setAudience(p.audience || 'women');
    setDescription(p.description);
    setMaterial(p.material);
    setCareInstructions(p.careInstructions);
    setFit(p.fit);
    setSkuPrefix(p.skuPrefix);
    setSellingPrice(p.sellingPrice);
    setOriginalPrice(p.originalPrice);
    setKeywordsText(p.keywords.join(', '));
    setIsActive(p.isActive);
    setIsFeatured(p.isFeatured);
    setIsBestSeller(p.isBestSeller);
    setIsNewArrival(p.isNewArrival);
    setIsTrending(Boolean(p.isTrending));
    setImages([...p.images].sort((a, b) => a.order - b.order));
    setVariants(p.variants.map((v) => ({ ...v })));
  };

  const closeEditor = () => {
    setIsCreating(false);
    setEditingProduct(null);
  };

  const handleProductImagesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    try {
      const uploaded: ProductImage[] = [];
      for (let i = 0; i < files.length; i++) {
        const key = await saveImageToDb(files[i]);
        uploaded.push({
          id: `img_${Date.now()}_${i}`,
          url: key,
          alt: name || files[i].name,
          isMain: images.length === 0 && i === 0,
          order: images.length + i,
        });
      }
      setImages((prev) => [...prev, ...uploaded]);
      pushToast({ title: `${uploaded.length} image(s) uploaded`, type: 'success' });
    } catch (err) {
      pushToast({
        title: 'Image upload failed',
        description: err instanceof Error ? err.message : 'Unsupported image',
        type: 'error',
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleVariantImageUpload = async (variantId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const keys: string[] = [];
      for (let i = 0; i < files.length; i++) {
        keys.push(await saveImageToDb(files[i]));
      }
      setVariants((prev) =>
        prev.map((v) =>
          v.id === variantId ? { ...v, images: [...v.images, ...keys] } : v
        )
      );
      pushToast({ title: 'Variant image added', type: 'success' });
    } catch (err) {
      pushToast({
        title: 'Upload error',
        description: err instanceof Error ? err.message : 'Invalid file',
        type: 'error',
      });
    }
  };

  const setMainImage = (imgId: string) => {
    setImages((prev) =>
      prev.map((img) => ({ ...img, isMain: img.id === imgId }))
    );
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const copy = [...images];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setImages(copy.map((img, i) => ({ ...img, order: i })));
  };

  const removeImage = (imgId: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== imgId);
      if (filtered.length > 0 && !filtered.some((i) => i.isMain)) {
        filtered[0] = { ...filtered[0], isMain: true };
      }
      return filtered.map((img, i) => ({ ...img, order: i }));
    });
  };

  const addEmptyVariant = () => {
    const idx = variants.length + 1;
    const newVariant: ProductVariant = {
      id: `var_${Date.now()}_${idx}`,
      productId: editingProduct?.id || '',
      variantName: 'Black / L',
      size: 'L',
      colour: 'Black',
      colourHex: '#181818',
      sku: `${skuPrefix || 'FLV'}-${idx}`,
      sellingPrice: sellingPrice || 999,
      originalPrice: originalPrice || 1299,
      stock: 10,
      images: [],
      isActive: true,
    };
    setVariants((prev) => [...prev, newVariant]);
  };

  const updateVariantField = <K extends keyof ProductVariant>(
    id: string,
    key: K,
    value: ProductVariant[K]
  ) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const updated = { ...v, [key]: value };
        if (key === 'colour' || key === 'size') {
          updated.variantName = `${updated.colour} / ${updated.size}`;
        }
        return updated;
      })
    );
  };

  const removeVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const buildPayload = () => {
    const cat = categories.find((c) => c.id === categoryId);
    const normalizedImages =
      images.length > 0
        ? images.map((img, i) => ({
            ...img,
            order: i,
            isMain: i === 0 ? images.every((x) => !x.isMain) || img.isMain : img.isMain,
          }))
        : [];

    return {
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      categoryId,
      categoryName: cat?.name || 'Apparel',
      audience,
      description: description.trim(),
      material: material.trim(),
      careInstructions: careInstructions.trim(),
      fit: fit.trim(),
      skuPrefix: skuPrefix.trim(),
      sellingPrice: Number(sellingPrice),
      originalPrice: Number(originalPrice),
      images: normalizedImages,
      variants,
      keywords: keywordsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      isActive,
      isFeatured,
      isBestSeller,
      isNewArrival,
      isTrending,
    };
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      pushToast({ title: 'Product name is required', type: 'error' });
      return;
    }
    if (variants.length === 0) {
      pushToast({ title: 'Add at least one child variant', type: 'error' });
      return;
    }

    const payload = buildPayload();
    if (editingProduct) {
      productService.update(editingProduct.id, payload);
      pushToast({ title: 'Product updated', type: 'success' });
    } else {
      productService.create(payload);
      pushToast({ title: 'Product published to catalog', type: 'success' });
    }
    refreshAll();
    closeEditor();
  };

  const handlePreviewCurrent = () => {
    const payload = buildPayload();
    setPreviewProduct({
      ...payload,
      id: editingProduct?.id || 'preview',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const filteredProducts = products.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q) ||
      p.skuPrefix.toLowerCase().includes(q)
    );
  });

  // Editor Screen
  if (isCreating || editingProduct) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeEditor}
              className="p-2 border border-[#E5E1D8] bg-white hover:border-[#1E2022]"
              aria-label="Back to products"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-display text-2xl font-semibold text-[#1E2022]">
                {editingProduct ? `Edit: ${editingProduct.name}` : 'Create New Product'}
              </h1>
              <p className="text-xs text-[#5C5E64]">
                Manage parent details, multi-photo IndexedDB gallery, and child variants.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePreviewCurrent}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#1E2022] bg-white hover:bg-[#F7F6F2] text-xs font-semibold uppercase tracking-wider"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Storefront Card &amp; PDP</span>
          </button>
        </div>

        <form onSubmit={handleSaveProduct} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Main Details */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white border border-[#E5E1D8] p-6 space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
                  Parent Product Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#1E2022] mb-1">
                      Product Name *
                    </label>
                    <input
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (!editingProduct) setSlug(slugify(e.target.value));
                      }}
                      placeholder="e.g. Classic Heavyweight Crew Tee"
                      className="w-full px-3.5 py-2 text-sm border border-[#E5E1D8] focus:border-[#1B2A4A] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1E2022] mb-1">
                      URL Slug
                    </label>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                      className="w-full px-3.5 py-2 text-xs font-mono border border-[#E5E1D8] focus:border-[#1B2A4A] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1E2022] mb-1">
                      SKU Prefix
                    </label>
                    <input
                      value={skuPrefix}
                      onChange={(e) => setSkuPrefix(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs font-mono border border-[#E5E1D8] focus:border-[#1B2A4A] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1E2022] mb-1">
                      Category *
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-[#E5E1D8] bg-white focus:border-[#1B2A4A] outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1E2022] mb-1">
                      Collection Audience
                    </label>
                    <select
                      value={audience}
                      onChange={(e) =>
                        setAudience(e.target.value as 'women' | 'men' | 'unisex')
                      }
                      className="w-full px-3.5 py-2 text-sm border border-[#E5E1D8] bg-white focus:border-[#1B2A4A] outline-none"
                    >
                      <option value="women">Women&apos;s Fashion</option>
                      <option value="men">Men&apos;s Fashion</option>
                      <option value="unisex">Unisex / Essentials</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#1E2022] mb-1">
                      Fit Profile
                    </label>
                    <input
                      value={fit}
                      onChange={(e) => setFit(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-[#E5E1D8] focus:border-[#1B2A4A] outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#1E2022] mb-1">
                      Product Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-[#E5E1D8] focus:border-[#1B2A4A] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1E2022] mb-1">
                      Material Composition
                    </label>
                    <input
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-[#E5E1D8] focus:border-[#1B2A4A] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1E2022] mb-1">
                      Care Instructions
                    </label>
                    <input
                      value={careInstructions}
                      onChange={(e) => setCareInstructions(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-[#E5E1D8] focus:border-[#1B2A4A] outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#1E2022] mb-1">
                      Search Keywords (comma separated)
                    </label>
                    <input
                      value={keywordsText}
                      onChange={(e) => setKeywordsText(e.target.value)}
                      placeholder="oversized, cotton, black tee"
                      className="w-full px-3.5 py-2 text-sm border border-[#E5E1D8] focus:border-[#1B2A4A] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Multi-Image IndexedDB Gallery */}
              <div className="bg-white border border-[#E5E1D8] p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
                      Product Images (Stored in IndexedDB)
                    </h2>
                    <p className="text-[11px] text-[#5C5E64] mt-0.5">
                      Upload unlimited JPG, PNG, WebP or AVIF photos. Large files are automatically compressed.
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImages ? 'Uploading...' : 'Upload Images'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={(e) => handleProductImagesUpload(e.target.files)}
                      className="hidden"
                    />
                  </label>
                </div>

                {images.length === 0 ? (
                  <div className="p-8 border border-dashed border-[#D3CFC7] bg-[#F7F6F2] text-center text-xs text-[#5C5E64]">
                    No images uploaded yet. Click "Upload Images" to select photos from your device.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={img.id}
                        className={`border p-2 bg-[#F7F6F2] space-y-2 ${
                          img.isMain ? 'border-[#1B2A4A]' : 'border-[#E5E1D8]'
                        }`}
                      >
                        <div className="aspect-[3/4] bg-white overflow-hidden relative">
                          <ResolvedImage
                            src={img.url}
                            alt={img.alt || 'Product image'}
                            className="w-full h-full object-cover"
                          />
                          {img.isMain && (
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-[#1B2A4A] text-white text-[9px] font-semibold uppercase">
                              Main
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveImage(idx, -1)}
                              aria-label="Move image left"
                              className="p-1 border border-[#E5E1D8] bg-white disabled:opacity-30"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === images.length - 1}
                              onClick={() => moveImage(idx, 1)}
                              aria-label="Move image right"
                              className="p-1 border border-[#E5E1D8] bg-white disabled:opacity-30"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setMainImage(img.id)}
                            title="Set as main image"
                            className={`p-1 border bg-white ${
                              img.isMain ? 'border-[#1B2A4A] text-[#1B2A4A]' : 'border-[#E5E1D8] text-[#5C5E64]'
                            }`}
                          >
                            <Star className={`w-3 h-3 ${img.isMain ? 'fill-[#1B2A4A]' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            aria-label="Delete image"
                            className="p-1 border border-[#E5E1D8] bg-white text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Child Variants Builder */}
              <div className="bg-white border border-[#E5E1D8] p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
                      Child Variants ({variants.length})
                    </h2>
                    <p className="text-[11px] text-[#5C5E64] mt-0.5">
                      Each size &amp; colour combination has its own SKU, price, stock, and optional image.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addEmptyVariant}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Variant</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {variants.map((v) => (
                    <div
                      key={v.id}
                      className="border border-[#E5E1D8] bg-[#F7F6F2] p-4 space-y-3"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 items-end">
                        <div>
                          <label className="block text-[10px] uppercase text-[#5C5E64] mb-1">
                            Size
                          </label>
                          <input
                            value={v.size}
                            onChange={(e) => updateVariantField(v.id, 'size', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-[#E5E1D8] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-[#5C5E64] mb-1">
                            Colour
                          </label>
                          <input
                            value={v.colour}
                            onChange={(e) => updateVariantField(v.id, 'colour', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-[#E5E1D8] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-[#5C5E64] mb-1">
                            Hex
                          </label>
                          <input
                            type="color"
                            value={v.colourHex || '#181818'}
                            onChange={(e) => updateVariantField(v.id, 'colourHex', e.target.value)}
                            className="w-full h-8 p-0.5 border border-[#E5E1D8] bg-white cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-[#5C5E64] mb-1">
                            SKU
                          </label>
                          <input
                            value={v.sku}
                            onChange={(e) => updateVariantField(v.id, 'sku', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-mono border border-[#E5E1D8] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-[#5C5E64] mb-1">
                            Price (₹)
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={v.sellingPrice}
                            onChange={(e) =>
                              updateVariantField(v.id, 'sellingPrice', Number(e.target.value))
                            }
                            className="w-full px-2.5 py-1.5 text-xs tabular-nums border border-[#E5E1D8] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-[#5C5E64] mb-1">
                            MRP (₹)
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={v.originalPrice}
                            onChange={(e) =>
                              updateVariantField(v.id, 'originalPrice', Number(e.target.value))
                            }
                            className="w-full px-2.5 py-1.5 text-xs tabular-nums border border-[#E5E1D8] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-[#5C5E64] mb-1">
                            Stock
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={v.stock}
                            onChange={(e) =>
                              updateVariantField(v.id, 'stock', Number(e.target.value))
                            }
                            className="w-full px-2.5 py-1.5 text-xs tabular-nums border border-[#E5E1D8] bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E5E1D8]">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs text-[#1E2022] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={v.isActive}
                              onChange={(e) =>
                                updateVariantField(v.id, 'isActive', e.target.checked)
                              }
                              className="accent-[#1B2A4A]"
                            />
                            <span>Active</span>
                          </label>

                          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#E5E1D8] bg-white text-[11px] font-medium cursor-pointer hover:border-[#1B2A4A]">
                            <Upload className="w-3 h-3" />
                            <span>Variant Photo ({v.images.length})</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/avif"
                              onChange={(e) => handleVariantImageUpload(v.id, e.target.files)}
                              className="hidden"
                            />
                          </label>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeVariant(v.id)}
                          className="text-xs text-red-600 hover:underline inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove Variant</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar Pricing & Status */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-[#E5E1D8] p-6 space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
                  Base Pricing (INR)
                </h2>
                <div>
                  <label className="block text-xs font-medium text-[#1E2022] mb-1">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm tabular-nums border border-[#E5E1D8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1E2022] mb-1">
                    Original / MRP Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm tabular-nums border border-[#E5E1D8]"
                  />
                </div>
                <p className="text-xs text-[#1B2A4A] font-semibold">
                  Discount: {calculateDiscountPercentage(originalPrice, sellingPrice)}%
                </p>
              </div>

              <div className="bg-white border border-[#E5E1D8] p-6 space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
                  Visibility &amp; Merchandising
                </h2>
                <label className="flex items-center gap-2 text-xs text-[#1E2022] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="accent-[#1B2A4A]"
                  />
                  <span>Published (Visible on Storefront)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#1E2022] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="accent-[#1B2A4A]"
                  />
                  <span>Mark as New Arrival</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#1E2022] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="accent-[#1B2A4A]"
                  />
                  <span>Mark as Best Seller</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#1E2022] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="accent-[#1B2A4A]"
                  />
                  <span>Mark as Featured Collection</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#1E2022] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="accent-[#1B2A4A]"
                  />
                  <span>Mark as Trending This Week</span>
                </label>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProduct ? 'Save Product Changes' : 'Publish Product'}</span>
                </button>
                <button
                  type="button"
                  onClick={closeEditor}
                  className="w-full py-3 border border-[#E5E1D8] bg-white text-xs font-medium text-[#5C5E64] hover:text-[#1E2022]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Live Customer Preview Modal */}
        {previewProduct && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white border border-[#E5E1D8] max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1B2A4A]">
                  Customer Storefront Preview
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewProduct(null)}
                  className="p-1 text-[#5C5E64]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="aspect-[3/4] bg-[#F7F6F2] border border-[#E5E1D8] overflow-hidden">
                  <ResolvedImage
                    src={
                      previewProduct.images.find((i) => i.isMain)?.url ||
                      previewProduct.images[0]?.url
                    }
                    alt={previewProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <span className="text-[11px] uppercase tracking-wider text-[#5C5E64]">
                    {previewProduct.categoryName}
                  </span>
                  <h3 className="font-display text-2xl font-semibold text-[#1E2022]">
                    {previewProduct.name || 'Untitled Product'}
                  </h3>
                  <div className="flex items-baseline gap-2 tabular-nums">
                    <span className="text-lg font-semibold text-[#1E2022]">
                      {formatINR(previewProduct.sellingPrice)}
                    </span>
                    {previewProduct.originalPrice > previewProduct.sellingPrice && (
                      <span className="text-sm text-[#86888E] line-through">
                        {formatINR(previewProduct.originalPrice)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5C5E64] leading-relaxed">
                    {previewProduct.description}
                  </p>
                  <div className="pt-2">
                    <p className="text-[11px] font-semibold uppercase text-[#1E2022] mb-1.5">
                      Configured Variants ({previewProduct.variants.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {previewProduct.variants.map((v) => (
                        <span
                          key={v.id}
                          className="px-2 py-1 text-[11px] border border-[#E5E1D8] bg-[#F7F6F2]"
                        >
                          {v.variantName} ({v.stock})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Product Table Screen
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#1E2022]">Products</h1>
          <p className="text-xs text-[#5C5E64]">
            Manage parent products, multi-image galleries, and child variants.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-white border border-[#E5E1D8] p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-[#86888E]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name, category, or SKU prefix..."
          className="flex-1 text-sm outline-none bg-transparent"
        />
      </div>

      <div className="bg-white border border-[#E5E1D8] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F6F2] border-b border-[#E5E1D8] text-[#5C5E64] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 font-semibold">Product</th>
              <th className="py-3 px-4 font-semibold">Category</th>
              <th className="py-3 px-4 font-semibold">Price</th>
              <th className="py-3 px-4 font-semibold">Variants / Stock</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECE9E2]">
            {filteredProducts.map((p) => {
              const img = p.images.find((i) => i.isMain)?.url || p.images[0]?.url;
              const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
              return (
                <tr key={p.id} className="hover:bg-[#F7F6F2]">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-13 bg-[#F7F6F2] border border-[#E5E1D8] shrink-0 overflow-hidden">
                        <ResolvedImage src={img} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[#1E2022] truncate max-w-[220px]">{p.name}</p>
                        <p className="font-mono text-[11px] text-[#86888E]">{p.skuPrefix}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#5C5E64]">{p.categoryName}</td>
                  <td className="py-3 px-4 font-semibold tabular-nums text-[#1E2022]">
                    {formatINR(p.sellingPrice)}
                  </td>
                  <td className="py-3 px-4 tabular-nums text-[#5C5E64]">
                    {p.variants.length} variants · {totalStock} units
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => {
                        productService.update(p.id, { isActive: !p.isActive });
                        refreshAll();
                        pushToast({
                          title: p.isActive ? 'Product unpublished' : 'Product published',
                          type: 'info',
                        });
                      }}
                      className={`text-xs font-semibold ${
                        p.isActive ? 'text-emerald-700' : 'text-[#86888E]'
                      }`}
                    >
                      {p.isActive ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditForm(p)}
                        title="Edit product"
                        className="p-1.5 border border-[#E5E1D8] hover:border-[#1E2022] text-[#1E2022]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          productService.duplicate(p.id);
                          refreshAll();
                          pushToast({ title: 'Product duplicated as draft', type: 'success' });
                        }}
                        title="Duplicate product"
                        className="p-1.5 border border-[#E5E1D8] hover:border-[#1E2022] text-[#5C5E64]"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(p)}
                        title="Delete product"
                        className="p-1.5 border border-[#E5E1D8] hover:border-red-300 text-red-600"
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
        title="Delete Product?"
        description={`Are you sure you want to permanently remove "${deleteTarget?.name}" and all of its child variants?`}
        confirmLabel="Delete Product"
        destructive
        onConfirm={() => {
          if (deleteTarget) {
            productService.remove(deleteTarget.id);
            refreshAll();
            pushToast({ title: 'Product deleted', type: 'info' });
          }
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

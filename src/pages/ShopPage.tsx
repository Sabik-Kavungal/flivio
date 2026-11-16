import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { ProductCard } from '../components/product/ProductCard';
import { calculateDiscountPercentage, formatINR } from '../utils/format';

interface ShopPageProps {
  mode?:
    | 'all'
    | 'women'
    | 'men'
    | 'category'
    | 'new-arrivals'
    | 'collections'
    | 'best-sellers'
    | 'offers'
    | 'search';
}

const PAGE_SIZE = 12;

export const ShopPage: React.FC<ShopPageProps> = ({ mode = 'all' }) => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);

  const normalizedSlug = slug;

  const initialQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'women' | 'men'>(
    mode === 'women' ? 'women' : mode === 'men' ? 'men' : 'all'
  );
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(
    normalizedSlug || 'all'
  );
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedColour, setSelectedColour] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [onlyDiscounted, setOnlyDiscounted] = useState<boolean>(mode === 'offers');
  const [onlyBestSellers, setOnlyBestSellers] = useState<boolean>(mode === 'best-sellers');
  const [sortBy, setSortBy] = useState<
    'newest' | 'price-asc' | 'price-desc' | 'best-sellers'
  >(mode === 'best-sellers' ? 'best-sellers' : 'newest');
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setSelectedCategorySlug(mode === 'category' && normalizedSlug ? normalizedSlug : 'all');
    setSelectedAudience(
      mode === 'women' ? 'women' : mode === 'men' ? 'men' : 'all'
    );
    setOnlyDiscounted(mode === 'offers');
    setOnlyBestSellers(mode === 'best-sellers');
    setSortBy(mode === 'best-sellers' ? 'best-sellers' : 'newest');
    setVisibleCount(PAGE_SIZE);
  }, [mode, normalizedSlug]);

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileFiltersOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileFiltersOpen]);

  const activeProducts = useMemo(() => products.filter((p) => p.isActive), [products]);
  const activeCategories = useMemo(() => categories.filter((c) => c.isActive), [categories]);

  const sliderMaxPrice = useMemo(() => {
    const highest = activeProducts.reduce((acc, p) => Math.max(acc, p.sellingPrice), 0);
    return Math.max(800, Math.ceil(highest / 100) * 100);
  }, [activeProducts]);
  const effectiveMaxPrice = maxPrice ?? sliderMaxPrice;

  const currentCategory = activeCategories.find((c) => c.slug === selectedCategorySlug);

  const sidebarCategories = useMemo(() => {
    if (selectedAudience === 'women') {
      return activeCategories.filter((c) => c.audience === 'women');
    }
    if (selectedAudience === 'men') {
      return activeCategories.filter((c) => c.audience !== 'women');
    }
    return activeCategories;
  }, [activeCategories, selectedAudience]);

  const { allSizes, allColours } = useMemo(() => {
    const sizeSet = new Set<string>();
    const colourMap = new Map<string, string>();
    activeProducts.forEach((p) => {
      p.variants
        .filter((v) => v.isActive)
        .forEach((v) => {
          sizeSet.add(v.size);
          colourMap.set(v.colour, v.colourHex);
        });
    });
    return {
      allSizes: Array.from(sizeSet),
      allColours: Array.from(colourMap.entries()).map(([name, hex]) => ({ name, hex })),
    };
  }, [activeProducts]);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const list = activeProducts.filter((p) => {
      if (mode === 'new-arrivals' && !p.isNewArrival) return false;
      if (mode === 'collections' && !p.isFeatured) return false;

      if (selectedAudience === 'women') {
        const cat = activeCategories.find((c) => c.id === p.categoryId);
        if (p.audience !== 'women' && cat?.audience !== 'women') return false;
      } else if (selectedAudience === 'men') {
        const cat = activeCategories.find((c) => c.id === p.categoryId);
        if (p.audience === 'women' || cat?.audience === 'women') return false;
      }

      if (selectedCategorySlug !== 'all') {
        const cat = activeCategories.find((c) => c.slug === selectedCategorySlug);
        if (cat && p.categoryId !== cat.id) return false;
      }

      if (onlyBestSellers && !p.isBestSeller) return false;

      if (onlyDiscounted) {
        const hasDiscount =
          calculateDiscountPercentage(p.originalPrice, p.sellingPrice) > 0 ||
          p.variants.some(
            (v) =>
              v.isActive &&
              calculateDiscountPercentage(v.originalPrice, v.sellingPrice) > 0
          );
        if (!hasDiscount) return false;
      }

      if (maxPrice !== null && p.sellingPrice > effectiveMaxPrice) return false;

      if (selectedSize !== 'all') {
        if (!p.variants.some((v) => v.isActive && v.size === selectedSize && v.stock > 0)) {
          return false;
        }
      }

      if (selectedColour !== 'all') {
        if (!p.variants.some((v) => v.isActive && v.colour === selectedColour)) {
          return false;
        }
      }

      if (q) {
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.skuPrefix.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.keywords.some((k) => k.toLowerCase().includes(q)) ||
          p.variants.some((v) => v.sku.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.sellingPrice - b.sellingPrice;
      if (sortBy === 'price-desc') return b.sellingPrice - a.sellingPrice;
      if (sortBy === 'best-sellers') {
        return Number(b.isBestSeller) - Number(a.isBestSeller);
      }
      const aW = a.audience === 'women' ? 0 : 1;
      const bW = b.audience === 'women' ? 0 : 1;
      if (selectedAudience === 'all' && aW !== bW) return aW - bW;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    activeProducts,
    activeCategories,
    mode,
    selectedAudience,
    selectedCategorySlug,
    onlyBestSellers,
    onlyDiscounted,
    maxPrice,
    effectiveMaxPrice,
    selectedSize,
    selectedColour,
    searchTerm,
    sortBy,
  ]);

  const pageTitle =
    mode === 'category' && currentCategory
      ? currentCategory.name
      : mode === 'women'
      ? "Women's Collection"
      : mode === 'men'
      ? "Men's Essentials"
      : mode === 'new-arrivals'
      ? 'New Arrivals'
      : mode === 'collections'
      ? 'Curated Collections'
      : mode === 'best-sellers'
      ? 'Best Sellers'
      : mode === 'offers'
      ? 'Seasonal Offers'
      : mode === 'search' && searchTerm
      ? `Search: "${searchTerm}"`
      : 'All Collections';

  const pageSubtitle =
    mode === 'category' && currentCategory
      ? currentCategory.description
      : mode === 'women'
      ? 'Eyelet embroidered layered tops, pastel Korean puff tops, floral blouses & breathable cotton short kurtis.'
      : 'Pastel tones, breathable cottons, and effortless everyday dressing.';

  const resetFilters = () => {
    setSearchTerm('');
    if (mode !== 'category') setSelectedCategorySlug('all');
    if (mode !== 'women' && mode !== 'men') setSelectedAudience('all');
    setSelectedSize('all');
    setSelectedColour('all');
    setMaxPrice(null);
    setOnlyDiscounted(mode === 'offers');
    setOnlyBestSellers(mode === 'best-sellers');
    setSearchParams({});
  };

  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string; onClear: () => void }[] = [];
    if (searchTerm.trim()) {
      chips.push({
        key: 'search',
        label: `Search: "${searchTerm.trim()}"`,
        onClear: () => {
          setSearchTerm('');
          if (searchParams.has('q')) {
            const next = new URLSearchParams(searchParams);
            next.delete('q');
            setSearchParams(next);
          }
        },
      });
    }
    if (mode !== 'women' && mode !== 'men' && selectedAudience !== 'all') {
      chips.push({
        key: 'audience',
        label: selectedAudience === 'women' ? 'Women' : 'Men',
        onClear: () => {
          setSelectedAudience('all');
          setSelectedCategorySlug('all');
        },
      });
    }
    if (mode !== 'category' && selectedCategorySlug !== 'all' && currentCategory) {
      chips.push({
        key: 'category',
        label: currentCategory.name,
        onClear: () => setSelectedCategorySlug('all'),
      });
    }
    if (maxPrice !== null && effectiveMaxPrice < sliderMaxPrice) {
      chips.push({
        key: 'price',
        label: `Under ${formatINR(effectiveMaxPrice)}`,
        onClear: () => setMaxPrice(null),
      });
    }
    if (selectedSize !== 'all') {
      chips.push({
        key: 'size',
        label: `Size ${selectedSize}`,
        onClear: () => setSelectedSize('all'),
      });
    }
    if (selectedColour !== 'all') {
      chips.push({
        key: 'colour',
        label: `Colour: ${selectedColour}`,
        onClear: () => setSelectedColour('all'),
      });
    }
    if (onlyDiscounted && mode !== 'offers') {
      chips.push({
        key: 'discounted',
        label: 'On Sale',
        onClear: () => setOnlyDiscounted(false),
      });
    }
    if (onlyBestSellers && mode !== 'best-sellers') {
      chips.push({
        key: 'bestsellers',
        label: 'Best Sellers',
        onClear: () => setOnlyBestSellers(false),
      });
    }
    return chips;
  }, [
    searchTerm,
    searchParams,
    setSearchParams,
    mode,
    selectedAudience,
    selectedCategorySlug,
    currentCategory,
    maxPrice,
    effectiveMaxPrice,
    sliderMaxPrice,
    selectedSize,
    selectedColour,
    onlyDiscounted,
    onlyBestSellers,
  ]);

  const displayed = filteredProducts.slice(0, visibleCount);

  const FilterPanelContent = (
    <div className="space-y-6">
      {/* Search inside listing */}
      <div>
        <label
          htmlFor="shop-filter-search"
          className="block text-xs font-semibold uppercase tracking-wider text-[#1E2022] mb-2"
        >
          Search
        </label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#86888E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="shop-filter-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Embroidered, Korean, floral, kurti, SKU..."
            className="w-full pl-9 pr-8 py-2 text-base sm:text-xs border border-[#ECE9E2] bg-white focus:border-[#1B2A4A] outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search query"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#86888E] hover:text-[#1E2022]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Audience Switcher (only shown if both Women & Men categories exist) */}
      {mode !== 'category' && activeCategories.some((c) => c.audience !== 'women') && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#1E2022] mb-2.5">
            Department
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'women', label: 'Women' },
              { id: 'men', label: 'Men' },
            ].map((aud) => (
              <button
                key={aud.id}
                type="button"
                onClick={() => {
                  setSelectedAudience(aud.id as 'all' | 'women' | 'men');
                  setSelectedCategorySlug('all');
                }}
                className={`py-1.5 text-xs font-medium border transition-colors ${
                  selectedAudience === aud.id
                    ? 'border-[#1B2A4A] bg-[#1B2A4A] text-white'
                    : 'border-[#ECE9E2] text-[#5C5E64] hover:border-[#1E2022]'
                }`}
              >
                {aud.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#1E2022] mb-2.5">
          Category
        </p>
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => setSelectedCategorySlug('all')}
            className={`w-full text-left py-1 text-xs transition-colors ${
              selectedCategorySlug === 'all'
                ? 'text-[#1B2A4A] font-semibold'
                : 'text-[#5C5E64] hover:text-[#1E2022]'
            }`}
          >
            All Categories
          </button>
          {sidebarCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategorySlug(cat.slug)}
              className={`w-full text-left py-1 text-xs flex items-start justify-between gap-2 transition-colors ${
                selectedCategorySlug === cat.slug
                  ? 'text-[#1B2A4A] font-semibold'
                  : 'text-[#5C5E64] hover:text-[#1E2022]'
              }`}
            >
              <span className="leading-snug">{cat.name}</span>
              <span className="tabular-nums text-[11px] opacity-70 shrink-0 pt-0.5">
                {activeProducts.filter((p) => p.categoryId === cat.id).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Max Price */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
            Max Price
          </span>
          <span className="text-xs font-semibold tabular-nums text-[#1B2A4A]">
            {formatINR(effectiveMaxPrice)}
          </span>
        </div>
        <input
          type="range"
          min={350}
          max={sliderMaxPrice}
          step={50}
          value={effectiveMaxPrice}
          aria-label="Maximum price filter"
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#1B2A4A]"
        />
        <div className="flex justify-between text-[11px] text-[#86888E] tabular-nums mt-1">
          <span>₹350</span>
          <span>{formatINR(sliderMaxPrice)}</span>
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#1E2022] mb-2.5">
          Size
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedSize('all')}
            className={`px-2.5 py-1 text-xs border transition-colors ${
              selectedSize === 'all'
                ? 'border-[#1B2A4A] bg-[#1B2A4A] text-white'
                : 'border-[#ECE9E2] text-[#5C5E64] hover:border-[#1E2022]'
            }`}
          >
            All
          </button>
          {allSizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size === selectedSize ? 'all' : size)}
              className={`min-w-[36px] px-2.5 py-1 text-xs border transition-colors ${
                selectedSize === size
                  ? 'border-[#1B2A4A] bg-[#1B2A4A] text-white'
                  : 'border-[#ECE9E2] text-[#5C5E64] hover:border-[#1E2022]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colour Filter */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#1E2022] mb-2.5">
          Colour
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedColour('all')}
            className={`px-2.5 py-1 text-xs border ${
              selectedColour === 'all'
                ? 'border-[#1B2A4A] text-[#1B2A4A] font-semibold'
                : 'border-[#ECE9E2] text-[#5C5E64]'
            }`}
          >
            All
          </button>
          {allColours.map((col) => (
            <button
              key={col.name}
              type="button"
              onClick={() => setSelectedColour(col.name === selectedColour ? 'all' : col.name)}
              title={col.name}
              className={`px-2.5 py-1 text-xs border flex items-center gap-1.5 ${
                selectedColour === col.name
                  ? 'border-[#1B2A4A] bg-[#F7F6F2] font-medium text-[#1E2022]'
                  : 'border-[#ECE9E2] text-[#5C5E64]'
              }`}
            >
              <span
                className="w-2.5 h-2.5 border border-black/15"
                style={{ backgroundColor: col.hex }}
              />
              <span>{col.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Toggles */}
      <div className="space-y-2 pt-2 border-t border-[#ECE9E2]">
        <label className="flex items-center gap-2 text-xs text-[#1E2022] cursor-pointer">
          <input
            type="checkbox"
            checked={onlyDiscounted}
            onChange={(e) => setOnlyDiscounted(e.target.checked)}
            className="accent-[#1B2A4A]"
          />
          <span>Discounted Items Only</span>
        </label>
        <label className="flex items-center gap-2 text-xs text-[#1E2022] cursor-pointer">
          <input
            type="checkbox"
            checked={onlyBestSellers}
            onChange={(e) => setOnlyBestSellers(e.target.checked)}
            className="accent-[#1B2A4A]"
          />
          <span>Best Sellers Only</span>
        </label>
      </div>

      <button
        type="button"
        onClick={resetFilters}
        className="w-full py-2.5 text-xs font-medium border border-[#ECE9E2] text-[#5C5E64] hover:text-[#1E2022] hover:border-[#1E2022] transition-colors"
      >
        Reset All Filters
      </button>
    </div>
  );

  return (
    <div className="bg-white min-h-[75vh] text-[#1E2022]">
      {/* Page Header */}
      <div className="border-b border-[#ECE9E2] bg-[#F7F6F2]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
          <nav className="text-xs text-[#5C5E64] mb-2.5 flex items-center gap-2">
            <Link to="/" className="hover:text-[#1E2022]">Home</Link>
            <span>/</span>
            <span className="text-[#1E2022] font-medium truncate">{pageTitle}</span>
          </nav>
          <h1 className="font-display text-2xl sm:text-4xl font-semibold text-[#1E2022]">
            {pageTitle}
          </h1>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#5C5E64] max-w-2xl">
            {pageSubtitle}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-12">
        {/* Mobile/Tablet Quick Horizontal Category Pills */}
        {sidebarCategories.length > 0 && (
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-4 border-b border-[#ECE9E2]">
            <button
              type="button"
              onClick={() => setSelectedCategorySlug('all')}
              className={`px-3 py-1.5 text-xs border whitespace-nowrap shrink-0 transition-colors ${
                selectedCategorySlug === 'all'
                  ? 'border-[#1B2A4A] bg-[#1B2A4A] text-white font-semibold'
                  : 'border-[#ECE9E2] bg-[#F7F6F2] text-[#1E2022]'
              }`}
            >
              All
            </button>
            {sidebarCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategorySlug(cat.slug)}
                className={`px-3 py-1.5 text-xs border whitespace-nowrap shrink-0 transition-colors ${
                  selectedCategorySlug === cat.slug
                    ? 'border-[#1B2A4A] bg-[#1B2A4A] text-white font-semibold'
                    : 'border-[#ECE9E2] bg-[#F7F6F2] text-[#1E2022]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 pb-5 mb-6 sm:mb-8 border-b border-[#ECE9E2]">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 border border-[#ECE9E2] bg-[#F7F6F2] text-xs font-medium text-[#1E2022] shrink-0 active:scale-[0.98]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterChips.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-semibold bg-[#1B2A4A] text-white tabular-nums">
                  {activeFilterChips.length}
                </span>
              )}
            </button>
            <p className="text-[11px] sm:text-xs text-[#5C5E64] tabular-nums truncate">
              <span className="font-semibold text-[#1E2022]">{displayed.length}</span> of{' '}
              <span className="font-semibold text-[#1E2022]">{filteredProducts.length}</span> styles
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="sort-select" className="hidden sm:inline text-xs text-[#5C5E64]">
              Sort:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-2.5 sm:px-3 py-2 text-xs border border-[#ECE9E2] bg-white text-[#1E2022] focus:border-[#1B2A4A] outline-none"
            >
              <option value="newest">Newest</option>
              <option value="best-sellers">Best Sellers</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">{FilterPanelContent}</div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-9">
            {activeFilterChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-5 pb-4 border-b border-[#ECE9E2]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C5E64] mr-1">
                  Active:
                </span>
                {activeFilterChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onClear}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F7F6F2] border border-[#ECE9E2] hover:border-[#1B2A4A] text-xs text-[#1E2022] transition-colors"
                  >
                    <span>{chip.label}</span>
                    <X className="w-3 h-3 text-[#5C5E64]" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-medium text-[#1B2A4A] hover:underline ml-auto"
                >
                  Clear all
                </button>
              </div>
            )}

            {displayed.length === 0 ? (
              <div className="py-16 text-center border border-[#ECE9E2] bg-[#F7F6F2] px-6">
                <p className="text-base font-medium text-[#1E2022]">
                  No products match your selected filters
                </p>
                <p className="text-xs text-[#5C5E64] mt-1.5">
                  Try clearing some filters or adjusting your search query.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 px-5 py-2.5 bg-[#1E2022] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#1B2A4A] transition-colors active:scale-[0.98]"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3.5 gap-y-7 sm:gap-x-6 sm:gap-y-10">
                  {displayed.map((product, idx) => (
                    <ProductCard key={product.id} product={product} priority={idx < 4} />
                  ))}
                </div>

                {visibleCount < filteredProducts.length && (
                  <div className="mt-10 sm:mt-12 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                      className="px-6 sm:px-8 py-3 border border-[#1E2022] text-xs font-semibold uppercase tracking-wider text-[#1E2022] hover:bg-[#1E2022] hover:text-white transition-colors active:scale-[0.98]"
                    >
                      Load More Products ({filteredProducts.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Animated Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-start">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-[86%] max-w-xs bg-white h-full overflow-y-auto p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#ECE9E2]">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#1E2022]">
                  Filter Products
                </h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filters"
                  className="p-1.5 text-[#5C5E64] hover:text-[#1E2022]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {FilterPanelContent}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="mt-6 w-full py-3 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Show {filteredProducts.length} Results
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

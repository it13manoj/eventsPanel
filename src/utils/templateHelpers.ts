export interface TemplateItem {
  id?: string;
  category_id: number;
  category_name: string;
  subcategory_id: number;
  subcategory_name: string;
  quantity: number;
  price: number;
  vertical?: boolean;
  horizontal?: boolean;
  verticalValue?: string;
  verticalUnit?: string;
  verticalPcs?: number;
  horizontalValue?: string;
  horizontalUnit?: string;
  horizontalPcs?: number;
}

export interface EventTemplateData {
  id?: number;
  name: string;
  total_price: number;
  description?: string;
  items: TemplateItem[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Normalizes an individual raw item object from API or forms into a clean TemplateItem.
 * Handles both camelCase and snake_case properties, boolean/integer flags, and string numbers.
 */
export const normalizeSingleItem = (it: any, index: number = 0): TemplateItem => {
  if (!it || typeof it !== "object") {
    return {
      id: `${Date.now()}-${index}-${Math.random()}`,
      category_id: 0,
      category_name: "",
      subcategory_id: 0,
      subcategory_name: "",
      quantity: 1,
      price: 0,
    };
  }

  const verticalEnabled = Boolean(
    it.vertical === true ||
    it.vertical === 1 ||
    it.vertical === "1" ||
    it.vertical === "true" ||
    Boolean(it.verticalValue || it.vertical_value)
  );

  const horizontalEnabled = Boolean(
    it.horizontal === true ||
    it.horizontal === 1 ||
    it.horizontal === "1" ||
    it.horizontal === "true" ||
    Boolean(it.horizontalValue || it.horizontal_value)
  );

  const catId = Number(it.category_id || it.categoryId || it.categories_id || 0);
  const catName = String(
    it.category_name || it.categoryName || it.categories_name || (catId ? `Category #${catId}` : "")
  );

  const subCatId = Number(it.subcategory_id || it.subcategoryId || it.sub_categories_id || 0);
  const subCatName = String(
    it.subcategory_name || it.subcategoryName || it.sub_categories_name || it.name || (subCatId ? `Item #${subCatId}` : "Stock Item")
  );

  const qty = Math.max(1, parseInt(String(it.quantity || it.qty || it.quntites || it.value || 1), 10) || 1);
  const price = Math.max(0, parseFloat(String(it.price || it.unit_price || 0)) || 0);

  const vVal = it.verticalValue !== undefined && it.verticalValue !== null
    ? String(it.verticalValue)
    : (it.vertical_value !== undefined && it.vertical_value !== null ? String(it.vertical_value) : (verticalEnabled ? "10" : undefined));

  const vUnit = it.verticalUnit || it.vertical_unit || (verticalEnabled ? "ft" : undefined);

  const vPcs = (it.verticalPcs !== undefined && it.verticalPcs !== null)
    ? Number(it.verticalPcs)
    : ((it.vertical_pcs !== undefined && it.vertical_pcs !== null) ? Number(it.vertical_pcs) : (verticalEnabled ? 1 : undefined));

  const hVal = it.horizontalValue !== undefined && it.horizontalValue !== null
    ? String(it.horizontalValue)
    : (it.horizontal_value !== undefined && it.horizontal_value !== null ? String(it.horizontal_value) : (horizontalEnabled ? "10" : undefined));

  const hUnit = it.horizontalUnit || it.horizontal_unit || (horizontalEnabled ? "ft" : undefined);

  const hPcs = (it.horizontalPcs !== undefined && it.horizontalPcs !== null)
    ? Number(it.horizontalPcs)
    : ((it.horizontal_pcs !== undefined && it.horizontal_pcs !== null) ? Number(it.horizontal_pcs) : (horizontalEnabled ? 1 : undefined));

  return {
    id: it.id ? String(it.id) : `${Date.now()}-${index}-${Math.random()}`,
    category_id: catId,
    category_name: catName,
    subcategory_id: subCatId,
    subcategory_name: subCatName,
    quantity: qty,
    price: price,
    vertical: verticalEnabled,
    verticalValue: vVal,
    verticalUnit: vUnit,
    verticalPcs: vPcs,
    horizontal: horizontalEnabled,
    horizontalValue: hVal,
    horizontalUnit: hUnit,
    horizontalPcs: hPcs,
  };
};

/**
 * Normalizes raw items data from API (which may be JSON string, double-stringified,
 * null, array, or object) into a strictly typed TemplateItem[].
 */
export const normalizeTemplateItems = (raw: any): TemplateItem[] => {
  if (!raw) return [];
  let parsed = raw;

  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
    } catch (e) {
      return [];
    }
  }

  if (Array.isArray(parsed)) {
    return parsed.map((item, idx) => normalizeSingleItem(item, idx));
  }

  if (parsed && typeof parsed === "object") {
    return Object.values(parsed).map((item, idx) => normalizeSingleItem(item, idx));
  }

  return [];
};


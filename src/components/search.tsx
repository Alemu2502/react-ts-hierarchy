import { Item } from "../types.ts";


// Flatten items for easy search/filter
export function flattenItems(items: Item[]): Item[] {
  const flatItems: Item[] = [];
  function flatten(item: Item) {
    flatItems.push(item);
    if (Array.isArray(item.children)) {
      item.children.forEach(flatten);
    }
  }
  items.forEach(flatten);
  return flatItems;
}

// Organize back into hierarchical structure after filtering
export function organizeItems(items: Item[]): Item[] {
  const itemMap: { [key: number]: Item } = {};

  items.forEach((item) => {
    itemMap[item.id] = { ...item, children: [] };
  });

  const roots: Item[] = [];
  items.forEach((item) => {
    if (item.parentId === null || item.parentId === undefined) {
      roots.push(itemMap[item.id]);
    } else if (itemMap[item.parentId]) {
      (itemMap[item.parentId]!.children as Item[]).push(itemMap[item.id]);
    }
  });

  return roots;
}

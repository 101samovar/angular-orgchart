import { OrgItem } from "./OrgItem";

export interface ChartElement {
    x: number,
    y: number,
    item: OrgItem,
    parent?: ChartElement,
    childrenCount: number,
    category: number,
    connection?: string
}

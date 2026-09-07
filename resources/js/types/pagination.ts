export interface PaginatorLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedCollection<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginatorLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

export interface TableState {
    search: string | null;
    col: string | null;
    sort: string | null;
}

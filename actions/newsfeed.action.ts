
import { API } from '@/lib/fetch';
import { Newsfeed } from '@/types';

export interface NewsfeedListResponse {
    newsfeeds: Newsfeed[];
    count: number;
}

export interface NewsfeedFilter {
    sort?: { field: string; order: string };
    search?: string;
    limit: number;
    offset?: number;
    published?: boolean;
    pinned?: boolean;
}

/**
 * List all newsfeed posts with filters
 */
export async function listNewsfeed(filter: NewsfeedFilter): Promise<{
    success: boolean;
    data?: NewsfeedListResponse;
    error?: any;
}> {
    try {
        const { sort, search, limit, offset, published, pinned } = filter;
        const where: Record<string, unknown> = {};
        if (published !== undefined) where.published = published;
        if (pinned !== undefined) where.pinned = pinned;
        const response = await API.GetAll<any>('newsfeed', {
            search: search || undefined,
            limit: limit || 10,
            offset: offset || 0,
            where: Object.keys(where).length > 0 ? where : undefined,
            sort: sort ? [[sort.field, sort.order]] : undefined,
        });
        if (response.error) {
            return { success: false, error: response.error };
        }
        // API returns: { data: { newsfeeds: [], count: X } }
        const newsfeeds = response.data?.newsfeeds || [];
        const totalCount = response.data?.count || 0;
        return {
            success: true,
            data: {
                newsfeeds,
                count: totalCount,
            },
        };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch newsfeed' };
    }
}

/**
 * Get newsfeed post by ID (with optional populate)
 */
export async function getNewsfeedById(id: string | number, populate?: string[]): Promise<{
    success: boolean;
    data?: { newsfeed: Newsfeed };
    error?: any;
}> {
    try {
        const params: Record<string, any> = {};
        if (populate) params.populate = populate;
        const { data, error } = await API.GetById<{ newsfeed: Newsfeed }>('newsfeed', id, params);
        if (error) return { success: false, error };
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch newsfeed' };
    }
}


/**
 * Get newsfeed post by ID
 */
// export async function getNewsfeedById(id: number, populate?: string[]): Promise<{
//     success: boolean;
//     data?: { newsfeed: Newsfeed };
//     error?: any;
// }> {
//     try {
//         const { data, error } = await API.GetById<{ newsfeed: Newsfeed }>('newsfeed', id);
//         if (error) return { success: false, error };
//         return { success: true, data };
//     } catch (error) {
//         return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch newsfeed' };
//     }
// }



/**
 * Create new newsfeed post
 */
export async function createNewsfeed(newsfeedData: Partial<Newsfeed>): Promise<{
    success: boolean;
    data?: { newsfeed: Newsfeed };
    error?: string;
}> {
    try {
        const { data, error, message, validationErrors } = await API.Create<Partial<Newsfeed>, { newsfeed: Newsfeed }>(
            'newsfeed',
            newsfeedData
        );
        if (error) {
            if (validationErrors && validationErrors.length > 0) {
                const firstError = validationErrors[0];
                const errorMessage = Object.values(firstError.constraints || {})[0] || 'Validation failed';
                return { success: false, error: errorMessage };
            }
            const errorMessage = typeof error === 'string' ? error : message || 'Failed to create newsfeed';
            return { success: false, error: errorMessage };
        }
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Failed to create newsfeed' };
    }
}

/**
 * Update newsfeed post by ID
 */
export async function updateNewsfeed(id: number, newsfeedData: Partial<Newsfeed>): Promise<{
    success: boolean;
    data?: { newsfeed: Newsfeed };
    error?: string;
}> {
    try {
        const { data, error, message, validationErrors } = await API.UpdateById<Partial<Newsfeed>, { newsfeed: Newsfeed }>(
            'newsfeed',
            id,
            newsfeedData
        );
        if (error) {
            if (validationErrors && validationErrors.length > 0) {
                const firstError = validationErrors[0];
                const errorMessage = Object.values(firstError.constraints || {})[0] || 'Validation failed';
                return { success: false, error: errorMessage };
            }
            const errorMessage = typeof error === 'string' ? error : message || 'Failed to update newsfeed';
            return { success: false, error: errorMessage };
        }
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Failed to update newsfeed' };
    }
}

/**
 * Delete newsfeed post by ID
 */
export async function deleteNewsfeed(id: number): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const { error, message } = await API.DeleteById('newsfeed', id);
        if (error) {
            const errorMessage = typeof error === 'string' ? error : message || 'Failed to delete newsfeed';
            return { success: false, error: errorMessage };
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete newsfeed' };
    }
}
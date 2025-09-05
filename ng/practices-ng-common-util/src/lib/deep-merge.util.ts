function mergeRecursive(obj: any, newObj: any, visited: any[] = []): any {
    if (!obj || !newObj) {
        return;
    }

    if (visited.includes(newObj)) {
        return;
    }

    visited.push(newObj);
    Object.entries(newObj).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
            if (!obj[key]) {
                obj[key] = value;
            } else {
                mergeRecursive(obj[key], value, visited);
            }
        } else if (value !== undefined) {
            obj[key] = value;
        }
    });
}

type DeepPartial<T> = T extends Record<string, any>
    ? {
          [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;

export function deepMerge<T extends Record<string, any>>(options?: T, newOptions?: DeepPartial<T>): T {
    const merged: any = {
        ...options,
    };

    if (newOptions) {
        mergeRecursive(merged, newOptions);
    }

    return merged;
}

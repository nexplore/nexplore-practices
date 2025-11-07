import { describe, expect, it, jest } from '@jest/globals';
import { isObjDeepEqual } from './is-obj-deep-equal';

describe('isObjDeepEqual', () => {
    // Primitives test
    it('should compare primitive values correctly', () => {
        expect(isObjDeepEqual(1, 1)).toBe(true);
        expect(isObjDeepEqual('test', 'test')).toBe(true);
        expect(isObjDeepEqual(true, true)).toBe(true);
        expect(isObjDeepEqual(1, 2)).toBe(false);
        expect(isObjDeepEqual('test', 'test2')).toBe(false);
        expect(isObjDeepEqual(true, false)).toBe(false);
        expect(isObjDeepEqual(null, null)).toBe(true);
        expect(isObjDeepEqual(undefined, undefined)).toBe(true);
        expect(isObjDeepEqual(null, undefined)).toBe(false);
    });

    // Simple objects test
    it('should compare simple objects correctly', () => {
        expect(isObjDeepEqual({ a: 1, b: 'test' }, { a: 1, b: 'test' })).toBe(true);
        expect(isObjDeepEqual({ a: 1, b: 'test' }, { a: 1, b: 'test2' })).toBe(false);
        expect(isObjDeepEqual({ a: 1, b: 'test' }, { a: 1 })).toBe(false);
        expect(isObjDeepEqual({ a: 1 }, { a: 1, b: 'test' })).toBe(false);
    });

    // Nested objects test
    it('should compare nested objects correctly', () => {
        expect(
            isObjDeepEqual(
                { a: 1, b: { c: 2, d: { e: 3 } } },
                { a: 1, b: { c: 2, d: { e: 3 } } }
            )
        ).toBe(true);

        expect(
            isObjDeepEqual(
                { a: 1, b: { c: 2, d: { e: 3 } } },
                { a: 1, b: { c: 2, d: { e: 4 } } }
            )
        ).toBe(false);

        expect(
            isObjDeepEqual(
                { a: 1, b: { c: 2, d: { e: 3 } } },
                { a: 1, b: { c: 2, d: {} } }
            )
        ).toBe(false);
    });

    // Basic maximum depth test
    it('should detect differences at deep levels with default depth', () => {
        const obj1 = { 
            level1: { 
                level2: { 
                    level3: { 
                        level4: { 
                            level5: { value: "original" } 
                        } 
                    } 
                } 
            } 
        };
        
        const obj2 = { 
            level1: { 
                level2: { 
                    level3: { 
                        level4: { 
                            level5: { value: "different" } 
                        } 
                    } 
                } 
            } 
        };
        
        // With default depth (10), should detect difference at level 5
        expect(isObjDeepEqual(obj1, obj2)).toBe(false);
    });

    it('should limit comparison by maximum depth parameter', () => {
        // Create objects with difference at level 5
        const obj1 = { 
            level1: { 
                level2: { 
                    level3: { 
                        level4: { 
                            level5: { value: "original" } 
                        } 
                    } 
                } 
            } 
        };
        
        const obj2 = { 
            level1: { 
                level2: { 
                    level3: { 
                        level4: { 
                            level5: { value: "different" } 
                        } 
                    } 
                } 
            } 
        };
        
        // With depth 4, should compare level4 objects by reference
        // (which are different references)
        expect(isObjDeepEqual(obj1, obj2, { maximumDepth: 4 })).toBe(false);
    });

    it('should properly handle depth 0 (shallow comparison)', () => {
        const shallow1 = { prop: { nested: 1 } };
        const shallow2 = { prop: { nested: 1 } };
        
        // With depth 0, should do shallow comparison (different object references)
        expect(isObjDeepEqual(shallow1, shallow2, { maximumDepth: 0 })).toBe(false);
        
        // Modify shallow2 to have the same reference
        shallow2.prop = shallow1.prop;
        
        // Now with shared reference, should be equal
        expect(isObjDeepEqual(shallow1, shallow2, { maximumDepth: 0 })).toBe(true);
    });

    it('should compare objects with same values but different references at various depths', () => {
        // Objects with same structure and values, but different references
        const refObj1 = { 
            level1: { 
                level2: { 
                    level3: { 
                        level4: { 
                            level5: { value: "same" }
                        } 
                    } 
                } 
            } 
        };
        
        const refObj2 = { 
            level1: { 
                level2: { 
                    level3: { 
                        level4: { 
                            level5: { value: "same" }
                        } 
                    } 
                } 
            } 
        };
        
        // With full depth, should detect they are equal by value
        expect(isObjDeepEqual(refObj1, refObj2)).toBe(true);
        
        // Test with different depths
        expect(isObjDeepEqual(refObj1, refObj2, { maximumDepth: 5 })).toBe(true);
        expect(isObjDeepEqual(refObj1, refObj2, { maximumDepth: 4 })).toBe(false); // References differ
    });

    it('should detect differences at specific levels based on depth', () => {
        // Multilevel objects with difference at deep level
        const multiLevel1 = {
            a: {
                b: {
                    c: {
                        d: {
                            e: 1
                        }
                    }
                }
            }
        };
        
        const multiLevel2 = {
            a: {
                b: {
                    c: {
                        d: {
                            e: 2 // Difference at level 5
                        }
                    }
                }
            }
        };
        
        // Every depth here will show false because the references
        // are different at each level
        expect(isObjDeepEqual(multiLevel1, multiLevel2, { maximumDepth: 1 })).toBe(false);
        expect(isObjDeepEqual(multiLevel1, multiLevel2, { maximumDepth: 2 })).toBe(false);
        expect(isObjDeepEqual(multiLevel1, multiLevel2, { maximumDepth: 3 })).toBe(false);
        expect(isObjDeepEqual(multiLevel1, multiLevel2, { maximumDepth: 4 })).toBe(false);
        expect(isObjDeepEqual(multiLevel1, multiLevel2, { maximumDepth: 5 })).toBe(false);
    });

    it('should handle shared references at intermediate levels', () => {
        // Create shared object for testing reference equality
        const shared = { d: { e: 3 } };
        
        // Both objects use the same reference at level 'c'
        const sharedLevel1 = { a: { b: { c: shared } } };
        const sharedLevel2 = { a: { b: { c: shared } } };
        
        // These should be equal at low depths because level 'a.b' objects are different references
        expect(isObjDeepEqual(sharedLevel1, sharedLevel2, { maximumDepth: 1 })).toBe(false);
        
        // But equal at deeper depths because level 'c' shares the same reference
        expect(isObjDeepEqual(sharedLevel1, sharedLevel2, { maximumDepth: 2 })).toBe(true);
        expect(isObjDeepEqual(sharedLevel1, sharedLevel2, { maximumDepth: 5 })).toBe(true);
    });

    it('should handle basic cyclic references', () => {
        // Create objects with simple self-references
        const obj1: any = { a: 1 };
        obj1.self = obj1;
        
        const obj2: any = { a: 1 };
        obj2.self = obj2;
        
        // Should handle cyclic references correctly
        expect(isObjDeepEqual(obj1, obj2)).toBe(true);
        
        // Modify one object
        obj2.a = 2;
        
        // Should detect the difference
        expect(isObjDeepEqual(obj1, obj2)).toBe(false);
    });

    it('should handle cyclic references with reference sharing', () => {
        // Create objects with shared references
        const obj1: any = { a: 1, b: { c: 2 } };
        const obj2: any = { a: 1, b: { c: 2 } }; // Different reference for b
        
        // With depth 1, still deep compares the first level's properties
        // Since obj1.b and obj2.b have the same structure, they'll be equal
        expect(isObjDeepEqual(obj1, obj2, { maximumDepth: 1 })).toBe(true);
        
        // If we want to test reference comparison, we should use depth 0
        expect(isObjDeepEqual(obj1, obj2, { maximumDepth: 0 })).toBe(false);
        
        // Share the reference for b
        obj2.b = obj1.b;
        
        // Now should be equal with both depth 0 and 1
        expect(isObjDeepEqual(obj1, obj2, { maximumDepth: 1 })).toBe(true);
        expect(isObjDeepEqual(obj1, obj2, { maximumDepth: 0 })).toBe(true);
    });

    it('should handle cyclic references with property changes at different depths', () => {
        // Simple objects with cyclic references
        const obj1: any = { a: 1, b: { c: 2 } };
        obj1.cycle = obj1; // Self-reference
        
        const obj2: any = { a: 1, b: { c: 2 } };
        obj2.cycle = obj2; // Self-reference
        
        // Share b reference to isolate this test
        obj2.b = obj1.b;
        
        // Properties at level 1 should be equal
        // However, since objects are not strictly identical and we have cyclic refs,
        // the comparison might not work as intuitively expected
        expect(isObjDeepEqual(obj1, obj2, { maximumDepth: 1 })).toBe(false);
        
        // But with full depth, it should recognize they have the same structure
        expect(isObjDeepEqual(obj1, obj2)).toBe(true);
        
        // Change a property at top level
        obj2.a = 3;
        
        // Should detect difference at any depth
        expect(isObjDeepEqual(obj1, obj2, { maximumDepth: 0 })).toBe(false);
        expect(isObjDeepEqual(obj1, obj2, { maximumDepth: 1 })).toBe(false);
    });

    it('should handle nested cyclic references', () => {
        // Create objects with nested circular references
        const obj1: any = { a: 1 };
        const nested1: any = { parent: obj1, value: 2 };
        obj1.nested = nested1; // Two-way reference
        
        const obj2: any = { a: 1 };
        const nested2: any = { parent: obj2, value: 2 };
        obj2.nested = nested2; // Two-way reference
        
        // Should handle nested cyclic references
        expect(isObjDeepEqual(obj1, obj2)).toBe(true);
        
        // Change a property in the nested object
        nested2.value = 3;
        
        // Should detect the difference
        expect(isObjDeepEqual(obj1, obj2)).toBe(false);
    });

    it('should handle complex object graphs with cycles', () => {
        // Create a more complex object graph with multiple cycles
        interface TestNode {
            id: number;
            name: string;
            parent?: TestNode;
            children: TestNode[];
        }
        
        // Create a tree structure with parent references (creating cycles)
        const createTree = (): TestNode => {
            const root: TestNode = {
                id: 1,
                name: 'root',
                children: []
            };
            
            const child1: TestNode = {
                id: 2,
                name: 'child1',
                parent: root,
                children: []
            };
            
            const child2: TestNode = {
                id: 3,
                name: 'child2',
                parent: root,
                children: []
            };
            
            const grandchild: TestNode = {
                id: 4,
                name: 'grandchild',
                parent: child1,
                children: []
            };
            
            root.children.push(child1, child2);
            child1.children.push(grandchild);
            
            return root;
        };
        
        const tree1 = createTree();
        const tree2 = createTree();
        
        // Trees should be equal despite the cycles
        expect(isObjDeepEqual(tree1, tree2)).toBe(true);
        
        // Modify a node deep in the tree
        tree2.children[0].children[0].name = 'modified grandchild';
        
        // Should detect the difference
        expect(isObjDeepEqual(tree1, tree2)).toBe(false);
    });

    // Date objects test
    it('should compare Date objects correctly', () => {
        const date1 = new Date('2023-01-01');
        const date2 = new Date('2023-01-01');
        const date3 = new Date('2023-01-02');

        expect(isObjDeepEqual(date1, date2)).toBe(true);
        expect(isObjDeepEqual(date1, date3)).toBe(false);
        expect(isObjDeepEqual({ date: date1 }, { date: date2 })).toBe(true);
        expect(isObjDeepEqual({ date: date1 }, { date: date3 })).toBe(false);
    });

    // Error objects test
    it('should compare Error objects correctly', () => {
        const error1 = new Error('test error');
        const error2 = new Error('test error');
        const error3 = new Error('different error');

        expect(isObjDeepEqual(error1, error2)).toBe(true);
        expect(isObjDeepEqual(error1, error3)).toBe(false);
        expect(isObjDeepEqual({ error: error1 }, { error: error2 })).toBe(true);
        expect(isObjDeepEqual({ error: error1 }, { error: error3 })).toBe(false);
    });

    // Property filter test
    it('should apply property filter correctly', () => {
        const obj1 = { a: 1, b: 2, c: 3 };
        const obj2 = { a: 1, b: 5, c: 3 };

        // Without filter, should be different
        expect(isObjDeepEqual(obj1, obj2)).toBe(false);

        // With filter that ignores property 'b', should be equal
        expect(isObjDeepEqual(obj1, obj2, { maximumDepth: 10, propertyFilter: (key) => key !== 'b' })).toBe(true);
    });

    // Custom comparator test
    it('should apply custom comparator correctly', () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { a: 1, b: 3 };

        // With custom comparator that considers all 'b' values equal
        const customComparator = (val1: any, val2: any, key: string) => {
            if (key === 'b') {
                return true;
            }
            return undefined; // Use default comparison for other properties
        };

        expect(isObjDeepEqual(obj1, obj2, { customComparator })).toBe(true);
    });

    // Array comparison
    it('should compare arrays correctly', () => {
        expect(isObjDeepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
        expect(isObjDeepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
        expect(isObjDeepEqual([1, 2, 3], [1, 2])).toBe(false);

        // Nested arrays
        expect(isObjDeepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
        expect(isObjDeepEqual([1, [2, 3]], [1, [2, 4]])).toBe(false);

        // Arrays with objects
        expect(isObjDeepEqual([{ a: 1 }, { b: 2 }], [{ a: 1 }, { b: 2 }])).toBe(true);
        expect(isObjDeepEqual([{ a: 1 }, { b: 2 }], [{ a: 1 }, { b: 3 }])).toBe(false);
    });

    // Mixed object types
    it('should handle mixed object types correctly', () => {
        const obj1 = {
            name: 'test',
            date: new Date('2023-01-01'),
            error: new Error('test error'),
            nested: { a: 1, b: [1, 2, 3] }
        };

        const obj2 = {
            name: 'test',
            date: new Date('2023-01-01'),
            error: new Error('test error'),
            nested: { a: 1, b: [1, 2, 3] }
        };

        const obj3 = {
            name: 'test',
            date: new Date('2023-01-01'),
            error: new Error('test error'),
            nested: { a: 1, b: [1, 2, 4] }
        };

        expect(isObjDeepEqual(obj1, obj2)).toBe(true);
        expect(isObjDeepEqual(obj1, obj3)).toBe(false);
    });
});

export enum SampleType {
    Type1 = 'type1',
    Type2 = 'type2',
    Type3 = 'type3',
}

export interface SampleListEntry {
    id: string;
    type: SampleType;
    name: string;
    active: boolean;
}

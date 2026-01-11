export interface Asset {
  _id?: string;
  asset_id: string;
  project_id: string;
  project_name: string;
  asset_type: string;
  asset_name: string;
  provider_name: string;
  acquisition_date: string;
  source_type: 'purchased' | 'donated' | 'leased' | 'government_provided';
  quantity: number;
  unit_value: number;
  total_value: number;
  status: 'active' | 'maintenance' | 'disposed' | 'lost';
  description?: string;
  location?: string;
  maintenance_schedule?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetFormData {
  project_id: string;
  project_name: string;
  asset_type: string;
  asset_name: string;
  provider_name: string;
  acquisition_date: string;
  source_type: 'purchased' | 'donated' | 'leased' | 'government_provided';
  quantity: number;
  unit_value: number;
  total_value: number;
  status: 'active' | 'maintenance' | 'disposed' | 'lost';
  description: string;
  location: string;
  maintenance_schedule: string;
}

export interface AssetStats {
  totalAssets: number;
  statusDistribution: {
    active: number;
    maintenance: number;
    disposed: number;
    lost: number;
  };
  totalValue: number;
  assetsByType: {
    type: string;
    count: number;
    value: number;
  }[];
  assetsBySource: {
    source: string;
    count: number;
    value: number;
  }[];
}
export enum Table {
  Accounts = 'accounts',
}

export interface MasjidProfile {
  id: string;
  user_id: string;
  address: string;
  code: string;
  logo_url: string;
  created_at: string;
  updated_at: string;
}

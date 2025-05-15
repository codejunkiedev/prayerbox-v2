export enum Table {
  Accounts = 'accounts',
}

export type Account = {
  id: number;
  email: string;
  code: string;
  created_at: string;
  updated_at: string;
};

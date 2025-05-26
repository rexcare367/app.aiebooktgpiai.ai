export interface ProfilePageProps {
  mode: string;
}
export interface ProfilePageState {
  loading: boolean | string;
  updating: boolean | string;
  username: string;
  userId: string;
  email: string;
  phone_number: string;
  address: string;
  name: string;
  guardianName: string;
}
